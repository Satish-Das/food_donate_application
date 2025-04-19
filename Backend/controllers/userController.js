const ApiError = require("../utils/errorHandler.js")
const ApiResponse = require('../utils/apiResponse.js')
const asyncHandler = require('../utils/asyncHandler.js')
const {registerService, loginService, updateUserService, deleteUserService } = require ("../services/user.service.js")
const {generateAccessToken, generateRefreshToken, setTokensCookie} = require("../utils/tokenGenerator.js")


const register = asyncHandler(async(req, res) => {
    const {phone, email, password, fullname, city, pincode, address} = req.body;
    
    if (!phone) throw new ApiError(400, "Phone number is required");
    if (!email) throw new ApiError(400, "Email is required");
    if (!password) throw new ApiError(400, "Password is required");
    if (!fullname) throw new ApiError(400, "Full name is required");
    if (!city) throw new ApiError(400, "City is required");
    if (!pincode) throw new ApiError(400, "Pincode is required");
    if (!address) throw new ApiError(400, "Address is required");

    const data = {
        phone, email, password, fullname, city, pincode, address
    }
    const user = await registerService(data);

    return res
    .status(201) 
    .json(
        new ApiResponse(200, "User created Successfully", user)
    )
});

const login = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    if (!email) throw new ApiError(400, "Email is required");
    if (!password) throw new ApiError(400, "Password is required");

    const data = {
        email, 
        password
    }
        const user = await loginService(data);

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        setTokensCookie(res, accessToken, refreshToken);
        user.password = undefined;

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "User logged in successfully",
                {
                    user,
                    accessToken,
                    refreshToken
                }
            )
        )
})

// Logout Controller
const logout = asyncHandler(async (req, res) => {
    // Clear the cookies (access token and refresh token)
    res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Respond with a success message
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged out successfully",
                null
            )
        );
});

const updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;

    if (!userId) throw new ApiError(400, "User ID is required");

    const updatedUser = await updateUserService(userId, updateData);
    updatedUser.password = undefined;

    return res.status(200).json(
        new ApiResponse(200, "User updated successfully", updatedUser)
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) throw new ApiError(400, "User ID is required");

    await deleteUserService(userId);

    return res.status(200).json(
        new ApiResponse(200, "User deleted successfully", null)
    );
});

// Debug function to check JWT settings - REMOVE IN PRODUCTION
const checkJwtConfig = async(req, res) => {
    try {
        const jwtSecret = process.env.JWT_ACCESS_SECRET; // Updated to check for JWT_ACCESS_SECRET
        const maskSecret = jwtSecret ? `${jwtSecret.substring(0, 3)}...` : null;
        
        res.status(200).json({
            message: "JWT Configuration Status",
            jwt_secret_exists: !!jwtSecret,
            jwt_secret_length: jwtSecret ? jwtSecret.length : 0,
            jwt_secret_preview: maskSecret,
            env_vars_present: Object.keys(process.env).filter(key => key.includes('JWT')),
            node_env: process.env.NODE_ENV
        });
    } catch (error) {
        console.error("Error in checkJwtConfig:", error);
        res.status(500).json({ message: "Error checking JWT configuration" });
    }
};

// Get User Profile function
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        // req.user comes from the auth middleware
        const user = req.user;
        
        if (!user) {
            throw new ApiError(401, "User not authenticated");
        }
        
        // Don't send password in response
        user.password = undefined;
        
        // Check if user has donations (assuming user model has donations field)
        let userData = user.toObject();
        
        // Return the profile data
        return res.status(200).json(
            new ApiResponse(200, "User profile retrieved successfully", userData)
        );
    } catch (error) {
        throw new ApiError(500, "Error retrieving user profile: " + error.message);
    }
});

module.exports = {
    register,
    login,
    logout,
    updateUser,
    deleteUser,
    checkJwtConfig,
    getUserProfile
}