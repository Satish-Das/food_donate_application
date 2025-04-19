import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * ProtectedRoute component to protect routes that require authentication
 * If user is not logged in, they will be redirected to the login page
 * For admin routes, it checks for admin token
 */
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Display any error messages from localStorage if they exist
    const errorMessage = localStorage.getItem('auth_error');
    if (errorMessage) {
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      localStorage.removeItem('auth_error'); // Clear the message
    }
  }, []);
  
  // For admin routes
  if (adminRequired) {
    const adminToken = localStorage.getItem('adminToken');
    console.log("ProtectedRoute - checking admin token:", !!adminToken);
    
    if (!adminToken) {
      console.log("ProtectedRoute - No admin token found, redirecting to admin login");
      localStorage.setItem('auth_error', 'Please login as admin to access this page');
      
      // Force reload to admin login page to ensure clean state
      window.location.href = '/admin/login';
      return null;
    }
    
    console.log("ProtectedRoute - Admin token found, rendering protected admin content");
    return children;
  }
  
  // For regular user routes
  const token = localStorage.getItem('accessToken');
  console.log("ProtectedRoute - checking auth token:", !!token);
  
  // If no token is found, set an error message and redirect to login
  if (!token) {
    console.log("ProtectedRoute - No token found, redirecting to login");
    
    // Store the error message in localStorage to display after redirect
    localStorage.setItem('auth_error', 'Please login to access this page');
    
    // Redirect to login page with the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  console.log("ProtectedRoute - Token found, rendering protected content");
  // If token exists, render the protected component
  return children;
};

export default ProtectedRoute; 