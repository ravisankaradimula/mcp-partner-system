const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { partnerId, amount, type, description } = req.body;
    
    // Verify partner exists and is active
    const partner = await User.findOne({ _id: partnerId, role: 'partner', status: 'active' });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found or inactive' });
    }

    const order = new Order({
      mcp: req.user._id,
      partner: partnerId,
      amount,
      type,
      description
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get all orders for MCP
const getMCPOrders = async (req, res) => {
  try {
    const orders = await Order.find({ mcp: req.user._id })
      .populate('partner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching MCP orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all orders for Partner
const getPartnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ partner: req.user._id })
      .populate('mcp', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching partner orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('mcp', 'wallet')
      .populate('partner', 'wallet');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    if (order.mcp._id.toString() !== req.user._id.toString() && 
        order.partner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    if (status === 'completed') {
      order.completedAt = Date.now();
      
      // Update MCP wallet
      order.mcp.wallet.balance -= order.amount;
      order.mcp.wallet.transactions.push({
        type: 'debit',
        amount: order.amount,
        description: `Order completion: ${order.description}`,
        date: new Date()
      });

      // Update Partner wallet
      order.partner.wallet.balance += order.amount;
      order.partner.wallet.transactions.push({
        type: 'credit',
        amount: order.amount,
        description: `Order completion: ${order.description}`,
        date: new Date()
      });

      await order.mcp.save();
      await order.partner.save();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Assign order to partner
const assignOrder = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.partner = partnerId;
    order.status = 'assigned';
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning order', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('mcp', 'name email phone')
      .populate('partner', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership
    if (order.mcp.toString() !== req.user._id.toString() && 
        order.partner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

module.exports = {
  createOrder,
  getMCPOrders,
  getPartnerOrders,
  updateOrderStatus,
  assignOrder,
  getOrderById
}; 