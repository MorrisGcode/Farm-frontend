import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Mock Lucide React Icons (replace with actual imports if using npm package)
const LayoutDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
);
const Cow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M11.25 7.756a4.5 4.5 0 00-6.572 2.947A1.5 1.5 0 014.5 12h-.75m0-6.75a4.5 4.5 0 100 9m1.5-1.5a1.5 1.5 0 011.5 1.5M10.5 15H8.25m0 0a1.5 1.5 0 00-1.5 1.5V21m1.5-1.5a1.5 1.5 0 00-1.5-1.5H3.75m1.5 1.5A1.5 1.5 0 003 21m0 0h1.5m0-4.5h7.5m-7.5 0l-1.5-1.5M15.75 5.25a3 3 0 013 3v2.25m0 4.5a3 3 0 01-3 3h-1.5m-4.5 0a3 3 0 01-3-3v-1.5m0-4.5a3 3 0 013-3h1.5m4.5 0a3 3 0 013 3v1.5m0 0l-1.5 1.5m-1.5 1.5l1.5 1.5m-1.5-1.5a3 3 0 00-3-3H9.75m0-6V2.25m0 0h.008v.008H9.75v-.008zm-3 3h.008v.008H6.75v-.008z"/></svg>
);
const Milk = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.5 17.25v-2.25a2.25 2.25 0 00-2.25-2.25H10.5m-.75 2.25v2.25m-3.75 0v-2.25m0-9A1.125 1.125 0 017.5 7.125v-1.5m6.75 6.75l-4.5 4.5m-4.5 4.5h15"/></svg>
);
const DollarSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
);
const GitFork = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v.2C18 11.4 15.8 13.5 13.5 13.5H10A2.5 2.5 0 017.5 16v1.5"/><path d="M6 9v.2C6 11.4 8.2 13.5 10.5 13.5H13A2.5 2.5 0 0015.5 16v1.5"/></svg>
);
const Soup = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M12 21a9 9 0 007.61-14.76 8.58 8.58 0 00-7.61-3.24 8.58 8.58 0 00-7.61 3.24A9 9 0 0012 21z"/><path d="M8 10h8"/><path d="M8 14h8"/></svg>
);
const FileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z"/><path d="M14 2v4a2 2 0 002 2h4"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/><line x1="8" y1="13" x2="16" y2="13"/></svg>
);
const HeartPulse = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.2 12H9l2-8 3 12 2-8h5.8"/></svg>
);
const Baby = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 12H15M9 12V9m0 3V15m0-6V15m0 3h6M9 12h6M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
);
const Wallet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M19 7V4a1 1 0 00-1-1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a1 1 0 001-1v-3"/><path d="M22 7H11c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h11c.6 0 1-.4 1-1V8c0-.6-.4-1-1-1z"/></svg>
);
const LogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const X = () => ( // Added X icon for close button
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);


// Define links for each role with associated icons
const managerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { to: '/dashboard/cows', label: 'Cows', icon: <Cow /> },
  { to: '/dashboard/milk-records', label: 'Milk Records', icon: <Milk /> },
  { to: '/dashboard/milk-sales', label: 'Milk Sales', icon: <DollarSign /> },
  { to: '/dashboard/breeds', label: 'Breeds', icon: <GitFork /> },
  { to: '/dashboard/feed-management', label: 'Feed Management', icon: <Soup /> },
  { to: '/dashboard/feeding-report', label: 'Feeding Reports', icon: <FileText /> },
  { to: '/dashboard/breeding-records', label: 'Breeding Records', icon: <HeartPulse /> },
  { to: '/dashboard/calf-management', label: 'Calf Management', icon: <Baby /> },
  { to: '/dashboard/health-records', label: 'Health Records', icon: <HeartPulse /> },
  { to: '/dashboard/expense-tracker', label: 'Expense Tracker', icon: <Wallet /> }, 
];

const workerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { to: '/dashboard/milk-records', label: 'Milk Records', icon: <Milk /> },
  { to: '/dashboard/feeding-report', label: 'Feeding Reports', icon: <FileText /> },
];

// SideMenu now accepts isOpen and onClose props
const SideMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  let role = '';
  let username = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    role = user?.role?.toUpperCase() || '';
    username = user?.username || 'Guest';
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
    role = '';
    username = 'Guest';
  }

  const links = role === 'MANAGER' ? managerLinks : workerLinks;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex-shrink-0
        min-h-screen // Ensure it always takes full height on desktop
      `}>
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .sidebar-link {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: 8px;
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.85);
          }
          .sidebar-link:hover {
            background-color: rgba(255, 255, 255, 0.15);
            color: white;
            transform: translateX(3px);
          }
          .sidebar-link.active {
            background-color: rgba(255, 255, 255, 0.25);
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .sidebar-link.active svg {
              color: #fff; /* Ensure icon color is white for active state */
          }
          .sidebar-link svg {
              color: rgba(255, 255, 255, 0.7); /* Default icon color */
              transition: color 0.2s ease;
          }
          `}
        </style>

        {/* FarmConnect Logo/Title */}
        <div className="p-6 border-b border-blue-800 flex items-center justify-between">
          <span className="text-3xl font-extrabold text-white">🐄 FarmConnect</span>
          {/* Close button for mobile */}
          <button 
            onClick={onClose} 
            className="md:hidden text-white hover:text-blue-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-blue-800 text-center">
          <p className="text-lg font-semibold text-blue-200">{username}</p>
          <p className="text-sm text-blue-300">{role === 'MANAGER' ? 'Farm Manager' : 'Farm Worker'}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {links.map(link => {
              // Determine if the link is active
              const isActive = link.to === '/dashboard' 
                ? location.pathname === '/dashboard' // Exact match for Dashboard
                : location.pathname.startsWith(link.to); // Starts with for other links

              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose} // Close sidebar on link click for mobile
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold justify-center shadow-md"
          >
            <LogOut />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
