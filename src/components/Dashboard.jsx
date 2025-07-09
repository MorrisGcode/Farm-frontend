import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import SideMenu from './SideMenu'; // Assuming SideMenu is in the same directory or correctly aliased

// Mock LogOut icon for the top bar (if not using lucide-react directly)
const LogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

// Mock Menu icon for hamburger menu (if not using lucide-react directly)
const Menu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to control sidebar visibility

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.role) {
        navigate('/login');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage items
    window.location.href = '/login'; // Redirect to login page
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the navigate('/login') above,
    // but as a fallback, return null or a simple message.
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-inter"> {/* Added font-inter class */}
      {/* Custom CSS for Inter font and scrollbar */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .font-inter {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #e2e8f0; /* Tailwind gray-200 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #94a3b8; /* Tailwind gray-400 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b; /* Tailwind gray-500 */
        }
        `}
      </style>

      {/* Side Menu - Pass isOpen and onClose props */}
      <SideMenu isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Main Content Area */}
      {/* Added min-w-0 to ensure this flex item correctly takes up remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          {/* Hamburger menu button for mobile */}
          <button 
            onClick={toggleSidebar} 
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-2xl font-semibold text-gray-800 hidden md:block">Welcome, {user.username}!</h1> {/* Hidden on mobile */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium md:hidden">Welcome, {user.username}!</span> {/* Visible on mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Outlet */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
