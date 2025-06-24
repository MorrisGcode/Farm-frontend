import React from 'react';
import { Navigate } from 'react-router-dom';
import ManagerDashboard from './ManagerDashboard';
import WorkerDashboard from './WorkerDashboard';
export default function DashboardRedirect() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'MANAGER') return <ManagerDashboard />;
    if (user.role === 'WORKER') return <WorkerDashboard />;
    return <Navigate to="/login" />;
  } catch (err) {
    console.error('Error parsing user data:', err);
    return <Navigate to="/login" />;
  }
}