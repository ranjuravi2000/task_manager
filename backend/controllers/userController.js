// logged-in user profile-------
const getProfile = async (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
};

module.exports = {
  getProfile,
};
