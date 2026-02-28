const User = require("../models/user");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async( username, email, password ) => {
  
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  // Create user (password hashed by mongoose hook)
  const user = await User.create({
    username,
    email: normalizedEmail,
    password,
  });

  return { user:{
    id: user._id,
    name: user.username,
    email: user.email,
    accountStatus: user.accountStatus
  }
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user) throw new AppError("Invalid email or password",401); 

  if (user.accountStatus !== 'active') {
    throw new AppError(`Login failed. Account is ${user.accountStatus}.`,401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { user:{
    id: user._id,
    name: user.username,
    email: user.email,
    accountStatus: user.accountStatus
  }, token };
};

module.exports = { registerUser, loginUser };
