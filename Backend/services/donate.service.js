const donateModel = require('../models/donateModel.js')
const userModel = require('../models/userModel.js')
const mongoose = require('mongoose')

// Create a new donation
const createDonation = async (data) => {
    console.log('Starting donation creation with data:', {
        ...data,
        user: data.user ? (typeof data.user === 'object' ? 'ObjectId instance' : data.user) : null
    });
    
    try {
        // Sanitize data to prevent errors
        const sanitizedData = { ...data };
       
        // Check if mongoose is properly imported
        console.log('Mongoose version:', mongoose.version);
        console.log('Is ObjectId valid function available:', typeof mongoose.Types.ObjectId.isValid === 'function');
        
        // Handle user ID - ensure it's either a valid ObjectId or null
        if (sanitizedData.user) {
            try {
                // If it's already an ObjectId instance
                if (sanitizedData.user instanceof mongoose.Types.ObjectId) {
                    console.log('User ID is already an ObjectId instance:', sanitizedData.user.toString());
                }
                // If it's a string, check if valid and convert
                else if (typeof sanitizedData.user === 'string') {
                    console.log('Checking if string is valid ObjectId:', sanitizedData.user);
                    if (mongoose.Types.ObjectId.isValid(sanitizedData.user)) {
                        sanitizedData.user = new mongoose.Types.ObjectId(sanitizedData.user);
                        console.log('Converted string to ObjectId successfully:', sanitizedData.user.toString());
                    } else {
                        sanitizedData.user = null;
                    }
                }
                // Handle other types
                else {
                    sanitizedData.user = null;
                }
            } catch (err) {
                sanitizedData.user = null;
            }
        } else {
            sanitizedData.user = null;
        }
        
        // Remove any fields that might cause issues
        if (sanitizedData._id) {
            delete sanitizedData._id;
        }
        
        // Add a unique identifier to each donation to prevent duplicate key errors
        // This ensures each donation is unique even if the same user donates multiple times
        sanitizedData.donationDate = new Date();
        sanitizedData.uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        
        console.log('Creating donation with final sanitized data:', {
            ...sanitizedData,
            user: sanitizedData.user ? sanitizedData.user.toString() : 'null (Anonymous)'
        });
        
        // Create the donation with explicit schema validation
        const newDonate = await donateModel.create(sanitizedData);
        
        console.log('Donation created successfully with ID:', newDonate._id.toString());
        console.log('User associated with donation:', newDonate.user ? newDonate.user.toString() : 'Anonymous');
        
        // Update user model if there is a user associated with the donation
        if (newDonate.user) {
            try {
                // Update user with the new donation reference and increment totalDonations
                const updatedUser = await userModel.findByIdAndUpdate(
                    newDonate.user,
                    {
                        $push: { donations: newDonate._id },
                        $inc: { totalDonations: 1 }
                    },
                    { new: true }
                );
                
                if (updatedUser) {
                    console.log(`User ${updatedUser._id} updated with donation ${newDonate._id} - Total donations: ${updatedUser.totalDonations}`);
                } else {
                    console.warn(`User ${newDonate.user} not found when updating donation reference`);
                }
            } catch (updateError) {
                console.error('Error updating user with donation reference:', updateError);
                // We don't throw here to avoid failing the donation if user update fails
            }
        }
        
        return newDonate;
    } catch (error) {
        console.error("❌ Error creating donation:", error);
        
        // Detailed error reporting for different error types
        if (error.name === 'ValidationError') {
            console.error('Validation error details:', JSON.stringify(error.errors));
            const errorMessages = Object.values(error.errors).map(err => err.message).join(', ');
            console.error('Validation errors:', errorMessages);
        } else if (error.name === 'CastError') {
            console.error('Cast error details:', {
                value: error.value,
                path: error.path,
                kind: error.kind
            });
        } else if (error.code === 11000) {
            console.error('Duplicate key error detected:', error.keyValue);
            
            // Create a new attempt with a different unique identifier to ensure it's accepted
            try {
                console.log('Attempting to create donation with additional uniqueness guarantees');
                
                // Create a new object with modified data to ensure uniqueness
                const modifiedData = { ...data };
                modifiedData.donationDate = new Date(); // Update timestamp to current time
                modifiedData.uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`; // Add longer random string
                
                console.log('Retry with modified data:', {
                    donationDate: modifiedData.donationDate,
                    uniqueId: modifiedData.uniqueId
                });
                
                // Create with the modified data
                return await donateModel.create(modifiedData);
            } catch (retryError) {
                console.error('Second attempt to create donation failed:', retryError);
                
                // Try one more time with an even more unique approach
                try {
                    console.log('Final attempt to create donation');
                    
                    // Add even more randomness to ensure uniqueness
                    const finalAttemptData = { ...data };
                    finalAttemptData.donationDate = new Date();
                    finalAttemptData.uniqueId = `final-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
                    
                    return await donateModel.create(finalAttemptData);
                } catch (finalError) {
                    console.error('All attempts to create donation failed:', finalError);
                    throw finalError;
                }
            }
        }
        
        throw error;
    }
};

