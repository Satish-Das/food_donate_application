import React, { useState, useEffect } from 'react'
import img from '../assets/img/donate.jpg';
import { toast } from 'react-toastify';
import axios from '../config/axios';

// Add CSS to hide the number input spinners
const styles = {
  hideNumberSpinners: `
    /* For Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* For Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  `
};

const images = [
    "https://images.pexels.com/photos/29321658/pexels-photo-29321658/free-photo-of-modern-indoor-staircase-with-neon-lights.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30122027/pexels-photo-30122027/free-photo-of-photographer-in-yellow-jacket-capturing-fall-nature.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30079902/pexels-photo-30079902/free-photo-of-pristine-snowfall-captured-in-winter-landscape.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30173365/pexels-photo-30173365/free-photo-of-minimalist-flatlay-of-modern-home-office-supplies.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/29321658/pexels-photo-29321658/free-photo-of-modern-indoor-staircase-with-neon-lights.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30122027/pexels-photo-30122027/free-photo-of-photographer-in-yellow-jacket-capturing-fall-nature.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30079902/pexels-photo-30079902/free-photo-of-pristine-snowfall-captured-in-winter-landscape.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
    "https://images.pexels.com/photos/30173365/pexels-photo-30173365/free-photo-of-minimalist-flatlay-of-modern-home-office-supplies.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  ];
  

const Donate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    foodType: 'veg', // Set default to 'veg'
    phone: '',
    address: '',
    quantity: '',
    notes: ''
  });
  
  const [phoneError, setPhoneError] = useState('');
  const [quantityError, setQuantityError] = useState('');

  // Fetch user profile including donation history
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await axios.get('/user/profile');
      if (response.data && response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Check if user is logged in and get user data
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const userString = localStorage.getItem('user');
      
      console.log('User string from localStorage:', userString);
      
      let userData = null;
      try {
        userData = userString ? JSON.parse(userString) : null;
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
      
      console.log('Parsed user data:', userData);
      
      setIsLoggedIn(!!token);
      
      // Make sure we have a valid user ID
      if (userData && userData._id) {
        setUserId(userData._id);
        console.log('Setting user ID from localStorage:', userData._id);
        
        // Fetch user profile to get donation history
        fetchUserProfile();
        
        // Display toast to confirm user is logged in
        toast.info(`Logged in as ${userData.name || 'user'}`);
      } else {
        console.log('No valid user ID found in localStorage');
      }
      
      // If logged in, pre-fill some fields
      if (userData) {
        setFormData(prev => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          foodType: 'veg' // Ensure default is 'veg'
        }));
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    } else if (name === 'quantity') {
      // Only allow positive numbers
      const numberValue = value.replace(/[^0-9]/g, '');
      
      if (value !== numberValue) {
        setQuantityError('Please enter numbers only');
      } else {
        setQuantityError('');
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else if (name === 'foodType') {
      setFormData(prev => ({
        ...prev,
        foodType: value
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
    
    // Display immediate toast to show the form submission started
    const loadingToastId = toast.loading("Submitting donation...");
    
    // Reset previous errors
    setPhoneError('');
    setQuantityError('');
    
    // Validate required fields
    const errors = [];
    if (!formData.name) errors.push('Name is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.foodType) errors.push('Food type is required');
    if (!formData.phone) errors.push('Phone number is required');
    if (!formData.address) errors.push('Address is required');
    if (!formData.quantity) errors.push('Quantity is required');
    
    // Display all validation errors at once if there are any
    if (errors.length > 0) {
      toast.update(loadingToastId, { 
        render: errors.join(', '), 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      toast.update(loadingToastId, { 
        render: 'Please enter a valid email address', 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
      return;
    }
    
    // Validate phone number
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      toast.update(loadingToastId, { 
        render: 'Phone number must be 10 digits', 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
      return;
    }
    
    // Validate quantity
    if (parseInt(formData.quantity) <= 0) {
      setQuantityError('Quantity must be greater than 0');
      toast.update(loadingToastId, { 
        render: 'Quantity must be greater than 0', 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the most current user ID directly from localStorage
      let currentUserId = null;
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          currentUserId = userData._id;
        }
      } catch (err) {
        console.error('Error getting user ID from localStorage:', err);
      }
      
      console.log('Current user ID for donation:', currentUserId || 'Not available');
      
      // Prepare data for backend
      const backendData = {
        fullname: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        foodType: formData.foodType,
        fullAddress: formData.address.trim(),
        foodQuantity: formData.quantity.trim(),
        notes: formData.notes.trim()
      };
      
      // Add user ID if it exists
      if (currentUserId) {
        backendData.user = currentUserId;
        console.log('Adding user ID to donation data:', currentUserId);
      } else if (userId) {
        backendData.user = userId;
        console.log('Using user ID from state:', userId);
      } else {
        console.log('No user ID available, donation will be anonymous');
      }
      
      console.log('Sending donation data:', backendData);
      
      const response = await axios.post('/donate/donate', backendData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      console.log('Donation response:', response);
      
      if (response.data && response.data.statusCode === 200) {
        // First immediately clear the form data
        setFormData({
          name: '',
          email: '',
          foodType: 'veg',
          phone: '',
          address: '',
          quantity: '',
          notes: ''
        });
        
        // Also clear any error states
        setPhoneError('');
        setQuantityError('');
        
        // Reset form fields programmatically
        document.getElementById('donationForm').reset();
        
        // Then show success toast
        toast.success("Donation created successfully! Thank you for your contribution.", {
          position: "top-center",
          autoClose: 5000, // Keep it visible for 5 seconds
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Dismiss the loading toast separately
        toast.dismiss(loadingToastId);
        
        // Redirect to dashboard after a longer delay to ensure toast is visible and form is cleared
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 3000);
      } else {
        // Handle unexpected response format
        toast.update(loadingToastId, {
          render: response.data?.message || "Donation submitted but with unexpected response format",
          type: "warning",
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      
      // Make sure to always update or dismiss the loading toast
      try {
        // Handle different types of errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          
          // Try to extract the most specific error message
          let errorMessage;
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = `Server error (${error.response.status})`;
          }
          
          toast.update(loadingToastId, { 
            render: errorMessage, 
            type: "error", 
            isLoading: false, 
            autoClose: 5000 
          });
          
          // Log detailed error information for debugging
          console.error('Error details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // The request was made but no response was received
          toast.update(loadingToastId, { 
            render: 'No response from server. Please check your internet connection.', 
            type: "error", 
            isLoading: false, 
            autoClose: 5000 
          });
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.update(loadingToastId, { 
            render: 'An error occurred while setting up the request', 
            type: "error", 
            isLoading: false, 
            autoClose: 5000 
          });
          console.error('Error setting up request:', error.message);
        }
      } catch (toastError) {
        // If updating the toast fails for some reason, dismiss it and show a new one
        toast.dismiss(loadingToastId);
        toast.error("An error occurred during donation submission", {
          position: "top-right",
          autoClose: 5000
        });
        console.error('Error updating toast:', toastError);
      }
    } finally {
      setIsSubmitting(false);
      
      // Final fallback - if somehow the toast wasn't updated or dismissed,
      // dismiss it here to ensure it doesn't get stuck
      setTimeout(() => {
        toast.dismiss(loadingToastId);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{styles.hideNumberSpinners}</style>
      <img 
            className="w-full h-96 object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
            src={img}  // Use imported variable here
            alt="Donate"
            />

<div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Left Side - Image */}
      <div className="md:w-1/2 flex justify-center ">
        <img
          src={img} // Replace with your image path
          alt="Donation"
          className="w-300 mr-20 rounded-lg shadow-lg"
        />
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Donate Now</h2>
        
    {/* Show donation history if user has donated before */}
        {userProfile && userProfile.totalDonations > 0 && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg">
            <p className="font-medium">Thank you for your previous {userProfile.totalDonations} donation{userProfile.totalDonations > 1 ? 's' : ''}!</p>
            <p className="text-sm">Your continued support makes a difference.</p>
          </div>
        )}

        <form id="donationForm" className="space-y-4" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
            required 
          />

          <input 
            type="email" 
            placeholder="Email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
            required 
          />

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-medium mb-2">Food Type:</h2>

            <div>
              <label className="mr-4 cursor-pointer">
                <input 
                  type="radio" 
                  name="foodType" 
                  value="veg" 
                  checked={formData.foodType === 'veg'}
                  onChange={handleChange}
                  className="mr-1" 
                  required
                />
                Veg 
              </label>

              <label className="mr-4 cursor-pointer">
                <input 
                  type="radio" 
                  name="foodType" 
                  value="non-veg" 
                  checked={formData.foodType === 'non-veg'}
                  onChange={handleChange}
                  className="mr-1" 
                />
                Non Veg
              </label>

            </div>
          </div>

          <div className="relative">
            <input 
              type="tel" 
              placeholder="WhatsApp No." 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
              pattern="[0-9]{10}"
              maxLength="10"
              required 
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          <input 
            type="text" 
            placeholder="Address" 
            name="address" 
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
            required 
          />

          <div className="relative">
            <style>{styles.hideNumberSpinners}</style>
            <input 
              type="number" 
              placeholder="Quantity (in numbers)" 
              name="quantity" 
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
              min="1"
              required 
            />
            {quantityError && (
              <p className="text-red-500 text-xs mt-1">{quantityError}</p>
            )}
          </div>
          
          <textarea
            placeholder="Additional notes (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 resize-none"
            rows="3"
          />
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-700'} text-white p-3 rounded-lg transition-colors duration-300`}
          >
            {isSubmitting ? 'Submitting...' : 'Donate'}
          </button>
        </form>
      </div>
    </div>


    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Note:</h2>
      <ul className="space-y-2">
        <li className="flex items-start">
          <span className="text-black text-lg mr-2">●</span>
          <p>
            It costs us ₹1,500 to provide nutritious, hygienic and tasty mid-day meals to a child for a year.*
          </p>
        </li>
        <li className="flex items-start">
          <span className="text-black text-lg mr-2">●</span>
          <p>
            We thank the Central Government and various State Governments and UT Administrations for supporting us in
            serving mid-day meals to children.
          </p>
        </li>
        <li className="flex items-start">
          <span className="text-black text-lg mr-2">●</span>
          <p>
            If you are an account holder of Indian banks and have debit/credit cards issued by these banks then please
            select Indian Donors as your donation mode.
          </p>
        </li>
        <li className="flex items-start">
          <span className="text-black text-xl mr-2">★</span>
          <p>
            The ask is for 232 meals per child for an academic year. The equivalent number of meals can also be served
            for a shorter period for a higher number of children. The amount can also be utilised to meet cost
            escalations if required. Alternatively, it can be used for improving the school infrastructure to create a
            better learning environment and to serve meals.
          </p>
        </li>
      </ul>
    </div>

    <div className="w-full overflow-hidden whitespace-nowrap bg-gray-100 py-4">
      <div className="flex animate-marquee space-x-4">
        {images.concat(images).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Image ${index + 1}`}
            className="w-[300px] h-[200px] rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
    </div>
  )
}

export default Donate
