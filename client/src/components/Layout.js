import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiHome, FiPackage, FiUsers, FiCreditCard, FiLogOut } from 'react-icons/fi';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMcp = user?.role === 'mcp';
  const baseRoute = isMcp ? '/mcp' : '/partner';

  const navigation = [
    { name: 'Dashboard', path: `${baseRoute}/dashboard`, icon: FiHome },
    { name: 'Orders', path: `${baseRoute}/orders`, icon: FiPackage },
    ...(isMcp ? [{ name: 'Partners', path: '/mcp/partners', icon: FiUsers }] : []),
    { name: 'Wallet', path: `${baseRoute}/wallet`, icon: FiCreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-primary">MCP System</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-600"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.role === 'mcp' ? 'MCP Dashboard' : 'Partner Dashboard'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 