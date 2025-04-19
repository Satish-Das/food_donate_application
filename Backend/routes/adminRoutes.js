const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController.js');
const adminAuth = require('../middlewares/admin.middleware');

// Public admin routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Admin protected routes - require admin authentication
router.get('/profile', adminAuth, getAdminProfile);
router.get('/dashboard-stats', adminAuth, getDashboardStats);
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:userId', adminAuth, getUserDetails);
router.get('/donations', adminAuth, getAllDonations);
router.get('/donations/by-status', adminAuth, getDonationsByStatus);
router.patch('/update-donation-status', adminAuth, updateDonationStatus);
router.post('/reset-password', adminAuth, resetPassword);

module.exports = router;