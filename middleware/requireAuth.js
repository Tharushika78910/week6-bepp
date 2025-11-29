const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // Expected format: "Bearer <token>"
  const token = authorization.split(" ")[1];

  try {
    if (!process.env.SECRET) {
      return res
        .status(500)
        .json({ error: "JWT secret (SECRET) not configured on server" });
    }

    // Verify token using the same SECRET
    const { _id } = jwt.verify(token, process.env.SECRET);

    // Attach authenticated user to request
    req.user = await User.findOne({ _id }).select("_id");

    next();
  } catch (error) {
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
