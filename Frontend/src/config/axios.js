import axios from 'axios'

// Create a custom instance of axios with default config
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    timeout: 15000, // Increased timeout to 15 seconds for slower connections
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Enable CORS
    withCredentials: false
});

// Function to get a clean token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    // Make sure token is properly formatted (not undefined, null, etc)
    return token.trim() || null;
};

// Function to handle token expiration and logout
const handleTokenExpiration = () => {
    // Clear all auth tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('useMockData'); // Also clear mock data flag
    
    // Redirect to login page if we're not already there
    if (!window.location.pathname.includes('/login')) {
        console.warn('Session expired. Redirecting to login page...');
        // Use timeout to allow current code to finish execution
        setTimeout(() => {
            window.location.href = '/login?expired=true';
        }, 100);
    }
};

// Log current backend URL configuration on startup
console.log('Backend API URL configured as:', instance.defaults.baseURL);

// Add request interceptor for logging and token management
instance.interceptors.request.use(
    (config) => {
        // Ensure content type is set for all requests
        if (config.method !== 'get') {
            config.headers['Content-Type'] = 'application/json';
        }
        
        // Add auth token automatically if present
        const token = getAuthToken();
        if (token) {
            // Always include 'Bearer ' prefix
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log outgoing requests for debugging
        console.log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.url}`, {
            baseURL: config.baseURL,
            headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'None' // Log presence but not the actual token
            }
        });
        
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
    (response) => {
        // Log successful responses
        console.log(`✅ Response from ${response.config.url}:`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('❌ Response Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase()
            });
            
            // Check for token expiration or authentication errors
            if (error.response.status === 401 || error.response.status === 403) {
                const responseData = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : JSON.stringify(error.response.data);
                
                // Check for specific token errors
                if (
                    responseData.includes('Token has expired') || 
                    responseData.includes('expired') || 
                    responseData.includes('Invalid token') || 
                    responseData.includes('Authentication required') ||
                    responseData.includes('jwt expired') ||
                    responseData.includes('not authenticated')
                ) {
                    console.warn('Authentication token has expired or is invalid');
                    handleTokenExpiration();
                }
            }
            
            // Handle 500 errors that might contain token expiration info
            if (error.response.status === 500) {
                const responseData = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : JSON.stringify(error.response.data);
                
                if (
                    responseData.includes('Token has expired') ||
                    responseData.includes('jwt expired') ||
                    responseData.includes('authentication')
                ) {
                    console.warn('Server error due to authentication issue');
                    handleTokenExpiration();
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('❌ Network Error: No response received', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                timeout: error.config?.timeout
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('❌ Request Setup Error:', error.message, error);
        }
        
        // Pass the error along to be handled by the component
        return Promise.reject(error);
    }
);

export default instance;