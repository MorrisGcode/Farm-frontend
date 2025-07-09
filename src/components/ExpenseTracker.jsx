import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Base URL for your Django API (adjust if different)
const API_BASE_URL = 'http://localhost:8000/api';

// Expense Categories - Must match Django's EXPENSE_CATEGORIES
const EXPENSE_CATEGORIES = [
    { value: 'WAGES', label: 'Wages' },
    { value: 'FEEDS', label: 'Feeds' },
    { value: 'VETERINARY_SERVICES', label: 'Veterinary Services' },
    { value: 'FARM_TOOLS', label: 'Farm Tools' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'OTHER', label: 'Other' },
];

function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]); // For 'worker_paid' dropdown
    const [newExpense, setNewExpense] = useState({
        category: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0], // Default to today
        description: '',
        worker_paid: '', // ID of the user/worker paid
    });
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [totalExpensesToday, setTotalExpensesToday] = useState(0);
    const [totalExpensesMonth, setTotalExpensesMonth] = useState(0);
    const [totalExpensesRange, setTotalExpensesRange] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [dailyExpensesData, setDailyExpensesData] = useState([]); // For chart data

    // Utility to format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            return dateString;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to get the authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch Expenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            let url = `${API_BASE_URL}/expenses/`;
            const params = new URLSearchParams();
            if (filterCategory) {
                params.append('category', filterCategory);
            }
            if (filterStartDate) {
                params.append('start_date', filterStartDate);
            }
            if (filterEndDate) {
                params.append('end_date', filterEndDate);
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            setExpenses(data);
            console.log('Expenses fetched:', data);

        } catch (err) {
            setError(`Failed to fetch expenses: ${err.message}`);
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    }, [filterCategory, filterStartDate, filterEndDate]);
     
    // Fetch Users (for worker_paid dropdown)
    const fetchUsers = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }
            // IMPORTANT: Adjust this URL to your actual user listing endpoint.
            // This example assumes an endpoint like /api/users/ or /api/farmusers/
            // that returns a list of user objects with 'id' and 'username'.
            // You might need to create such an endpoint if it doesn't exist.
            const response = await fetch(`${API_BASE_URL}/users/`, { // Example URL, adjust as per your Django setup
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();

            // CRITICAL: Ensure data is an array before processing
            if (!Array.isArray(data)) {
                console.error('API response for users is not an array:', data);
                throw new Error('Invalid data format received for users: Expected an array.');
            }

            // Filter for users with 'WORKER' role and ensure essential properties exist
            const workers = data.filter(user =>
                user && typeof user.role === 'string' && user.role.toUpperCase() === 'WORKER' &&
                user.id !== undefined && user.username !== undefined
            );
            setUsers(workers);
            console.log('Users (Workers) fetched:', workers);
        }
        catch (err) {
            setError(`Failed to fetch users: ${err.message}`);
            console.error('Error fetching users:', err);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
        fetchUsers();
    }, [fetchExpenses, fetchUsers]);

    // Handle form input changes
    const handleNewExpenseChange = (e) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({ ...prev, [name]: value }));
    };

    // Handle adding a new expense record
    const handleAddExpense = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        // Basic validation
        if (!newExpense.category || !newExpense.amount || !newExpense.expense_date) {
            setError('Please fill in all required fields (Category, Amount, Date).');
            setLoading(false);
            return;
        }
        if (parseFloat(newExpense.amount) <= 0) {
            setError('Amount must be a positive number.');
            setLoading(false);
            return;
        }

        // Specific validation for 'Wages' category
        if (newExpense.category === 'WAGES' && !newExpense.worker_paid) {
            setError('For "Wages" category, please select the worker paid.');
            setLoading(false);
            return;
        }

        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            const payload = {
                category: newExpense.category,
                amount: parseFloat(newExpense.amount),
                expense_date: newExpense.expense_date,
                description: newExpense.description,
            };

            // Only include worker_paid if the category is wages
            if (newExpense.category === 'WAGES' && newExpense.worker_paid) {
                payload.worker_paid = parseInt(newExpense.worker_paid);
            } else {
                // Ensure worker_paid is not sent if not wages, or is null
                payload.worker_paid = null;
            }


            const response = await fetch(`${API_BASE_URL}/expenses/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Attempt to parse specific error messages from Django if available
                let errorMessage = 'Failed to add expense.';
                if (errorData && typeof errorData === 'object') {
                    errorMessage = Object.values(errorData).flat().join(' ');
                }
                throw new Error(`HTTP error! Status: ${response.status} - ${errorMessage}`);
            }
            setMessage('Expense record added successfully!');
            setNewExpense({
                category: '',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                description: '',
                worker_paid: '',
            }); // Reset form
            setShowAddExpenseModal(false); // Close modal on successful submission
            fetchExpenses(); // Re-fetch to update the list
        } catch (err) {
            setError(`Failed to add expense: ${err.message}`);
            console.error('Error adding expense:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate expense analysis
    const calculateExpenseAnalysis = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        let totalToday = 0;
        let totalMonth = 0;
        let totalRange = 0;

        expenses.forEach(expense => {
            const expenseDate = expense.expense_date;
            const expenseAmount = parseFloat(expense.amount || 0);

            if (expenseDate === today) {
                totalToday += expenseAmount;
            }

            if (expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd) {
                totalMonth += expenseAmount;
            }

            if (filterStartDate && filterEndDate) { // Use filterStartDate and filterEndDate for analysis range
                if (expenseDate >= filterStartDate && expenseDate <= filterEndDate) {
                    totalRange += expenseAmount;
                }
            }
        });

        setTotalExpensesToday(totalToday);
        setTotalExpensesMonth(totalMonth);
        setTotalExpensesRange(totalRange);
    }, [expenses, filterStartDate, filterEndDate]); // Dependencies updated

    // Process expense data for the line chart
    const processExpensesForChart = useCallback(() => {
        const dailyAggregates = {};
        expenses.forEach(expense => {
            const date = expense.expense_date;
            const amount = parseFloat(expense.amount || 0);
            if (dailyAggregates[date]) {
                dailyAggregates[date] += amount;
            } else {
                dailyAggregates[date] = amount;
            }
        });

        // Convert to array and sort by date
        const chartData = Object.keys(dailyAggregates).map(date => ({
            date: date,
            totalExpenses: parseFloat(dailyAggregates[date].toFixed(2))
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        setDailyExpensesData(chartData);
    }, [expenses]);

    // Recalculate analysis whenever expenses data or analysis range changes
    useEffect(() => {
        calculateExpenseAnalysis();
        processExpensesForChart();
    }, [expenses, calculateExpenseAnalysis, processExpensesForChart, filterStartDate, filterEndDate]); // Added filter dates to dependencies


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-inter text-gray-800">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
            </style>

            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-10">
                <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Farm Expense Tracker</h1>

                {/* Messages */}
                {loading && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md relative text-center">
                        Loading...
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-center">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-center">
                        {message}
                    </div>
                )}

                {/* Add Expense Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowAddExpenseModal(true)}
                        className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                    >
                        Add New Expense
                    </button>
                </div>

                {/* Add New Expense Modal */}
                {showAddExpenseModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl relative w-full max-w-2xl">
                            <button
                                onClick={() => setShowAddExpenseModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                            <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">Add New Expense</h2>
                            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={newExpense.category}
                                        onChange={handleNewExpenseChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Expense Date
                                    </label>
                                    <input
                                        type="date"
                                        id="expense_date"
                                        name="expense_date"
                                        value={newExpense.expense_date}
                                        onChange={handleNewExpenseChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (Ksh)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        value={newExpense.amount}
                                        onChange={handleNewExpenseChange}
                                        step="0.01"
                                        min="0.01"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                {newExpense.category === 'WAGES' && (
                                    <div>
                                        <label htmlFor="worker_paid" className="block text-sm font-medium text-gray-700 mb-1">
                                            Worker Paid
                                        </label>
                                        <select
                                            id="worker_paid"
                                            name="worker_paid"
                                            value={newExpense.worker_paid}
                                            onChange={handleNewExpenseChange}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                            required={newExpense.category === 'WAGES'}
                                        >
                                            <option value="">Select worker</option>
                                            {users.map(user => (
                                                // Defensive rendering: ensure user and its properties exist
                                                user && user.id && user.username ? (
                                                    <option key={user.id} value={user.id}>
                                                        {user.username}
                                                    </option>
                                                ) : null
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={newExpense.description}
                                        onChange={handleNewExpenseChange}
                                        rows="3"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    ></textarea>
                                </div>
                                <div className="md:col-span-2 flex justify-center mt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                        disabled={loading}
                                    >
                                        {loading ? 'Adding...' : 'Add Expense Record'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddExpenseModal(false)}
                                        className="ml-4 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filter Expenses */}
                <section className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Filter Expenses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label htmlFor="filter_category" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Category
                            </label>
                            <select
                                id="filter_category"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                            >
                                <option value="">All Categories</option>
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="filter_start_date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="filter_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="filter_end_date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-center mt-4">
                            <button
                                onClick={fetchExpenses}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Apply Filter
                            </button>
                            <button
                                onClick={() => { setFilterCategory(''); setFilterStartDate(''); setFilterEndDate(''); }}
                                className="ml-4 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </section>

                {/* Expense Records Table */}
                <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Expense Records</h2>
                    {expenses.length === 0 && !loading && <p className="text-center text-gray-500">No expense records found.</p>}
                    {expenses.length > 0 && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (Ksh)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Recorded By</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.expense_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category_display}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh{parseFloat(expense.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{expense.description || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.worker_paid_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.recorded_by_name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Expense Analysis */}
                <section className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Expense Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Expenses Today</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalExpensesToday.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Expenses This Month</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalExpensesMonth.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Expenses in Selected Range</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalExpensesRange.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label htmlFor="analysis_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="analysis_start_date"
                                value={filterStartDate} // Use filterStartDate for analysis input
                                onChange={(e) => setFilterStartDate(e.target.value)} // Update filterStartDate
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="analysis_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="analysis_end_date"
                                value={filterEndDate} // Use filterEndDate for analysis input
                                onChange={(e) => setFilterEndDate(e.target.value)} // Update filterEndDate
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <button
                                onClick={calculateExpenseAnalysis}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Calculate Analysis
                            </button>
                        </div>
                    </div>
                </section>

                {/* Daily Expenses Trend Chart */}
                <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Daily Expenses Trend</h2>
                    {dailyExpensesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={dailyExpensesData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis />
                                <Tooltip formatter={(value) => `Ksh${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="totalExpenses" stroke="#2563eb" activeDot={{ r: 8 }} name="Total Expenses" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-500">No expense data available for charting.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default ExpenseTracker;
