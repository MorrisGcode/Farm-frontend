import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Mock Lucide React Icons (via CDN)
const X = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-x"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const PlusCircle = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-plus-circle"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );


// MilkRecordForm now accepts onSave and onCancel props
const MilkRecordForm = ({ onSave, onCancel, editingRecord }) => {
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

  // Effect to populate form when editingRecord changes
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        cow: editingRecord.cow,
        date: editingRecord.date,
        morning_amount: editingRecord.morning_amount,
        evening_amount: editingRecord.evening_amount,
        notes: editingRecord.notes || ''
      });
    } else {
      // Reset form for new record
      setFormData({
        cow: '',
        date: new Date().toISOString().split('T')[0],
        morning_amount: '',
        evening_amount: '',
        notes: ''
      });
    }
    setError(''); // Clear errors on form open/reset
  }, [editingRecord]);


  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/cows/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCows(response.data);
      } catch (err) {
        setError('Failed to fetch cows for the form.');
        console.error('Error fetching cows:', err);
      }
    };
    fetchCows();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.cow || !formData.date || formData.morning_amount === '' || formData.evening_amount === '') {
      setError('Please fill in all required fields (Cow, Date, Morning Amount, Evening Amount).');
      setLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.morning_amount)) || parseFloat(formData.morning_amount) < 0 ||
        isNaN(parseFloat(formData.evening_amount)) || parseFloat(formData.evening_amount) < 0) {
      setError('Morning and Evening amounts must be valid positive numbers.');
      setLoading(false);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        cow: parseInt(formData.cow, 10), // Ensure cow ID is an integer
        morning_amount: parseFloat(formData.morning_amount),
        evening_amount: parseFloat(formData.evening_amount)
      };
      
      // Call the onSave prop, passing the data
      await onSave(dataToSave);
      setLoading(false);
      // Form will be closed by the parent component via onSave's success
    } catch (err) {
      console.error('Error saving milk record:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to save milk record');
      setLoading(false);
    }
  };

  return (
    // Modal Overlay and Content Wrapper
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700">{editingRecord ? 'Edit Milk Record' : 'Add Milk Record'}</h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cow" className="block text-sm font-medium text-gray-700 mb-1">Cow <span className="text-red-500">*</span></label>
                    <select
                        id="cow"
                        name="cow"
                        value={formData.cow}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    >
                        <option value="">Select a cow</option>
                        {cows.map(cow => (
                            <option key={cow.id} value={cow.id}>{cow.name} (Ear Tag: {cow.ear_tag_number})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    />
                </div>
                <div>
                    <label htmlFor="morning_amount" className="block text-sm font-medium text-gray-700 mb-1">Morning Amount (L) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="morning_amount"
                        name="morning_amount"
                        step="0.1"
                        min="0"
                        value={formData.morning_amount}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        placeholder="e.g., 15.5"
                    />
                </div>
                <div>
                    <label htmlFor="evening_amount" className="block text-sm font-medium text-gray-700 mb-1">Evening Amount (L) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="evening_amount"
                        name="evening_amount"
                        step="0.1"
                        min="0"
                        value={formData.evening_amount}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        placeholder="e.g., 10.0"
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        rows="3"
                        placeholder="Any additional notes about this record..."
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default MilkRecordForm;
