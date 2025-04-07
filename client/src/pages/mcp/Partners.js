import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Partners = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = { Authorization: `Bearer ${token}` };
        console.log('Fetching partners...');
        
        const response = await axios.get('http://localhost:5000/api/partner', { headers });
        console.log('Partners response:', response.data);
        
        setPartners(response.data);
      } catch (error) {
        console.error('Error fetching partners:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'inactive':
        return <span className="badge badge-warning">Inactive</span>;
      case 'suspended':
        return <span className="badge badge-danger">Suspended</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading partners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your collection partners</p>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No partners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div key={partner._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{partner.name}</h3>
                  {getStatusBadge(partner.status)}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMail className="w-4 h-4 mr-2" />
                    {partner.email}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {partner.phone}
                  </div>
                  
                  {partner.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2 mt-1" />
                      <div>
                        {partner.address.street && <div>{partner.address.street}</div>}
                        {partner.address.city && partner.address.state && (
                          <div>{partner.address.city}, {partner.address.state}</div>
                        )}
                        {partner.address.zipCode && <div>{partner.address.zipCode}</div>}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex -space-x-1">
                      {partner.rating > 0 ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <FiCheckCircle 
                            key={i} 
                            className={`w-4 h-4 ${i < partner.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No ratings yet</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {partner.completedOrders} orders completed
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Partners; 