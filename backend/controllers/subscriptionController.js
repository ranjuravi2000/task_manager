const User = require("../models/User");

// Update user's subscription plan
const updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    const validPlans = ["free", "pro", "ultimate"];

    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        message: "Invalid subscription plan",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update subscription
    user.subscription.plan = plan;
    user.subscription.status = "active";
    user.subscription.startDate = new Date();

    if (plan === "free") {
      user.subscription.endDate = null;
    }

    await user.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updateSubscription,
};