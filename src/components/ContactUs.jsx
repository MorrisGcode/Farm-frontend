import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Make sure Link is imported for the Navbar
import contactpage from '../assets/images/health.png';

function ContactUs() {
  // Navbar state and icon definitions, directly within ContactUs component
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

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setIsError(false);
    setIsLoading(true);

    if (!formData.name || !formData.email || !formData.message) {
      setIsError(true);
      setStatusMessage('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setIsError(true);
      setStatusMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(data.message || 'Thank you for your message! We will get back to you soon.');
        setIsError(false);
        setFormData({ name: '', email: '', message: '' });
      } else {
        let errorMessage = 'Something went wrong. Please try again.';
        if (data && typeof data === 'object') {
          const errors = Object.values(data).flat();
          if (errors.length > 0) {
            errorMessage = errors.join(' ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
        setIsError(true);
        setStatusMessage(errorMessage);
      }
    } catch (error) {
      console.error('Network error or server unreachable:', error);
      setIsError(true);
      setStatusMessage('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter text-gray-800">
      {/* Tailwind CSS and Font Imports (from your original snippet) */}
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
            animation: fadeInDown 0.7s ease-out forwards;
            opacity: 0;
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

      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-r from-blue-700 to-blue-500 h-64 sm:h-80 md:h-96 flex items-center justify-center mb-10 shadow-xl overflow-hidden rounded-xl mx-4 sm:mx-8 lg:mx-16"
        style={{
          backgroundImage: `url(${contactpage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for contrast and depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 animate-fade-in-down">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
            Get In Touch With Us
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-2 font-light">
            We're here to help! Reach out for support, feedback, or partnership opportunities.
          </p>
        </div>
      </div>

      {/* Main content wrapper with padding */}
      <main className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Contact Form Section */}
          <div className="bg-white shadow-3xl rounded-3xl p-8 md:p-10 hover:shadow-blue-300 transition-all duration-300 transform hover:-translate-y-2 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">
              Send us a Message
            </h2>
            {statusMessage && (
              <div
                className={`px-5 py-3 rounded-xl mb-6 text-lg font-medium flex items-center ${
                  isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {isError ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {statusMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:text-base p-3 transition duration-150 ease-in-out"
                  placeholder="Your Full Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:text-base p-3 transition duration-150 ease-in-out"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-base font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:text-base p-3 transition duration-150 ease-in-out resize-y"
                  placeholder="Tell us what's on your mind..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information Section (as previously provided) */}
          <div className="bg-white shadow-3xl rounded-3xl p-8 md:p-10 hover:shadow-blue-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">
                Our Contact Details
              </h2>
              <div className="space-y-7">
                {/* Email */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">Email Address</h3>
                    <a href="mailto:info@farmconnect.com" className="text-blue-600 hover:underline text-base">
                      info@farmconnect.com
                    </a>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">Phone Number</h3>
                    <p className="text-gray-700 text-base">+254 (722) 123-4567</p>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.727A8 8 0 0120 12c0-5.523-4.477-10-10-10S0 6.477 0 12c0 2.972 1.288 5.676 3.332 7.525L6 22l-1.657-2.727z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">Our Location</h3>
                    <p className="text-gray-700 text-base">123 Farm Lane, Limuru, Tigoni</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Social Media (Optional) */}
            <div className="mt-10 flex space-x-6 justify-center">
              <a
                href="https://wa.me/15551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-700 text-4xl transform hover:scale-110 transition-transform duration-200"
                title="Chat on WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
                <span className="sr-only">WhatsApp</span>
              </a>
              <a
                href="https://facebook.com/farmconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 text-4xl transform hover:scale-110 transition-transform duration-200"
                title="Follow on Facebook"
              >
                <i className="fab fa-facebook-f"></i>
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com/farmconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 text-4xl transform hover:scale-110 transition-transform duration-200"
                title="Follow on Twitter"
              >
                <i className="fab fa-twitter"></i>
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com/farmconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-700 text-4xl transform hover:scale-110 transition-transform duration-200"
                title="Follow on Instagram"
              >
                <i className="fab fa-instagram"></i>
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm bg-white shadow-inner rounded-t-3xl mt-12">
        <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved. Built with passion for agriculture.</p>
      </footer>
    </div>
  );
}

export default ContactUs;