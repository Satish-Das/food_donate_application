const express = require('express');
const router = express.Router();
const {login, register, logout, updateUser, deleteUser, checkJwtConfig, getUserProfile} = require("../controllers/userController.js")
const auth = require('../middlewares/auth.middleware');

router.post("/register", register)
router.post("/login", login)
router.get('/logout',logout)

// Add auth middleware to protected routes
router.get("/profile", auth, getUserProfile);
router.put("/update/:userId", auth, updateUser);
router.delete("/delete/", auth, deleteUser);

// Debug route - REMOVE IN PRODUCTION
router.get("/jwt-debug", checkJwtConfig);

module.exports = router;