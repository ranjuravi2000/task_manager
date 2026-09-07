const User = require("../models/User");

// ------Get LOGGED-IN USER PROFILE--------//
const getProfile = async (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user,
    });
};

// -------GET ALL USERS-----------//
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("_id username email");

        res.status(200).json({
            count: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

module.exports = {
    getProfile,
    getUsers,
};