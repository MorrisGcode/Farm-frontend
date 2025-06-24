import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CowList = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/cows/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCows(response.data);
      } catch (err) {
        console.error('Error fetching cows:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        setError('Failed to fetch cows. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen-minus-header">
        <p className="text-xl text-gray-600 animate-pulse">Loading farm cows...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Farm Cows</h2>
        {user.role === 'MANAGER' && (
          <Link
            to="/dashboard/add-cow"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add New Cow
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cows.map((cow) => (
              <tr key={cow.id}>
                <td className="px-6 py-4 whitespace-nowrap">{cow.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cow.breed_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{cow.age} years</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    cow.health_status === 'HEALTHY' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cow.health_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/dashboard/cow/${cow.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
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
  );
};

export default CowList;
