import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.role) {
        navigate('/login');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <SideMenu />
      <div className="flex-1 bg-gray-50 p-6">
        <nav className="bg-white shadow-lg mb-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/dashboard/cows" className="text-gray-700 hover:text-gray-900">
                  View Cows
                </Link>
                <Link to="/dashboard/milk-records" className="text-gray-700 hover:text-gray-900">
                  Milk Records
                </Link>
              </div>
              <div className="flex items-center">
                <span className="mr-4">Welcome, {user.username}</span>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;