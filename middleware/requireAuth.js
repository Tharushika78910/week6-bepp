const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    // ✅ Match the payload: { id } NOT { _id }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Use id to query the user
    req.user = await User.findOne({ _id: id }).select("_id");

    if (!req.user) {
      return res.status(401).json({ error: "Request is not authorized" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
