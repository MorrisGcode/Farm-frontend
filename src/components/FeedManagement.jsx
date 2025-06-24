import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios

// Base URL for your Django API (adjust if your Django server is on a different port/domain)
const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/'; // Adjust this if your Django server is different

// Main React App Component for Feed Type Management (now named FeedManagement)
const FeedManagement = () => { // Renamed from App to FeedManagement
    const [feedTypes, setFeedTypes] = useState([]);
    const [editingFeedType, setEditingFeedType] = useState(null); // State to hold the feed type being edited
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch feed types on component mount
    useEffect(() => {
        fetchFeedTypes();
    }, []);

    const fetchFeedTypes = async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // Note: Your BreedList example uses localStorage.getItem('token') for Authorization.
            // If your FeedType API also requires authentication, you'll need to pass the token.
            // For now, assuming it's publicly accessible as per Django `AllowAny` permission.
            const response = await axios.get(`${DJANGO_API_BASE_URL}feedtypes/`);
            setFeedTypes(response.data);
        } catch (err) {
            console.error("Failed to fetch feed types:", err);
            // Check for specific error messages from Django if available
            setError(`Failed to load feed types. Please check if the Django backend is running and accessible at ${DJANGO_API_BASE_URL}.`);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for CRUD operations on Feed Types using Axios

    const handleAddOrUpdateFeedType = async (feedTypeData) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Assuming token might be needed as in BreedList example
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    // Conditionally add Authorization header if token exists
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };

            let response;
            if (feedTypeData.id) {
                // Update existing feed type
                response = await axios.put(`${DJANGO_API_BASE_URL}feedtypes/${feedTypeData.id}/`, feedTypeData, config);
            } else {
                // Add new feed type
                response = await axios.post(`${DJANGO_API_BASE_URL}feedtypes/`, feedTypeData, config);
            }

            // After successful operation, re-fetch all data to ensure consistency
            fetchFeedTypes();
            setEditingFeedType(null); // Clear editing state after successful add/update
        } catch (err) {
            console.error("Failed to save feed type:", err.response ? err.response.data : err.message);
            setError(`Failed to save feed type: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFeedType = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    // Conditionally add Authorization header if token exists
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };
            await axios.delete(`${DJANGO_API_BASE_URL}feedtypes/${id}/`, config);

            // Remove deleted record from state immediately for quicker UI update
            setFeedTypes(feedTypes.filter(feedType => feedType.id !== id));
        } catch (err) {
            console.error("Failed to delete feed type:", err.response ? err.response.data : err.message);
            setError(`Failed to delete feed type: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (feedType) => {
        setEditingFeedType(feedType);
    };

    const cancelEditing = () => {
        setEditingFeedType(null);
    };

    // Display loading or error messages
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-xl font-semibold text-gray-700">Loading Feed Type Management...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
                <div className="text-xl font-semibold text-red-700">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 font-inter">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
                    Feed Type and Nutrition Management
                </h1>

                {/* Feed Type Form */}
                <FeedTypeForm
                    onSubmit={handleAddOrUpdateFeedType}
                    editingFeedType={editingFeedType}
                    onCancelEdit={cancelEditing}
                />

                <hr className="my-8 border-t-2 border-gray-200" />

                {/* Feed Type List */}
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 text-center">
                    All Feed Types
                </h2>
                {feedTypes.length === 0 ? (
                    <p className="text-center text-gray-600 mt-8">No feed types found. Add one above!</p>
                ) : (
                    <FeedTypeList
                        feedTypes={feedTypes}
                        onEdit={startEditing}
                        onDelete={handleDeleteFeedType}
                    />
                )}
            </div>
        </div>
    );
};

