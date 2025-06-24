import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MilkRecords = () => {
  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [selectedCow, setSelectedCow] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to fetch records based on current filters
  const fetchRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please log in.');

      const params = new URLSearchParams();
      if (selectedCow) params.append('cow', selectedCow);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await axios.get(
        `http://localhost:8000/api/milk-records/?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setRecords(response.data);
    } catch (err) {
      console.error('Error fetching records:', err);
      // More user-friendly error messages
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load milk records. Please try again.'
      );
      setRecords([]); // Clear records on error
    } finally {
      setLoading(false);
    }
  };

  // Handler for applying filters
  const handleApplyFilters = () => {
    fetchRecords();
  };

  // Initial data fetch on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found. Please log in.');

        // Fetch cows for the filter dropdown
        const cowsResponse = await axios.get('http://localhost:8000/api/cows/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCows(cowsResponse.data);

        // Fetch initial milk records
        // No need for a separate fetchRecords() call here, it's done below
      } catch (err) {
        console.error('Error during initial data fetch:', err);
        setError('Failed to load initial data (cows or records).');
      }
    };

    fetchData(); // Fetch cows once on mount
    fetchRecords(); // Fetch records on mount and when filter states change
  }, []); // Empty dependency array means this effect runs once on mount

  // This useEffect re-runs `fetchRecords` whenever filter states change
  // If you only want `fetchRecords` to run when "Apply Filters" button is clicked,
  // remove this useEffect and rely solely on `handleApplyFilters`
  useEffect(() => {
    fetchRecords();
  }, [selectedCow, startDate, endDate]); // Re-fetch when filters change


  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Milk Production Records
        </h2>
        <Link
          to="/dashboard/milk-records/add"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add New Record
        </Link>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Records</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label htmlFor="cow-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Cow
            </label>
            <select
              id="cow-select"
              value={selectedCow}
              onChange={(e) => setSelectedCow(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">All Cows</option>
              {cows.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="w-full sm:col-span-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Loading State Display */}
      {loading && (
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-700">Loading milk records...</p>
        </div>
      )}

      {/* Records Table */}
      {!loading && records.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-600 border border-gray-200">
          <p className="text-lg">No milk records found for the selected criteria.</p>
          <p className="mt-2 text-sm">Try adjusting your filters or add a new record.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cow
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Morning (L)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evening (L)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (L)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorded By
                  </th>
                  {/* Add an Actions column here if you plan to add edit/delete buttons */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors duration-150'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.cow_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.morning_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.evening_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {(record.morning_amount + record.evening_amount).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.recorded_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilkRecords;