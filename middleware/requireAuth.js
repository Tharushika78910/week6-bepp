const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // Expected: "Bearer <token>"
  const token = authorization.split(" ")[1];

  try {
    // Use same fallback secret as userController
    const secret = process.env.SECRET || "testsecret123";

    // Verify token
    const { _id } = jwt.verify(token, secret);

    // Attach user id
    req.user = await User.findById(_id).select("_id");

    if (!req.user) {
      return res.status(401).json({ error: "Request is not authorized" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
