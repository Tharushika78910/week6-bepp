const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Generate JWT
const generateToken = (id) => {
  const secret = process.env.SECRET || "testsecret123";
  return jwt.sign({ _id: id }, secret, { expiresIn: "3d" });
};


// SIGNUP
const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ONLY these 3 fields are required in the tests
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password validation
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password is too weak" });
    }

    // Create user
    const user = await User.signup(name, email, password);

    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.log("SIGNUP ERROR:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const user = await User.login(email, password);

    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// /ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to get user profile" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getMe,
};
