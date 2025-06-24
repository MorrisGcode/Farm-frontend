import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BreedingRecords = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]); // State to store cows for the dropdown
  const [form, setForm] = useState({
    cow: '', // Will store cow ID (integer)
    bull_name: '',
    breeding_date: '',
    insemination_method: 'NATURAL',
    expected_calving_date: '', // Will be null if left blank
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRecordId, setEditingRecordId] = useState(null); // State to store ID of record being edited
  const [filterCowId, setFilterCowId] = useState(''); // State for filtering records by cow ID

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please log in.');
      return null;
    }
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Function to fetch all records (used after CUD operations and for filtering)
  const fetchRecords = async (cowIdFilter = '') => {
    const config = getAuthHeaders();
    if (!config) return;

    try {
      let url = 'http://127.0.0.1:8000/api/breeding-records/';
      if (cowIdFilter) {
        // Assuming your backend API allows filtering by cow ID like this
        // You might need to adjust your Django view to support this query param
        url += `?cow_id=${cowIdFilter}`;
      }
      const recordsRes = await axios.get(url, config);
      setRecords(recordsRes.data);
    } catch (err) {
      console.error("Error fetching breeding records:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to load breeding records. Please try again.');
      }
    }
  };

  // Initial data fetch (cows and all records)
  useEffect(() => {
    const fetchData = async () => {
      setError('');
      if (user.role !== 'MANAGER') {
        setError('You do not have permission to view breeding records.');
        return;
      }

      const config = getAuthHeaders();
      if (!config) return;

      try {
        const cowsRes = await axios.get('http://127.0.0.1:8000/api/cows/', config);
        setCows(cowsRes.data);
        await fetchRecords(); // Fetch all records initially
      } catch (err) {
        console.error("Error fetching initial data:", err);
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
        } else {
          setError('Failed to load initial data (cows/records).');
        }
      }
    };

    fetchData();
  }, [user.role]); // Dependency array: re-run if user role changes

  // Trigger record fetch when filterCowId changes
  useEffect(() => {
    fetchRecords(filterCowId);
  }, [filterCowId]); // Only re-run when filterCowId changes

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prevForm => {
      let newValue = value;

      // Special handling for 'cow' (ForeignKey expects integer ID)
      if (name === 'cow') {
        newValue = value === '' ? '' : parseInt(value, 10);
      }
      // Special handling for optional date fields: convert empty string to null
      // For expected_calving_date, send null if blank as per your serializer setup
      else if (name === 'expected_calving_date') {
        newValue = value === '' ? null : value;
      }

      return {
        ...prevForm,
        [name]: newValue
      };
    });
  };

  // Handle filter change
  const handleFilterChange = e => {
    setFilterCowId(e.target.value);
  };

  // Function to reset the form
  const resetForm = () => {
    setForm({
      cow: '',
      bull_name: '',
      breeding_date: '',
      insemination_method: 'NATURAL',
      expected_calving_date: '',
      notes: ''
    });
    setEditingRecordId(null); // Exit editing mode
    setError('');
    setSuccess('');
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const config = getAuthHeaders();
    if (!config) return;

    try {
      const dataToSend = { ...form };
      // Ensure expected_calving_date is null if empty, not an empty string or removed
      if (dataToSend.expected_calving_date === '') {
        dataToSend.expected_calving_date = null;
      }

      if (editingRecordId) {
        // UPDATE existing record
        await axios.put(`http://127.0.0.1:8000/api/breeding-records/${editingRecordId}/`, dataToSend, config);
        setSuccess('Breeding record updated successfully!');
      } else {
        // ADD new record
        await axios.post('http://127.0.0.1:8000/api/breeding-records/', dataToSend, config);
        setSuccess('Breeding record added!');
      }
      resetForm(); // Reset form and exit editing mode
      await fetchRecords(filterCowId); // Refresh the list, maintaining the filter
    } catch (err) {
      console.error("Error submitting breeding record:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 400) {
        // Display specific validation errors from Django
        setError(`Failed to submit record: ${JSON.stringify(err.response.data)}`);
      } else if (err.response && err.response.status === 401) {
        setError('Unauthorized: Please log in again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Function to populate form for editing
  const onEdit = (record) => {
    setEditingRecordId(record.id);
    setForm({
      cow: record.cow, // cow is already an integer ID
      bull_name: record.bull_name,
      breeding_date: record.breeding_date,
      insemination_method: record.insemination_method,
      expected_calving_date: record.expected_calving_date || '', // Converts null to '' for date input
      notes: record.notes || ''
    });
    setSuccess(''); // Clear any previous success message
    setError(''); // Clear any previous error message
  };

  // Function to delete a record
  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this breeding record?')) {
      return; // User cancelled
    }

    const config = getAuthHeaders();
    if (!config) return;

    setError('');
    setSuccess('');

    try {
      await axios.delete(`http://127.0.0.1:8000/api/breeding-records/${id}/`, config);
      setSuccess('Breeding record deleted successfully!');
      await fetchRecords(filterCowId); // Refresh the list, maintaining the filter
      // If the deleted record was the one being edited, clear the form
      if (editingRecordId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting breeding record:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 401) {
        setError('Unauthorized: Please log in again.');
      } else {
        setError('Failed to delete breeding record. Please try again.');
      }
    }
  };

  if (user.role !== 'MANAGER') {
    return (
      <div className="text-center text-red-600 mt-8">
        You do not have permission to view breeding records.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{editingRecordId ? 'Edit Breeding Record' : 'Add New Breeding Record'}</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      {/* Add/Edit Breeding Record Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cow</label>
          <select
            name="cow"
            value={form.cow}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
            disabled={!!editingRecordId} // Disable cow selection when editing
          >
            <option value="">Select Cow</option>
            {cows.map(cow => (
              <option key={cow.id} value={cow.id}>{cow.name} ({cow.tag_number})</option>
            ))}
          </select>
          {editingRecordId && (
            <p className="text-xs text-gray-500 mt-1">Cow cannot be changed when editing a record.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bull Name</label>
          <input
            type="text"
            name="bull_name"
            value={form.bull_name}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
            placeholder="Name of the bull"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Breeding Date</label>
          <input
            type="date"
            name="breeding_date"
            value={form.breeding_date}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Insemination Method</label>
          <select
            name="insemination_method"
            value={form.insemination_method}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="NATURAL">Natural Breeding</option>
            <option value="AI">Artificial Insemination</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Expected Calving Date</label>
          <input
            type="date"
            name="expected_calving_date"
            value={form.expected_calving_date || ''} // Handle null to empty string for input
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Leave blank to auto-calculate"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to auto-calculate (280 days after breeding date)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Any additional notes"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingRecordId ? 'Update Record' : 'Add Record'}
          </button>
          {editingRecordId && (
            <button
              type="button" // Use type="button" to prevent form submission
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Filter by Cow */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Filter by Cow:</label>
        <select
          name="filterCow"
          value={filterCowId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-full md:w-1/2 lg:w-1/3"
        >
          <option value="">All Cows</option>
          {cows.map(cow => (
            <option key={cow.id} value={cow.id}>{cow.name} ({cow.tag_number})</option>
          ))}
        </select>
      </div>

      {/* Breeding Records Table */}
      <h3 className="text-xl font-bold mb-3 mt-8">Existing Breeding Records</h3>
      {records.length === 0 ? (
        <p>No breeding records found {filterCowId ? 'for the selected cow' : ''}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Cow</th>
                <th className="py-2 px-4 border-b">Bull</th>
                <th className="py-2 px-4 border-b">Breeding Date</th>
                <th className="py-2 px-4 border-b">Method</th>
                <th className="py-2 px-4 border-b">Expected Calving</th>
                <th className="py-2 px-4 border-b">Notes</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{record.cow_name || 'N/A'}</td> {/* Use cow_name from serializer */}
                  <td className="py-2 px-4">{record.bull_name}</td>
                  <td className="py-2 px-4">{record.breeding_date}</td>
                  <td className="py-2 px-4">
                    {record.insemination_method === 'NATURAL' ? 'Natural' : 'Artificial Insemination'}
                  </td>
                  <td className="py-2 px-4">{record.expected_calving_date || 'N/A'}</td> {/* Display N/A for null */}
                  <td className="py-2 px-4">{record.notes || 'N/A'}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => onEdit(record)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BreedingRecords;