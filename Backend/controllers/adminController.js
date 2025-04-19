const ApiError = require("../utils/errorHandler.js");
const ApiResponse = require('../utils/apiResponse.js');
const asyncHandler = require('../utils/asyncHandler.js');
const Admin = require('../models/adminModel.js');
const User = require('../models/userModel.js');
const Donation = require('../models/donateModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Admin Registration
const registerAdmin = asyncHandler(async (req, res) => {
    const { fullname, email, password, phone, city, pincode, address } = req.body;
    
    // Validation
    if (!fullname) throw new ApiError(400, "Full name is required");
    if (!email) throw new ApiError(400, "Email is required");
    if (!password) throw new ApiError(400, "Password is required");
    if (!phone) throw new ApiError(400, "Phone number is required");
    if (!city) throw new ApiError(400, "City is required");
    if (!pincode) throw new ApiError(400, "Pincode is required");
    if (!address) throw new ApiError(400, "Address is required");
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        throw new ApiError(409, "Admin with this email already exists");
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin
    const admin = await Admin.create({
        fullname,
        email,
        password: hashedPassword,
        phone,
        city,
        pincode,
        address
    });
    
    // Remove password from response
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;
    
    return res.status(201).json(
        new ApiResponse(201, "Admin registered successfully", adminWithoutPassword)
    );
});

// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
    console.log('Admin login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
        console.log('Admin login failed: Missing email or password');
        throw new ApiError(400, "Email and password are required");
    }
    
    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
        console.log('Admin login failed: No admin found with email:', email);
        throw new ApiError(401, "Invalid credentials");
    }
    
    console.log('Admin found:', { id: admin._id, email: admin.email });
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
        console.log('Admin login failed: Invalid password for admin:', email);
        throw new ApiError(401, "Invalid credentials");
    }
    
    // Get the JWT secret to use
    const jwtSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'ADMIN_ACCESS_SECRET_KEY';
    console.log('Using JWT secret (first 5 chars):', jwtSecret.substring(0, 5) + '...');
    
    // Generate tokens with userId to match the existing token format
    const accessToken = jwt.sign(
        { 
            userId: admin._id.toString(),
            role: 'admin' // Keep role for future use
        }, 
        jwtSecret,
        { expiresIn: '1d' }
    );
    
    console.log('Admin token generated successfully for:', admin.email);
    
    // Remove password from response
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;
    
    // Return response
    return res.status(200).json(
        new ApiResponse(200, {
            accessToken,
            admin: adminWithoutPassword
        }, "Login successful")
    );
});

// Get Admin Dashboard Stats
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total donations
    const totalDonations = await Donation.countDocuments();
    
    // Get total food quantity
    const donationsAggregate = await Donation.aggregate([
        {
            $group: {
                _id: null,
                totalQuantity: { 
                    $sum: { 
                        $toInt: { 
                            $cond: [
                                { $isNumber: { $toInt: "$foodQuantity" } },
                                { $toInt: "$foodQuantity" },
                                0
                            ] 
                        } 
                    } 
                }
            }
        }
    ]);
    
    const totalFoodQuantity = donationsAggregate.length > 0 ? donationsAggregate[0].totalQuantity : 0;
    
    // Get donations by status
    const statusCounts = {
        pending: await Donation.countDocuments({ status: 'pending' }),
        accepted: await Donation.countDocuments({ status: 'accepted' }),
        completed: await Donation.countDocuments({ status: 'completed' }),
        cancelled: await Donation.countDocuments({ status: 'cancelled' })
    };
    
    // Get recent donations
    const recentDonations = await Donation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullname email phone');
    
    // Get recent users
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password');
    
    return res.status(200).json(
        new ApiResponse(200, "Dashboard stats retrieved successfully", {
            totalUsers,
            totalDonations,
            totalFoodQuantity,
            statusCounts,
            recentDonations,
            recentUsers
        })
    );
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    
    return res.status(200).json(
        new ApiResponse(200, "Users retrieved successfully", users)
    );
});

// Get All Donations
const getAllDonations = asyncHandler(async (req, res) => {
    const donations = await Donation.find()
        .sort({ createdAt: -1 })
        .populate('user', 'fullname email phone');
    
    return res.status(200).json(
        new ApiResponse(200, "Donations retrieved successfully", donations)
    );
});

// Get Donations by Status
const getDonationsByStatus = asyncHandler(async (req, res) => {
    const { status } = req.query;
    
    // Validation
    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled', 'all'];
    if (status && !validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
        query.status = status;
    }
    
    // Get donations with filter
    const donations = await Donation.find(query)
        .sort({ createdAt: -1 })
        .populate('user', 'fullname email phone');
    
    // Count by status
    const statusCounts = {
        pending: await Donation.countDocuments({ status: 'pending' }),
        accepted: await Donation.countDocuments({ status: 'accepted' }),
        completed: await Donation.countDocuments({ status: 'completed' }),
        cancelled: await Donation.countDocuments({ status: 'cancelled' })
    };
    
    return res.status(200).json(
        new ApiResponse(200, "Donations retrieved successfully", {
            donations,
            counts: {
                total: donations.length,
                ...statusCounts
            }
        })
    );
});

// Update Donation Status
const updateDonationStatus = asyncHandler(async (req, res) => {
    const { donationId, status } = req.body;
    
    // Validation
    if (!donationId) throw new ApiError(400, "Donation ID is required");
    if (!status) throw new ApiError(400, "Status is required");
    
    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }
    
    if (!mongoose.Types.ObjectId.isValid(donationId)) {
        throw new ApiError(400, "Invalid donation ID");
    }
    
    // Update donation status
    const donation = await Donation.findByIdAndUpdate(
        donationId,
        { status },
        { new: true }
    ).populate('user', 'fullname email phone');
    
    if (!donation) {
        throw new ApiError(404, "Donation not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, "Donation status updated successfully", donation)
    );
});

// Reset Admin Password
const resetPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;
    
    // Validation
    if (!currentPassword) throw new ApiError(400, "Current password is required");
    if (!newPassword) throw new ApiError(400, "New password is required");
    
    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters long");
    }
    
    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    return res.status(200).json(
        new ApiResponse(200, "Password updated successfully", null)
    );
});

// Get User Details
const getUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    
    const user = await User.findById(userId)
        .select('-password')
        .populate('donations');
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, "User details retrieved successfully", user)
    );
});

// Get Admin Profile
const getAdminProfile = asyncHandler(async (req, res) => {
    // Admin information is already attached to the request by the middleware
    const admin = req.user;
    
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, "Admin profile retrieved successfully", {
            admin
        })
    );
});

module.exports = {
    registerAdmin,
    loginAdmin,
    getDashboardStats,
    getAllUsers,
    getAllDonations,
    getDonationsByStatus,
    updateDonationStatus,
    resetPassword,
    getUserDetails,
    getAdminProfile
};
