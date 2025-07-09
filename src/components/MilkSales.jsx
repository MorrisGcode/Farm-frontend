import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MilkSales() { 
    const [sales, setSales] = useState([]);
    const [milkRecords, setMilkRecords] = useState([]);
    const [newSale, setNewSale] = useState({
        quantity_sold: '',
        price_per_liter: '',
        sale_date: new Date().toISOString().split('T')[0], 
    });
    const [filterDate, setFilterDate] = useState('');
    const [analysisStartDate, setAnalysisStartDate] = useState('');
    const [analysisEndDate, setAnalysisEndDate] = useState('');
    const [totalSalesToday, setTotalSalesToday] = useState(0);
    const [totalSalesMonth, setTotalSalesMonth] = useState(0);
    const [totalSalesRange, setTotalSalesRange] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages
    const [showAddSaleModal, setShowAddSaleModal] = useState(false); // State to control modal visibility
    const [dailySalesData, setDailySalesData] = useState([]); // State for chart data
    const [availableMilkForDate, setAvailableMilkForDate] = useState(0); // State to display available milk

    // Base URL for your Django API (adjust if different)
    const API_BASE_URL = 'http://localhost:8000/api';

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

    // Fetch Milk Sales Records
    const fetchSales = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            let url = `${API_BASE_URL}/milk-sales/`;
            const params = new URLSearchParams();
            if (filterDate) {
                params.append('sale_date', filterDate);
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
            setSales(data);
            console.log('Sales fetched:', data);

        } catch (err) {
            setError(`Failed to fetch sales: ${err.message}`);
            console.error('Error fetching sales:', err);
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    // Fetch Milk Production Records
    const fetchMilkProductions = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/milk-production/`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            setMilkRecords(data);
            console.log('Milk Records fetched:', data);

        } catch (err) {
            setError(`Failed to fetch milk production records: ${err.message}`);
            console.error('Error fetching milk production records:', err);
        }
    }, []);

    useEffect(() => {
        fetchSales();
        fetchMilkProductions();
    }, [fetchSales, fetchMilkProductions]);

    // Handle form input changes
    const handleNewSaleChange = (e) => {
        const { name, value } = e.target;
        setNewSale(prev => ({ ...prev, [name]: value }));
    };

    // Helper to calculate daily milk availability
    const getDailyMilkAvailability = useCallback((date) => {
        console.log('Calculating availability for date:', date, 'Current Milk Records:', milkRecords, 'Current Sales:', sales);

        // Total milk produced on the given date
        const totalProducedToday = milkRecords
            .filter(record => {
                const recordDate = record.date; // Use record.date as per your console output
                console.log(`Filtering record date: ${recordDate} vs Comparing with sale date: ${date}`);
                return recordDate === date;
            })
            .reduce((sum, record) => sum + (parseFloat(record.morning_amount || 0) + parseFloat(record.evening_amount || 0)), 0);

        // Total milk already sold on the given date
        const totalSoldToday = sales
            .filter(sale => sale.sale_date === date)
            .reduce((sum, sale) => sum + parseFloat(sale.quantity_sold || 0), 0); // Use sale.quantity_sold

        const available = totalProducedToday - totalSoldToday;
        console.log('Total Produced:', totalProducedToday, 'Total Sold:', totalSoldToday, 'Available:', available);
        return {
            totalProduced: totalProducedToday,
            totalSold: totalSoldToday,
            available: available
        };
    }, [milkRecords, sales]);

    // Effect to update available milk when sale_date or sales/milkRecords change
    useEffect(() => {
        if (showAddSaleModal && newSale.sale_date) {
            const { available } = getDailyMilkAvailability(newSale.sale_date);
            setAvailableMilkForDate(available);
        } else if (!showAddSaleModal) {
            setAvailableMilkForDate(0);
        }
    }, [newSale.sale_date, showAddSaleModal, getDailyMilkAvailability]);


    // Handle adding a new sale record
    const handleAddSale = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        // Basic validation
        if (!newSale.quantity_sold || !newSale.price_per_liter || !newSale.sale_date) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }
        if (parseFloat(newSale.quantity_sold) <= 0 || parseFloat(newSale.price_per_liter) <= 0) {
            setError('Quantity and price must be positive numbers.');
            setLoading(false);
            return;
        }

        const quantityToSell = parseFloat(newSale.quantity_sold);
        const { available, totalProduced, totalSold } = getDailyMilkAvailability(newSale.sale_date);

        // NEW VALIDATION: Check against total daily available milk
        if (quantityToSell > available) {
            setError(`Quantity to sell (${quantityToSell}L) exceeds available milk for ${formatDate(newSale.sale_date)}. Total produced: ${totalProduced}L, Already sold: ${totalSold}L, Remaining: ${available}L.`);
            setLoading(false);
            return;
        }
        // END NEW VALIDATION

        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Please log in.');
                setLoading(false);
                return;
            }

            // Find a milk_record ID for the selected sale date to satisfy backend ForeignKey
            // Use record.date for finding the matching record
            const milkRecordToSend = milkRecords.find(record => record.date === newSale.sale_date)?.id;

            if (milkRecordToSend === undefined || milkRecordToSend === null) {
                setError('No milk production record found for the selected sale date. Please add milk production for this date first.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/milk-sales/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    milk_record: milkRecordToSend,
                    quantity_sold: quantityToSell,
                    price_per_liter: parseFloat(newSale.price_per_liter),
                    sale_date: newSale.sale_date,
                    // sold_by will be set by the backend based on the authenticated user
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            setMessage('Milk sale record added successfully!');
            setNewSale({
                quantity_sold: '',
                price_per_liter: '',
                sale_date: new Date().toISOString().split('T')[0],
            }); // Reset form
            setShowAddSaleModal(false); // Close modal on successful submission
            fetchSales(); // Re-fetch to update the list with the new sale and apply current filters
        } catch (err) {
            setError(`Failed to add sale: ${err.message}`);
            console.error('Error adding sale:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate sales analysis
    const calculateSalesAnalysis = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        let totalToday = 0;
        let totalMonth = 0;
        let totalRange = 0;

        sales.forEach(sale => {
            console.log('Processing sale for analysis:', sale); // Log the entire sale object
            const saleDate = sale.sale_date;
            const saleAmount = parseFloat(sale.total_sale_amount || 0); // Corrected: Use sale.total_sale_amount
            if (saleDate === today) {
                totalToday += saleAmount;
            }

            if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
                totalMonth += saleAmount;
            }

            if (analysisStartDate && analysisEndDate) {
                if (saleDate >= analysisStartDate && saleDate <= analysisEndDate) {
                    totalRange += saleAmount;
                }
            }
        });

        setTotalSalesToday(totalToday);
        setTotalSalesMonth(totalMonth);
        setTotalSalesRange(totalRange);
    }, [sales, analysisStartDate, analysisEndDate]);

    // Process sales data for the line chart
    const processSalesForChart = useCallback(() => {
        const dailyAggregates = {};
        sales.forEach(sale => {
            console.log('Processing sale for chart:', sale); // Log the entire sale object
            const date = sale.sale_date;
            const amount = parseFloat(sale.total_sale_amount || 0); // Corrected: Use sale.total_sale_amount
            if (dailyAggregates[date]) {
                dailyAggregates[date] += amount;
            } else {
                dailyAggregates[date] = amount;
            }
        });

        // Convert to array and sort by date
        const chartData = Object.keys(dailyAggregates).map(date => ({
            date: date,
            totalSales: parseFloat(dailyAggregates[date].toFixed(2))
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        setDailySalesData(chartData);
    }, [sales]);

    // Recalculate analysis whenever sales data or analysis range changes
    useEffect(() => {
        calculateSalesAnalysis();
        processSalesForChart();
    }, [sales, analysisStartDate, analysisEndDate, calculateSalesAnalysis, processSalesForChart]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 font-inter text-gray-800">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
            </style>

            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-10">
                <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">Milk Sales Dashboard</h1>

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

                {/* Add Sale Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowAddSaleModal(true)}
                        className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                    >
                        Add New Sale Record
                    </button>
                </div>

                {/* Add New Sale Modal */}
                {showAddSaleModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl relative w-full max-w-2xl">
                            <button
                                onClick={() => setShowAddSaleModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                            <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">Add New Milk Sale</h2>
                            <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Removed Milk Production Record dropdown */}
                                <div>
                                    <label htmlFor="sale_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sale Date
                                    </label>
                                    <input
                                        type="date"
                                        id="sale_date"
                                        name="sale_date"
                                        value={newSale.sale_date}
                                        onChange={handleNewSaleChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                {/* Display available milk for the selected date */}
                                {newSale.sale_date && (
                                    <div className="md:col-span-2 text-center text-lg font-semibold text-blue-700 mt-2">
                                        Available Milk for {formatDate(newSale.sale_date)}: {availableMilkForDate.toFixed(2)}L
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="quantity_sold" className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity Sold (Liters)
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity_sold"
                                        name="quantity_sold"
                                        value={newSale.quantity_sold}
                                        onChange={handleNewSaleChange}
                                        step="0.01"
                                        min="0.01"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="price_per_liter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price Per Liter (Currency)
                                    </label>
                                    <input
                                        type="number"
                                        id="price_per_liter"
                                        name="price_per_liter"
                                        value={newSale.price_per_liter}
                                        onChange={handleNewSaleChange}
                                        step="0.01"
                                        min="0.01"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-center mt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                        disabled={loading}
                                    >
                                        {loading ? 'Adding...' : 'Add Sale Record'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSaleModal(false)}
                                        className="ml-4 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filter Sales Records */}
                <section className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Filter Sales Records</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label htmlFor="filter_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                id="filter_date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center md:justify-end col-span-full md:col-span-1">
                            <button
                                onClick={fetchSales}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Apply Filter
                            </button>
                            <button
                                onClick={() => { setFilterDate(''); }}
                                className="ml-4 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </section>

                {/* Milk Sales Records Table */}
                <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Milk Sales Records</h2>
                    {sales.length === 0 && !loading && <p className="text-center text-gray-500">No sales records found.</p>}
                    {sales.length > 0 && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cow Name</th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold (L)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Liter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sale.sale_date)}</td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.cow_name || 'N/A'}</td> */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.quantity_sold}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh{parseFloat(sale.price_per_liter).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Ksh{parseFloat(sale.total_sale_amount).toFixed(2)}</td> {/* Corrected: Use sale.total_sale_amount */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Sales Analysis */}
                <section className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Sales Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Sales Today</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalSalesToday.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Sales This Month</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalSalesMonth.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-700">Total Sales in Selected Range</h3>
                            <p className="text-3xl font-bold text-blue-700">Ksh{totalSalesRange.toFixed(2)}</p>
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
                                value={analysisStartDate}
                                onChange={(e) => setAnalysisStartDate(e.target.value)}
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
                                value={analysisEndDate}
                                onChange={(e) => setAnalysisEndDate(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <button
                                onClick={calculateSalesAnalysis}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            >
                                Calculate Analysis
                            </button>
                        </div>
                    </div>
                </section>

                {/* Daily Sales Trend Chart */}
                <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">Daily Sales Trend</h2>
                    {dailySalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={dailySalesData}
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
                                <Line type="monotone" dataKey="totalSales" stroke="#2563eb" activeDot={{ r: 8 }} name="Total Sales" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-500">No sales data available for charting.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default MilkSales;
