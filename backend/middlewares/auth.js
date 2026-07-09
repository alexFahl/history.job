const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect (middleware)
 *
 * Guards private routes by verifying the JWT
 *
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1 => Verify the header format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    // 2 => Extract token
    const token = authHeader.split(" ")[1];

    // 3 => Verify token,
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4 => Load the user informations from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user no longer exists" });
    }

    // 5=> Attach user to the request
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, token is invalid or expired" });
  }
};

module.exports = { protect };
