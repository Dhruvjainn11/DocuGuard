const { sendSuccess } = require("../common/response");
const { registerUser, loginUser, logoutUser } = require("../services/authService");

const registerController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const { user } = await registerUser(username, email, password);
    sendSuccess(res, "User registered successfully", user, 200);
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, "User logged in successfully", user, 200);
  } catch (err) {
    next(err);
  }
};

const logoutController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await logoutUser(userId);
    res.clearCookie("token");
    sendSuccess(res, "User logged out successfully", null, 200);
  } catch (err) { 
    next(err);
  }
}

module.exports = { registerController, loginController, logoutController };
