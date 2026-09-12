const express = require("express");
const {
    getProfile,
    getUsers,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
// get all users----
router.get("/", authMiddleware, getUsers);
// Protected profile route---------//
router.get("/profile", authMiddleware, getProfile);


module.exports = router;