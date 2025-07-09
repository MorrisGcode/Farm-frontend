import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Only Link is needed here, BrowserRouter is provided by App.jsx

function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reusable SVG for Menu icon (Hamburger)
  const MenuIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      ></path>
    </svg>
  );

  // Reusable SVG for Close icon (X)
  const CloseIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  );

  return (
    // The outermost div ensures the component occupies the full viewport
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 font-inter text-gray-800">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          html, body, #root { /* Ensure html, body, and root div fill the screen */
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden; /* Prevent horizontal scroll */
          }
          body { font-family: 'Inter', sans-serif; }
          .animate-fade-in-down {
            animation: fadeInDown 0.3s ease-out forwards;
          }
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="bg-white shadow-lg py-4 px-6 md:px-8 rounded-b-xl">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo/Brand Name */}
          <Link to="/" className="text-2xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">🐄</span> FarmConnect
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/about-us"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-md"
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2 rounded-md"
            >
              Contact Us
            </Link>
            {/* Separated Login and Register buttons */}
            <Link
              to="/login"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 bg-white px-4 py-3 rounded-lg shadow-inner animate-fade-in-down">
            <Link
              to="/about-us"
              className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact-us"
              className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            {/* Separated Login and Register links for mobile */}
            <Link
              to="/login"
              className="block px-3 py-2 text-blue-600 border border-blue-600 rounded-md text-center font-medium hover:bg-blue-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block px-3 py-2 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 lg:py-32">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900 leading-tight mb-6">
          Welcome to FarmConnect
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-8">
          Your comprehensive solution for efficient dairy farm management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/about-us"
            className="px-8 py-3 border border-blue-600 text-blue-800 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
          >
            Learn More
          </Link>
        </div>
      </header>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm bg-white shadow-inner rounded-t-xl">
        <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
