import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import MCPDashboard from './pages/mcp/Dashboard';
import PartnerDashboard from './pages/partner/Dashboard';
import Partners from './pages/mcp/Partners';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/mcp/dashboard" replace />} />
            
            {/* MCP Routes */}
            <Route path="mcp">
              <Route path="dashboard" element={<MCPDashboard />} />
              <Route path="partners" element={<Partners />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Partner Routes */}
            <Route path="partner">
              <Route path="dashboard" element={<PartnerDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