// Get all donations
const getAllDonations = async () => {
    try {
        const donations = await donateModel.find()
            .populate('user', 'fullname email') // Populate user details
            .sort({ createdAt: -1 }); // Most recent first
        return donations;
    } catch (error) {
        console.error("Error retrieving donations:", error);
        throw error;
    }
};

// Get donations by user ID
const getDonationsByUser = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID format");
        }
        
        console.log("Looking for donations with user ID:", userId.toString());
        
        // First fetch the user to get their email
        const user = await userModel.findById(userId);
        
        if (!user) {
            console.error("User not found in database:", userId.toString());
            throw new Error("User not found");
        }
        
        console.log("Found user, email:", user.email);
        
        // Find donations by both user ID and email to catch all possible donations
        const donations = await donateModel.find({
            $or: [
                { user: userId },                 // Donations linked by user ID
                { email: user.email }             // Donations matched by email
            ]
        }).sort({ createdAt: -1 });               // Sort by most recent first
        
        console.log(`Found ${donations.length} total donations for user ${userId.toString()}`);
        return donations;
    } catch (error) {
        console.error("Error retrieving user donations:", error);
        throw error;
    }
};

// Update donation status
const updateDonationStatus = async (donationId, status) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            throw new Error("Invalid donation ID format");
        }
        
        const updatedDonation = await donateModel.findByIdAndUpdate(
            donationId,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!updatedDonation) {
            throw new Error("Donation not found");
        }
        
        return updatedDonation;
    } catch (error) {
        console.error("Error updating donation status:", error);
        throw error;
    }
};

// Get donation by ID
const getDonationById = async (donationId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            throw new Error("Invalid donation ID format");
        }
        
        const donation = await donateModel.findById(donationId)
            .populate('user', 'fullname email'); // Populate user details if available
            
        if (!donation) {
            throw new Error("Donation not found");
        }
        
        return donation;
    } catch (error) {
        console.error("Error retrieving donation:", error);
        throw error;
    }
};

// Get donations by status
const getDonationsByStatus = async (status) => {
    try {
        // Validate status against the enum values in the model
        const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status. Must be one of: pending, accepted, completed, cancelled");
        }
        
        const donations = await donateModel.find({ status })
            .populate('user', 'fullname email')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${donations.length} donations with status "${status}"`);
        return donations;
    } catch (error) {
        console.error(`Error retrieving donations with status ${status}:`, error);
        throw error;
    }
};

// Get donations by date range
const getDonationsByDateRange = async (startDate, endDate) => {
    try {
        // Convert string dates to Date objects if they're not already
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format. Please use YYYY-MM-DD format");
        }
        
        // Set end date to end of day for inclusive search
        end.setHours(23, 59, 59, 999);
        
        console.log(`Searching for donations between ${start.toISOString()} and ${end.toISOString()}`);
        
        // Use $or to search in both donationDate and createdAt fields
        const donations = await donateModel.find({
            $or: [
                { donationDate: { $gte: start, $lte: end } },
                { createdAt: { $gte: start, $lte: end } }
            ]
        })
        .populate('user', 'fullname email')
        .sort({ donationDate: -1 });
        
        console.log(`Found ${donations.length} donations in date range`);
        return donations;
    } catch (error) {
        console.error("Error retrieving donations by date range:", error);
        throw error;
    }
};

// Get donations by food type
const getDonationsByFoodType = async (foodType) => {
    try {
        // Validate food type against the enum values in the model
        const validFoodTypes = ['veg', 'non-veg', 'both'];
        if (!validFoodTypes.includes(foodType)) {
            throw new Error("Invalid food type. Must be one of: veg, non-veg, both");
        }
        
        const donations = await donateModel.find({ foodType })
            .populate('user', 'fullname email')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${donations.length} donations with food type "${foodType}"`);
        return donations;
    } catch (error) {
        console.error(`Error retrieving donations with food type ${foodType}:`, error);
        throw error;
    }
};

