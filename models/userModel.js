const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // These fields must NOT be required for iteration tests
    phone_number: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    date_of_birth: {
      type: Date,
    },

    membership_status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
    },
  },
  { timestamps: true }
);

// ---------- STATIC SIGNUP (ONLY name, email, password required) ----------
userSchema.statics.signup = async function (name, email, password) {

  // Required fields for tests
  if (!name || !email || !password) {
    throw Error("All fields must be filled");
  }

  // Email validation
  if (!validator.isEmail(email)) {
    throw Error("Email not valid");
  }

  // Password validation
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  // Check if user already exists
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create user with required fields only
  const user = await this.create({
    name,
    email,
    password: hash,
  });

  return user;
};

// ---------- STATIC LOGIN ----------
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
