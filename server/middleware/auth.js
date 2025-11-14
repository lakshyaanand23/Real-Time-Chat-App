import jwt from "jsonwebtoken";
import User from "../models/User.js";


// Unified protect middleware: accepts Authorization: Bearer <token> OR custom header `token`
export const protectRoute = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await User.findById(decoded.userId).select("-password");
    const user = await User.findById(decoded._id).select("-password");
    req.user = user;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
