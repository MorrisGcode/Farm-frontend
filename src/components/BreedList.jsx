import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Mock icons for demonstration (assuming these are not globally available otherwise)
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
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
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

const BreedList = () => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // State to control modal visibility
  const [editingBreed, setEditingBreed] = useState(null); // State to hold breed being edited
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

  // Fetch breeds
  const fetchBreeds = async () => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${DJANGO_API_BASE_URL}breeds/`, config);
      setBreeds(response.data);
    } catch (err) {
      console.error('Error fetching breeds:', err.response ? err.response.data : err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized: Please log in again or check permissions.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load breeds. Please ensure the Django backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []); // Fetch breeds on component mount

  // Handle adding a new breed
  const handleAddBreed = async (newBreedData) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${DJANGO_API_BASE_URL}breeds/`, newBreedData, config);
      setIsFormModalOpen(false); // Close modal
      setEditingBreed(null); // Clear editing state
      fetchBreeds(); // Refresh list
    } catch (err) {
      console.error('Error adding breed:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to add breed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating an existing breed
  const handleUpdateBreed = async (updatedBreedData) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${DJANGO_API_BASE_URL}breeds/${updatedBreedData.id}/`, updatedBreedData, config);
      setIsFormModalOpen(false); // Close modal
      setEditingBreed(null); // Clear editing state
      fetchBreeds(); // Refresh list
    } catch (err) {
      console.error('Error updating breed:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to update breed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a breed
  const handleDeleteBreed = async (breedId) => {
    setLoading(true);
    setError('');
    const config = getAuthHeaders();
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      await axios.delete(`${DJANGO_API_BASE_URL}breeds/${breedId}/`, config);
      setShowDeleteConfirm(null); // Close confirmation modal
      fetchBreeds(); // Refresh list
    } catch (err) {
      console.error('Error deleting breed:', err.response ? err.response.data : err);
      setError(err.response?.data?.message || 'Failed to delete breed.');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingBreed(null); // Ensure no breed is being edited
    setIsFormModalOpen(true);
    setError(''); // Clear previous errors
  };

  // Open modal for editing
  const openEditModal = (breed) => {
    setEditingBreed(breed);
    setIsFormModalOpen(true);
    setError(''); // Clear previous errors
  };

  // Close modal
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingBreed(null);
    setError(''); // Clear errors when closing
  };

  // Confirm delete action
  const confirmDelete = (breed) => {
    setShowDeleteConfirm(breed);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Role-based access control (assuming only MANAGER can manage breeds)
  if (user.role?.toUpperCase() !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 rounded-lg">
        <p className="font-semibold text-lg text-red-700">You do not have permission to manage breeds.</p>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700">Loading breeds...</div>
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
    <div>
      {/* Removed max-w-xl mx-auto from this div. Added w-full to ensure it takes full width */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
          Breed Management
        </h1>

        {/* Button to open the Add Breed Modal */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add New Breed
          </button>
        </div>

        {breeds.length === 0 && !loading ? (
          <p className="text-center text-gray-600 mt-8">No breeds found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6 rounded-tl-lg">Breed Name</th>
                  <th scope="col" className="py-3 px-6">Description</th>
                  <th scope="col" className="py-3 px-6 rounded-tr-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {breeds.map((breed) => (
                  <tr key={breed.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{breed.name}</td>
                    <td className="py-4 px-6">{breed.description || 'N/A'}</td>
                    <td className="py-4 px-6 flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(breed)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      >
                        <Edit className="w-4 h-4 inline-block mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(breed)}
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

      {/* Breed Form Modal */}
      {isFormModalOpen && (
        <BreedFormModal
          onSave={editingBreed ? handleUpdateBreed : handleAddBreed}
          onCancel={closeFormModal}
          editingBreed={editingBreed}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          breed={showDeleteConfirm}
          onConfirm={handleDeleteBreed}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

// Breed Form Modal Component (nested)
const BreedFormModal = ({ onSave, onCancel, editingBreed }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingBreed) {
      setFormData({
        name: editingBreed.name || '',
        description: editingBreed.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setFormError(''); // Clear error on form open/reset
  }, [editingBreed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Breed Name is required.');
      return;
    }

    const dataToSave = {
      name: formData.name.trim(),
      description: formData.description.trim() || null, // Send null if description is empty
    };

    if (editingBreed) {
      onSave({ ...dataToSave, id: editingBreed.id });
    } else {
      onSave(dataToSave);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">{editingBreed ? 'Edit Breed' : 'Add New Breed'}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Validation Error!</strong>
            <span className="block sm:inline"> {formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Breed Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="e.g., A dairy breed known for high milk production."
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {editingBreed ? 'Update Breed' : 'Add Breed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component (nested)
const DeleteConfirmationModal = ({ breed, onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center scale-in">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Confirm Deletion</h2>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the breed{' '}
            <strong className="text-red-600">{breed.name}</strong>?
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
              onClick={() => onConfirm(breed.id)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

export default BreedList;
