const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { emitNewOrder, emitStockUpdate } = require('../config/socket');

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Validation schemas
const createOrderSchema = Joi.object({
  shipping_address: Joi.string().required(),
  payment_method: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay').default('credit_card')
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// Get user's orders
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const orders = await db.all(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    // Get total count
    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { shipping_address, payment_method } = value;

    // Get cart items
    const cartItems = await db.all(`
      SELECT c.product_id, c.quantity, p.price, p.stock_quantity, p.name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Only ${item.stock_quantity} available` 
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderResult = await db.run(`
      INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, totalAmount, shipping_address, payment_method]);

    const orderId = orderResult.id;

    // Create order items and update stock
    for (const item of cartItems) {
      // Add order item
      await db.run(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price]);

      // Update product stock
      const newStock = item.stock_quantity - item.quantity;
      await db.run(`
        UPDATE products SET stock_quantity = ?
        WHERE id = ?
      `, [newStock, item.product_id]);

      // Emit real-time stock update
      emitStockUpdate(item.product_id, newStock);
    }

    // Clear cart
    await db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    // Get complete order data for real-time notification
    const orderData = await db.get(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    // Emit real-time notification to admin
    emitNewOrder(orderData);

    res.status(201).json({
      message: 'Order created successfully',
      order_id: orderId,
      total_amount: parseFloat(totalAmount.toFixed(2))
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific order
router.get('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Get order details
    const order = await db.get(`
      SELECT * FROM orders 
      WHERE id = ? AND user_id = ?
    `, [orderId, req.user.id]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const orderItems = await db.all(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    order.items = orderItems;

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status (for admin use - simplified for demo)
router.put('/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { error, value } = updateOrderStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const { status } = value;

    // Check if order exists and belongs to user
    const order = await db.get(
      'SELECT id FROM orders WHERE id = ? AND user_id = ?',
      [orderId, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    await db.run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;