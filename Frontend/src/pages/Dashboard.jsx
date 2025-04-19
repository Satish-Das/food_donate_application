import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, PointElement, LineElement } from "chart.js";
import { toast } from 'react-toastify';
import axios from '../config/axios';
import Profile from "./Profile";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, PointElement, LineElement);

const Dashboard = () => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [donations, setDonations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  
  const [statistics, setStatistics] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [donationNotes, setDonationNotes] = useState("");
  const [allDonations, setAllDonations] = useState([]);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [updatingQuantity, setUpdatingQuantity] = useState(false);

  // Add this at the top of your component to prevent duplicate error toasts
  const [hasShownNetworkError, setHasShownNetworkError] = useState(false);
  
  // Use this for controlling API retries
  const [apiRetryCount, setApiRetryCount] = useState(0);
  const MAX_API_RETRIES = 2;

  useEffect(() => {
    if (user && !isLoading) {
      if (isAdmin) {
        // Only attempt to fetch data if we haven't exceeded retry count
        if (apiRetryCount < MAX_API_RETRIES) {
          fetchAllDonations();
          fetchDonationStatistics();
        }
      } else {
        // Only attempt to fetch data if we haven't exceeded retry count
        if (apiRetryCount < MAX_API_RETRIES && !hasShownNetworkError) {
          fetchUserDonations();
        }
      }
    }
  }, [user, isAdmin, isLoading, apiRetryCount]);

  // Separate useEffect to handle data update confirmation
  useEffect(() => {
    console.log("Donations data updated:", {
      length: donations.length,
      data: donations.slice(0, 2) // Log first couple of items for debugging
    });

    console.log("Filtered donations updated:", {
      length: filteredDonations.length,
      data: filteredDonations.slice(0, 2) // Log first couple of items for debugging
    });
  }, [donations, filteredDonations]);

  useEffect(() => {
    if (isAdmin) {
      let filtered = [...allDonations];
      
      if (statusFilter !== "all") {
        filtered = filtered.filter(donation => donation.status === statusFilter);
      }
      
      if (foodTypeFilter !== "all") {
        filtered = filtered.filter(donation => donation.foodType === foodTypeFilter);
      }
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(donation => {
          const donationDate = new Date(donation.donationDate);
          return donationDate >= start && donationDate <= end;
        });
      }
      
      setFilteredDonations(filtered);
    } else {
      setFilteredDonations(donations);
    }
  }, [allDonations, statusFilter, foodTypeFilter, startDate, endDate, isAdmin, donations]);

  const fetchDonationStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/donate/statistics');
      if (response.data && response.data.success) {
        setStatistics(response.data.data);
        console.log("Statistics data loaded:", response.data.data);
      }
    } catch (error) {
      console.error('Error fetching donation statistics:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || `Server error (${statusCode})`;
        
        if (statusCode === 403) {
          toast.error("You don't have permission to view donation statistics");
        } else {
          toast.error(`Failed to fetch statistics: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("Network error: Failed to connect to the server");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDonations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/donate/all');
      if (response.data && response.data.success) {
        setAllDonations(response.data.data || []);
        console.log(`Admin: Loaded ${response.data.data.length} total donations`);
      }
    } catch (error) {
      console.error('Error fetching all donations:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || `Server error (${statusCode})`;
        
        if (statusCode === 403) {
          toast.error("You don't have permission to view all donations");
        } else {
          toast.error(`Failed to fetch donations: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("Network error: Failed to connect to the server");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDonations = async () => {
    try {
      // Increment retry count to prevent infinite retries
      setApiRetryCount(prevCount => prevCount + 1);
      
      console.log('Attempting to fetch donations from /donate/user');
      setIsLoading(true); // Set loading state to true while fetching
      
      const response = await axios.get('/donate/user');
      console.log('Donation response received:', response);
      
      if (response.data) {
        // Extract donations data from the response, checking all possible locations
        let donationsData = [];
        
        // Check all possible locations for donation data
        if (Array.isArray(response.data.data)) {
          // If data is directly in data.data as an array
          donationsData = response.data.data;
          console.log('Found donations in response.data.data array');
        } else if (response.data.data && response.data.data.donations && Array.isArray(response.data.data.donations)) {
          // If donations are nested inside data.data.donations
          donationsData = response.data.data.donations;
          console.log('Found donations in response.data.data.donations array');
        } else if (response.data.donations && Array.isArray(response.data.donations)) {
          // If donations are in response.data.donations
          donationsData = response.data.donations;
          console.log('Found donations in response.data.donations array');
        } else if (Array.isArray(response.data.message)) {
          // If data is directly in data.message as an array
          donationsData = response.data.message;
          console.log('Found donations in response.data.message array');
        } else if (response.data.message && Array.isArray(response.data.message.data)) {
          // If data is in data.message.data
          donationsData = response.data.message.data;
          console.log('Found donations in response.data.message.data array');
        } else if (response.data.message && response.data.message.donations && Array.isArray(response.data.message.donations)) {
          // If donations are in data.message.donations
          donationsData = response.data.message.donations;
          console.log('Found donations in response.data.message.donations array');
        } else if (response.data.success && Array.isArray(response.data.message)) {
          // If data is in message field when success is true
          donationsData = response.data.message;
          console.log('Found donations in response.data.message array with success flag');
        } else {
          // If we can't find the data in any common location, log the structure
          console.warn('Could not locate donations array in response structure:', response.data);
          console.warn('Response structure keys:', Object.keys(response.data));
          if (response.data.message) {
            console.warn('Message field type:', typeof response.data.message);
            if (typeof response.data.message === 'object') {
              console.warn('Message field keys:', Object.keys(response.data.message));
            }
          }
        }
        
        // Log the full donation data to help debug
        console.log('Donation data extracted:', donationsData);
        
        // Make sure we have valid objects with required properties from donateModel
        const validDonations = donationsData.filter(donation => 
          donation && 
          donation._id && 
          donation.donationDate && 
          donation.status && 
          donation.foodType && 
          donation.foodQuantity
        );
        
        if (validDonations.length !== donationsData.length) {
          console.warn(`Found ${donationsData.length - validDonations.length} invalid donation entries`);
        }
        
        // Sort donations by date (newest first)
        const sortedDonations = validDonations.sort((a, b) => {
          return new Date(b.donationDate) - new Date(a.donationDate);
        });
        
        console.log('Setting donations state with:', sortedDonations.length, 'valid donations');
        setDonations(sortedDonations);
        
        // Force update filteredDonations immediately after updating donations
        setFilteredDonations(sortedDonations);
        
        // Display a success message (only on first successful load)
        if (sortedDonations.length > 0 && apiRetryCount < 2) {
          toast.success(`Successfully loaded ${sortedDonations.length} donations`);
        } else if (sortedDonations.length === 0 && apiRetryCount < 2) {
          toast.info("You haven't made any donations yet");
        }
      } else {
        console.warn('No data in response:', response);
        if (!hasShownNetworkError) {
          toast.warning('Received empty response from the server');
          setHasShownNetworkError(true);
        }
        // Initialize as empty array to prevent filter errors
        setDonations([]);
        setFilteredDonations([]);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      
      // Initialize as empty array to prevent filter errors
      setDonations([]);
      setFilteredDonations([]);
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Check for token expiration in 500 errors
        const statusCode = error.response.status;
        if (statusCode === 401 || statusCode === 403 || 
            (statusCode === 500 && typeof error.response.data === 'string' && 
             error.response.data.includes('Token has expired'))) {
          console.warn('Authentication failed in fetchUserDonations. Session expired.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Only show the error toast once
          if (!hasShownNetworkError) {
            toast.error("Your session has expired. Please log in again.");
            setHasShownNetworkError(true);
          }
          
          navigate('/login', { state: { from: '/dashboard', expired: true } });
          return;
        }
        
        // Only show error message once
        if (!hasShownNetworkError) {
          const errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
          toast.error(`Failed to fetch donations: ${errorMessage}`);
          setHasShownNetworkError(true);
        }
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
        
        // Only show error toast once
        if (!hasShownNetworkError) {
          toast.error('Failed to connect to the server. Please check your network connection or try again later.');
          setHasShownNetworkError(true);
        }
      } else if (!hasShownNetworkError) {
        console.error('Request setup error:', error.message);
        toast.error(`Failed to fetch donations: ${error.message}`);
        setHasShownNetworkError(true);
      }
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/user/profile`);
      if (response.data && response.data.success) {
        setUserProfile(response.data.data);
        console.log("User profile loaded with donation data:", response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Handle token expiration errors
      if (error.response) {
        const statusCode = error.response.status;
        // Convert the error data to string format regardless of input type
        const errorData = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
          
        if (statusCode === 401 || statusCode === 403 || 
            (statusCode === 500 && errorData && errorData.includes('Token has expired'))) {
          console.warn('Authentication failed in fetchUserProfile. Logging out...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          toast.error("Your session has expired. Please log in again.");
          navigate('/login', { state: { from: '/dashboard', expired: true } });
        }
      }
    }
  };

  const getDonationDetails = async (donationId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/donate/id/${donationId}`);
      console.log('Donation details response:', response);
      
      let donationData = null;
      
      // Handle the specific response structure where donation details are in message
      if (response.data && response.data.success) {
        if (response.data.message && typeof response.data.message === 'object' && !Array.isArray(response.data.message)) {
          // Main case - donation details are directly in the message object
          donationData = response.data.message;
          console.log('Found donation details in response.data.message');
        } else if (response.data.data) {
          // Alternative structure - data might be in the data field
          donationData = response.data.data;
          console.log('Found donation details in response.data.data');
        } else if (Array.isArray(response.data.message) && response.data.message.length > 0) {
          // Handle case where message is an array
          donationData = response.data.message[0];
          console.log('Found donation details in response.data.message array');
        }
      }
      
      if (donationData) {
        console.log('Setting donation details:', donationData);
        
        // Extract user details if they're nested in the donation data
        const userDetails = donationData.user || null;
        
        // Set the selected donation with the donation data
        setSelectedDonation(donationData);
        setDonationNotes(donationData.notes || "");
        
        // If user details are directly provided in the response, use them
        if (userDetails) {
          console.log('User details found in donation response:', userDetails);
          setSelectedDonation(prev => ({
            ...prev,
            userDetails: userDetails
          }));
        } 
        // If user details aren't provided but we're admin and have a user ID, fetch them
        else if (isAdmin && donationData.user && typeof donationData.user === 'string') {
          try {
            const userResponse = await axios.get(`/user/profile?id=${donationData.user}`);
            if (userResponse.data && userResponse.data.success) {
              const fetchedUserDetails = userResponse.data.data || userResponse.data.message;
              setSelectedDonation(prev => ({
                ...prev,
                userDetails: fetchedUserDetails
              }));
              console.log('Added user details to donation:', fetchedUserDetails);
            }
          } catch (userError) {
            console.error('Error fetching user details:', userError);
            // Continue showing donation details even if user details fail
          }
        }
        
        toast.success("Donation details loaded");
      } else {
        console.warn('No donation data found in response');
        toast.warning("Could not find donation details in server response");
      }
    } catch (error) {
      console.error('Error fetching donation details:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || `Server error (${statusCode})`;
        toast.error(`Failed to fetch donation details: ${errorMessage}`);
      } else if (error.request) {
        toast.error("Network error: Failed to connect to the server");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addNotesToDonation = async () => {
    if (!selectedDonation) return;
    
    try {
      const response = await axios.post('/donate/add-notes', {
        donationId: selectedDonation._id,
        notes: donationNotes
      });
      
      if (response.data && response.data.success) {
        toast.success("Notes added successfully");
        
        const updatedDonation = response.data.data;
        setAllDonations(prev => prev.map(donation => 
          donation._id === updatedDonation._id ? updatedDonation : donation
        ));
        
        setSelectedDonation(null);
        setDonationNotes("");
        
        if (isAdmin) {
          fetchAllDonations();
        }
      }
    } catch (error) {
      console.error('Error adding notes to donation:', error);
      toast.error("Failed to add notes to donation");
    }
  };

  const updateStatus = async () => {
    if (!selectedDonation || !newStatus) return;
    
    try {
      const response = await axios.patch('/donate/status', {
        donationId: selectedDonation._id,
        status: newStatus
      });
      
      if (response.data && response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        
        const updatedDonation = response.data.data;
        setAllDonations(prev => prev.map(donation => 
          donation._id === updatedDonation._id ? updatedDonation : donation
        ));
        
        setSelectedDonation(updatedDonation);
        setEditingStatus(false);
        
        if (isAdmin) {
          fetchDonationStatistics();
        }
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      toast.error("Failed to update donation status");
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setFoodTypeFilter("all");
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log("Dashboard - Token found:", !!token);
        
        if (!token) {
          console.log("Dashboard - No token found, redirecting to login");
          toast.error("Authentication required. Please login.");
          navigate('/login', { state: { from: '/dashboard' } });
          return;
        }
        
        if (token.trim() === '') {
          console.error("Dashboard - Empty token found");
          localStorage.removeItem('accessToken');
          toast.error("Invalid authentication. Please login again.");
          navigate('/login', { state: { from: '/dashboard' } });
          return;
        }
        
        try {
          const userString = localStorage.getItem('user');
          if (!userString) {
            console.error("Dashboard - No user data found");
            toast.error("User data not found. Please login again.");
            localStorage.removeItem('accessToken');
            navigate('/login', { state: { from: '/dashboard' } });
            return;
          }
          
          const userData = JSON.parse(userString);
          
          if (!userData || !userData._id) {
            console.error("Dashboard - Invalid user data:", userData);
            toast.error("Invalid user data. Please login again.");
            localStorage.removeItem('accessToken');
            navigate('/login', { state: { from: '/dashboard' } });
            return;
          }
          
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
          console.log("Dashboard - User data loaded:", userData.fullname);
          
          await Promise.all([
            fetchUserProfile(userData._id)
          ]);
          
          setIsLoading(false);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          toast.error("Error loading user data. Please login again.");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: '/dashboard' } });
        }
      } catch (error) {
        console.error("Dashboard - Authentication error:", error);
        toast.error("Authentication error. Please login again.");
        navigate('/login', { state: { from: '/dashboard' } });
      }
    };
    
    checkAuth();
  }, [navigate]);

  const generateFoodTypeChart = () => {
    if (isAdmin && statistics && statistics.byFoodType) {
      return {
        labels: Object.keys(statistics.byFoodType).map(type => 
          type.charAt(0).toUpperCase() + type.slice(1)
        ),
    datasets: [
      {
            data: Object.values(statistics.byFoodType),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };
    }
    
    const foodTypes = {};
    (isAdmin ? filteredDonations : donations).forEach(donation => {
      const type = donation.foodType;
      foodTypes[type] = (foodTypes[type] || 0) + 1;
    });

    return {
      labels: Object.keys(foodTypes).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
      ),
    datasets: [
      {
          data: Object.values(foodTypes),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
    };
  };

  const generateStatusChart = () => {
    if (isAdmin && statistics && statistics.byStatus) {
      return {
        labels: Object.keys(statistics.byStatus).map(status => 
          status.charAt(0).toUpperCase() + status.slice(1)
        ),
        datasets: [
          {
            label: "Donation Status",
            data: Object.values(statistics.byStatus),
            backgroundColor: ["#FFA500", "#36A2EB", "#4BC0C0", "#FF6384"],
          },
        ],
      };
    }
    
    const statusCounts = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0
    };

    (isAdmin ? filteredDonations : donations).forEach(donation => {
      if (statusCounts[donation.status] !== undefined) {
        statusCounts[donation.status]++;
      }
    });

    return {
      labels: Object.keys(statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          label: "Donation Status",
          data: Object.values(statusCounts),
          backgroundColor: ["#FFA500", "#36A2EB", "#4BC0C0", "#FF6384"],
        },
      ],
    };
  };
  
  const generateRecentDonationsChart = () => {
    if (isAdmin && statistics && statistics.recentDonations) {
      const labels = statistics.recentDonations.map(item => item.date);
      const data = statistics.recentDonations.map(item => item.count);
      
      return {
        labels,
        datasets: [
          {
            label: "Daily Donations",
            data,
            borderColor: "#4BC0C0",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      };
    }
    
    return {
      labels: ["No data available"],
      datasets: [{ data: [0] }]
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
    
    setTimeout(() => {
      window.location.replace('/');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  const DonationDetailView = () => {
    if (!selectedDonation) return null;

    // Format date with fallback for invalid dates
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Invalid date';
        }
        return date.toLocaleString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Donation Details
            </h2>
            <button 
              onClick={() => {
                setSelectedDonation(null);
                setDonationNotes("");
                setEditingStatus(false);
                setEditingQuantity(false);
                setNewQuantity('');
                setQuantityError('');
              }}
              className="text-gray-500 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information Panel */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center border-b border-blue-200 pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  User Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Full Name</p>
                    <p className="font-medium text-gray-800">{selectedDonation.fullname || 'Not provided'}</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Email</p>
                    <p className="font-medium text-gray-800 break-words">{selectedDonation.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Phone</p>
                    <p className="font-medium text-gray-800">
                      {selectedDonation.phone ? (
                        <a href={`tel:${selectedDonation.phone}`} className="hover:text-blue-600">
                          {selectedDonation.phone}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>

                  {selectedDonation.user && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Donor Type</p>
                      <p className="font-medium text-gray-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span className="h-2 w-2 rounded-full bg-blue-600 mr-1"></span>
                          Registered User
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {!selectedDonation.user && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Donor Type</p>
                      <p className="font-medium text-gray-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Anonymous Donor
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  </div>
                  <p className="text-gray-800 bg-blue-50 p-2 rounded">{selectedDonation.fullAddress || 'Not provided'}</p>
                </div>

                {selectedDonation.user && isAdmin && (
                  <div className="mt-4 text-center">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                      onClick={() => navigate(`/profile?id=${selectedDonation.user}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View Complete User Profile
                    </button>
                  </div>
                )}

                {selectedDonation.user && selectedDonation.userDetails && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Additional User Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedDonation.userDetails.totalDonations && (
                        <div>
                          <span className="text-gray-600">Total Donations:</span>
                          <span className="ml-1 font-medium">{selectedDonation.userDetails.totalDonations}</span>
                        </div>
                      )}
                      {selectedDonation.userDetails.address && (
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <span className="ml-1">{selectedDonation.userDetails.address}</span>
                        </div>
                      )}
                      {selectedDonation.userDetails.city && (
                        <div>
                          <span className="text-gray-600">City:</span>
                          <span className="ml-1">{selectedDonation.userDetails.city}</span>
                        </div>
                      )}
                      {selectedDonation.userDetails.pinCode && (
                        <div>
                          <span className="text-gray-600">Pin Code:</span>
                          <span className="ml-1">{selectedDonation.userDetails.pinCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Donation Information Panel */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center border-b border-green-200 pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  Donation Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Donation ID</p>
                    <p className="font-medium text-xs text-gray-600 truncate">{selectedDonation._id}</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Date & Time</p>
                    <p className="font-medium text-gray-800">
                      {selectedDonation.donationDate ? new Date(selectedDonation.donationDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not available'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedDonation.donationDate ? new Date(selectedDonation.donationDate).toLocaleTimeString() : ''}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Food Type</p>
                    <div className="flex items-center">
                      {selectedDonation.foodType === 'veg' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                          <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                          Vegetarian
                        </span>
                      )}
                      {selectedDonation.foodType === 'non-veg' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                          <span className="h-2 w-2 rounded-full bg-red-600 mr-1"></span>
                          Non-Vegetarian
                        </span>
                      )}
                      {selectedDonation.foodType === 'both' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-600 mr-1"></span>
                          Mixed
                        </span>
                      )}
                      {!selectedDonation.foodType && (
                        <span className="text-gray-600">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Quantity</p>
                    {editingQuantity ? (
                      <div className="mt-1">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={newQuantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow positive numbers
                              const numberValue = value.replace(/[^0-9]/g, '');
                              
                              if (value !== numberValue) {
                                setQuantityError('Please enter numbers only');
                              } else if (parseInt(numberValue) <= 0 && numberValue !== '') {
                                setQuantityError('Quantity must be greater than 0');
                              } else {
                                setQuantityError('');
                              }
                              
                              setNewQuantity(numberValue);
                            }}
                            className={`block w-full px-3 py-2 border ${
                              quantityError ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                            placeholder="Enter quantity"
                          />
                        </div>
                        {quantityError && (
                          <p className="mt-1 text-xs text-red-600">{quantityError}</p>
                        )}
                        <div className="mt-2 flex space-x-2">
                          <button
                            type="button"
                            disabled={updatingQuantity}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                              updatingQuantity ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              setUpdatingQuantity(true);
                              updateDonationQuantity();
                            }}
                          >
                            {updatingQuantity ? 'Updating...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            disabled={updatingQuantity}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            onClick={() => {
                              setEditingQuantity(false);
                              setNewQuantity('');
                              setQuantityError('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {selectedDonation.foodQuantity ? `${selectedDonation.foodQuantity} ${parseInt(selectedDonation.foodQuantity) > 1 ? 'items' : 'item'}` : 'Not specified'}
                        </p>
                        {!isAdmin && selectedDonation.status === 'pending' && (
                          <button 
                            onClick={() => {
                              setEditingQuantity(true);
                              setNewQuantity(selectedDonation.foodQuantity);
                            }}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Status</p>
                    {editingStatus ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <select 
                          value={newStatus} 
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                          <option value="">Select status</option>
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          onClick={updateStatus} 
                          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingStatus(false)} 
                          className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedDonation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedDonation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          selectedDonation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          selectedDonation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <span className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              selectedDonation.status === 'pending' ? 'bg-yellow-500' :
                              selectedDonation.status === 'accepted' ? 'bg-green-500' :
                              selectedDonation.status === 'completed' ? 'bg-blue-500' :
                              selectedDonation.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></span>
                            {selectedDonation.status ? selectedDonation.status.charAt(0).toUpperCase() + selectedDonation.status.slice(1) : 'Unknown'}
                          </span>
                        </span>
                        {isAdmin && (
                          <button 
                            onClick={() => {
                              setEditingStatus(true);
                              setNewStatus(selectedDonation.status || '');
                            }}
                            className="text-blue-500 text-sm underline hover:text-blue-700"
                          >
                            Change Status
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamps */}
                  <div className="col-span-2 mt-2 bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1 font-medium">Timestamps</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-1 text-gray-800">
                          {formatDate(selectedDonation.createdAt || selectedDonation.donationDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <span className="ml-1 text-gray-800">
                          {formatDate(selectedDonation.updatedAt || selectedDonation.donationDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            {isAdmin ? (
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center border-b border-purple-200 pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Admin Notes
                </h3>
                <textarea 
                  value={donationNotes} 
                  onChange={(e) => setDonationNotes(e.target.value)}
                  className="w-full border border-purple-200 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Add notes about this donation..."
                />
                <button 
                  onClick={addNotesToDonation}
                  disabled={!donationNotes.trim()}
                  className={`mt-3 flex items-center px-4 py-2 rounded-md transition duration-200 ${
                    donationNotes.trim() 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-300 text-white cursor-not-allowed'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293z" />
                  </svg>
                  Save Notes
                </button>
              </div>
            ) : (
              selectedDonation.notes && selectedDonation.notes.trim() && (
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center border-b border-blue-200 pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Notes from Admin
                  </h3>
                  <div className="p-4 bg-white rounded-md border border-blue-200 italic whitespace-pre-wrap">
                    {selectedDonation.notes}
                  </div>
                </div>
              )
            )}
            
            <div className="mt-6 flex justify-end">
              {isAdmin && (
                <div className="flex-grow text-left">
                  <button
                    onClick={() => window.open(`/donate/print/${selectedDonation._id}`, '_blank')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 items-center mr-2 inline-flex"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Print
                  </button>
                </div>
              )}
              <button 
                onClick={() => {
                  setSelectedDonation(null);
                  setDonationNotes("");
                  setEditingStatus(false);
                  setEditingQuantity(false);
                  setNewQuantity('');
                  setQuantityError('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add function to handle quantity changes
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    const numberValue = value.replace(/[^0-9]/g, '');
    
    if (value !== numberValue) {
      setQuantityError('Please enter numbers only');
    } else if (parseInt(numberValue) <= 0 && numberValue !== '') {
      setQuantityError('Quantity must be greater than 0');
    } else {
      setQuantityError('');
    }
    
    setNewQuantity(numberValue);
  };

  // Add function to update donation quantity
  const updateDonationQuantity = async () => {
    // Validate quantity
    if (!newQuantity || newQuantity.trim() === '') {
      setQuantityError('Quantity is required');
      return;
    }
    
    if (parseInt(newQuantity) <= 0) {
      setQuantityError('Quantity must be greater than 0');
      return;
    }
    
    setUpdatingQuantity(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const response = await axios.patch('/donate/update-quantity', 
        { 
          donationId: selectedDonation._id, 
          foodQuantity: newQuantity 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Quantity update response:', response.data);
      
      if (response.data && response.data.success) {
        // Update the selected donation
        setSelectedDonation({
          ...selectedDonation,
          foodQuantity: newQuantity
        });
        
        // Update the donation in the lists
        const updateList = (list) => 
          list.map(donation => 
            donation._id === selectedDonation._id 
              ? {...donation, foodQuantity: newQuantity} 
              : donation
          );
        
        setAllDonations(prev => updateList(prev));
        setFilteredDonations(prev => updateList(prev));
        setDonations(prev => updateList(prev));
        
        toast.success('Food quantity updated successfully!');
        setEditingQuantity(false);
      } else {
        toast.error(response.data?.message || 'Failed to update food quantity');
      }
    } catch (error) {
      console.error('Error updating donation quantity:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your login session has expired. Please log in again.');
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update this donation');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid input. Please check your data.');
      } else {
        toast.error('Failed to update donation. Please try again later.');
      }
    } finally {
      setUpdatingQuantity(false);
    }
  };

  return (
    <div className="flex h-screen">
      {selectedDonation && <DonationDetailView />}
      
      <div className="w-1/4 bg-blue-700 text-white flex flex-col">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Food Donate</h1>
          <h1 className="mt-2">Welcome {isAdmin ? 'Admin' : user?.fullname || 'User'}</h1>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2 px-4">
            {[
              "Dashboard", 
              ...(isAdmin ? ["Donation Management", "Statistics"] : []), 
              "Profile"
            ].map((page) => (
              <li key={page}>
                <button
                  onClick={() => setActivePage(page)}
                  className={`w-full text-left py-2 px-4 rounded-md ${
                    activePage === page ? "bg-blue-800" : "hover:bg-blue-600"
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

      <div className="flex-grow bg-gray-100 overflow-y-auto">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{activePage}</h2>

        </header>

        <div className="p-6">
          {activePage === "Dashboard" && (
            <>
              {/* Removing the userProfile stats box that was here */}
              
              {isAdmin ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Total Donations</h3>
                    <p className="text-2xl font-bold">{statistics?.totalDonations || allDonations.length}</p>
                  </div>
                  <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Pending</h3>
                    <p className="text-2xl font-bold">{statistics?.byStatus?.pending || allDonations.filter(d => d.status === 'pending').length}</p>
                  </div>
                  <div className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Accepted</h3>
                    <p className="text-2xl font-bold">{statistics?.byStatus?.accepted || allDonations.filter(d => d.status === 'accepted').length}</p>
                  </div>
                  <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Completed</h3>
                    <p className="text-2xl font-bold">{statistics?.byStatus?.completed || allDonations.filter(d => d.status === 'completed').length}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Total Donations</h3>
                    <p className="text-2xl font-bold">{donations.length}</p>
                </div>
                <div className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Total Quantity</h3>
                    <p className="text-2xl font-bold">
                      {donations.reduce((sum, donation) => sum + parseInt(donation.foodQuantity || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-teal-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold">Pending Donations</h3>
                    <p className="text-2xl font-bold">
                      {donations.filter(donation => donation.status === 'pending').length}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">Recent Donations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Food Type</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isAdmin ? filteredDonations : donations).length > 0 ? (
                        (isAdmin ? filteredDonations : donations).slice(0, 5).map((donation) => (
                          <tr key={donation._id} className="border-t">
                            <td className="px-4 py-2">
                              {new Date(donation.donationDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">{donation.foodType}</td>
                            <td className="px-4 py-2">{donation.foodQuantity}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                donation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => getDonationDetails(donation._id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                            No donations found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Food Type Distribution</h3>
                  <div className="h-64">
                    {(isAdmin ? filteredDonations : donations).length > 0 ? (
                      <Pie data={generateFoodTypeChart()} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No donation data available
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Donation Status</h3>
                  <div className="h-64">
                    {(isAdmin ? filteredDonations : donations).length > 0 ? (
                      <Bar data={generateStatusChart()} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No donation data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isAdmin && statistics && statistics.recentDonations && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-bold mb-4">Donation Trend (Last 7 Days)</h3>
                  <div className="h-64">
                    <Line data={generateRecentDonationsChart()} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              )}
            </>
          )}

          {activePage === "Donation Management" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Filter Donations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                    <select 
                      value={foodTypeFilter} 
                      onChange={(e) => setFoodTypeFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">All Food Types</option>
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-3">
                  <button 
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Donation List</h3>
                  <span className="text-sm text-gray-500">
                    Showing {filteredDonations.length} donations
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Donor</th>
                        <th className="px-4 py-2 text-left">Food Type</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => (
                          <tr key={donation._id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {new Date(donation.donationDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">{donation.fullname}</td>
                            <td className="px-4 py-3 capitalize">{donation.foodType}</td>
                            <td className="px-4 py-3">{donation.foodQuantity}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-sm ${
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                donation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => getDonationDetails(donation._id)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                            No donations match your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activePage === "Statistics" && isAdmin && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {statistics?.totalDonations || 0}
                  </div>
                  <p className="text-gray-600 mt-1">Total Donations</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {statistics?.byStatus?.completed || 0}
                  </div>
                  <p className="text-gray-600 mt-1">Completed</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl font-bold text-yellow-600">
                    {statistics?.byStatus?.pending || 0}
                  </div>
                  <p className="text-gray-600 mt-1">Pending</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {statistics?.byStatus?.cancelled || 0}
                  </div>
                  <p className="text-gray-600 mt-1">Cancelled</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Donation Status Distribution</h3>
                  <div className="h-64">
                    {statistics ? (
                      <Bar 
                        data={generateStatusChart()} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        Loading statistics...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-4">Food Type Distribution</h3>
                  <div className="h-64">
                    {statistics ? (
                      <Pie 
                        data={generateFoodTypeChart()} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        Loading statistics...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Donation Trend (Last 7 Days)</h3>
                <div className="h-80">
                  {statistics?.recentDonations ? (
                    <Line 
                      data={generateRecentDonationsChart()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      Loading statistics...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePage === "Profile" && (
            <div>
              <Profile userProfile={userProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;