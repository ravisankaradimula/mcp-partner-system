import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [newOrder, setNewOrder] = useState({
    partnerId: '',
    amount: '',
    type: 'credit',
    description: ''
  });

  const fetchPartners = useCallback(async () => {
    try {
      const response = await api.get('/partner');
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const endpoint = user.role === 'mcp' ? '/order/mcp' : '/order/partner';
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    if (user.role === 'mcp') {
      fetchPartners();
    }
  }, [user, fetchOrders, fetchPartners]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/order', newOrder);
      setShowCreateModal(false);
      setNewOrder({
        partnerId: '',
        amount: '',
        type: 'credit',
        description: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error creating order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/order/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input py-1"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {user.role === 'mcp' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              New Order
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.partner.name}</div>
                    <div className="text-sm text-gray-500">{order.partner.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className="input py-1"
                      disabled={order.status === 'completed' || order.status === 'cancelled'}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Partner</label>
                <select
                  value={newOrder.partnerId}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    partnerId: e.target.value
                  }))}
                  className="input mt-1"
                  required
                >
                  <option value="">Select a partner</option>
                  {partners.map(partner => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  className="input mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newOrder.type}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    type: e.target.value
                  }))}
                  className="input mt-1"
                  required
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="input mt-1"
                  required
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 