// Add notes to a donation
const addNotesToDonation = async (donationId, notes) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            throw new Error("Invalid donation ID format");
        }
        
        if (!notes || typeof notes !== 'string' || notes.trim() === '') {
            throw new Error("Notes cannot be empty");
        }
        
        const updatedDonation = await donateModel.findByIdAndUpdate(
            donationId,
            { notes },
            { new: true, runValidators: true }
        );
        
        if (!updatedDonation) {
            throw new Error("Donation not found");
        }
        
        console.log(`Added notes to donation ${donationId}`);
        return updatedDonation;
    } catch (error) {
        console.error("Error adding notes to donation:", error);
        throw error;
    }
};

// Get donation statistics
const getDonationStatistics = async () => {
    try {
        // Get count by status
        const statusCounts = await donateModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Get count by food type
        const foodTypeCounts = await donateModel.aggregate([
            {
                $group: {
                    _id: "$foodType",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Get donations by date (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Make sure we have created_at field by using $ifNull to fallback to donationDate if needed
        const recentDonations = await donateModel.aggregate([
            {
                $match: {
                    $or: [
                        { createdAt: { $gte: sevenDaysAgo } },
                        { donationDate: { $gte: sevenDaysAgo } }
                    ]
                }
            },
            {
                $addFields: {
                    // Use createdAt if available, otherwise fall back to donationDate
                    dateField: { $ifNull: ["$createdAt", "$donationDate"] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$dateField" },
                        month: { $month: "$dateField" },
                        day: { $dayOfMonth: "$dateField" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);
        
        // Format the results into a more usable structure
        const statusStats = statusCounts.reduce((acc, curr) => {
            if (curr._id) { // Make sure _id is not null
                acc[curr._id] = curr.count;
            }
            return acc;
        }, {});
        
        const foodTypeStats = foodTypeCounts.reduce((acc, curr) => {
            if (curr._id) { // Make sure _id is not null
                acc[curr._id] = curr.count;
            }
            return acc;
        }, {});
        
        const dailyDonations = recentDonations.map(item => {
            // Handle any potentially missing fields
            const year = item._id?.year || new Date().getFullYear();
            const month = item._id?.month || new Date().getMonth() + 1;
            const day = item._id?.day || new Date().getDate();
            
            return {
                date: `${year}-${month}-${day}`,
                count: item.count || 0
            };
        });
        
        return {
            totalDonations: await donateModel.countDocuments(),
            byStatus: statusStats,
            byFoodType: foodTypeStats,
            recentDonations: dailyDonations
        };
    } catch (error) {
        console.error("Error generating donation statistics:", error);
        // Return a basic statistics object instead of throwing
        return {
            totalDonations: await donateModel.countDocuments().catch(() => 0),
            byStatus: {},
            byFoodType: {},
            recentDonations: []
        };
    }
};

// Update donation quantity by the owner
const updateDonationQuantity = async (donationId, foodQuantity, userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            throw new Error("Invalid donation ID format");
        }
        
        if (!foodQuantity || parseInt(foodQuantity) <= 0) {
            throw new Error("Food quantity must be greater than 0");
        }
        
        // Find the donation first to check ownership
        const donation = await donateModel.findById(donationId);
        
        if (!donation) {
            throw new Error("Donation not found");
        }
        
        // Check if the user is the owner of the donation
        if (donation.user && donation.user.toString() !== userId.toString()) {
            throw new Error("You don't have permission to update this donation");
        }
        
        // Check if donation status allows quantity update (only pending donations can be updated)
        if (donation.status !== 'pending') {
            throw new Error("Only pending donations can be updated");
        }
        
        // Update the donation quantity
        const updatedDonation = await donateModel.findByIdAndUpdate(
            donationId,
            { foodQuantity },
            { new: true, runValidators: true }
        );
        
        return updatedDonation;
    } catch (error) {
        console.error("Error updating donation quantity:", error);
        throw error;
    }
};

module.exports = {
    createDonation,
    getAllDonations,
    getDonationsByUser,
    updateDonationStatus,
    getDonationById,
    getDonationsByStatus,
    getDonationsByDateRange,
    getDonationsByFoodType,
    addNotesToDonation,
    getDonationStatistics,
    updateDonationQuantity
};