import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkerDashboard = () => {
    // State for dashboard statistics
    const [stats, setStats] = useState({
        total_cows: 0,
        records_today: 0,
        total_milk_recorded: 0
    });
    // State for loading, error, and notifications
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    // State to store expenses specific to the logged-in worker
    const [workerExpenses, setWorkerExpenses] = useState([]);

    // Hook for navigation
    const navigate = useNavigate();

    // Retrieve user and token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    // Get the ID of the current logged-in worker for filtering expenses
    const currentWorkerId = user.id;
    console.log('Loaded user from localStorage:', user);
    // Determine if the logged-in user has the 'WORKER' role
    const isWorker = user.role?.toUpperCase() === 'WORKER';

    // --- Data Fetching Logic (Memoized with useCallback) ---

    const fetchDashboardData = useCallback(async () => {
        // Redirect to login if not authenticated
        if (!user.username || !token) {
            setError('Not authenticated. Please log in.');
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // 1. Fetch total cows
            const cowsRes = await axios.get('http://localhost:8000/api/cows/', config);

            // 2. Fetch general worker stats (e.g., records_today, total_milk_recorded)
            // This endpoint should ideally provide stats specific to the logged-in worker.
            // If it's general farm stats, then adjust as needed.
            const statsRes = await axios.get('http://localhost:8000/api/dashboard/', config);

            // 3. Fetch expenses specifically for this worker
            // We assume your backend endpoint handles filtering by `worker_paid` ID.
            const expensesRes = await axios.get(`http://localhost:8000/api/expenses/?worker_paid=${currentWorkerId}`, config);
            setWorkerExpenses(expensesRes.data);

            // Update the dashboard stats
            setStats({
                total_cows: cowsRes.data.length, // Assuming cowsRes.data is an array of cows
                records_today: statsRes.data.records_today,
                total_milk_recorded: statsRes.data.total_milk_recorded
            });
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Worker Dashboard Data Error:', err.response ? err.response.data : err);
            // Handle specific HTTP error codes
            if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view this dashboard data.');
            } else if (err.response?.status === 401) {
                setError('Session expired or unauthorized. Please log in again.');
                // Clear local storage on unauthorized access and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                setError('Failed to load dashboard data. Please try again or check backend connection.');
            }
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    }, [navigate, user.username, token, currentWorkerId]); // Dependencies for useCallback

    const fetchNotifications = useCallback(async () => {
        if (!token) {
            setNotifications([]);
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:8000/api/notifications/', config);
            setNotifications(res.data);
        } catch (err) {
            console.error('Worker Notifications Error:', err.response ? err.response.data : err);
            setNotifications([]); // Clear notifications on error
        }
    }, [token]); // Dependencies for useCallback

    // --- Effect Hook for Data Loading ---
    useEffect(() => {
        fetchDashboardData();
        fetchNotifications();
    }, [fetchDashboardData, fetchNotifications]); // Re-fetch when these memoized functions change (which is rare)

    // --- Event Handler for Logout ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // --- Wage Calculation Logic ---
    // Get today's date in YYYY-MM-DD format (for comparison with backend DateField)
    const today = new Date().toISOString().split('T')[0];

    // Filter and sum wages paid to the current worker specifically for today
    const wagesPaidToday = workerExpenses
        .filter(exp =>
            exp.category === 'WAGES' &&
            // While backend filters by worker_paid, this client-side filter adds robustness
            // and ensures only data for *this* worker is processed if backend filter was broad.
            exp.worker_paid === currentWorkerId &&
            exp.expense_date === today
        )
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // --- Conditional Rendering for Loading and Error States ---
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center py-4 text-gray-700 font-semibold text-lg">Loading dashboard data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
                <p className="font-semibold text-lg text-center mb-4">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
                >
                    Retry
                </button>
                <button
                    onClick={handleLogout}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    // --- Main Dashboard Render ---
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-6 font-inter">
            {/* Inline style for Inter font - could be moved to index.css */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
            </style>
            <div className="max-w-7xl mx-auto w-full">
                {/* <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Worker Dashboard</h1> */}

                {/* Greeting (Optional, but nice personal touch) */}
                {/* {user.username && (
                    <p className="text-lg text-gray-600 text-center mb-6">
                        Welcome back, <span className="font-semibold text-blue-600">{user.username}!</span>
                    </p>
                )} */}

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Cows */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Cows</h3>
                        <p className="text-5xl font-extrabold text-blue-600">{stats.total_cows || 0}</p>
                    </div>
                    {/* Records Today */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Records Today</h3>
                        <p className="text-5xl font-extrabold text-green-600">{stats.records_today || 0}</p>
                    </div>
                    {/* Total Milk Today (L) */}
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Milk Today (L)</h3>
                        <p className="text-5xl font-extrabold text-purple-600">{stats.total_milk_recorded || 0} L</p>
                    </div>
                </div>

                {/* New Section for Wages Paid Today - Only for Workers */}
                {isWorker && (
                    <div className="bg-yellow-50 p-6 rounded-xl shadow-xl border-b-4 border-yellow-500 flex flex-col items-center justify-center text-center mb-8 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Wages Paid Today</h3>
                        <p className="text-5xl font-extrabold text-yellow-600">Ksh{wagesPaidToday.toFixed(2)}</p>
                        <p className="text-gray-500 mt-2">This is the total amount paid to you today.</p>
                        {/* Optional: Link to a full wages history page */}
                        {/* <Link to="/dashboard/my-wages" className="text-blue-600 hover:underline mt-2">
                            View full payment history
                        </Link> */}
                    </div>
                )}

                {/* Manager Notifications */}
                <div className="bg-white rounded-lg shadow-xl mb-8 p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Manager Notifications</h2>
                    {notifications.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">No notifications yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {notifications.map(notif => (
                                <li key={notif.id} className="py-3 px-2 hover:bg-gray-50 transition-colors duration-200">
                                    <p className="text-base text-gray-700">
                                        <span className="font-semibold text-blue-600">{notif.created_by_name || 'Manager'}:</span> {notif.message}
                                    </p>
                                    <span className="block text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Worker Quick Actions */}
                <div className="bg-white rounded-lg shadow-xl mb-8 hover:shadow-2xl transition-shadow duration-300">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">Quick Actions</h2>
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            <Link
                                to="/dashboard/milk-records/add"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Milk Record
                            </Link>
                            <Link
                                to="/dashboard/milk-records"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                View Milk Records
                            </Link>
                            <Link
                                to="/dashboard/feeding-report"
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-pink-600 hover:bg-pink-700 transition-transform transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l-5 5m0 0l5 5m-5-5h12" />
                                </svg>
                                Add Feeding Report
                            </Link>
                            
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkerDashboard;