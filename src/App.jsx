import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Adjusted import paths as requested to use a single dot, assuming components folder is in the same directory as App.jsx
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import AddCow from './components/AddCow';
import MilkRecords from './components/MilkRecords'; // This component will manage the MilkRecordForm modal
import CowDetails from './components/CowDetails';
import Reports from './components/Reports';
import CowList from './components/CowList';
// Removed: import MilkRecordForm from './components/MilkRecordForm'; // MilkRecordForm is now used as a modal within MilkRecords
import DashboardRedirect from './components/DashboardRedirect'; // This component might become redundant if Dashboard handles redirect
import BreedList from './components/BreedList';
import FeedManagement from './components/FeedManagement';
import DailyFeedingReport from './components/DailyFeedingReport';
import BreedingRecords from './components/BreedingRecords';
import AddHealthRecord from './components/CowHealthRecords'; // Assuming this is for adding/managing health records
import CalfManagement from './components/CalfManagement';
import ManagerDashboard from './components/ManagerDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage'; // Import the new LandingPage component
import AboutUs from './components/AboutUs'; // New import
import ContactUs from './components/ContactUs'; // New import
import MilkSales from './components/MilkSales'; // New import
import ExpenseTracker from './components/ExpenseTracker'; // New import

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
        <Route path="/" element={<LandingPage />} /> {/* Set LandingPage as the root route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about-us" element={<AboutUs />} /> {/* Added About Us route */}
        <Route path="/contact-us" element={<ContactUs />} /> {/* Added Contact Us route */}

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
            {/* Removed the direct route for MilkRecordForm. It should be opened as a modal from MilkRecords. */}
            {/* <Route path="/dashboard/milk-records/add" element={<MilkRecordForm />} /> */}
            <Route path="/dashboard/milk-records" element={<MilkRecords />} /> {/* MilkRecords now handles the modal */}
            <Route path="/dashboard/cow/:id" element={<CowDetails />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/breeds" element={<BreedList />} />
            <Route path="/dashboard/feed-management" element={<FeedManagement />} />
            <Route path="/dashboard/feeding-report" element={<DailyFeedingReport />} />
            <Route path="/dashboard/breeding-records" element={<BreedingRecords />} />
            {/* Route for adding health record specific to a cow */}
            <Route path="/dashboard/cows/:cowId/add-health-record" element={<AddHealthRecord />} />
            {/* Route for general health records list/management (if AddHealthRecord is also a list component) */}
            <Route path="/dashboard/health-records" element={<AddHealthRecord />} /> 
            <Route path="/dashboard/calf-management" element={<CalfManagement />} />
            <Route path="/dashboard/milk-sales" element={<MilkSales />} /> {/* Added Milk Sales route */}
            <Route path="/dashboard/expense-tracker" element={<ExpenseTracker />} /> {/* Added Expense Tracker route */}
          </Route>
        </Route>

        {/* Fallback for any other undefined paths - consider a 404 page or redirect to login/home */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
