import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login/', credentials);
      
      if (response.data.access) {
        // Store the token
        localStorage.setItem('token', response.data.access);
        
        // Get user details after login
        const userResponse = await axios.get('http://localhost:8000/api/user/', {
          headers: {
            'Authorization': `Bearer ${response.data.access}`
          }
        });
        
        // Store user details including role
        localStorage.setItem('user', JSON.stringify({
          username: userResponse.data.username,
          role: userResponse.data.role
        }));
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      {/* Tailwind CSS import - usually in public/index.html or main.js, but included for self-containment if needed */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          body {
            font-family: 'Inter', sans-serif;
          }
          .fade-in-up {
            animation: fadeInUp 0.7s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      
      {/* Removed mx-auto from this div. The parent's 'justify-center' will now correctly center it. */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-2xl space-y-8 fade-in-up">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">FarmConnect</h1> {/* Changed system name to FarmConnect */}
          <h2 className="text-xl font-semibold text-gray-700">Farm Management System</h2>
          <p className="mt-4 text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-lg"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-blue-600 hover:underline font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
