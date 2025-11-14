import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded._id).select("-password");
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
