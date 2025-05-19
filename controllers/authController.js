const User = require("../models/User");
const generateToken = require("../utils/jwtGenerator");
const { success, error } = require("../utils/responseHandler");

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return error(res, "User already exists", 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "collector",
    });

    if (!user) {
      return error(res, "Invalid user data", 400);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return success(
      res,
      "User registered successfully",
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
      201
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return error(res, "Invalid credentials", 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return error(res, "Invalid credentials", 401);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return success(res, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return success(res, "User retrieved successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};
