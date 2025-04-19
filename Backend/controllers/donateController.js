const ApiError = require("../utils/errorHandler.js")
const ApiResponse = require('../utils/apiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const mongoose = require('mongoose')
const { 
    createDonation, 
    getAllDonations: getAllDonationsService, 
    getDonationsByUser: getDonationsByUserService, 
    updateDonationStatus: updateDonationStatusService,
    getDonationById: getDonationByIdService,
    getDonationsByStatus: getDonationsByStatusService,
    getDonationsByDateRange: getDonationsByDateRangeService,
    getDonationsByFoodType: getDonationsByFoodTypeService,
    addNotesToDonation: addNotesToDonationService,
    getDonationStatistics: getDonationStatisticsService,
    updateDonationQuantity: updateDonationQuantityService
} = require('../services/donate.service.js')

const donateFood = asyncHandler(async(req, res) => {
    try {
        console.log('📥 Donation request received:', req.body);
        
        const {fullname, email, phone, foodType, fullAddress, foodQuantity, notes, user: bodyUserId} = req.body;
        
        // Comprehensive validation
        const validationErrors = [];
        
        if (!phone) validationErrors.push("Phone number is required");
        else if (!/^\d{10}$/.test(phone)) validationErrors.push("Phone number must be 10 digits");
        
        if (!email) validationErrors.push("Email is required");
        else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.push("Email format is invalid");
        
        if (!fullname) validationErrors.push("Full name is required");
        if (!foodType) validationErrors.push("Food type is required");
        if (!fullAddress) validationErrors.push("Address is required");
        
        if (!foodQuantity) validationErrors.push("Food quantity is required");
        else if (parseInt(foodQuantity) <= 0) validationErrors.push("Food quantity must be greater than 0");
        
        if (validationErrors.length > 0) {
            console.log('❌ Validation errors:', validationErrors);
            return res.status(400).json(
                new ApiResponse(400, validationErrors.join(", "), null)
            );
        }
        
        // Handle user ID safely
        let userId = null;
        
        // First check if authenticated user is available
        if (req.user && req.user._id) {
            try {
                userId = req.user._id; // Already an ObjectId
                console.log('✅ Using authenticated user ID:', userId.toString());
            } catch (error) {
                console.error('❌ Error using authenticated user ID:', error);
                userId = null;
            }
        } 
        // Then try to use ID from request body if valid
        else if (bodyUserId) {
            try {
                console.log('🔍 Checking user ID from request body:', bodyUserId);
                if (mongoose.Types.ObjectId.isValid(bodyUserId)) {
                    userId = new mongoose.Types.ObjectId(bodyUserId);
                    console.log('✅ Using validated user ID from request body:', userId.toString());
                } else {
                    console.warn('⚠️ Invalid user ID format in request body, will be null:', bodyUserId);
                }
            } catch (error) {
                console.error('❌ Error processing user ID from body:', error);
            }
        }
        
        console.log('✏️ User ID sources - Auth:', req.user?._id?.toString() || 'none', 'Body:', bodyUserId || 'none');
        console.log('✅ Final user ID being used:', userId?.toString() || 'null (Anonymous)');
        
        // Prepare donation data
    const data = {
            user: userId, // Will be null if no valid user ID was found
            fullname, 
            email, 
            phone, 
            foodType, 
            fullAddress, 
            foodQuantity,
            notes: notes || '',
            donationDate: new Date()
        }
        
        console.log('🚀 Sending donation data to service:', {
            ...data,
            user: data.user ? data.user.toString() : 'null (Anonymous)'
        });
        
        // Create the donation
        const donate = await createDonation(data);
        
        console.log('✅ Donation created successfully - ID:', donate._id.toString(), 'User:', donate.user?.toString() || 'Anonymous');
        
        return res
            .status(201) 
            .json(
                new ApiResponse(201, "Donation recorded successfully", donate)
            );
    } catch (error) {
        console.error("❌ Donation controller error:", error);
        
        // Handle different types of errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json(
                new ApiResponse(400, errors.join(", "), null)
            );
        }
        
        // For other errors, return a generic 500 error
        return res.status(500).json(
            new ApiResponse(500, "Server error: " + (error.message || "Unknown error"), null)
        );
    }
});

// Get all donations
const getAllDonations = asyncHandler(async(req, res) => {
    const donations = await getAllDonationsService();

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Donations retrieved successfully", donations)
    )
});

