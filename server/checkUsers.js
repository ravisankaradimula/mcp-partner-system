const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/mcp', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find().select('-password');
    console.log('Users in database:', users);

    // Create a test user if none exist
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'mcp',
        phone: '1234567890'
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers(); 