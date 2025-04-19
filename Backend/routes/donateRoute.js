const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/donateController.js');
const auth = require('../middlewares/auth.middleware.js');

// Public route - anyone can donate
router.post('/donate', donateFood);

// Protected routes - require authentication
router.get('/all', auth, getAllDonations);
router.get('/user', auth, getUserDonations);
router.patch('/status', auth, updateDonationStatus);

// New routes
router.get('/id/:id', auth, getDonationById);
router.get('/status/:status', auth, getDonationsByStatus);
router.get('/date-range', auth, getDonationsByDateRange);
router.get('/food-type/:foodType', auth, getDonationsByFoodType);
router.post('/add-notes', auth, addNotesToDonation);
router.get('/statistics', auth, getDonationStatistics);

// Route for updating donation quantity
router.patch('/update-quantity', auth, updateDonationQuantity);

module.exports = router;