// Component for the Feed Type Form (Add/Edit)
const FeedTypeForm = ({ onSubmit, editingFeedType, onCancelEdit }) => {
    const initialState = {
        name: '',
        dry_matter_percent: '',
        crude_protein_percent: '',
        metabolizable_energy_mj_kg: '',
        notes: ''
    };
    const [formData, setFormData] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});

    // Populate form if editing an existing feed type
    useEffect(() => {
        if (editingFeedType) {
            setFormData({
                id: editingFeedType.id,
                name: editingFeedType.name,
                dry_matter_percent: editingFeedType.dry_matter_percent || '',
                crude_protein_percent: editingFeedType.crude_protein_percent || '',
                metabolizable_energy_mj_kg: editingFeedType.metabolizable_energy_mj_kg || '',
                notes: editingFeedType.notes || ''
            });
        } else {
            setFormData(initialState); // Reset form for new feed type
        }
        setFormErrors({}); // Clear errors on edit/new form load
    }, [editingFeedType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.name.trim()) errors.name = "Feed type name is required.";
        // Validate numeric fields only if they are not empty
        if (formData.dry_matter_percent !== '' && (isNaN(formData.dry_matter_percent) || parseFloat(formData.dry_matter_percent) < 0)) errors.dry_matter_percent = "Must be a non-negative number.";
        if (formData.crude_protein_percent !== '' && (isNaN(formData.crude_protein_percent) || parseFloat(formData.crude_protein_percent) < 0)) errors.crude_protein_percent = "Must be a non-negative number.";
        if (formData.metabolizable_energy_mj_kg !== '' && (isNaN(formData.metabolizable_energy_mj_kg) || parseFloat(formData.metabolizable_energy_mj_kg) < 0)) errors.metabolizable_energy_mj_kg = "Must be a non-negative number.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Convert empty strings to null for numeric fields before submission
            const dataToSubmit = { ...formData };
            if (dataToSubmit.dry_matter_percent === '') dataToSubmit.dry_matter_percent = null;
            if (dataToSubmit.crude_protein_percent === '') dataToSubmit.crude_protein_percent = null;
            if (dataToSubmit.metabolizable_energy_mj_kg === '') dataToSubmit.metabolizable_energy_mj_kg = null;

            onSubmit(dataToSubmit);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">
                {editingFeedType ? 'Edit Feed Type' : 'Add New Feed Type'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Feed Type Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., Hay, Silage"
                        required
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Dry Matter (%) */}
                <div>
                    <label htmlFor="dry_matter_percent" className="block text-sm font-medium text-gray-700 mb-1">
                        Dry Matter (%):
                    </label>
                    <input
                        type="number"
                        id="dry_matter_percent"
                        name="dry_matter_percent"
                        value={formData.dry_matter_percent}
                        onChange={handleChange}
                        step="0.01"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.dry_matter_percent ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 85.00"
                    />
                    {formErrors.dry_matter_percent && <p className="text-red-500 text-xs mt-1">{formErrors.dry_matter_percent}</p>}
                </div>

                {/* Crude Protein (%) */}
                <div>
                    <label htmlFor="crude_protein_percent" className="block text-sm font-medium text-gray-700 mb-1">
                        Crude Protein (%):
                    </label>
                    <input
                        type="number"
                        id="crude_protein_percent"
                        name="crude_protein_percent"
                        value={formData.crude_protein_percent}
                        onChange={handleChange}
                        step="0.01"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.crude_protein_percent ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 18.00"
                    />
                    {formErrors.crude_protein_percent && <p className="text-red-500 text-xs mt-1">{formErrors.crude_protein_percent}</p>}
                </div>

                {/* Metabolizable Energy (MJ/kg DM) */}
                <div>
                    <label htmlFor="metabolizable_energy_mj_kg" className="block text-sm font-medium text-gray-700 mb-1">
                        Metabolizable Energy (MJ/kg DM):
                    </label>
                    <input
                        type="number"
                        id="metabolizable_energy_mj_kg"
                        name="metabolizable_energy_mj_kg"
                        value={formData.metabolizable_energy_mj_kg}
                        onChange={handleChange}
                        step="0.01"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.metabolizable_energy_mj_kg ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 10.50"
                    />
                    {formErrors.metabolizable_energy_mj_kg && <p className="text-red-500 text-xs mt-1">{formErrors.metabolizable_energy_mj_kg}</p>}
                </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes:
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any additional details about this feed type..."
                ></textarea>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
                {editingFeedType && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                    {editingFeedType ? 'Update Feed Type' : 'Add Feed Type'}
                </button>
            </div>
        </form>
    );
};

// Component for the Feed Type List
const FeedTypeList = ({ feedTypes, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="py-3 px-6 rounded-tl-lg">Feed Type</th>
                        <th scope="col" className="py-3 px-6">Dry Matter (%)</th>
                        <th scope="col" className="py-3 px-6">Crude Protein (%)</th>
                        <th scope="col" className="py-3 px-6">Metabolizable Energy (MJ/kg DM)</th>
                        <th scope="col" className="py-3 px-6 text-center rounded-tr-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {feedTypes.map((feedType) => (
                        <tr key={feedType.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{feedType.name}</td>
                            <td className="py-4 px-6">{feedType.dry_matter_percent || '-'}</td>
                            <td className="py-4 px-6">{feedType.crude_protein_percent || '-'}</td>
                            <td className="py-4 px-6">{feedType.metabolizable_energy_mj_kg || '-'}</td>
                            <td className="py-4 px-6 flex justify-center space-x-2">
                                <button
                                    onClick={() => onEdit(feedType)}
                                    className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(feedType.id)}
                                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeedManagement; // Changed default export to FeedManagement
