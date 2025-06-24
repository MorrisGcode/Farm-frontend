import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MilkRecordForm = () => {
  const navigate = useNavigate();
  const [cows, setCows] = useState([]);
  const [formData, setFormData] = useState({
    cow: '',
    date: new Date().toISOString().split('T')[0],
    morning_amount: '',
    evening_amount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/cows/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCows(response.data);
      } catch (err) {
        setError('Failed to fetch cows');
      }
    };
    fetchCows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/milk-production/',
        {
          ...formData,
          morning_amount: parseFloat(formData.morning_amount),
          evening_amount: parseFloat(formData.evening_amount)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate('/dashboard/milk-records');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add milk record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Add Milk Record</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cow</label>
          <select
            value={formData.cow}
            onChange={(e) => setFormData({...formData, cow: e.target.value})}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select a cow</option>
            {cows.map(cow => (
              <option key={cow.id} value={cow.id}>{cow.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Morning Amount (L)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.morning_amount}
            onChange={(e) => setFormData({...formData, morning_amount: e.target.value})}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Evening Amount (L)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.evening_amount}
            onChange={(e) => setFormData({...formData, evening_amount: e.target.value})}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Adding...' : 'Add Record'}
        </button>
      </form>
    </div>
  );
};

export default MilkRecordForm;