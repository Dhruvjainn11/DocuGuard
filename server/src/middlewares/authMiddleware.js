const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.userId).select(
      "_id roleId accountStatus isActive",
    );

    if (!user || user.accountStatus !== "active" || !user.isActive) {
      throw new AppError("Invalid or inactive user", 401);
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      roleId: user.roleId,
    };

    next();
  } catch (err) {
    next(err);
  }
};


module.exports = { authMiddleware };
