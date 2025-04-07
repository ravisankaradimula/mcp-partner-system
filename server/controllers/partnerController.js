const User = require('../models/User');
const Order = require('../models/Order');

// Get all partners for an MCP
const getPartners = async (req, res) => {
  try {
    // Check if user is MCP
    if (req.user.role !== 'mcp') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .sort({ name: 1 });
    
    console.log('Found partners:', partners.length);
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Error fetching partners' });
  }
};

// Get partner details
const getPartnerDetails = async (req, res) => {
  try {
    const partner = await User.findById(req.params.id)
      .select('-password');
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Only MCP or the partner themselves can view the details
    if (req.user.role !== 'mcp' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner details:', error);
    res.status(500).json({ message: 'Error fetching partner details' });
  }
};

// Update partner status
const updatePartnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check if user is MCP
    if (req.user.role !== 'mcp') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const partner = await User.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    partner.status = status;
    await partner.save();
    
    res.json(partner);
  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({ message: 'Error updating partner status' });
  }
};

// Get partner location
const getPartnerLocation = async (req, res) => {
  try {
    const partner = await User.findById(req.params.id).select('address');
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json(partner.address);
  } catch (error) {
    console.error('Error fetching partner location:', error);
    res.status(500).json({ message: 'Error fetching partner location' });
  }
};

module.exports = {
  getPartners,
  getPartnerDetails,
  updatePartnerStatus,
  getPartnerLocation
}; 