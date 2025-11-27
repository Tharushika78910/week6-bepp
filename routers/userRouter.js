const express = require("express");
const router = express.Router();

const { loginUser, signupUser, getMe } = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");

// Public routes
router.post("/login", loginUser);
router.post("/signup", signupUser);

// Protected route - get logged in user's data
router.get("/me", requireAuth, getMe);

module.exports = router;
