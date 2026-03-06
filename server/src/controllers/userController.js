const {getUserProfile}  = require("../services/userService")
const {sendSuccess} = require("../common/response");

const getProfileController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await getUserProfile(userId);
    
    sendSuccess(res, "User profile retrieved successfully", user, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {getProfileController};