// Get user donations
const getUserDonations = asyncHandler(async(req, res) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            console.log("getUserDonations - No authenticated user, returning empty list");
            // Return an empty list instead of throwing an error
            return res
                .status(200)
                .json(
                    new ApiResponse(200, "No authenticated user found - returning empty donation list", [])
                );
        }
        
        console.log("Fetching donations for user ID:", userId.toString());
        
        // Get donations directly linked to this user
        const donations = await getDonationsByUserService(userId);
        console.log(`Found ${donations.length} donations for user ${userId.toString()}`);
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, "User donations retrieved successfully", donations)
        );
    } catch (error) {
        console.error("Error in getUserDonations controller:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json(
                new ApiResponse(400, "Invalid user ID format", null)
            );
        }
        
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json(
            new ApiResponse(statusCode, error.message || "Error retrieving user donations", null)
        );
    }
});

// Update donation status
const updateDonationStatus = asyncHandler(async(req, res) => {
    // Check if req.body exists before trying to destructure from it
    if (!req.body) {
        return res.status(400).json(
            new ApiResponse(400, "Request body is missing", null)
        );
    }
    
    const { donationId, status } = req.body;
    
    // Validate required parameters
    if (!donationId) {
        return res.status(400).json(
            new ApiResponse(400, "Donation ID is required", null)
        );
    }
    
    if (!status || !['pending', 'accepted', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json(
            new ApiResponse(400, "Valid status is required", null)
        );
    }
    
    // Check if user is authenticated
    if (!req.user) {
        console.log("updateDonationStatus - No authenticated user");
        return res
            .status(403)
            .json(
                new ApiResponse(403, "Authentication required to update donation status", null)
            );
    }
    
    // Check if admin or owner of the donation
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAdmin) {
        return res.status(403).json(
            new ApiResponse(403, "You don't have permission to update donation status", null)
        );
    }
    
    try {
        const donation = await updateDonationStatusService(donationId, status);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Donation status updated successfully", donation)
            );
    } catch (error) {
        console.error("Error updating donation status:", error);
        
        if (error.message === "Donation not found") {
            return res.status(404).json(
                new ApiResponse(404, "Donation not found", null)
            );
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json(
                new ApiResponse(400, "Invalid donation ID format", null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error updating donation status", null)
        );
    }
});

// Get a single donation by ID
const getDonationById = asyncHandler(async(req, res) => {
    try {
        const donationId = req.params.id;
        
        if (!donationId) {
            return res.status(400).json(
                new ApiResponse(400, "Donation ID is required", null)
            );
        }
        
        const donation = await getDonationByIdService(donationId);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Donation retrieved successfully", donation)
            );
    } catch (error) {
        console.error("Error retrieving donation by ID:", error);
        
        if (error.message === "Donation not found") {
            return res.status(404).json(
                new ApiResponse(404, "Donation not found", null)
            );
        }
        
        if (error.message === "Invalid donation ID format") {
            return res.status(400).json(
                new ApiResponse(400, "Invalid donation ID format", null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error retrieving donation", null)
        );
    }
});

// Get donations by status
const getDonationsByStatus = asyncHandler(async(req, res) => {
    try {
        const { status } = req.params;
        
        if (!status) {
            return res.status(400).json(
                new ApiResponse(400, "Status parameter is required", null)
            );
        }
        
        const donations = await getDonationsByStatusService(status);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, `Donations with status '${status}' retrieved successfully`, donations)
            );
    } catch (error) {
        console.error("Error retrieving donations by status:", error);
        
        if (error.message && error.message.includes("Invalid status")) {
            return res.status(400).json(
                new ApiResponse(400, error.message, null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error retrieving donations by status", null)
        );
    }
});

// Get donations by date range
const getDonationsByDateRange = asyncHandler(async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json(
                new ApiResponse(400, "Both start date and end date are required", null)
            );
        }
        
        const donations = await getDonationsByDateRangeService(startDate, endDate);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Donations within date range retrieved successfully", donations)
            );
    } catch (error) {
        console.error("Error retrieving donations by date range:", error);
        
        if (error.message && error.message.includes("Invalid date format")) {
            return res.status(400).json(
                new ApiResponse(400, error.message, null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error retrieving donations by date range", null)
        );
    }
});

// Get donations by food type
const getDonationsByFoodType = asyncHandler(async(req, res) => {
    try {
        const { foodType } = req.params;
        
        if (!foodType) {
            return res.status(400).json(
                new ApiResponse(400, "Food type parameter is required", null)
            );
        }
        
        const donations = await getDonationsByFoodTypeService(foodType);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, `Donations with food type '${foodType}' retrieved successfully`, donations)
            );
    } catch (error) {
        console.error("Error retrieving donations by food type:", error);
        
        if (error.message && error.message.includes("Invalid food type")) {
            return res.status(400).json(
                new ApiResponse(400, error.message, null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error retrieving donations by food type", null)
        );
    }
});

