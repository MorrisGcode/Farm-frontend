import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Make sure react-router-dom is installed

const CowHealthRecords = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { cowId } = useParams(); // Get cowId from URL params, if present

  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    cow: cowId ? parseInt(cowId, 10) : '', // Pre-fill cow if cowId is in URL, parse to int
    record_date: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medication_administered: '',
    vet_name: '',
    next_checkup_date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingRecordId, setEditingRecordId] = useState(null); // State to store ID of record being edited

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

  // Function to fetch all records (used after CUD operations)
  const fetchRecords = async () => {
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }
    try {
      const recordsRes = await axios.get('http://127.0.0.1:8000/api/health-records/', config);
      setRecords(recordsRes.data);
    } catch (err) {
      console.error("Error fetching health records:", err);
      if (err.response && err.response.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to load health records. Please try again.');
      }
    }
  };

  // Initial data fetch (cows and all records)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      if (user.role !== 'MANAGER') {
        setError('You do not have permission to view health records.');
        setLoading(false);
        return;
      }

      const config = getAuthHeaders();
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        const cowsRes = await axios.get('http://127.0.0.1:8000/api/cows/', config);
        setCows(cowsRes.data);
        await fetchRecords(); // Fetch records initially
      } catch (err) {
        console.error("Error fetching initial data:", err);
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
        } else {
          setError('Failed to load initial data (cows/records).');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]); // Dependency array: re-run if user role changes

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
      else if (name === 'next_checkup_date') {
        newValue = value === '' ? null : value;
      }

      return {
        ...prevForm,
        [name]: newValue
      };
    });
  };

  // Function to reset the form
  const resetForm = () => {
    setForm({
      cow: cowId ? parseInt(cowId, 10) : '', // Reset to URL cowId if present
      record_date: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      medication_administered: '',
      vet_name: '',
      next_checkup_date: '',
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
      if (editingRecordId) {
        // UPDATE existing record
        await axios.put(`http://127.0.0.1:8000/api/health-records/${editingRecordId}/`, form, config);
        setSuccess('Health record updated successfully!');
      } else {
        // ADD new record
        await axios.post('http://127.0.0.1:8000/api/health-records/', form, config);
        setSuccess('Health record added successfully!');
      }
      resetForm(); // Reset form and exit editing mode
      await fetchRecords(); // Refresh the list
    } catch (err) {
      console.error("Error submitting health record:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 400) {
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
    // Populate form fields, ensuring date fields are in YYYY-MM-DD format for input type="date"
    setForm({
      cow: record.cow, 
      record_date: record.record_date,
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medication_administered: record.medication_administered || '',
      vet_name: record.vet_name || '',
      next_checkup_date: record.next_checkup_date || '', // Converts null to '' for date input
      notes: record.notes || ''
    });
    setSuccess(''); 
    setError(''); 
  };

  // delete a record
  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this health record?')) {
      return; 
    }

    const config = getAuthHeaders();
    if (!config) return;

    setError('');
    setSuccess('');

    try {
      await axios.delete(`http://127.0.0.1:8000/api/health-records/${id}/`, config);
      setSuccess('Health record deleted successfully!');
      await fetchRecords(); // Refresh the list
      // If the deleted record was the one being edited, clear the form
      if (editingRecordId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting health record:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 401) {
        setError('Unauthorized: Please log in again.');
      } else {
        setError('Failed to delete health record. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading health records...</div>;
  }

  if (user.role !== 'MANAGER') {
    return (
      <div className="text-center text-red-600 mt-8">
        You do not have permission to view health records.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{editingRecordId ? 'Edit Health Record' : 'Add New Health Record'}</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      {/* Add/Edit Health Record Form */}
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
          <label className="block text-sm font-medium text-gray-700">Record Date</label>
          <input
            type="date"
            name="record_date"
            value={form.record_date}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Symptoms</label>
          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="e.g., Coughing, loss of appetite"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="e.g., Bovine Respiratory Disease"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Treatment</label>
          <textarea
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="e.g., Administered antibiotics, kept isolated"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Medication Administered</label>
          <input
            type="text"
            name="medication_administered"
            value={form.medication_administered}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="e.g., Penicillin G (2 doses)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Veterinarian Name</label>
          <input
            type="text"
            name="vet_name"
            value={form.vet_name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Name of the attending vet"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Next Check-up Date</label>
          <input
            type="date"
            name="next_checkup_date"
            value={form.next_checkup_date || ''}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Any additional notes on the health record"
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

      {/* Health Records Table */}
      <h3 className="text-xl font-bold mb-3 mt-8">Existing Health Records</h3>
      {records.length === 0 ? (
        <p>No health records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Cow</th>
                <th className="py-2 px-4 border-b">Record Date</th>
                <th className="py-2 px-4 border-b">Diagnosis</th>
                <th className="py-2 px-4 border-b">Treatment</th>
                <th className="py-2 px-4 border-b">Vet Name</th>
                <th className="py-2 px-4 border-b">Next Check-up</th>
                <th className="py-2 px-4 border-b">Recorded By</th> {/* Added Recorded By column */}
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{record.cow_name || 'N/A'}</td> {/* Display cow_name */}
                  <td className="py-2 px-4">{record.record_date}</td>
                  <td className="py-2 px-4">{record.diagnosis || 'N/A'}</td>
                  <td className="py-2 px-4">{record.treatment || 'N/A'}</td>
                  <td className="py-2 px-4">{record.vet_name || 'N/A'}</td>
                  <td className="py-2 px-4">{record.next_checkup_date || 'N/A'}</td>
                  {/* Display recorded_by's username if available */}
                  <td className="py-2 px-4">{record.recorded_by_username || record.recorded_by || 'N/A'}</td>
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

export default CowHealthRecords;