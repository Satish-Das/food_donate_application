import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../config/axios'
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // If already logged in, redirect to dashboard
      navigate('/dashboard');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
    city: "",
    pinCode: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
    city: "",
    pinCode: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!mobileRegex.test(formData.phone)) {
      newErrors.phone = "Invalid mobile number format";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Pincode must be 6 digits";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear server error when user makes any change
    if (serverError) {
      setServerError("");
    }
  };

  const handleSignInClick = () => {
    navigate("/login");
  };

  const signUpSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      // Show validation error toast
      toast.error("Please fix the form errors before submitting", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/user/register', {
        fullname: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        pincode: formData.pinCode.trim(),
        address: formData.address.trim()
      });

      console.log("Register response:", response);
      console.log("Response data:", response.data);

      // Check if the response has the expected format
      if (response.data && response.data.success) {
        // Success toast
        toast.success("Registration successful! Redirecting to login...", {
          position: "top-right",
          autoClose: 2000,
        });

        // Redirect after a short delay to allow user to see the success toast
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000);
      } else {
        // Handle unexpected response format
        toast.warning("Registration completed but with an unexpected response format.", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Error toast
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
        setServerError("An error occurred during registration. Please try again.");
        toast.error("An error occurred during registration. Please try again.", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Side - Text Section */}
        <div className="w-1/2 bg-red-500 text-white flex flex-col items-center justify-center p-10">
          <h2 className="text-4xl font-bold mb-4">Hello, Friend!</h2>
          <p className="text-center text-lg mb-6">
            Sign in and start your journey with us.
          </p>
          <button
            onClick={handleSignInClick}
            className="bg-white text-red-500 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            SIGN IN
          </button>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sign Up</h2>
          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {serverError}
            </div>
          )}
          <form className="space-y-4" onSubmit={signUpSubmit}>
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className={`w-full p-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            {/* Password and Confirm Password side by side */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div className="w-1/2">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <div>
              <input
                type="text"
                name="phone"
                placeholder="Mobile No."
                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.phone}
                onChange={handleInputChange}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <input
                type="text"
                name="city"
                placeholder="City"
                className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.city}
                onChange={handleInputChange}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <input
                type="text"
                name="pinCode"
                placeholder="Pincode"
                className={`w-full p-2 border rounded ${errors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.pinCode}
                onChange={handleInputChange}
              />
              {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
            </div>
            <div>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.address}
                onChange={handleInputChange}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing Up...' : 'SIGN UP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}