const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
const signupUser = async (req, res) => {
  const {
    name,
    email,
    password,
    phone_number,
    gender,
    date_of_birth,
    membership_status,
  } = req.body;

  // Provide defaults for backward compatibility
  const safePhoneNumber = phone_number || "1234567890";
  const safeGender = gender || "Other";
  const safeDob = date_of_birth || "2000-01-01";
  const safeStatus = membership_status || "Active";

  try {
    // 1. Required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2. Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 3. Validate strong password
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password is too weak" });
    }

    // 4. Validate phone number
    if (!/^\d{10,}$/.test(safePhoneNumber)) {
      return res
        .status(400)
        .json({ error: "Phone number must be at least 10 digits" });
    }

    // 5. Validate enums
    const allowedGenders = ["Male", "Female", "Other"];
    const allowedStatuses = ["Active", "Inactive", "Suspended"];

    if (!allowedGenders.includes(safeGender)) {
      return res
        .status(400)
        .json({ error: "Gender must be Male, Female, or Other" });
    }

    if (!allowedStatuses.includes(safeStatus)) {
      return res.status(400).json({
        error: "Membership status must be Active, Inactive, or Suspended",
      });
    }

    // 6. Create user AFTER validation
    const user = await User.signup(
      name,
      email,
      password,
      safePhoneNumber,
      safeGender,
      safeDob,
      safeStatus
    );

    // 7. Create token
    const token = generateToken(user._id);

    // 8. Build safe response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      membership_status: user.membership_status,
    };

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.log("SIGNUP ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
};


// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const user = await User.login(email, password);

    // create a token
    const token = generateToken(user._id);

    // return full user object (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      membership_status: user.membership_status,
    };

    res.status(200).json({ user: userData, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user._id is set by requireAuth
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build a clean profile object with only the expected fields
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      membership_status: user.membership_status,
    };

    // Return the user object directly (not wrapped in { user: ... })
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getMe,
};
