import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Lucide React Icons (via CDN) - Mock components as direct imports are not supported in this environment
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

// user role from localStorage.
const user = JSON.parse(localStorage.getItem('user') || '{}');

const DailyFeedingReport = () => {
    const [dailyLogs, setDailyLogs] = useState([]);
    const [feedTypes, setFeedTypes] = useState([]); 
    const [editingLog, setEditingLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // New state for modal visibility

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                };

                // Fetch daily feeding logs
                const logsResponse = await axios.get(`${DJANGO_API_BASE_URL}dailyfeedinglogs/`, config);
                setDailyLogs(logsResponse.data);

                // Fetch feed types
                const feedTypesResponse = await axios.get(`${DJANGO_API_BASE_URL}feedtypes/`, config);
                setFeedTypes(feedTypesResponse.data);

            } catch (err) {
                console.error("Failed to fetch data:", err.response ? err.response.data : err.message);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Unauthorized: Please ensure you are logged in and have permission to view reports.");
                } else {
                    setError(`Failed to load data: ${err.response?.data?.detail || err.message || err.toString()}. Please ensure the Django backend is running and accessible.`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddOrUpdateLog = async (logData) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };

            let response;
            if (logData.id) {
                // For update
                response = await axios.put(`${DJANGO_API_BASE_URL}dailyfeedinglogs/${logData.id}/`, logData, config);
            } else {
                // For create,
                response = await axios.post(`${DJANGO_API_BASE_URL}dailyfeedinglogs/`, logData, config);
            }

            
            const updatedLogsResponse = await axios.get(`${DJANGO_API_BASE_URL}dailyfeedinglogs/`, config);
            setDailyLogs(updatedLogsResponse.data);
            setEditingLog(null); 
            setIsFormModalOpen(false); // Close modal on success
        } catch (err) {
            console.error("Failed to save log:", err.response ? err.response.data : err.message);
            setError(`Failed to save log: ${JSON.stringify(err.response?.data) || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };
            await axios.delete(`${DJANGO_API_BASE_URL}dailyfeedinglogs/${id}/`, config);
            setDailyLogs(dailyLogs.filter(log => log.id !== id));
        } catch (err) {
            console.error("Failed to delete log:", err.response ? err.response.data : err.message);
            setError(`Failed to delete log: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const openAddLogModal = () => {
        setEditingLog(null); // Clear any previous editing state
        setIsFormModalOpen(true); // Open the modal
        setError(null); // Clear any previous errors
    };

    const startEditing = (log) => {
        setEditingLog(log);
        setIsFormModalOpen(true); // Open the modal for editing
        setError(null); // Clear any previous errors
    };

    const cancelEditing = () => {
        setEditingLog(null);
        setIsFormModalOpen(false); // Close the modal
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-100 p-4">
                <div className="text-xl font-semibold text-gray-700">Loading Daily Feeding Report...</div>
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
                    Daily Feeding Report
                </h1>

                {/* Button to open the Daily Feeding Log Form Modal - Only visible to Workers */}
                {user.role === 'WORKER' && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={openAddLogModal}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" /> Add New Feeding Log
                        </button>
                    </div>
                )}
                
                <hr className="my-8 border-t-2 border-gray-200" />

                {/* Date Filter*/}
                <div className="flex justify-end mb-4">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Filter by date"
                    />
                </div>

                {/* Daily Feeding List */}
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 text-center">
                    All Daily Feeding Logs
                </h2>
                {dailyLogs.length === 0 ? (
                    <p className="text-center text-gray-600 mt-8">No daily feeding logs found. Add one above!</p>
                ) : (
                    <DailyFeedingLogList
                        dailyLogs={
                            filterDate
                                ? dailyLogs.filter(log => log.log_date === filterDate)
                                : dailyLogs
                        }
                        onEdit={startEditing}
                        onDelete={handleDeleteLog}
                        isWorker={user.role === 'WORKER'} 
                    />
                )}
            </div>

            {/* Daily Feeding Log Form Modal */}
            {isFormModalOpen && (
                <DailyFeedingLogForm
                    feedTypes={feedTypes}
                    onSubmit={handleAddOrUpdateLog}
                    editingLog={editingLog}
                    onCancelEdit={cancelEditing} // This now closes the modal
                />
            )}
        </div>
    );
};


