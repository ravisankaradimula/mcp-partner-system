import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.put('/user/profile', formData);
      setProfile(response.data);
      updateUser(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-secondary flex items-center"
          >
            <FiEdit2 className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditing(false);
                setFormData(profile);
                setError('');
              }}
              className="btn btn-secondary flex items-center"
            >
              <FiX className="mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="card">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editing ? formData.name : profile.name}
                  onChange={handleChange}
                  className="input mt-1"
                  disabled={!editing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editing ? formData.email : profile.email}
                  onChange={handleChange}
                  className="input mt-1"
                  disabled={!editing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editing ? formData.phone : profile.phone}
                  onChange={handleChange}
                  className="input mt-1"
                  disabled={!editing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={profile.role}
                  className="input mt-1"
                  disabled
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={editing ? formData.address.street : profile.address.street}
                    onChange={handleChange}
                    className="input mt-1"
                    disabled={!editing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={editing ? formData.address.city : profile.address.city}
                    onChange={handleChange}
                    className="input mt-1"
                    disabled={!editing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={editing ? formData.address.state : profile.address.state}
                    onChange={handleChange}
                    className="input mt-1"
                    disabled={!editing}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editing ? formData.address.zipCode : profile.address.zipCode}
                    onChange={handleChange}
                    className="input mt-1"
                    disabled={!editing}
                    required
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary flex items-center">
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 