import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../config/axios';

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalFoodQuantity: 0,
    statusCounts: {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0
    },
    recentDonations: [],
    recentUsers: []
  });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [donationCounts, setDonationCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0
  });
  const navigate = useNavigate();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error("Authentication required");
        navigate('/admin/login');
        return;
      }
      
      console.log("Fetching dashboard stats with token:", token.substring(0, 15) + "...");
      
      const response = await axios.get('/admin/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Dashboard stats response:", response.data);
      
      if (response.data && response.data.statusCode === 200) {
        // Check if data is in the message field or data field
        const statsData = response.data.message || response.data.data;
        if (statsData) {
          setDashboardStats(statsData);
        } else {
          console.error("Could not find dashboard stats in response:", response.data);
          toast.error("Error loading dashboard data");
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Check for 403 (access denied) or 401 (unauthorized) errors
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        console.log("Auth error, clearing admin token and redirecting to login");
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Authentication failed. Please login again with an admin account.");
        navigate('/admin/login');
      } else {
        handleApiError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error("Authentication required");
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get('/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Users response:", response.data);
      
      if (response.data && response.data.statusCode === 200) {
        // Check if users are in message or data field
        const usersData = response.data.message || response.data.data;
        if (usersData) {
          setUsers(usersData);
        } else {
          console.error("Could not find users data in response:", response.data);
          toast.error("Error loading users data");
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch donations by status
  const fetchDonations = async (filter = 'all') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error("Authentication required");
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get(`/admin/donations/by-status?status=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Donations response:", response.data);
      
      if (response.data && response.data.statusCode === 200) {
        // Check if donations are in message or data field
        const donationsData = response.data.message || response.data.data;
        if (donationsData) {
          setDonations(donationsData.donations || []);
          setDonationCounts(donationsData.counts || {
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            cancelled: 0
          });
        } else {
          console.error("Could not find donations data in response:", response.data);
          toast.error("Error loading donations data");
        }
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update donation status
  const updateDonationStatus = async (donationId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error("Authentication required");
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.patch('/admin/update-donation-status', 
        { donationId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Update donation status response:", response.data);
      
      if (response.data && response.data.statusCode === 200) {
        toast.success(`Donation status updated to ${status}`);
        // Refresh donations
        fetchDonations(statusFilter);
        
        // Also refresh dashboard stats if on dashboard
        if (activePage === "Dashboard") {
          fetchDashboardStats();
        }
      } else {
        const errorMessage = response.data?.message || response.data?.data || "Failed to update status";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      handleApiError(error);
    }
  };

  // Handle API errors
  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.log('Error response data:', error.response.data);
      
      if (error.response.status === 401 || error.response.status === 403) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      } else {
        // Get error message from response data
        const errorMessage = error.response.data?.message || 
                            error.response.data?.data || 
                            "An error occurred";
        toast.error(errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response was received
      toast.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      toast.error("An error occurred");
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the admin is authenticated
        const token = localStorage.getItem('adminToken');
        console.log("Checking admin token:", token ? "Token exists" : "No token");
        
        if (!token) {
          toast.error("Authentication required. Please login.");
          navigate('/admin/login');
          return;
        }
        
        // Get admin data
        let adminString = localStorage.getItem('adminData');
        console.log("Admin data from localStorage:", adminString);
        
        // If adminData is missing but we have a token, fetch the admin profile
        if (!adminString) {
          console.log("Admin data missing but token exists. Attempting to fetch admin profile...");
          
          try {
            const response = await axios.get('/admin/profile', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data && (response.data.statusCode === 200)) {
              const adminData = response.data.message || response.data.data;
              if (adminData && adminData.admin) {
                // Store the admin data in localStorage
                localStorage.setItem('adminData', JSON.stringify(adminData.admin));
                adminString = JSON.stringify(adminData.admin);
                console.log("Admin data fetched and saved to localStorage");
              }
            }
          } catch (fetchError) {
            console.error("Error fetching admin profile:", fetchError);
            // Continue with the process - we'll handle missing data gracefully
          }
        }
        
        try {
          // If we still don't have admin data, we'll initialize with minimal data
          if (!adminString) {
            console.log("Setting minimal admin data");
            const minimalAdminData = { fullname: "Admin User" };
            setAdminData(minimalAdminData);
          } else {
            const adminUserData = JSON.parse(adminString);
            setAdminData(adminUserData);
          }
          
          // Fetch initial data
          fetchDashboardStats();
          
        } catch (parseError) {
          console.error("Error parsing admin data:", parseError);
          // Set minimal admin data and continue
          setAdminData({ fullname: "Admin User" });
          fetchDashboardStats();
        }
      } catch (error) {
        console.error("Admin Dashboard - Authentication error:", error);
        toast.error("Authentication error. Please login again.");
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch page-specific data when active page changes
  useEffect(() => {
    if (activePage === "Dashboard") {
      fetchDashboardStats();
    } else if (activePage === "Users") {
      fetchUsers();
    } else if (activePage === "Donations") {
      fetchDonations(statusFilter);
    }
  }, [activePage, statusFilter]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    toast.success("Logged out successfully!");
    
    setTimeout(() => {
      navigate('/admin/login');
    }, 1000);
  };

  // Show loading state
  if (isLoading && !adminData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Sidebar */}
      <div className="w-1/5 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <h2 className="mt-2">
            {adminData ? adminData.fullname : 'Admin'}
          </h2>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2 px-4">
            {["Dashboard", "Users", "Donations"].map((page) => (
              <li key={page}>
                <button
                  onClick={() => setActivePage(page)}
                  className={`w-full text-left py-2 px-4 rounded-md ${
                    activePage === page ? "bg-indigo-900" : "hover:bg-indigo-700"
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-100 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{activePage}</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-700 text-white px-3 py-1 rounded-full text-sm">
              Admin Portal
            </div>
          </div>
        </header>

        {/* Content based on active page */}
        <div className="p-6">
          {activePage === "Dashboard" && (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white text-indigo-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
                  <h3 className="text-lg font-semibold">Total Users</h3>
                  <p className="text-3xl font-bold">{dashboardStats.totalUsers}</p>
                </div>
                <div className="bg-white text-green-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold">Total Donations</h3>
                  <p className="text-3xl font-bold">{dashboardStats.totalDonations}</p>
                </div>
                <div className="bg-white text-yellow-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold">Total Food Qty</h3>
                  <p className="text-3xl font-bold">{dashboardStats.totalFoodQuantity}</p>
                </div>
                <div className="bg-white text-red-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold">Pending Donations</h3>
                  <p className="text-3xl font-bold">{dashboardStats.statusCounts.pending}</p>
                </div>
              </div>

              {/* Donation Status Overview */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">Donation Status Overview</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="flex-grow">Pending</span>
                    <span className="font-semibold">{dashboardStats.statusCounts.pending}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="flex-grow">Accepted</span>
                    <span className="font-semibold">{dashboardStats.statusCounts.accepted}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="flex-grow">Completed</span>
                    <span className="font-semibold">{dashboardStats.statusCounts.completed}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="flex-grow">Cancelled</span>
                    <span className="font-semibold">{dashboardStats.statusCounts.cancelled}</span>
                  </div>
                </div>
              </div>

              {/* Recent Donations & Users */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Recent Donations</h3>
                  <div className="overflow-auto" style={{ maxHeight: "350px" }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardStats.recentDonations.map((donation) => (
                          <tr key={donation._id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {donation.user ? donation.user.fullname : donation.fullname}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {donation.foodType}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                donation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <select
                                value={donation.status}
                                onChange={(e) => updateDonationStatus(donation._id, e.target.value)}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300"
                              >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accept</option>
                                <option value="completed">Complete</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Recent Users</h3>
                  <div className="overflow-auto" style={{ maxHeight: "350px" }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardStats.recentUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {user.fullname}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {user.phone}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activePage === "Users" && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-4">All Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.fullname}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.phone}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.city}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {user.totalDonations}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === "Donations" && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">All Donations</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filter by status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-xl font-bold">{donationCounts.total}</div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg text-center">
                  <div className="text-sm text-yellow-600">Pending</div>
                  <div className="text-xl font-bold">{donationCounts.pending}</div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <div className="text-sm text-green-600">Accepted</div>
                  <div className="text-xl font-bold">{donationCounts.accepted}</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <div className="text-sm text-blue-600">Completed</div>
                  <div className="text-xl font-bold">{donationCounts.completed}</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <div className="text-sm text-red-600">Cancelled</div>
                  <div className="text-xl font-bold">{donationCounts.cancelled}</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.length > 0 ? (
                      donations.map((donation) => (
                        <tr key={donation._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {donation.user ? donation.user.fullname : donation.fullname}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {donation.foodType}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {donation.foodQuantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              donation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedDonation(donation)}
                                className="bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                              >
                                View
                              </button>
                              <select
                                value={donation.status}
                                onChange={(e) => updateDonationStatus(donation._id, e.target.value)}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300"
                              >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accept</option>
                                <option value="completed">Complete</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No donations found with the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">Donation Details</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Donor:</span>
                  <span>{selectedDonation.user ? selectedDonation.user.fullname : selectedDonation.fullname}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Email:</span>
                  <span>{selectedDonation.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Phone:</span>
                  <span>{selectedDonation.phone}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Food Type:</span>
                  <span>{selectedDonation.foodType}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Quantity:</span>
                  <span>{selectedDonation.foodQuantity}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Address:</span>
                  <span>{selectedDonation.fullAddress}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Status:</span>
                  <span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedDonation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedDonation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      selectedDonation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedDonation.status}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date(selectedDonation.donationDate).toLocaleString()}</span>
                </div>
                {selectedDonation.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Notes:</span>
                    <p className="mt-1 text-sm">{selectedDonation.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={() => setSelectedDonation(null)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    updateDonationStatus(selectedDonation._id, 'accepted');
                    setSelectedDonation(null);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  disabled={selectedDonation.status === 'accepted'}
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    updateDonationStatus(selectedDonation._id, 'completed');
                    setSelectedDonation(null);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={selectedDonation.status === 'completed'}
                >
                  Complete
                </button>
                <button
                  onClick={() => {
                    updateDonationStatus(selectedDonation._id, 'cancelled');
                    setSelectedDonation(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  disabled={selectedDonation.status === 'cancelled'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