const DailyFeedingLogForm = ({ feedTypes, onSubmit, editingLog, onCancelEdit }) => {
    const initialFeedQuantityState = { feed_type: '', quantity: '', unit: 'kg' };
    const initialState = {
        log_date: new Date().toISOString().split('T')[0],
        feed_quantities: [
            { ...initialFeedQuantityState }, 
            { ...initialFeedQuantityState }  
        ],
        special_feed_vitamins_notes: '',
        general_notes: ''
    };
    const [formData, setFormData] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (editingLog) {
            setFormData({
                id: editingLog.id,
                log_date: editingLog.log_date,
                
                feed_quantities: editingLog.feed_quantities.length > 0
                    ? editingLog.feed_quantities.map(fq => ({
                        feed_type: fq.feed_type,
                        quantity: fq.quantity,
                        unit: fq.unit
                    }))
                    : [{ ...initialFeedQuantityState }, { ...initialFeedQuantityState }], // Ensure at least two empty for new input
                special_feed_vitamins_notes: editingLog.special_feed_vitamins_notes || '',
                general_notes: editingLog.general_notes || ''
            });
        } else {
            setFormData(initialState);
        }
        setFormErrors({});
    }, [editingLog]);

    const handleLogDateChange = (e) => {
        setFormData({ ...formData, log_date: e.target.value });
    };

    const handleSpecialNotesChange = (e) => {
        setFormData({ ...formData, special_feed_vitamins_notes: e.target.value });
    };

    const handleGeneralNotesChange = (e) => {
        setFormData({ ...formData, general_notes: e.target.value });
    };


    const handleFeedQuantityChange = (index, field, value) => {
        const newFeedQuantities = [...formData.feed_quantities];
        newFeedQuantities[index] = { ...newFeedQuantities[index], [field]: value };
        setFormData({ ...formData, feed_quantities: newFeedQuantities });
    };

    const addFeedQuantityRow = () => {
        setFormData({
            ...formData,
            feed_quantities: [...formData.feed_quantities, { ...initialFeedQuantityState }]
        });
    };

    const removeFeedQuantityRow = (index) => {
        const newFeedQuantities = formData.feed_quantities.filter((_, i) => i !== index);
        setFormData({ ...formData, feed_quantities: newFeedQuantities });
    };


    const validateForm = () => {
        let errors = {};
        if (!formData.log_date) errors.log_date = "Log date is required.";

    
        const validFeedQuantities = formData.feed_quantities.filter(fq => fq.feed_type || fq.quantity || fq.unit);

        if (validFeedQuantities.length === 0 && !formData.special_feed_vitamins_notes.trim() && !formData.general_notes.trim()) {
            errors.feed_quantities = "At least one feed item or special notes must be provided.";
        }

        validFeedQuantities.forEach((fq, index) => {
            if (!fq.feed_type) errors[`feed_type_${index}`] = "Feed type is required.";
            if (!fq.quantity || isNaN(fq.quantity) || parseFloat(fq.quantity) <= 0) errors[`quantity_${index}`] = "Quantity must be a positive number.";
            if (!fq.unit.trim()) errors[`unit_${index}`] = "Unit is required.";
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Filter out empty rows before submission to avoid sending invalid data
            const dataToSubmit = {
                ...formData,
                feed_quantities: formData.feed_quantities.filter(fq => fq.feed_type && fq.quantity && fq.unit.trim())
            };
            onSubmit(dataToSubmit);
        }
    };

    return (
        // Modal Overlay and Content Wrapper
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-700">
                        {editingLog ? 'Edit Daily Feeding Log' : 'Add New Daily Feeding Log'}
                    </h3>
                    <button onClick={onCancelEdit} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Log Date */}
                        <div>
                            <label htmlFor="log_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Log Date:
                            </label>
                            <input
                                type="date"
                                id="log_date"
                                name="log_date"
                                value={formData.log_date}
                                onChange={handleLogDateChange}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors.log_date ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {formErrors.log_date && <p className="text-red-500 text-xs mt-1">{formErrors.log_date}</p>}
                        </div>
                    </div>

                    {/* Dynamic Feed Quantities Section */}
                    <div className="mt-6 border p-4 rounded-md bg-white">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Feed Items</h4>
                        {formData.feed_quantities.map((fq, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-4 p-3 border rounded-md bg-gray-50">
                                {/* Feed Type Selection */}
                                <div>
                                    <label htmlFor={`feed_type_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                        Feed Type {index + 1}:
                                    </label>
                                    <select
                                        id={`feed_type_${index}`}
                                        name="feed_type"
                                        value={fq.feed_type}
                                        onChange={(e) => handleFeedQuantityChange(index, 'feed_type', e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors[`feed_type_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Type</option>
                                        {feedTypes.map((ft) => (
                                            <option key={ft.id} value={ft.id}>
                                                {ft.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors[`feed_type_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`feed_type_${index}`]}</p>}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label htmlFor={`quantity_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                        Quantity:
                                    </label>
                                    <input
                                        type="number"
                                        id={`quantity_${index}`}
                                        name="quantity"
                                        value={fq.quantity}
                                        onChange={(e) => handleFeedQuantityChange(index, 'quantity', e.target.value)}
                                        step="0.01"
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., 50.00"
                                    />
                                    {formErrors[`quantity_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`quantity_${index}`]}</p>}
                                </div>

                                {/* Unit */}
                                <div>
                                    <label htmlFor={`unit_${index}`} className="block text-xs font-medium text-gray-600 mb-1">
                                        Unit:
                                    </label>
                                    <input
                                        type="text"
                                        id={`unit_${index}`}
                                        name="unit"
                                        value={fq.unit}
                                        onChange={(e) => handleFeedQuantityChange(index, 'unit', e.target.value)}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${formErrors[`unit_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="e.g., kg, lbs"
                                    />
                                    {formErrors[`unit_${index}`] && <p className="text-red-500 text-xs mt-1">{formErrors[`unit_${index}`]}</p>}
                                </div>

                                {/* Remove Button */}
                                <div className="sm:col-span-1 flex items-center justify-center">
                                    {formData.feed_quantities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeedQuantityRow(index)}
                                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {formErrors.feed_quantities && <p className="text-red-500 text-xs mt-1">{formErrors.feed_quantities}</p>}

                        <button
                            type="button"
                            onClick={addFeedQuantityRow}
                            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"> {/* Changed fill to currentColor */}
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Another Feed Type
                        </button>
                    </div>

                    {/* Special Feed / Vitamins Notes */}
                    <div className="mt-4">
                        <label htmlFor="special_feed_vitamins_notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Special Feed / Vitamins Notes:
                        </label>
                        <textarea
                            id="special_feed_vitamins_notes"
                            name="special_feed_vitamins_notes"
                            value={formData.special_feed_vitamins_notes}
                            onChange={handleSpecialNotesChange}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Added Vitamin E supplement, Extra mineral lick, etc."
                        ></textarea>
                    </div>

                    {/* General Notes */}
                    <div className="mt-4">
                        <label htmlFor="general_notes" className="block text-sm font-medium text-gray-700 mb-1">
                            General Notes:
                        </label>
                        <textarea
                            id="general_notes"
                            name="general_notes"
                            value={formData.general_notes}
                            onChange={handleGeneralNotesChange}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Any general observations about this daily distribution..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        {editingLog && (
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
                            {editingLog ? 'Update Log' : 'Add Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DailyFeedingLogList = ({ dailyLogs, onEdit, onDelete, isWorker }) => {
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="py-3 px-6 rounded-tl-lg">Date</th>
                        <th scope="col" className="py-3 px-6">Worker</th>
                        <th scope="col" className="py-3 px-6">Feed Items</th>
                        <th scope="col" className="py-3 px-6">Special Notes</th>
                        <th scope="col" className="py-3 px-6">General Notes</th>
                        {isWorker && <th scope="col" className="py-3 px-6 text-center rounded-tr-lg">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {dailyLogs.map((log) => (
                        <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{log.log_date}</td>
                            <td className="py-4 px-6">{log.worker_name}</td>
                            <td className="py-4 px-6">
                                {log.feed_quantities && log.feed_quantities.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {log.feed_quantities.map((fq, idx) => (
                                            <li key={idx}>
                                                {fq.quantity} {fq.unit} of {fq.feed_type_name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    '-'
                                )}
                            </td>
                            <td className="py-4 px-6">{log.special_feed_vitamins_notes || '-'}</td>
                            <td className="py-4 px-6">{log.general_notes || '-'}</td>
                            {isWorker && (
                                <td className="py-4 px-6 flex justify-center space-x-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(log)}
                                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(log.id)}
                                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DailyFeedingReport;
