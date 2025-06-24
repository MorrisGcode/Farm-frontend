import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../utils/auth';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalCows: 0,
    healthyCows: 0,
    sickCows: 0,
    totalMilkToday: 0
  });
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notifError, setNotifError] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Set up axios defaults
        axios.defaults.baseURL = 'http://localhost:8000/api';
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Make concurrent requests
        const [cowsResponse, milkResponse] = await Promise.all([
          axios.get('/cows/'),
          axios.get('/milk-production/stats/')
        ]);

        // Update states with response data
        setCows(cowsResponse.data);
        setStats({
          totalCows: cowsResponse.data.length,
          healthyCows: cowsResponse.data.filter(cow => cow.health_status === 'HEALTHY').length,
          sickCows: cowsResponse.data.filter(cow => cow.health_status === 'SICK').length,
          totalMilkToday: milkResponse.data.total_today || 0
        });
      } catch (err) {
        console.error('Dashboard Error:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://localhost:8000/api/notifications/', config);
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      }
    };

    fetchDashboardData();
    fetchNotifications();
  }, [navigate]);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setNotifError('');
    setNotifSuccess('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:8000/api/notifications/', { message: notificationMsg }, config);
      setNotifSuccess('Notification sent!');
      setNotificationMsg('');
      // Refresh notifications
      const res = await axios.get('http://localhost:8000/api/notifications/', config);
      setNotifications(res.data);
    } catch {
      setNotifError('Failed to send notification');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error: {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 text-blue-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Cows</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCows}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Healthy Cows</h3>
          <p className="text-3xl font-bold text-green-600">{stats.healthyCows}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Sick Cows</h3>
          <p className="text-3xl font-bold text-red-600">{stats.sickCows}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Today's Milk (L)</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalMilkToday}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/dashboard/add-cow"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Cow
            </Link>
            <Link
              to="/dashboard/milk-records"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              View Milk Records
            </Link>
            <Link
              to="/dashboard/reports"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              Generate Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Updated Cow List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cow Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Milk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cows.map(cow => (
                  <tr key={cow.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cow.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cow.health_status === 'HEALTHY' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cow.health_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cow.total_milk_today || 0} L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/dashboard/cow/${cow.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification Section */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Send Notification to Workers</h2>
        <form onSubmit={handleNotificationSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={notificationMsg}
            onChange={e => setNotificationMsg(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Write a notification for workers..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
        {notifError && <div className="text-red-600 mb-2">{notifError}</div>}
        {notifSuccess && <div className="text-green-600 mb-2">{notifSuccess}</div>}
        <h3 className="text-lg font-bold mb-2">Recent Notifications</h3>
        <ul>
          {notifications.map(notif => (
            <li key={notif.id} className="mb-2 border-b pb-2">
              <span className="font-semibold">{notif.created_by_name}:</span> {notif.message}
              <span className="block text-xs text-gray-500">{new Date(notif.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManagerDashboard;