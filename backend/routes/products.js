const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');

const router = express.Router();

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    let queryParams = [];
    let countParams = [];

    // Add category filter
    if (category) {
      query += ' AND c.name = ?';
      countQuery += ' AND category_id = (SELECT id FROM categories WHERE name = ?)';
      queryParams.push(category);
      countParams.push(category);
    }

    // Add search filter
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Add sorting
    const allowedSortFields = ['name', 'price', 'created_at', 'rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortField} ${order}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Execute queries
    const [products] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

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
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_featured = TRUE 
      ORDER BY p.rating DESC, p.created_at DESC 
      LIMIT 8
    `);

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id 
      ORDER BY c.name
    `);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q: query, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let searchQuery = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE (p.name LIKE ? OR p.description LIKE ?)
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE (p.name LIKE ? OR p.description LIKE ?)
    `;

    const searchTerm = `%${query}%`;
    let queryParams = [searchTerm, searchTerm];
    let countParams = [searchTerm, searchTerm];

    // Add category filter
    if (category) {
      searchQuery += ' AND c.name = ?';
      countQuery += ' AND category_id = (SELECT id FROM categories WHERE name = ?)';
      queryParams.push(category);
      countParams.push(category);
    }

    // Add price filters
    if (minPrice) {
      searchQuery += ' AND p.price >= ?';
      countQuery += ' AND price >= ?';
      queryParams.push(parseFloat(minPrice));
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      searchQuery += ' AND p.price <= ?';
      countQuery += ' AND price <= ?';
      queryParams.push(parseFloat(maxPrice));
      countParams.push(parseFloat(maxPrice));
    }

    searchQuery += ' ORDER BY p.rating DESC, p.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.execute(searchQuery, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const [products] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product: products[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;