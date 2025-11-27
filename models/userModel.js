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

    phone_number: {
      type: String,
      required: true,
      match: /^\d{10,}$/, // Must be at least 10 digits
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    date_of_birth: {
      type: Date,
      required: true,
    },

    membership_status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "Suspended"],
    },
  },
  { timestamps: true }
);

//
// STATIC SIGNUP METHOD
//
userSchema.statics.signup = async function (
  name,
  email,
  password,
  phone_number,
  gender,
  date_of_birth,
  membership_status
) {
  // Validate required fields
  if (
    !name ||
    !email ||
    !password ||
    !phone_number ||
    !gender ||
    !date_of_birth ||
    !membership_status
  ) {
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

  // Phone number validation - must be 10+ digits
  if (!/^\d{10,}$/.test(phone_number)) {
    throw Error("Phone number must be at least 10 digits");
  }

  // Check if user already exists
  const userExists = await this.findOne({ email });
  if (userExists) {
    throw Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await this.create({
    name,
    email,
    password: hashedPassword,
    phone_number,
    gender,
    date_of_birth,
    membership_status,
  });

  return user;
};

//
// STATIC LOGIN METHOD
//
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  // Find user
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
