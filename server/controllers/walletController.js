const User = require('../models/User');

// Get wallet balance
const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    res.json(user.wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet', error: error.message });
  }
};

// Add funds to wallet
const addFunds = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.user._id);

    user.wallet.balance += amount;
    user.wallet.transactions.push({
      type: 'credit',
      amount,
      description,
      date: new Date()
    });

    await user.save();
    res.json(user.wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error adding funds', error: error.message });
  }
};

// Withdraw funds from wallet
const withdrawFunds = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.user._id);

    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.wallet.balance -= amount;
    user.wallet.transactions.push({
      type: 'debit',
      amount,
      description,
      date: new Date()
    });

    await user.save();
    res.json(user.wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error withdrawing funds', error: error.message });
  }
};

// Transfer funds from MCP to Partner
const transferFunds = async (req, res) => {
  try {
    const { partnerId, amount, description } = req.body;

    // Check if user is MCP
    if (req.user.role !== 'mcp') {
      return res.status(403).json({ message: 'Only MCP can transfer funds' });
    }

    // Get MCP and Partner
    const mcp = await User.findById(req.user._id);
    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== 'partner') {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Check MCP balance
    if (mcp.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update MCP wallet
    mcp.wallet.balance -= amount;
    mcp.wallet.transactions.push({
      type: 'debit',
      amount,
      description: `Transfer to ${partner.name}: ${description}`,
      date: new Date()
    });

    // Update Partner wallet
    partner.wallet.balance += amount;
    partner.wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Transfer from ${mcp.name}: ${description}`,
      date: new Date()
    });

    await mcp.save();
    await partner.save();

    res.json({
      message: 'Transfer successful',
      mcpWallet: mcp.wallet,
      partnerWallet: partner.wallet
    });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring funds', error: error.message });
  }
};

module.exports = {
  getWallet,
  addFunds,
  withdrawFunds,
  transferFunds
}; 