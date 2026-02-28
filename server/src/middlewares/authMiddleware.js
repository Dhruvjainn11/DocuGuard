const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }    
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    req.user = {
      id: user._id,
      name: user.username,
    };

    next();
  } catch (err) {
    next(err);
  }
};


module.exports = { authMiddleware };
