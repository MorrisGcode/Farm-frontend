import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Lucide React Icons (assuming they are available or replaced with inline SVGs)
const PlusCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
);
const Edit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
);
const Trash2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const X = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const Stethoscope = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stethoscope"><path d="M17 17a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2"/><path d="M9 17v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"/><path d="M18 8h-1.5a2 2 0 0 0-2 2v1.14a2 2 0 0 0 .67 1.86L17 16"/><path d="M6 8h1.5a2 2 0 0 1 2 2v1.14a2 2 0 0 1-.67 1.86L7 16"/><circle cx="12" cy="9" r="2"/></svg>
);


const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/';

const CowHealthRecords = () => {
  // Using localStorage directly as requested
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const { cowId } = useParams(); // Optional: if viewing records for a specific cow

  const [records, setRecords] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    cow: cowId ? parseInt(cowId, 10) : '', // Pre-fill if cowId is in URL
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
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal state for add/edit

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    if (!token) {
      setError('Authentication token missing. Please log in.');
      return null;
    }
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Function to fetch all records
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }
    try {
      const recordsRes = await axios.get(`${DJANGO_API_BASE_URL}health-records/`, config);
      // Filter records by cowId if present in URL
      const filteredRecords = cowId
        ? recordsRes.data.filter(record => record.cow === parseInt(cowId, 10))
        : recordsRes.data;
      setRecords(filteredRecords);
    } catch (err) {
      console.error("Error fetching health records:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to load health records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all cows (for dropdown)
  const fetchCows = async () => {
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      return;
    }
    try {
      const cowsRes = await axios.get(`${DJANGO_API_BASE_URL}cows/`, config);
      setCows(cowsRes.data);
    } catch (err) {
      console.error("Error fetching cows:", err.response ? err.response.data : err);
      if (err.response && err.response.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to load cow data for selection.');
      }
    }
  };

  // Initial data fetch (cows and all records)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      if (user.role?.toUpperCase() !== 'MANAGER') { // Use toUpperCase for consistency
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
        await fetchCows(); // Fetch cows first
        await fetchRecords(); // Then fetch records
      } catch (err) {
        // Errors are already set by fetchCows/fetchRecords
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role, token, cowId]); // Depend on user.role, token, and cowId

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prevForm => {
      let newValue = value;
      if (name === 'cow') {
        newValue = value === '' ? '' : parseInt(value, 10);
      } else if (name === 'next_checkup_date') {
        newValue = value === '' ? null : value; // Ensure null for empty date
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
      cow: cowId ? parseInt(cowId, 10) : '',
      record_date: '',
      symptoms: '',
      diagnosis: '',
      treatment: '',
      medication_administered: '',
      vet_name: '',
      next_checkup_date: '',
      notes: ''
    });
    setEditingRecordId(null);
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

    // Basic validation
    if (!form.cow || !form.record_date) {
      setError('Cow and Record Date are required.');
      return;
    }

    try {
      if (editingRecordId) {
        await axios.put(`${DJANGO_API_BASE_URL}health-records/${editingRecordId}/`, form, config);
        setSuccess('Health record updated successfully!');
      } else {
        await axios.post(`${DJANGO_API_BASE_URL}health-records/`, form, config);
        setSuccess('Health record added successfully!');
      }
      resetForm();
      setShowModal(false); // Close modal after submit
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
    setForm({
      cow: record.cow,
      record_date: record.record_date,
      symptoms: record.symptoms || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medication_administered: record.medication_administered || '',
      vet_name: record.vet_name || '',
      next_checkup_date: record.next_checkup_date || '',
      notes: record.notes || ''
    });
    setSuccess('');
    setError('');
    setShowModal(true); // Open modal for editing
  };

  // delete a record
  const onDelete = async (id) => {
    // Reverted to window.confirm as per user's last provided code snippet
    if (!window.confirm('Are you sure you want to delete this health record?')) {
      return;
    }

    const config = getAuthHeaders();
    if (!config) return;

    setError('');
    setSuccess('');

    try {
      await axios.delete(`${DJANGO_API_BASE_URL}health-records/${id}/`, config);
      setSuccess('Health record deleted successfully!');
      await fetchRecords(); // Refresh the list
      if (editingRecordId === id) {
        resetForm(); // Reset form if the deleted record was being edited
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
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <p className="text-xl font-semibold text-gray-700">Loading health records...</p>
      </div>
    );
  }

  // Role-based access control using localStorage
  if (user.role?.toUpperCase() !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 rounded-lg">
        <p className="font-semibold text-lg text-red-700">You do not have permission to view health records.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-4 sm:p-6 md:p-8 font-inter">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .scale-in {
            animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 flex items-center">
            <Stethoscope className="w-8 h-8 mr-3 text-blue-600" />
            Cow Health Records
          </h1>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Record
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 shadow-md">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError('')}>
              <X className="w-5 h-5 text-red-700" />
            </span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 shadow-md">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">{success}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setSuccess('')}>
              <X className="w-5 h-5 text-green-700" />
            </span>
          </div>
        )}

        {/* Modal for Add/Edit Health Record */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 fade-in">
            <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl p-6 sm:p-8 relative scale-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-6">{editingRecordId ? 'Edit Health Record' : 'Add New Health Record'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="cow" className="block text-sm font-medium text-gray-700 mb-1">Cow <span className="text-red-500">*</span></label>
                  <select
                    id="cow"
                    name="cow"
                    value={form.cow}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    disabled={!!editingRecordId} // Disable cow selection when editing
                  >
                    <option value="">Select Cow</option>
                    {cows.map(cow => (
                      <option key={cow.id} value={cow.id}>{cow.name} ({cow.tag_number})</option>
                    ))}
                  </select>
                  {editingRecordId && (
                    <p className="text-xs text-gray-500 mt-1">Cow cannot be changed when editing an existing record.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="record_date" className="block text-sm font-medium text-gray-700 mb-1">Record Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    id="record_date"
                    name="record_date"
                    value={form.record_date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="next_checkup_date" className="block text-sm font-medium text-gray-700 mb-1">Next Check-up Date</label>
                  <input
                    type="date"
                    id="next_checkup_date"
                    name="next_checkup_date"
                    value={form.next_checkup_date || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    rows={2}
                    placeholder="e.g., Coughing, loss of appetite"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    rows={2}
                    placeholder="e.g., Bovine Respiratory Disease"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                  <textarea
                    id="treatment"
                    name="treatment"
                    value={form.treatment}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    rows={2}
                    placeholder="e.g., Administered antibiotics, kept isolated"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="medication_administered" className="block text-sm font-medium text-gray-700 mb-1">Medication Administered</label>
                  <input
                    type="text"
                    id="medication_administered"
                    name="medication_administered"
                    value={form.medication_administered}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    placeholder="e.g., Penicillin G (2 doses)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="vet_name" className="block text-sm font-medium text-gray-700 mb-1">Veterinarian Name</label>
                  <input
                    type="text"
                    id="vet_name"
                    name="vet_name"
                    value={form.vet_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    placeholder="Name of the attending vet"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-900"
                    rows={3}
                    placeholder="Any additional notes on the health record"
                  ></textarea>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {editingRecordId ? 'Update Record' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Health Records Table */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 mt-8 flex items-center">
          <Stethoscope className="w-6 h-6 mr-2 text-blue-600" />
          Existing Health Records
        </h3>
        {records.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-lg">No health records found for this cow or overall.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Cow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vet Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Check-up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.cow_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.record_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.diagnosis || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{record.treatment || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.vet_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.next_checkup_date || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.recorded_by_username || record.recorded_by || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button
                        onClick={() => onEdit(record)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center"
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-200 flex items-center"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CowHealthRecords;
