import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Adjusted import paths as requested to use a single dot, assuming components folder is in the same directory as App.jsx
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import AddCow from './components/AddCow';
import MilkRecords from './components/MilkRecords';
import CowDetails from './components/CowDetails';
import Reports from './components/Reports';
import CowList from './components/CowList';
import MilkRecordForm from './components/MilkRecordForm';
import DashboardRedirect from './components/DashboardRedirect';
import BreedList from './components/BreedList';
import FeedManagement from './components/FeedManagement';
import DailyFeedingReport from './components/DailyFeedingReport';
import BreedingRecords from './components/BreedingRecords';
import AddHealthRecord from './components/CowHealthRecords';
import CalfManagement from './components/CalfManagement';
import ManagerDashboard from './components/ManagerDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import Dashboard from './components/Dashboard';

function App() {
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role ? user.role.toUpperCase() : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const role = getUserRole();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes within the Dashboard layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Dashboard />}>
            {/* Conditional rendering for the main dashboard route */}
            <Route
              path="/dashboard"
              element={
                role === 'MANAGER' ? <ManagerDashboard /> : <WorkerDashboard />
              }
            />
            {/* Other Dashboard child routes */}
            <Route path="/dashboard/cows" element={<CowList />} />
            <Route path="/dashboard/add-cow" element={<AddCow />} />
            <Route path="/dashboard/milk-records/add" element={<MilkRecordForm />} />
            <Route path="/dashboard/milk-records" element={<MilkRecords />} />
            <Route path="/dashboard/cow/:id" element={<CowDetails />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/breeds" element={<BreedList />} />
            <Route path="/dashboard/feed-management" element={<FeedManagement />} />
            <Route path="/dashboard/feeding-report" element={<DailyFeedingReport />} />
            <Route path="/dashboard/breeding-records" element={<BreedingRecords />} />
            <Route path="/dashboard/cows/:cowId/add-health-record" element={<AddHealthRecord />} />
            <Route path="/dashboard/calf-management" element={<CalfManagement />} />
          </Route>
        </Route>

        {/* Redirect for root path */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        {/* Fallback for any other undefined paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;