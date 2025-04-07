const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getWallet,
  addFunds,
  transferFunds
} = require('../controllers/walletController');

// Get wallet balance
router.get('/', auth, getWallet);

// Add funds to wallet
router.post('/funds', auth, addFunds);

// Transfer funds from MCP to Partner
router.post('/transfer', auth, transferFunds);

module.exports = router; 