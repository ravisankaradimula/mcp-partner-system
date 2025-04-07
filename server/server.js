const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Trying to connect to local MongoDB as fallback...');
    
    try {
      await mongoose.connect('mongodb://localhost:27017/mcp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to local MongoDB successfully');
    } catch (localError) {
      console.error('Local MongoDB connection error:', localError.message);
      console.log('Please make sure MongoDB is installed and running, or check your MongoDB Atlas connection string.');
      // Don't exit the process, let the app continue running
    }
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/order', require('./routes/order'));
app.use('/api/partner', require('./routes/partner'));
app.use('/api/wallet', require('./routes/wallet'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 