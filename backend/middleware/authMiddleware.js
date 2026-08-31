const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Checking Authorization header---
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists--------
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

    // Verify JWT token---------
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token--------
    const user = await User.findById(decoded.id).select("-password");

    // Check if user exists----------
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach authenticated user to request-------
    req.user = user;

    // Continue to protected route---------
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid or expired token",
    });
  }
};

module.exports = authMiddleware;