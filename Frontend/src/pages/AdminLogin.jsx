import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../config/axios';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Attempting admin login for:', formData.email);
      const response = await axios.post('/admin/login', formData);
      console.log('Login response structure:', response.data);
      
      if (response.data && response.data.statusCode === 200) {
        // The response has nested data structure
        const responseData = response.data.data;
        console.log('Extracted response data:', responseData);
        
        if (responseData && responseData.accessToken) {
          console.log('Found token in response.data.data');
          
          // Store token
          localStorage.setItem('adminToken', responseData.accessToken);
          
          // Store admin data
          if (responseData.admin) {
            console.log('Storing admin data:', responseData.admin);
            localStorage.setItem('adminData', JSON.stringify(responseData.admin));
          } else {
            console.warn('No admin data in response, storing minimal data');
            localStorage.setItem('adminData', JSON.stringify({ fullname: 'Admin' }));
          }
          
          toast.success('Login successful! Redirecting to dashboard...');
          
          // Redirect to admin dashboard - ensure redirect works by using window.location
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1500);
        } else {
          console.error('Token structure not found in expected location:', response.data);
          toast.error('Login response format error. Please contact support.');
        }
      } else {
        toast.error(response.data?.message || response.data?.data || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        toast.error(error.response.data?.message || error.response.data?.data || 'Invalid credentials');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('An error occurred during login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Not an admin? <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">Go to homepage</a>
          </p>
          <p className="mt-3">
            <a href="/admin/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Create a new admin account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
