const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { emitProductUpdate, emitStockUpdate } = require('../config/socket');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000).required(),
  price: Joi.number().positive().required(),
  category_id: Joi.number().integer().positive().required(),
  image_url: Joi.string().uri().required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  is_featured: Joi.boolean().default(false)
});

const updateStockSchema = Joi.object({
  stock_quantity: Joi.number().integer().min(0).required()
});

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get total sales
    const totalSalesResult = await db.get(`
      SELECT COALESCE(SUM(total_amount), 0) as total_sales 
      FROM orders 
      WHERE payment_status = 'paid'
    `);

    // Get total orders
    const totalOrdersResult = await db.get('SELECT COUNT(*) as total_orders FROM orders');

    // Get total users
    const totalUsersResult = await db.get('SELECT COUNT(*) as total_users FROM users');

    // Get total products
    const totalProductsResult = await db.get('SELECT COUNT(*) as total_products FROM products');

    // Get recent orders
    const recentOrders = await db.all(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Get low stock products
    const lowStockProducts = await db.all(`
      SELECT * FROM products 
      WHERE stock_quantity < 10 
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);

    res.json({
      stats: {
        total_sales: totalSalesResult.total_sales,
        total_orders: totalOrdersResult.total_orders,
        total_users: totalUsersResult.total_users,
        total_products: totalProductsResult.total_products
      },
      recent_orders: recentOrders,
      low_stock_products: lowStockProducts
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all products for admin
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const products = await db.all(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalResult = await db.get('SELECT COUNT(*) as total FROM products');
    const total = totalResult.total;

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, price, category_id, image_url, stock_quantity, is_featured } = value;

    const result = await db.run(`
      INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, description, price, category_id, image_url, stock_quantity, is_featured ? 1 : 0]);

    const newProduct = await db.get(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [result.id]);

    // Emit real-time update
    emitProductUpdate({ type: 'created', product: newProduct });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, description, price, category_id, image_url, stock_quantity, is_featured } = value;

    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.run(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, 
          stock_quantity = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, price, category_id, image_url, stock_quantity, is_featured ? 1 : 0, productId]);

    const updatedProduct = await db.get(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [productId]);

    // Emit real-time updates
    emitProductUpdate({ type: 'updated', product: updatedProduct });
    if (existingProduct.stock_quantity !== stock_quantity) {
      emitStockUpdate(productId, stock_quantity);
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product stock
router.patch('/products/:id/stock', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { error, value } = updateStockSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { stock_quantity } = value;

    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.run(`
      UPDATE products 
      SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [stock_quantity, productId]);

    // Emit real-time stock update
    emitStockUpdate(productId, stock_quantity);

    res.json({
      message: 'Stock updated successfully',
      product_id: productId,
      new_stock: stock_quantity
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.run('DELETE FROM products WHERE id = ?', [productId]);

    // Emit real-time update
    emitProductUpdate({ type: 'deleted', productId });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let query = `
      SELECT o.*, u.first_name, u.last_name, u.email,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    let params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await db.all(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    let countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    const totalResult = await db.get(countQuery, countParams);
    const total = totalResult.total;

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if order exists
    const existingOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await db.run(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, orderId]);

    // Get updated order with user info
    const updatedOrder = await db.get(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    // Emit real-time order update to user
    const { emitOrderUpdate } = require('../config/socket');
    emitOrderUpdate(existingOrder.user_id, updatedOrder);

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;