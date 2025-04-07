import React, { useState, useEffect } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // Get wallet balance and transactions
      const walletResponse = await api.get('/wallet');
      setBalance(walletResponse.data.balance);
      setTransactions(walletResponse.data.transactions || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wallet/funds', { amount: parseFloat(amount) });
      setShowAddFundsModal(false);
      setAmount('');
      fetchWalletData();
    } catch (error) {
      console.error('Error adding funds:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <FiDownload className="text-green-500" />
    ) : (
      <FiUpload className="text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        {user.role === 'mcp' && (
          <button
            onClick={() => setShowAddFundsModal(true)}
            className="btn btn-primary"
          >
            Add Funds
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Current Balance</h2>
          <div className="text-3xl font-bold text-primary">₹{balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <li key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type || 'credit')}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description || `Transaction #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.date ? formatDate(transaction.date) : 'No date'}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{(transaction.amount || 0).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-4 text-center text-gray-500">
                No transactions found
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Funds to Wallet</h2>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input mt-1"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  Add Funds
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFundsModal(false)}
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

export default Wallet; 