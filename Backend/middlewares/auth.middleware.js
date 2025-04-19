const jwt = require('jsonwebtoken');
const ApiError = require('../utils/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel'); // Adjust the path if needed

const auth = asyncHandler(async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        
        // Extract token from Bearer format
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.replace('Bearer ', '') 
            : authHeader;
        
        // Check if token exists
        if (!token) {
            console.log('No token provided in request');
            
            // Check if the request is for a donation route that needs optional auth
            const isOptionalAuthRoute = req.originalUrl.includes('/donate/user') || 
                                       req.originalUrl.includes('/donate/all') ||
                                       req.originalUrl.includes('/donate/status');
            
            if (isOptionalAuthRoute) {
                console.log('Optional auth route detected. Continuing without user data.');
                req.user = null; // Set user to null but don't block the request
                return next();
            }
            
            throw new ApiError(401, 'Authentication required');
        }
        
        console.log('Attempting to verify token...');
        
        // Check if JWT_ACCESS_SECRET exists (updated from JWT_SECRET)
        const jwtSecret = process.env.JWT_ACCESS_SECRET;
        if (!jwtSecret) {
            console.error('JWT_ACCESS_SECRET environment variable is missing or empty');
            throw new ApiError(500, 'Server configuration error');
        }
        
        try {
            // Verify token - wrapped in try/catch to handle JWT-specific errors
            const decoded = jwt.verify(token, jwtSecret);
            console.log('Token verified, user id:', decoded.userId || decoded._id);
            
            // Find user by id (handle both formats: userId or _id)
            const userId = decoded.userId || decoded._id;
            const user = await User.findById(userId);
            
            if (!user) {
                console.log('User not found in database for id:', userId);
                throw new ApiError(401, 'User not found');
            }
            
            console.log('User authenticated successfully:', user.fullname || user.email);
            
            // Attach user to request
            req.user = user;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError.name, jwtError.message);
            
            if (jwtError.name === 'JsonWebTokenError') {
                throw new ApiError(401, 'Invalid token format');
            }
            if (jwtError.name === 'TokenExpiredError') {
                throw new ApiError(401, 'Token has expired, please log in again');
            }
            
            // Generic JWT error
            throw new ApiError(401, `Token validation failed: ${jwtError.message}`);
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        // Pass the error to the error handler
        next(error);
    }
});

module.exports = auth;