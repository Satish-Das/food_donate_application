import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [activeNav, setActiveNav] = useState('profile');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userDonations, setUserDonations] = useState([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pinCode: ''
  });

  // Get user data from local storage
  const getUserFromStorage = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  };

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const user = getUserFromStorage();
    if (user && user._id) {
      setFormData(prevData => ({
        ...prevData,
        fullName: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pinCode: user.pincode || ''
      }));
    }
  }, []);

  // Fetch user donations when the "donations" tab is active
  useEffect(() => {
    if (activeNav === 'donations') {
      fetchUserDonations();
    }
  }, [activeNav]);

  // Fetch user donations from the API
  const fetchUserDonations = async () => {
    const user = getUserFromStorage();
    if (!user || !user._id) {
      toast.error('User information not available');
      return;
    }

    setIsLoadingDonations(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login', { state: { from: '/dashboard' } });
        return;
      }

      // Add proper error handling
      try {
        const response = await axios.get('/donate/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('User donations fetched:', response.data);
        
        // Check if donations are in the message array (as per the provided response structure)
        if (response.data && response.data.success && Array.isArray(response.data.message)) {
          setUserDonations(response.data.message);
          console.log(`Set ${response.data.message.length} donations to state from message array`);
        }
        // Fallback checks for other possible response structures
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setUserDonations(response.data.data);
          console.log(`Set ${response.data.data.length} donations to state from data array`);
        } 
        else if (response.data && Array.isArray(response.data)) {
          setUserDonations(response.data);
          console.log(`Set ${response.data.length} donations to state from direct array`);
        }
        else {
          // Set empty array if no recognizable data structure
          setUserDonations([]);
          console.log('No donation data found in expected format, setting empty array');
          console.log('Response data structure:', response.data);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Initialize as empty array on error
        setUserDonations([]);
        
        // Check for authentication errors
        if (apiError.response?.status === 401) {
          toast.error('Your login session has expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('accessToken');
          setTimeout(() => navigate('/login', { state: { from: '/dashboard' } }), 2000);
        } else {
          toast.error('Failed to load your donations. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error in donation fetch process:', error);
      toast.error('An unexpected error occurred. Please try again.');
      // Initialize as empty array on error
      setUserDonations([]);
    } finally {
      setIsLoadingDonations(false);
    }
  };

  // Handle viewing donation details
  const viewDonationDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDonationModal(true);
  };

  // Close donation details modal
  const closeDonationModal = () => {
    setShowDonationModal(false);
    setSelectedDonation(null);
    setIsEditingQuantity(false);
    setNewQuantity('');
    setQuantityError('');
  };

  // Handle editing quantity
  const startEditingQuantity = () => {
    setNewQuantity(selectedDonation.foodQuantity);
    setIsEditingQuantity(true);
  };

  const cancelEditingQuantity = () => {
    setIsEditingQuantity(false);
    setNewQuantity('');
    setQuantityError('');
  };

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
    
    setIsUpdatingQuantity(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login', { state: { from: '/dashboard' } });
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
        
        // Update the donation in the list
        setUserDonations(prevDonations => 
          prevDonations.map(donation => 
            donation._id === selectedDonation._id 
              ? {...donation, foodQuantity: newQuantity} 
              : donation
          )
        );
        
        toast.success('Food quantity updated successfully!');
        setIsEditingQuantity(false);
      } else {
        toast.error(response.data?.message || 'Failed to update food quantity');
      }
    } catch (error) {
      console.error('Error updating donation quantity:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your login session has expired. Please log in again.');
        localStorage.removeItem('accessToken');
        setTimeout(() => navigate('/login', { state: { from: '/dashboard' } }), 2000);
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update this donation');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid input. Please check your data.');
      } else {
        toast.error('Failed to update donation. Please try again later.');
      }
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow digits, and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '');
      const truncated = digitsOnly.slice(0, 10);
      
      if (value !== truncated && value.length > truncated.length) {
        setPhoneError('Please enter only 10 digits');
      } else {
        setPhoneError('');
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: truncated
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = getUserFromStorage();
      const token = localStorage.getItem('accessToken');
      
      if (!user._id || !token) {
        toast.error('Authentication required');
        navigate('/login', { state: { from: '/dashboard' } });
        return;
      }
      
      // Prepare the data to update
      const updateData = {
        fullname: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pinCode
      };
      
      // Make API call to update user profile with better error handling
      try {
        const response = await axios.put(`/user/update/${user._id}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Profile update response:', response.data);
        
        // Update the local storage with new user data
        const updatedUser = {
          ...user,
          fullname: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pinCode
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } catch (apiError) {
        console.error('API Error during profile update:', apiError);
        
        // Handle authentication errors
        if (apiError.response?.status === 401) {
          toast.error('Your login session has expired. Please log in again.');
          localStorage.removeItem('accessToken');
          setTimeout(() => navigate('/login', { state: { from: '/dashboard' } }), 2000);
        } else {
          toast.error(apiError.response?.data?.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Unexpected error in profile update:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return; // First click just shows the confirmation
    }
    
    try {
      const user = getUserFromStorage();
      const token = localStorage.getItem('accessToken');
      
      if (!user || !user._id) {
        toast.error('User information not available');
        setIsDeleting(false);
        return;
      }
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login', { state: { from: '/dashboard' } });
        return;
      }
      
      // Make API call to delete user account with better error handling
      try {
        // Send the user ID in the request body as expected by the backend
        await axios.delete('/user/delete', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            userId: user._id
          }
        });
        
        // Clear all local storage data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        toast.success('Your account has been deleted successfully');
        
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (apiError) {
        console.error('API Error during account deletion:', apiError);
        
        // Handle authentication errors
        if (apiError.response?.status === 401) {
          toast.error('Your login session has expired. Please log in again.');
          localStorage.removeItem('accessToken');
          setTimeout(() => navigate('/login', { state: { from: '/dashboard' } }), 2000);
          setIsDeleting(false);
        } else {
          toast.error(apiError.response?.data?.message || 'Failed to delete account');
          setIsDeleting(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error in account deletion:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsDeleting(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Format donation date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine badge color based on donation status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render user's profile information
  const renderProfileInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">Full Name</h3>
        <p className="text-lg">{formData.fullName || 'Not provided'}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">Email</h3>
        <p className="text-lg">{formData.email || 'Not provided'}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">Phone</h3>
        <p className="text-lg">{formData.phone || 'Not provided'}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">Address</h3>
        <p className="text-lg">{formData.address || 'Not provided'}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">City</h3>
        <p className="text-lg">{formData.city || 'Not provided'}</p>
            </div>
      
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 font-medium">Pin Code</h3>
        <p className="text-lg">{formData.pinCode || 'Not provided'}</p>
            </div>
          </div>
  );

  // Render user's donation history
  const renderDonations = () => {
    if (isLoadingDonations) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (userDonations.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No donations yet</h3>
          <p className="text-gray-500 mb-6">You haven't made any food donations yet.</p>
          <Link
            to="/donate"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Make Your First Donation
          </Link>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userDonations.map((donation) => (
              <tr key={donation._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(donation.donationDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{donation.foodType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{donation.foodQuantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => viewDonationDetails(donation)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render account settings
  const renderSettings = () => (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium mb-4">Account Security</h3>
        <div className="space-y-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => toast.info('Password change feature coming soon!')}
          >
            Change Password
          </button>
        </div>
        </div>

      <div className="border-b pb-6">
        <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="donationUpdates" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
            <label htmlFor="donationUpdates" className="ml-2 block text-sm text-gray-900">
              Donation status updates
            </label>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="newCampaigns" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              defaultChecked
            />
            <label htmlFor="newCampaigns" className="ml-2 block text-sm text-gray-900">
              New donation campaigns
            </label>
          </div>
        </div>
      </div>

        <div>
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-medium mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {isDeleting ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-700">Are you absolutely sure? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  onClick={handleDeleteAccount}
                >
                  Yes, delete my account
                </button>
                <button 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => setIsDeleting(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <div className="bg-white shadow-md mb-6 rounded-lg overflow-hidden">
        <div className="container mx-auto">
          <nav className="flex flex-wrap">
            <button 
              onClick={() => setActiveNav('profile')}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeNav === 'profile' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveNav('donations')}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeNav === 'donations' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              My Donations
            </button>
            <button 
              onClick={() => setActiveNav('settings')}
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeNav === 'settings' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              Settings
            </button>
            <Link 
              to="/donate" 
              className="ml-auto px-6 py-3 my-1 mr-2 bg-green-500 text-white rounded-md font-medium text-sm hover:bg-green-600 transition-colors duration-200"
            >
              Donate Now
            </Link>
          </nav>
        </div>
      </div>

      {activeNav === 'profile' && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {/* Profile image or initials could go here */}
                <span className="text-4xl font-bold text-gray-600">
                  {formData.fullName.charAt(0) || '?'}
                </span>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{formData.fullName || 'User'}</h2>
                <p className="text-gray-600">{formData.email || 'No email provided'}</p>
              </div>
            </div>
            <button 
              className={`text-white px-6 py-2 rounded-md flex items-center justify-center ${isEditing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={toggleEdit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="fullName" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Full Name
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="email" 
                    name="email" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Email
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="tel" 
                    name="phone" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength="10" 
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Phone (10 digits)
                  </label>
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="address" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Address
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="city" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    City
                  </label>
                </div>

                <div className="relative z-0 w-full group">
                  <input 
                    type="text" 
                    name="pinCode" 
                    className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                    placeholder=" " 
                    value={formData.pinCode}
                    onChange={handleChange}
                  />
                  <label 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Pin Code
                  </label>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={toggleEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            renderProfileInfo()
          )}
        </div>
      )}
      
      {activeNav === 'donations' && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold mb-6">My Donations</h2>
          {renderDonations()}
        </div>
      )}
      
      {activeNav === 'settings' && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
          {renderSettings()}
        </div>
      )}
      
      {/* Donation Details Modal */}
      {showDonationModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Donation Details
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto"
                onClick={closeDonationModal}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Donation ID</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedDonation._id}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDonation.donationDate)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedDonation.status)}`}>
                      {selectedDonation.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Food Type</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedDonation.foodType}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                    {isEditingQuantity ? (
                      <div className="mt-1">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={newQuantity}
                            onChange={handleQuantityChange}
                            className={`block w-full px-3 py-2 border ${
                              quantityError ? 'border-red-300' : 'border-gray-300'
                            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            placeholder="Enter quantity"
                          />
                        </div>
                        {quantityError && (
                          <p className="mt-1 text-sm text-red-600">{quantityError}</p>
                        )}
                        <div className="mt-2 flex space-x-2">
                          <button
                            type="button"
                            disabled={isUpdatingQuantity}
                            className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              isUpdatingQuantity ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={updateDonationQuantity}
                          >
                            {isUpdatingQuantity ? 'Updating...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingQuantity}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={cancelEditingQuantity}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-900 mr-3">{selectedDonation.foodQuantity}</p>
                        {selectedDonation.status === 'pending' && (
                          <button
                            type="button"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                            onClick={startEditingQuantity}
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
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">Delivery Address</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedDonation.fullAddress}</p>
              </div>
              
              {selectedDonation.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Additional Notes</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.notes}</p>
                </div>
              )}
              
              <div className="mt-8 border-t pt-4">
                <div className="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">
                    {selectedDonation.status === 'pending' && 'Your donation is waiting for approval.'}
                    {selectedDonation.status === 'accepted' && 'Your donation has been accepted and will be collected soon.'}
                    {selectedDonation.status === 'completed' && 'Your donation was successfully delivered. Thank you!'}
                    {selectedDonation.status === 'cancelled' && 'This donation was cancelled.'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-end rounded-b-lg">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={closeDonationModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;