// Add notes to a donation
const addNotesToDonation = asyncHandler(async(req, res) => {
    try {
        const { donationId, notes } = req.body;
        
        if (!donationId) {
            return res.status(400).json(
                new ApiResponse(400, "Donation ID is required", null)
            );
        }
        
        if (!notes || notes.trim() === '') {
            return res.status(400).json(
                new ApiResponse(400, "Notes cannot be empty", null)
            );
        }
        
        // Check if user is authenticated
        if (!req.user) {
            return res
                .status(403)
                .json(
                    new ApiResponse(403, "Authentication required to add notes", null)
                );
        }
        
        // Check if admin (or in a real app, you might check if user owns the donation)
        const isAdmin = req.user?.role === 'admin';
        
        if (!isAdmin) {
            return res.status(403).json(
                new ApiResponse(403, "You don't have permission to add notes to this donation", null)
            );
        }
        
        const updatedDonation = await addNotesToDonationService(donationId, notes);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Notes added to donation successfully", updatedDonation)
            );
    } catch (error) {
        console.error("Error adding notes to donation:", error);
        
        if (error.message === "Donation not found") {
            return res.status(404).json(
                new ApiResponse(404, "Donation not found", null)
            );
        }
        
        if (error.message === "Invalid donation ID format") {
            return res.status(400).json(
                new ApiResponse(400, "Invalid donation ID format", null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error adding notes to donation", null)
        );
    }
});

// Get donation statistics
const getDonationStatistics = asyncHandler(async(req, res) => {
    try {
        // Check if user is authenticated and is an admin
        if (!req.user) {
            return res
                .status(403)
                .json(
                    new ApiResponse(403, "Authentication required to view statistics", null)
                );
        }
        
        const isAdmin = req.user?.role === 'admin';
        
        if (!isAdmin) {
            return res.status(403).json(
                new ApiResponse(403, "You don't have permission to view donation statistics", null)
            );
        }
        
        const statistics = await getDonationStatisticsService();
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Donation statistics retrieved successfully", statistics)
            );
    } catch (error) {
        console.error("Error retrieving donation statistics:", error);
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error retrieving donation statistics", null)
        );
    }
});

// Update donation quantity by the donor (non-admin user)
const updateDonationQuantity = asyncHandler(async(req, res) => {
    try {
        const { donationId, foodQuantity } = req.body;
        
        // Validation
        if (!donationId) {
            return res.status(400).json(
                new ApiResponse(400, "Donation ID is required", null)
            );
        }
        
        if (!foodQuantity) {
            return res.status(400).json(
                new ApiResponse(400, "Food quantity is required", null)
            );
        }
        
        if (parseInt(foodQuantity) <= 0) {
            return res.status(400).json(
                new ApiResponse(400, "Food quantity must be greater than 0", null)
            );
        }
        
        // Check if user is authenticated
        if (!req.user) {
            return res
                .status(403)
                .json(
                    new ApiResponse(403, "Authentication required to update donation", null)
                );
        }
        
        const userId = req.user._id;
        
        // Update donation quantity using the service
        const updatedDonation = await updateDonationQuantityService(donationId, foodQuantity, userId);
        
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Donation quantity updated successfully", updatedDonation)
            );
    } catch (error) {
        console.error("Error updating donation quantity:", error);
        
        if (error.message === "Donation not found") {
            return res.status(404).json(
                new ApiResponse(404, "Donation not found", null)
            );
        }
        
        if (error.message === "You don't have permission to update this donation") {
            return res.status(403).json(
                new ApiResponse(403, "You don't have permission to update this donation", null)
            );
        }
        
        if (error.message === "Only pending donations can be updated") {
            return res.status(400).json(
                new ApiResponse(400, "Only pending donations can be updated", null)
            );
        }
        
        if (error.name === 'CastError' || error.message === "Invalid donation ID format") {
            return res.status(400).json(
                new ApiResponse(400, "Invalid donation ID format", null)
            );
        }
        
        return res.status(500).json(
            new ApiResponse(500, error.message || "Error updating donation quantity", null)
        );
    }
});

module.exports = {
    donateFood,
    getAllDonations,
    getUserDonations,
    updateDonationStatus,
    getDonationById,
    getDonationsByStatus,
    getDonationsByDateRange, 
    getDonationsByFoodType,
    addNotesToDonation,
    getDonationStatistics,
    updateDonationQuantity
}