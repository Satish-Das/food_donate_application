import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo2.png';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in when component mounts or location changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };
    
    checkAuth();
    
    // Set up a listener for storage events (logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  // Check if on dashboard page
  const isDashboard = location.pathname === '/dashboard';

  // NavLink active class styling
  const navLinkClass = ({ isActive }) => {
    return `text-gray-700 hover:text-orange-600 transition-colors duration-300 font-medium ${
      isActive ? 'text-orange-600 border-b-2 border-orange-600' : ''
    }`;
  };

  // Handle the 'Get Started' button click (navigate to login page)
  const handleGetStarted = () => {
    navigate('/login');
  };

  // Handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    
    // Show logout toast
    toast.success('Logged out successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
    
    // Navigate to home page
    navigate('/');
  };

  // If on dashboard, don't show the navbar
  if (isDashboard) {
    return null;
  }

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center space-x-3">
                <img src={logo} className="h-16 w-auto" alt="Logo" />
              </NavLink>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
              <NavLink to="/service" className={navLinkClass}>
                Service
              </NavLink>
              <NavLink to="/gallery" className={navLinkClass}>
                Gallery
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
              <NavLink to="/donate" className={navLinkClass}>
                Donate
              </NavLink>
              
              {isLoggedIn ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors duration-300 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors duration-300 font-medium"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-gray-100 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <NavLink
                to="/"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/service"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Service
              </NavLink>
              <NavLink
                to="/gallery"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </NavLink>
              <NavLink
                to="/donate"
                className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                  isActive 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Donate
              </NavLink>
              
              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `block px-3 py-2 rounded-md font-medium ${
                      isActive 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300 font-medium mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleGetStarted();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors duration-300 font-medium mt-2"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
