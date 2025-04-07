const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createOrder,
  getMCPOrders,
  getPartnerOrders,
  updateOrderStatus,
  getOrderById
} = require('../controllers/orderController');

// MCP routes
router.get('/mcp', auth, getMCPOrders);
router.post('/', auth, createOrder);

// Partner routes
router.get('/partner', auth, getPartnerOrders);

// Common routes
router.get('/:id', auth, getOrderById);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router; 