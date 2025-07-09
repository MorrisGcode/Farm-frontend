import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MilkRecordForm from './MilkRecordForm'; // Import the modal form
import { useNavigate } from 'react-router-dom';

// Mock icons for demonstration
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
const Edit = () => (
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
      className="lucide lucide-edit"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
const Trash2 = () => (
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
      className="lucide lucide-trash-2"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
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


const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/';

const MilkRecords = () => {
  const [milkRecords, setMilkRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // State to control modal visibility
  const [editingRecord, setEditingRecord] = useState(null); // State to hold record being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // State for delete confirmation modal

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Helper for auth config
  const getAuthHeaders = () => {
    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch milk records
  const fetchMilkRecords = async () => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${DJANGO_API_BASE_URL}milk-production/`, config);
      setMilkRecords(response.data);
    } catch (err) {
      console.error('Error fetching milk records:', err.response ? err.response.data : err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized: Please log in again.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load milk records. Please ensure the Django backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilkRecords();
  }, []); // Fetch records on component mount

  // Handle adding a new record
  const handleAddRecord = async (newRecordData) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${DJANGO_API_BASE_URL}milk-production/`, newRecordData, config);
      setIsFormModalOpen(false); // Close modal
      setEditingRecord(null); // Clear editing state
      fetchMilkRecords(); // Refresh list
    } catch (err) {
      console.error('Error adding milk record:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to add milk record.');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating an existing record
  const handleUpdateRecord = async (updatedRecordData) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${DJANGO_API_BASE_URL}milk-production/${updatedRecordData.id}/`, updatedRecordData, config);
      setIsFormModalOpen(false); // Close modal
      setEditingRecord(null); // Clear editing state
      fetchMilkRecords(); // Refresh list
    } catch (err) {
      console.error('Error updating milk record:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to update milk record.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a record
  const handleDeleteRecord = async (recordId) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.delete(`${DJANGO_API_BASE_URL}milk-production/${recordId}/`, config);
      setShowDeleteConfirm(null); // Close confirmation modal
      fetchMilkRecords(); // Refresh list
    } catch (err) {
      console.error('Error deleting milk record:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Failed to delete milk record.');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding
  const openAddModal = () => {
    console.log("Attempting to open Add Milk Record modal."); // Debugging log
    setEditingRecord(null); // Ensure no record is being edited
    setIsFormModalOpen(true);
    setError(''); // Clear previous errors
  };

  // Open modal for editing
  const openEditModal = (record) => {
    console.log("Attempting to open Edit Milk Record modal for record:", record.id); // Debugging log
    setEditingRecord(record);
    setIsFormModalOpen(true);
    setError(''); // Clear previous errors
  };

  // Close modal
  const closeFormModal = () => {
    console.log("Closing Milk Record modal."); // Debugging log
    setIsFormModalOpen(false);
    setEditingRecord(null);
    setError(''); // Clear errors when closing
  };

  // Confirm delete action
  const confirmDelete = (record) => {
    setShowDeleteConfirm(record);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700">Loading milk records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-red-100 p-4">
        <div className="text-xl font-semibold text-red-700">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-4 sm:p-6 md:p-8 font-inter">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
          Milk Production Records
        </h1>

        {/* Button to open the Add Milk Record Modal */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add New Milk Record
          </button>
        </div>

        {milkRecords.length === 0 ? (
          <p className="text-center text-gray-600 mt-8">No milk records found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6 rounded-tl-lg">Date</th>
                  <th scope="col" className="py-3 px-6">Cow Name</th>
                  <th scope="col" className="py-3 px-6">Morning (L)</th>
                  <th scope="col" className="py-3 px-6">Evening (L)</th>
                  <th scope="col" className="py-3 px-6">Total (L)</th>
                  <th scope="col" className="py-3 px-6">Recorded By</th> {/* This column expects recorded_by_name from Django serializer */}
                  <th scope="col" className="py-3 px-6 rounded-tr-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milkRecords.map((record) => (
                  <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{record.date}</td>
                    <td className="py-4 px-6">{record.cow_name}</td> {/* Assuming cow_name is available from serializer */}
                    <td className="py-4 px-6">{record.morning_amount}</td>
                    <td className="py-4 px-6">{record.evening_amount}</td>
                    <td className="py-4 px-6 font-semibold">{record.morning_amount + record.evening_amount}</td>
                    <td className="py-4 px-6">{record.recorded_by_name}</td> {/* CORRECTED: Changed to record.recorded_by_name */}
                    <td className="py-4 px-6 flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(record)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      >
                        <Edit className="w-4 h-4 inline-block mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(record)}
                        className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                      >
                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Milk Record Form Modal */}
      {isFormModalOpen && (
        <MilkRecordForm
          onSave={editingRecord ? handleUpdateRecord : handleAddRecord}
          onCancel={closeFormModal}
          editingRecord={editingRecord}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          record={showDeleteConfirm}
          onConfirm={handleDeleteRecord}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

// Simple Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ record, onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center scale-in">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Confirm Deletion</h2>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the milk record for cow{' '}
            <strong className="text-red-600">{record.cow_name}</strong> on{' '}
            <strong className="text-red-600">{record.date}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(record.id)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

export default MilkRecords;
