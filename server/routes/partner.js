const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getPartners,
  getPartnerDetails,
  updatePartnerStatus,
  getPartnerLocation
} = require('../controllers/partnerController');

// Get all partners
router.get('/', auth, getPartners);

// Get partner details
router.get('/:id', auth, getPartnerDetails);

// Update partner status
router.put('/:id/status', auth, updatePartnerStatus);

// Get partner location
router.get('/:id/location', auth, getPartnerLocation);

module.exports = router; 