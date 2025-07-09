import React, { useState, useEffect } from 'react';

// Generic Modal Component (re-used)
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

// --- Main CalfManagement Component (remains mostly the same, included for context) ---
const CalfManagement = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [calves, setCalves] = useState([]);
    const [cows, setCows] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showCalfModal, setShowCalfModal] = useState(false);
    const [currentCalfData, setCurrentCalfData] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing. Please log in.');
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchCalves = async () => {
        setError('');
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/calves/', { headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch calves.');
            }
            const data = await response.json();
            setCalves(data);
        } catch (err) {
            console.error("Error fetching calves:", err);
            setError(`Failed to load calves: ${err.message}`);
        }
    };

    const fetchCows = async () => {
        setError('');
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/cows/', { headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch cows.');
            }
            const data = await response.json();
            setCows(data);
        } catch (err) {
            console.error("Error fetching cows:", err);
            setError(`Failed to load cows: ${err.message}`);
        }
    };

    useEffect(() => {
        if (user.role !== 'MANAGER') {
            setError('You do not have permission to manage calves.');
            return;
        }
        fetchCows();
        fetchCalves();
    }, [user.role]);

    const resetFormAndCloseModal = () => {
        setEditingId(null);
        setCurrentCalfData(null);
        setShowCalfModal(false);
        setError('');
        setSuccess('');
    };

    const handleFormSubmit = async (formData) => {
        setError('');
        setSuccess('');

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const dataToSubmit = { ...formData };
            // Ensure fields are correctly typed for backend, e.g., numbers, or null for empty strings
            dataToSubmit.weight_at_birth = dataToSubmit.weight_at_birth === '' ? null : parseFloat(dataToSubmit.weight_at_birth);
            dataToSubmit.dam = dataToSubmit.dam === '' ? null : parseInt(dataToSubmit.dam, 10);
            dataToSubmit.sire = dataToSubmit.sire === '' ? null : dataToSubmit.sire;
            dataToSubmit.notes = dataToSubmit.notes === '' ? null : dataToSubmit.notes;

            let response;
            if (editingId) {
                response = await fetch(`http://127.0.0.1:8000/api/calves/${editingId}/`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(dataToSubmit)
                });
            } else {
                response = await fetch('http://127.0.0.1:8000/api/calves/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(dataToSubmit)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                // Improved error logging: stringify the errorData to see all details
                throw new Error(JSON.stringify(errorData));
            }

            setSuccess(editingId ? 'Calf record updated successfully!' : 'Calf record added!');
            resetFormAndCloseModal();
            fetchCalves(); // Refresh the list
        } catch (err) {
            console.error("Error submitting calf record:", err);
            setError(`Failed to submit record: ${err.message}`);
        }
    };

    const handleEdit = (calf) => {
        setEditingId(calf.id);
        setCurrentCalfData(calf);
        setShowCalfModal(true);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this calf record?')) {
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) return;

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/calves/${id}/`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete calf record.');
            }

            setSuccess('Calf record deleted successfully!');
            fetchCalves();
            if (editingId === id) {
                resetFormAndCloseModal();
            }
        } catch (err) {
            console.error("Error deleting calf record:", err);
            setError(`Failed to delete calf record: ${err.message}`);
        }
    };

    if (user.role !== 'MANAGER') {
        return (
            <div className="text-center text-red-600 mt-8">
                You do not have permission to manage calves.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-6 text-center">Calf Management</h1>
            {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
            {success && <div className="text-green-600 mb-4 text-center">{success}</div>}

            <div className="flex justify-center mb-6">
                <button
                    onClick={() => {
                        setEditingId(null);
                        setCurrentCalfData(null);
                        setShowCalfModal(true);
                    }}
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                >
                    Add New Calf
                </button>
            </div>

            {/* Calf Form Modal */}
            {showCalfModal && (
                <Modal onClose={resetFormAndCloseModal}>
                    <CalfForm
                        onSubmit={handleFormSubmit}
                        editingId={editingId}
                        cows={cows}
                        initialFormData={currentCalfData}
                        onCancel={resetFormAndCloseModal}
                    />
                </Modal>
            )}

            <hr className="my-8 border-t-2 border-gray-200" />

            {/* Calves Table */}
            <h3 className="text-xl font-bold mb-3 mt-8">Existing Calves</h3>
            {calves.length === 0 ? (
                <p className="text-center text-gray-600">No calves found.</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100 text-left text-xs text-gray-700 uppercase">
                            <tr>
                                <th className="py-3 px-4 border-b rounded-tl-lg">Ear Tag No.</th>
                                <th className="py-3 px-4 border-b">DOB</th>
                                <th className="py-3 px-4 border-b">Gender</th>
                                <th className="py-3 px-4 border-b">Weight (kg)</th>
                                <th className="py-3 px-4 border-b">Dam</th>
                                <th className="py-3 px-4 border-b">Sire</th>
                                <th className="py-3 px-4 border-b">Weaned</th>
                                <th className="py-3 px-4 border-b">Notes</th>
                                <th className="py-3 px-4 border-b text-center rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calves.map(calf => (
                                <tr key={calf.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4 font-medium text-gray-900 whitespace-nowrap">{calf.ear_tag_number}</td>
                                    <td className="py-2 px-4">{calf.date_of_birth}</td>
                                    <td className="py-2 px-4">{calf.gender}</td>
                                    <td className="py-2 px-4">{calf.weight_at_birth || 'N/A'}</td>
                                    <td className="py-2 px-4">{calf.dam_ear_tag || calf.dam || 'N/A'}</td>
                                    <td className="py-2 px-4">{calf.sire || 'N/A'}</td>
                                    <td className="py-2 px-4 text-center">
                                        {calf.is_weaned ? (
                                            <span className="text-green-600">Yes</span>
                                        ) : (
                                            <span className="text-red-600">No</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">{calf.notes || 'N/A'}</td>
                                    <td className="py-2 px-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(calf)}
                                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(calf.id)}
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

// --- Separate Component for Calf Form ---
const CalfForm = ({ onSubmit, editingId, cows, initialFormData, onCancel }) => {
    const [form, setForm] = useState({
        ear_tag_number: '',
        date_of_birth: '',
        gender: '',
        weight_at_birth: '',
        dam: '',
        sire: '',
        is_weaned: false,
        notes: ''
    });

    useEffect(() => {
        if (editingId && initialFormData) {
            setForm({
                ear_tag_number: initialFormData.ear_tag_number,
                date_of_birth: initialFormData.date_of_birth,
                gender: initialFormData.gender,
                weight_at_birth: initialFormData.weight_at_birth || '',
                dam: initialFormData.dam || '',
                sire: initialFormData.sire || '',
                is_weaned: initialFormData.is_weaned,
                notes: initialFormData.notes || ''
            });
        } else {
            // Reset form for new entry
            setForm({
                ear_tag_number: '',
                date_of_birth: '',
                gender: '',
                weight_at_birth: '',
                dam: '',
                sire: '',
                is_weaned: false,
                notes: ''
            });
        }
    }, [editingId, initialFormData]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {editingId ? 'Edit Calf Record' : 'Add New Calf'}
            </h3>

            <div>
                <label htmlFor="ear_tag_number" className="block text-sm font-medium text-gray-700">Ear Tag Number</label>
                <input
                    type="text"
                    id="ear_tag_number"
                    name="ear_tag_number"
                    value={form.ear_tag_number}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calf ear tag number"
                />
            </div>
            <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option> {/* CHANGED: 'M' instead of 'MALE' */}
                    <option value="F">Female</option> {/* CHANGED: 'F' instead of 'FEMALE' */}
                </select>
            </div>
            <div>
                <label htmlFor="weight_at_birth" className="block text-sm font-medium text-gray-700">Weight at Birth (kg)</label>
                <input
                    type="number"
                    id="weight_at_birth"
                    name="weight_at_birth"
                    value={form.weight_at_birth}
                    onChange={handleChange}
                    step="0.01"
                    // Removed 'required' attribute as it's optional in Django
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Weight in kg (optional)"
                />
            </div>
            <div>
                <label htmlFor="dam" className="block text-sm font-medium text-gray-700">Dam (Mother Cow)</label>
                <select
                    id="dam"
                    name="dam"
                    value={form.dam}
                    onChange={handleChange}
                    // Removed 'required' attribute as it's optional in Django
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select Dam (Optional)</option>
                    {cows.map(cow => (
                        <option key={cow.id} value={cow.id}>{cow.name} ({cow.ear_tag_number})</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sire" className="block text-sm font-medium text-gray-700">Sire (Father Bull)</label>
                <input
                    type="text"
                    id="sire"
                    name="sire"
                    value={form.sire}
                    onChange={handleChange}
                    className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sire name or tag (optional)"
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_weaned"
                    name="is_weaned"
                    checked={form.is_weaned}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_weaned" className="ml-2 block text-sm text-gray-700">
                    Is Weaned
                </label>
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
                    placeholder="Any additional notes (optional)"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-150 ease-in-out"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-150 ease-in-out"
                >
                    {editingId ? 'Update Calf' : 'Add Calf'}
                </button>
            </div>
        </form>
    );
};

export default CalfManagement;