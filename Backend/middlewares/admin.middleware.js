const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const ApiError = require('../utils/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

const adminAuth = asyncHandler(async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Admin Auth Header:', authHeader ? 'Present' : 'Missing');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, "Authorization required. Please login as admin");
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new ApiError(401, "Authorization required. Please login as admin");
        }
        
        console.log('Admin Token:', token.substring(0, 15) + '...');
        
        // Verify token with more debug info
        try {
            console.log('Attempting to verify admin token...');
            // Use a fallback JWT secret if the env variable isn't set
            const jwtSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'ADMIN_ACCESS_SECRET_KEY';
            console.log('JWT Secret first 5 chars:', jwtSecret.substring(0, 5) + '...');
            
            const decoded = jwt.verify(token, jwtSecret);
            console.log('Token decoded successfully:', decoded);
            
            // Get admin ID from the decoded token - handle both "id" and "userId" formats
            const adminId = decoded.id || decoded.userId;
            if (!adminId) {
                console.log('No ID found in token:', decoded);
                throw new ApiError(401, "Invalid token format: Missing admin ID");
            }
            
            // Find admin by ID
            const admin = await Admin.findById(adminId).select('-password');
            
            if (!admin) {
                console.log('No admin found with ID:', adminId);
                throw new ApiError(404, "Admin not found");
            }
            
            console.log('Admin authenticated successfully:', admin.fullname || admin.email);
            
            // Attach admin to request
            req.user = admin;
            next();
        } catch (jwtError) {
            console.error('JWT Verification Error:', jwtError.message);
            throw new ApiError(401, "Invalid token: " + jwtError.message);
        }
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid token. Please login again");
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Token expired. Please login again");
        } else {
            throw error;
        }
    }
});

module.exports = adminAuth; 