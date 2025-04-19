import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from '../config/axios';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the route the user was trying to access if they were redirected
  const from = location.state?.from || '/dashboard';

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Use direct window location for better browser support
      window.location.href = '/dashboard';
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage((prev) => ({
      ...prev,
      [name]: "", // Clear error message for the field being edited
    }));
    
    // Clear server error when user makes any change
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!formData.email) {
      errors.email = "Please fill the email";
    }
    if (!formData.password) {
      errors.password = "Please fill the password";
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors);
      toast.error("Please fill all required fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setErrorMessage({ email: "", password: "" });
    setIsLoading(true);
    
    try {
      const response = await axios.post('/user/login', {
        email: formData.email.trim(),
        password: formData.password,
      });
      
      // Log the FULL response for debugging
      console.log("Login response:", response);
      console.log("Response data:", response.data);
      
      // FIXED: Based on console output, tokens are in response.data.message
      if (response.data?.message?.accessToken) {
        console.log("Found accessToken:", response.data.message.accessToken);
        console.log("Found refreshToken:", response.data.message.refreshToken);
        
        // Store tokens
        localStorage.setItem('accessToken', response.data.message.accessToken);
        localStorage.setItem('refreshToken', response.data.message.refreshToken);
        
        if (response.data.message.user) {
          localStorage.setItem('user', JSON.stringify(response.data.message.user));
        }
        
        toast.success("Login successful! Redirecting to dashboard...", {
          position: "top-right",
          autoClose: 1000,
        });
        
        // Force immediate navigation with full page reload
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 1000);
        
        return;
      } else {
        console.error("Token structure not found in:", response.data);
        toast.error("Authentication token not found in response. Check console for details.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
        toast.error(error.response.data.message, {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
        setServerError("An error occurred during login. Please try again.");
        toast.error("An error occurred during login. Please try again.", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg flex">
        {/* Sign In Section */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sign In</h2>
          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorMessage.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {errorMessage.email && (
                <p className="text-red-500 text-sm mt-1">{errorMessage.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorMessage.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {errorMessage.password && (
                <p className="text-red-500 text-sm mt-1">{errorMessage.password}</p>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Sign Up Section */}
        <div className="w-1/2 bg-red-500 text-white p-8 flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
          <p className="text-center mb-6">Sign up and start your journey with us.</p>
          <button
            onClick={handleSignUp}
            className="bg-white text-red-500 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}