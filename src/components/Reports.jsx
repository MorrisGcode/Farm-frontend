import React, { useState } from 'react';
import axios from 'axios';

const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/';

const Reports = () => {
  const [reportType, setReportType] = useState('milk_production'); // Default report type
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null); // Clear previous report data

    if (!token) {
      setError('Authentication token missing. Please log in.');
      setLoading(false);
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      setLoading(false);
      return;
    }

    // Basic date validation
    if (new Date(startDate) > new Date(endDate)) {
        setError('Start date cannot be after end date.');
        setLoading(false);
        return;
    }

    try {
      let endpoint = '';
      let params = { start_date: startDate, end_date: endDate };

      // Adjust endpoint based on reportType
      if (reportType === 'milk_production') {
        endpoint = `${DJANGO_API_BASE_URL}reports/milk-production/`;
      } else if (reportType === 'milk_sales') {
        endpoint = `${DJANGO_API_BASE_URL}reports/milk-sales/`;
      } else if (reportType === 'feeding') {
        endpoint = `${DJANGO_API_BASE_URL}reports/feeding/`;
      } else {
        setError('Invalid report type selected.');
        setLoading(false);
        return;
      }

      const response = await axios.get(endpoint, { ...config, params });
      setReportData(response.data);

    } catch (err) {
      console.error('Error fetching report:', err.response ? err.response.data : err);
      setError(err.response?.data?.error || 'Failed to generate report. Check backend for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4 sm:p-6 md:p-8 font-inter">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
          Farm Reports
        </h1>

        {/* Report Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              <option value="milk_production">Milk Production Report</option>
              <option value="milk_sales">Milk Sales Report</option>
              <option value="feeding">Daily Feeding Report</option>
              
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
        </div>
        <div className="flex justify-center mb-8">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {reportData && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Report Results ({reportType.replace('_', ' ').toUpperCase()})</h2>
            <p className="text-gray-600 mb-4">Report Period: {reportData.start_date} to {reportData.end_date}</p>

            {/* Render report data based on reportType */}
            {reportType === 'milk_production' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Total Milk Produced: {reportData.total_milk_produced} L</h3>
                
                {reportData.daily_breakdown && reportData.daily_breakdown.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Daily Production Breakdown</h4>
                        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (L)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.daily_breakdown.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.total_liters}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {reportData.cow_breakdown && reportData.cow_breakdown.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Cow-wise Production Breakdown</h4>
                        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cow Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (L)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.cow_breakdown.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.cow_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.total_liters}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
              </div>
            )}

            {reportType === 'milk_sales' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Total Sales Amount: Ksh{reportData.total_sales_amount?.toFixed(2)}</h3>
                <h3 className="text-xl font-semibold mb-2">Total Liters Sold: {reportData.total_liters_sold} L</h3>
                
                {reportData.daily_sales_breakdown && reportData.daily_sales_breakdown.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Daily Sales Breakdown</h4>
                        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (Ksh)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liters (L)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.daily_sales_breakdown.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">Ksh{item.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.total_liters}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
              </div>
            )}

            {reportType === 'feeding' && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Feed Consumption Summary</h3>
                {reportData.feed_type_totals && reportData.feed_type_totals.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.feed_type_totals.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.feed_type_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.total_quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No feed consumption data for this period.</p>
                )}

                {reportData.detailed_logs && reportData.detailed_logs.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Detailed Daily Feeding Logs</h4>
                        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Notes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">General Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.detailed_logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{log.log_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{log.worker_name}</td>
                                            <td className="px-6 py-4">
                                                {log.feed_quantities && log.feed_quantities.length > 0 ? (
                                                    <ul className="list-disc list-inside">
                                                        {log.feed_quantities.map((fq, idx) => (
                                                            <li key={idx}>
                                                                {fq.quantity} {fq.unit} of {fq.feed_type_name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">{log.special_feed_vitamins_notes || '-'}</td>
                                            <td className="px-6 py-4">{log.general_notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
