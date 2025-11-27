const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  // verify user is authenticated
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  console.log("Full Authorization header:", authorization);
  console.log("After split:", authorization.split(" "));
  console.log("Scheme:", authorization.split(" ")[0]);
  console.log("Token:", authorization.split(" ")[1]);

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    console.log("Decoded user ID (_id) from token:", _id);

    req.user = await User.findOne({ _id }).select("_id");
    console.log("req.user:", req.user);
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
