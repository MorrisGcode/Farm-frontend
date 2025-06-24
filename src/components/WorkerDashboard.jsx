import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const WorkerDashboard = () => {
  const [stats, setStats] = useState({
    assigned_cows: 0,
    records_today: 0,
    total_milk_recorded: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Retrieve user and token from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Basic check for authentication before making requests
      if (!user.username || !token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        
        const response = await axios.get('http://localhost:8000/api/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setStats(response.data);
        setError(''); 
      } catch (err) {
        console.error('Worker Dashboard Data Error:', err.response ? err.response.data : err);
        if (err.response?.status === 403) {
          setError('Access denied. You do not have permission to view this dashboard data.');
        } else if (err.response?.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          navigate('/login'); 
        } else {
          setError('Failed to load dashboard data. Please try again or check backend.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      // Notifications might be accessible to all authenticated users
      if (!token) {
        setNotifications([]); 
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:8000/api/notifications/', config);
        setNotifications(res.data);
      } catch (err) {
        console.error('Worker Notifications Error:', err.response ? err.response.data : err);
       
        setNotifications([]);
      }
    };

    fetchDashboardData();
    fetchNotifications();
  }, [navigate, user.username, token]); // Dependencies to re-run effect if auth info changes

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

 
  const isWorker = user.role?.toUpperCase() === 'WORKER';

  if (loading) {
    return <div className="text-center py-4 text-gray-700 font-semibold">Loading dashboard data...</div>;
  }

  // Display error if data fetch failed or access is denied
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
        <p className="font-semibold text-lg text-center mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
        <button
          onClick={handleLogout}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    
    <div className="flex-1 bg-gray-50 p-6"> {/*  Dashboard Outlet */}
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Assigned Cows</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.assigned_cows || 0}</p> {/* Ensure default 0 */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Records Today</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.records_today || 0}</p> {/* Ensure default 0 */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Milk Today (L)</h3>
          <p className="text-3xl font-bold text-green-600">{stats.total_milk_recorded || 0}</p> {/* Ensure default 0 */}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Manager Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-gray-500">No notifications yet.</div>
        ) : (
          <ul>
            {notifications.map(notif => (
              <li key={notif.id} className="mb-2 border-b pb-2">
                <span className="font-semibold">{notif.created_by_name}:</span> {notif.message}
                <span className="block text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Worker Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/milk-records/add"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Milk Record
            </Link>
            <Link
              to="/dashboard/milk-records"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              View Milk Records
            </Link>
            <Link
              to="/dashboard/feeding-report"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
            >
              Add Feeding Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
