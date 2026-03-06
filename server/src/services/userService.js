const User = require("../models/user");
const AppError = require("../utils/appError");

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('username email accountStatus isActive');
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

module.exports = { getUserProfile };