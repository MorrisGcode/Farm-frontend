import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Define links for each role
const managerLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard/reports', label: 'Reports' },
  { to: '/dashboard/cows', label: 'Cows' },
  { to: '/dashboard/milk-records', label: 'Milk Records' },
  { to: '/dashboard/breeds', label: 'Breeds' },
  { to: '/dashboard/feed-management', label: 'Feed Management' },
  { to: '/dashboard/feeding-report', label: 'Feeding Reports' },
  { to: '/dashboard/breeding-records', label: 'Breeding Records' },
  { to: '/dashboard/calf-management', label: 'Calf Management' },
];

const workerLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard/milk-records', label: 'Milk Records' },
  { to: '/dashboard/feeding-report', label: 'Feeding Reports' },
];

const SideMenu = () => {
  const location = useLocation();
  // Get user role from localStorage
  let role = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
  
    role = user?.role?.toUpperCase() || '';
  } catch {
    role = '';
  }

  
  const links = role === 'MANAGER' ? managerLinks : workerLinks;

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {role === 'MANAGER' ? 'Farm Manager' : 'Farm Worker'}
        </h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block px-4 py-2 rounded hover:bg-blue-100 ${
                  location.pathname.startsWith(link.to)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideMenu;
