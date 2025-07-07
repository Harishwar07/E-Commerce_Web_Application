const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Validation schemas
const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().default(1)
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().positive().required()
});

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const [cartItems] = await pool.execute(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity,
             (c.quantity * p.price) as subtotal
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      cart_items: cartItems,
      total: parseFloat(total.toFixed(2)),
      item_count: cartItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { error, value } = addToCartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { product_id, quantity } = value;

    // Check if product exists and has sufficient stock
    const [products] = await pool.execute(
      'SELECT id, name, price, stock_quantity FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${product.stock_quantity} items available` 
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existingItems.length > 0) {
      // Update existing item
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more items. Only ${product.stock_quantity - existingItems[0].quantity} more available` 
        });
      }

      await pool.execute(
        'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );

      res.json({ 
        message: 'Cart updated successfully',
        quantity: newQuantity
      });
    } else {
      // Add new item
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );

      res.status(201).json({ 
        message: 'Item added to cart successfully',
        quantity
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/update/:id', async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.id);
    const { error, value } = updateCartSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    const { quantity } = value;

    // Check if cart item exists and belongs to user
    const [cartItems] = await pool.execute(`
      SELECT c.id, c.product_id, p.stock_quantity 
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = ? AND c.user_id = ?
    `, [cartItemId, req.user.id]);

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cartItem = cartItems[0];

    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${cartItem.stock_quantity} items available` 
      });
    }

    // Update quantity
    await pool.execute(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, cartItemId]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/remove/:id', async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.id);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    // Check if cart item exists and belongs to user
    const [cartItems] = await pool.execute(
      'SELECT id FROM cart WHERE id = ? AND user_id = ?',
      [cartItemId, req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Remove item
    await pool.execute('DELETE FROM cart WHERE id = ?', [cartItemId]);

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    await pool.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;