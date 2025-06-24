import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaPlusCircle, FaArrowLeft, FaWeight, FaCalendarAlt, FaStethoscope, FaClipboardList, FaExclamationCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'; // Added more icons

const CowDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cow, setCow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [updateSuccess, setUpdateSuccess] = useState(false); // New state for success message

    // Retrieve user role from local storage for conditional rendering
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = user.role === 'MANAGER'; // Simplified role check

    // Memoize fetchCowDetails to prevent unnecessary re-creations
    const fetchCowDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        setUpdateSuccess(false); // Reset success message on new fetch

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                `http://localhost:8000/api/cows/${id}/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setCow(response.data);
            setEditData(response.data); // Initialize editData with fetched cow data
        } catch (err) {
            console.error('Error fetching cow details:', err.response || err);
            if (err.response && err.response.status === 404) {
                setError('Cow not found.');
            } else if (err.response && err.response.status === 401) {
                setError('Authentication failed. Please log in again.');
                navigate('/login');
            } else {
                setError(err.response?.data?.detail || err.message || 'Failed to load cow details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); // Dependencies for useCallback

    useEffect(() => {
        fetchCowDetails();
    }, [fetchCowDetails]); // Now depends on the memoized fetchCowDetails

    const handleEdit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setUpdateSuccess(false); // Clear previous success

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.put( // Use PUT for full replacement, PATCH if partial
                `http://localhost:8000/api/cows/${id}/`,
                editData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setCow(response.data); // Update cow state with the response data (ensures consistency)
            setIsEditing(false); // Exit edit mode
            setUpdateSuccess(true); // Show success message
            // Optional: You could re-fetch details after a short delay if needed for complex updates
            // setTimeout(() => fetchCowDetails(), 1000);
        } catch (err) {
            console.error('Error updating cow details:', err.response || err);
            // Display specific validation errors from the backend if available
            if (err.response?.data) {
                const errorMessages = Object.values(err.response.data).flat().join(' ');
                setError(`Failed to update cow details: ${errorMessages}`);
            } else {
                setError('Failed to update cow details. Please try again.');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // --- Render States ---

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl text-gray-600 font-semibold">Loading cow details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md flex items-center" role="alert">
                    <FaExclamationCircle className="text-xl mr-3" />
                    <div>
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/dashboard/cows')} // Go back to cows list
                        className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Cows List
                    </button>
                </div>
            </div>
        );
    }

    if (!cow) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg shadow-md flex items-center" role="alert">
                    <FaExclamationTriangle className="text-xl mr-3" />
                    <div>
                        <strong className="font-bold">Information:</strong>
                        <span className="block sm:inline ml-2">Cow details could not be loaded.</span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/dashboard/cows')}
                        className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Cows List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
                {/* Header Section with Name and Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-0">
                        {cow.name}
                    </h1>
                    <div className="flex space-x-3">
                        {isManager && !isEditing && ( // Only show edit button if manager and not already editing
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                                <FaEdit className="mr-2 -ml-1 h-4 w-4" /> Edit Cow
                            </button>
                        )}
                        {/* Always show Add Health Record button if manager */}
                        {isManager && (
                            <Link
                                to={`/dashboard/cows/${cow.id}/add-health-record`}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                            >
                                Add Health Record
                            </Link>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {updateSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 shadow-sm flex items-center justify-between" role="alert">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-xl mr-3" />
                            <span className="block sm:inline">Cow details updated successfully!</span>
                        </div>
                        <button onClick={() => setUpdateSuccess(false)} className="text-green-700 hover:text-green-900">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Main Details / Edit Form */}
                {isEditing ? (
                    <form onSubmit={handleEdit} className="space-y-6"> {/* Increased spacing */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={editData.name || ''} // Ensure default value to prevent "uncontrolled input" warning
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                            <input
                                type="text"
                                id="breed"
                                name="breed"
                                value={editData.breed || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={editData.age || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={editData.weight || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="health_status" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                            <select
                                id="health_status"
                                name="health_status"
                                value={editData.health_status || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                required
                            >
                                <option value="HEALTHY">Healthy</option>
                                <option value="SICK">Sick</option>
                                <option value="TREATMENT">Under Treatment</option>
                            </select>
                        </div>
                        <div className="flex space-x-4 pt-4"> {/* Added padding top */}
                            <button
                                type="submit"
                                className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset editData to the current cow state if canceling
                                    setEditData(cow);
                                    setError(''); // Clear error on cancel
                                }}
                                className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Detail Card: Breed */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex items-center space-x-4 shadow-sm">
                            <FaClipboardList className="text-blue-500 text-3xl" />
                            <div>
                                <h2 className="text-gray-600">Breed</h2>
                                <p className="font-medium">{cow.breed_name}</p>
                            </div>
                        </div>

                        {/* Detail Card: Age */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex items-center space-x-4 shadow-sm">
                            <FaCalendarAlt className="text-purple-500 text-3xl" />
                            <div>
                                <h2 className="text-sm font-medium text-gray-500">Age</h2>
                                <p className="text-lg font-semibold text-gray-900">{cow.age} years</p>
                            </div>
                        </div>

                        {/* Detail Card: Weight */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex items-center space-x-4 shadow-sm">
                            <FaWeight className="text-yellow-600 text-3xl" />
                            <div>
                                <h2 className="text-sm font-medium text-gray-500">Weight</h2>
                                <p className="text-lg font-semibold text-gray-900">{cow.weight} kg</p>
                            </div>
                        </div>

                        {/* Detail Card: Health Status */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex items-center space-x-4 shadow-sm">
                            <FaStethoscope className="text-green-500 text-3xl" />
                            <div>
                                <h2 className="text-sm font-medium text-gray-500">Health Status</h2>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                    cow.health_status === 'HEALTHY'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {cow.health_status}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={() => navigate('/dashboard/cows')} // Navigates back to the cows list
                        className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Cows List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CowDetails;