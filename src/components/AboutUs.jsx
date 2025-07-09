import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Import images from src/assets/images
import cowImg from '../assets/images/cow.png';
import milkImg from '../assets/images/milk.png';
import calfImg from '../assets/images/calf.png';
import feedImg from '../assets/images/feed.png';
import healthImg from '../assets/images/health.png';
import aboutheroImg from '../assets/images/abouthero.png'
import salesImg from '../assets/images/salesImg.png'; // Add this image to your assets or use a placeholder


function AboutUs() {
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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter text-gray-800">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          html, body, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
          }
          body { font-family: 'Inter', sans-serif; }
          .animate-fade-in-down {
            animation: fadeInDown 0.7s ease-out forwards; /* Smoother animation */
            opacity: 0; /* Start invisible */
          }
          .animate-slide-up {
            animation: slideUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          /* Custom scrollbar for webkit browsers for main content */
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      {/* Navbar - Directly Embedded */}
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

      {/* Main content area */}
      <main className="flex-grow overflow-y-auto p-6 sm:p-8">
        {/* Hero Section */}
        <div
          className="relative bg-gradient-to-r from-blue-700 to-blue-500 h-64 sm:h-80 md:h-96 flex items-center justify-center mb-10 shadow-xl overflow-hidden rounded-xl"
          style={{
            backgroundImage: `url(${aboutheroImg})`, // Using aboutheroImg as background
            backgroundSize: 'cover', // Ensures the image covers the entire area
            backgroundPosition: 'center', // Centers the image
            backgroundRepeat: 'no-repeat', // Prevents image repetition
          }}
        >
          {/* Overlay for contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-40"></div> {/* Adjusted opacity for better image visibility */}
          <div className="relative z-10 text-center px-4 animate-fade-in-down">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
              About FarmConnect
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 font-light max-w-2xl mx-auto">
              Empowering dairy farmers with smart, connected solutions for a better tomorrow.
            </p>
          </div>
        </div>

        {/* Our Mission Section */}
        <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8 text-center max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At FarmConnect, our mission is to revolutionize dairy farm management by providing
            innovative, user-friendly, and comprehensive digital tools. We aim to empower farmers
            with actionable insights, streamline daily operations, enhance animal welfare, and
            ultimately contribute to a more sustainable and profitable dairy industry.
          </p>
        </section>

        {/* Core Functions Section - Enhanced with animations and imported images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Cow Management */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 00-6.572 2.947A1.5 1.5 0 017.5 12h-.75m0-6.75a4.5 4.5 0 100 9m1.5-1.5a1.5 1.5 0 011.5 1.5M10.5 15H8.25m0 0a1.5 1.5 0 00-1.5 1.5V21m1.5-1.5a1.5 1.5 0 00-1.5-1.5H3.75m1.5 1.5A1.5 1.5 0 003 21m0 0h1.5m0-4.5h7.5m-7.5 0l-1.5-1.5M15.75 5.25a3 3 0 013 3v2.25m0 4.5a3 3 0 01-3 3h-1.5m-4.5 0a3 3 0 01-3-3v-1.5m0-4.5a3 3 0 013-3h1.5m4.5 0a3 3 0 013 3v1.5m0 0l-1.5 1.5m-1.5 1.5l1.5 1.5m-1.5-1.5a3 3 0 00-3-3H9.75m0-6V2.25m0 0h.008v.008H9.75v-.008zm-3 3h.008v.008H6.75v-.008z" />
              </svg>
              Cow Management
            </h2>
            <img
              src={cowImg}
              alt="Cow Management"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Track individual cow details, breeding cycles, and historical data to ensure optimal herd performance and health.
            </p>
          </div>

          {/* Milk Production Management & Analysis */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.5 17.25v-2.25a2.25 2.25 0 00-2.25-2.25H10.5m-.75 2.25v2.25m-3.75 0v-2.25m0-9A1.125 1.125 0 017.5 7.125v-1.5m6.75 6.75l-4.5 4.5m-4.5 4.5h15" />
              </svg>
              Milk Production & Analysis
            </h2>
            <img
              src={milkImg}
              alt="Milk Production Management & Analysis"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Record daily milk yields, analyze production trends, and identify factors influencing output for better decision-making.
            </p>
          </div>

          {/* Calf Management */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75c0-1.036.8-1.875 1.8-1.875h1.35c.345 0 .684.06.99.173L8.25 14.167a4.5 4.5 0 014.5 0l2.1-.84c.306-.113.645-.173.99-.173h1.35c1-.008 1.8.857 1.8 1.875v3.586a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.34V15.75z" />
              </svg>
              Calf Management
            </h2>
            <img
              src={calfImg}
              alt="Calf Management"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Monitor calf health, growth, feeding schedules, and vaccination records for strong future herd development.
            </p>
          </div>

          {/* Health Management */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12H15M9 12V9m0 3V15m0-6V15m0 3h6M9 12h6M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              Health Management
            </h2>
            <img
              src={healthImg}
              alt="Health Management"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Maintain detailed health records, vaccination schedules, and treatment histories to ensure a healthy and productive herd.
            </p>
          </div>

          {/* Feed Reports & Management */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v-4.477a.25.25 0 01.4-.23L12 14.5l2.6-2.007a.25.25 0 01.4.23v4.477m-8.5.073h11.5a1 1 0 001-1v-8.5a1 1 0 00-1-1h-11.5a1 1 0 00-1 1v8.5a1 1 0 001 1zM2 7.75h20M7.5 13h9" />
              </svg>
              Feed Management
            </h2>
            <img
              src={feedImg}
              alt="Feed Reports & Management"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Manage feed inventory, track consumption, and generate reports to optimize feeding strategies and reduce waste.
            </p>
          </div>

          {/* Sales & Expense Reports */}
          <div className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M5 11h14a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" />
              </svg>
              Sales & Expense Reports
            </h2>
            <img
              src={salesImg}
              alt="Sales & Expense Reports"
              className="w-full h-48 rounded-lg mb-4 shadow-md object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/ccc/000?text=Image+Unavailable"; }}
            />
            <p className="text-gray-700 leading-relaxed text-base">
              Track your farm’s sales, monitor expenses, and generate financial reports to keep your business profitable and sustainable.
            </p>
          </div>
        </div>

        {/* Our Team Section */}
        <section className="py-16 bg-blue-50 rounded-xl shadow-lg mt-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src="https://placehold.co/150x150/000000/FFFFFF?text=Morrison+N"
                  alt="Morrison Njenga"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200"
                />
                <h3 className="text-xl font-semibold text-blue-700 mb-1">Morrison Njenga</h3>
                <p className="text-blue-600 font-medium mb-3">CEO & Founder</p>
                <p className="text-gray-600 text-center">
                  Visionary leader passionate about leveraging technology to empower the agricultural sector.
                </p>
              </div>
              {/* Team Member 2 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src="https://placehold.co/150x150/000000/FFFFFF?text=Ian+G"
                  alt="Ian Githinji"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200"
                />
                <h3 className="text-xl font-semibold text-blue-700 mb-1">Ian Githinji</h3>
                <p className="text-blue-600 font-medium mb-3">Lead Developer</p>
                <p className="text-gray-600 text-center">
                  Architect of FarmConnect's robust and scalable software solutions.
                </p>
              </div>
              {/* Team Member 3 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src="https://placehold.co/150x150/000000/FFFFFF?text=Stella+W"
                  alt="Stella Wanjiku"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200"
                />
                <h3 className="text-xl font-semibold text-blue-700 mb-1">Stella Wanjiku</h3>
                <p className="text-blue-600 font-medium mb-3">Agricultural Specialist</p>
                <p className="text-gray-600 text-center">
                  Ensuring our features align with real-world farming needs and best practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section - Enhanced with animations */}
        <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <p className="text-lg text-gray-700 mb-6">
            Ready to revolutionize your dairy farm operations?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact-us"
              className="px-8 py-3 border border-blue-600 text-blue-800 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm bg-white shadow-inner rounded-t-xl mt-12">
        <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AboutUs;
