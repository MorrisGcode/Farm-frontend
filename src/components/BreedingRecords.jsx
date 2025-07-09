import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Generic Modal Component (re-used from previous example)
const Modal = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 mx-4 my-8">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

const BreedingRecords = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [records, setRecords] = useState([]);
    const [cows, setCows] = useState([]); // State to store cows for the dropdown
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingRecordId, setEditingRecordId] = useState(null); // State to store ID of record being edited
    const [filterCowId, setFilterCowId] = useState(''); // State for filtering records by cow ID
    const [showBreedingRecordModal, setShowBreedingRecordModal] = useState(false); // New state for modal visibility

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
    }, [user.role]);

    // Trigger record fetch when filterCowId changes
    useEffect(() => {
        fetchRecords(filterCowId);
    }, [filterCowId]);

    // Function to reset the form and close modal
    const resetFormAndCloseModal = () => {
        setEditingRecordId(null); // Exit editing mode
        setShowBreedingRecordModal(false); // Close the modal
        setError(''); // Clear any previous error messages
        setSuccess(''); // Clear any previous success messages
    };

    // Handle form submission (Add or Update)
    const handleFormSubmit = async (formData) => { // Renamed from handleSubmit to avoid confusion
        setError('');
        setSuccess('');

        const config = getAuthHeaders();
        if (!config) return;

        try {
            const dataToSend = { ...formData };
            if (dataToSend.expected_calving_date === '') {
                dataToSend.expected_calving_date = null;
            }

            if (editingRecordId) {
                await axios.put(`http://127.0.0.1:8000/api/breeding-records/${editingRecordId}/`, dataToSend, config);
                setSuccess('Breeding record updated successfully!');
            } else {
                await axios.post('http://127.0.0.1:8000/api/breeding-records/', dataToSend, config);
                setSuccess('Breeding record added!');
            }
            await fetchRecords(filterCowId); // Refresh the list, maintaining the filter
            resetFormAndCloseModal(); // Reset form and close modal
        } catch (err) {
            console.error("Error submitting breeding record:", err.response ? err.response.data : err);
            if (err.response && err.response.status === 400) {
                setError(`Failed to submit record: ${JSON.stringify(err.response.data)}`);
            } else if (err.response && err.response.status === 401) {
                setError('Unauthorized: Please log in again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    // Function to prepare form for editing and open modal
    const onEdit = (record) => {
        setEditingRecordId(record.id);
        setShowBreedingRecordModal(true); // Open modal
        // The form data will be set by the BreedingRecordForm component's useEffect
        setError(''); // Clear any previous error message
        setSuccess(''); // Clear any previous success message
    };

    // Function to delete a record
    const onDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this breeding record?')) {
            return;
        }

        const config = getAuthHeaders();
        if (!config) return;

        setError('');
        setSuccess('');

        try {
            await axios.delete(`http://127.0.0.1:8000/api/breeding-records/${id}/`, config);
            setSuccess('Breeding record deleted successfully!');
            await fetchRecords(filterCowId); // Refresh the list, maintaining the filter
            if (editingRecordId === id) {
                resetFormAndCloseModal(); // If the deleted record was being edited, close modal
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

    // Handle filter change
    const handleFilterChange = e => {
        setFilterCowId(e.target.value);
    };

    if (user.role !== 'MANAGER') {
        return (
            <div className="text-center text-red-600 mt-8">
                You do not have permission to view breeding records.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-6 text-center">Breeding Records Management</h1>
            {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
            {success && <div className="text-green-600 mb-4 text-center">{success}</div>}

            <div className="flex justify-center mb-6">
                <button
                    onClick={() => {
                        setEditingRecordId(null); // Ensure form is for new record
                        setShowBreedingRecordModal(true); // Open modal
                    }}
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                >
                    Add New Breeding Record
                </button>
            </div>

            {/* Breeding Record Form Modal */}
            {showBreedingRecordModal && (
                <Modal onClose={resetFormAndCloseModal}>
                    <BreedingRecordForm
                        onSubmit={handleFormSubmit}
                        editingRecordId={editingRecordId}
                        cows={cows}
                        onCancel={resetFormAndCloseModal}
                        // Pass the specific record data if editing
                        initialFormData={editingRecordId ? records.find(rec => rec.id === editingRecordId) : null}
                    />
                </Modal>
            )}

            <hr className="my-8 border-t-2 border-gray-200" />

            {/* Filter by Cow */}
            <div className="mb-4">
                <label htmlFor="filterCow" className="block text-sm font-medium text-gray-700 mb-1">Filter by Cow:</label>
                <select
                    id="filterCow"
                    name="filterCow"
                    value={filterCowId}
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full md:w-1/2 lg:w-1/3 focus:ring-blue-500 focus:border-blue-500"
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
                <p className="text-center text-gray-600">No breeding records found {filterCowId ? 'for the selected cow' : ''}.</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100 text-left text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="py-3 px-4 border-b rounded-tl-lg">Cow</th>
                                <th className="py-3 px-4 border-b">Bull</th>
                                <th className="py-3 px-4 border-b">Breeding Date</th>
                                <th className="py-3 px-4 border-b">Method</th>
                                <th className="py-3 px-4 border-b">Expected Calving</th>
                                <th className="py-3 px-4 border-b">Notes</th>
                                <th className="py-3 px-4 border-b text-center rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <tr key={record.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4 font-medium text-gray-900 whitespace-nowrap">{record.cow_name || 'N/A'}</td>
                                    <td className="py-2 px-4">{record.bull_name}</td>
                                    <td className="py-2 px-4">{record.breeding_date}</td>
                                    <td className="py-2 px-4">
                                        {record.insemination_method === 'NATURAL' ? 'Natural' : 'Artificial Insemination'}
                                    </td>
                                    <td className="py-2 px-4">{record.expected_calving_date || 'N/A'}</td>
                                    <td className="py-2 px-4">{record.notes || 'N/A'}</td>
                                    <td className="py-2 px-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(record.id)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
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

// --- Separate Component for Breeding Record Form ---
const BreedingRecordForm = ({ onSubmit, editingRecordId, cows, onCancel, initialFormData }) => {
    const [form, setForm] = useState({
        cow: '',
        bull_name: '',
        breeding_date: '',
        insemination_method: 'NATURAL',
        expected_calving_date: '',
        notes: ''
    });

    useEffect(() => {
        if (editingRecordId && initialFormData) {
            setForm({
                cow: initialFormData.cow, // cow is already an integer ID
                bull_name: initialFormData.bull_name,
                breeding_date: initialFormData.breeding_date,
                insemination_method: initialFormData.insemination_method,
                expected_calving_date: initialFormData.expected_calving_date || '', // Converts null to '' for date input
                notes: initialFormData.notes || ''
            });
        } else {
            setForm({
                cow: '',
                bull_name: '',
                breeding_date: '',
                insemination_method: 'NATURAL',
                expected_calving_date: '',
                notes: ''
            });
        }
    }, [editingRecordId, initialFormData]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prevForm => {
            let newValue = value;

            if (name === 'cow') {
                newValue = value === '' ? '' : parseInt(value, 10);
            } else if (name === 'expected_calving_date') {
                newValue = value === '' ? null : value;
            }

            return {
                ...prevForm,
                [name]: newValue
            };
        });
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(form); // Pass the current form state up to the parent
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {editingRecordId ? 'Edit Breeding Record' : 'Add New Breeding Record'}
            </h3>

            <div>
                <label htmlFor="cow" className="block text-sm font-medium text-gray-700">Cow</label>
                <select
                    id="cow"
                    name="cow"
                    value={form.cow}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="bull_name" className="block text-sm font-medium text-gray-700">Bull Name</label>
                <input
                    type="text"
                    id="bull_name"
                    name="bull_name"
                    value={form.bull_name}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Name of the bull"
                />
            </div>
            <div>
                <label htmlFor="breeding_date" className="block text-sm font-medium text-gray-700">Breeding Date</label>
                <input
                    type="date"
                    id="breeding_date"
                    name="breeding_date"
                    value={form.breeding_date}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="insemination_method" className="block text-sm font-medium text-gray-700">Insemination Method</label>
                <select
                    id="insemination_method"
                    name="insemination_method"
                    value={form.insemination_method}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="NATURAL">Natural Breeding</option>
                    <option value="AI">Artificial Insemination</option>
                </select>
            </div>
            <div>
                <label htmlFor="expected_calving_date" className="block text-sm font-medium text-gray-700">Expected Calving Date</label>
                <input
                    type="date"
                    id="expected_calving_date"
                    name="expected_calving_date"
                    value={form.expected_calving_date || ''}
                    onChange={handleChange}
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave blank to auto-calculate"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-calculate (280 days after breeding date)
                </p>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Any additional notes"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    type="button" // Important: type="button" to prevent form submission
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-150 ease-in-out"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-150 ease-in-out"
                >
                    {editingRecordId ? 'Update Record' : 'Add Record'}
                </button>
            </div>
        </form>
    );
};

export default BreedingRecords;