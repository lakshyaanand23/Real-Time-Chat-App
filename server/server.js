import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);


// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
  });
});

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));


// import express from "express";
// import cors from "cors";
// import http from "http";
// import 'dotenv/config';
// import jwt from "jsonwebtoken";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// app.use(cors());
// app.use(express.json());

// // --- In-memory mock store (so it runs without a DB) ---
// const users = new Map(); // email -> {id, fullName, email, password, bio}
// const messages = []; // { from, to, text, createdAt, seen }
// let nextId = 1;

// function auth(req, res, next) {
//   const auth = req.headers.authorization || "";
//   const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//   if (!token) return res.status(401).json({ success: false, message: "No token" });
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = payload;
//     next();
//   } catch (e) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// }

// app.get("/api/health", (req, res) => res.json({ ok: true, envDefined: typeof process !== "undefined" }));

// app.post("/api/auth/signup", (req, res) => {
//   const { fullName, email, password, bio = "" } = req.body || {};
//   if (!fullName || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
//   if (users.has(email)) return res.status(409).json({ success: false, message: "User already exists" });
//   const id = String(nextId++);
//   users.set(email, { id, fullName, email, password, bio });
//   const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
//   return res.json({ success: true, userData: { id, fullName, email, bio }, token });
// });

// app.post("/api/auth/login", (req, res) => {
//   const { email, password } = req.body || {};
//   const u = users.get(email);
//   if (!u || u.password !== password) return res.status(401).json({ success: false, message: "Invalid credentials" });
//   const token = jwt.sign({ id: u.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
//   return res.json({ success: true, userData: { id: u.id, fullName: u.fullName, email: u.email, bio: u.bio }, token });
// });

// app.put("/api/auth/update-profile", auth, (req, res) => {
//   const { fullName, bio = "" } = req.body || {};
//   const entry = [...users.values()].find(u => u.id === req.user.id);
//   if (!entry) return res.status(404).json({ success: false, message: "User not found" });
//   entry.fullName = fullName ?? entry.fullName;
//   entry.bio = bio ?? entry.bio;
//   return res.json({ success: true, userData: { id: entry.id, fullName: entry.fullName, email: entry.email, bio: entry.bio } });
// });

// app.get("/api/messages/users", auth, (req, res) => {
//   const list = [...users.values()].filter(u => u.id !== req.user.id).map(u => ({ id: u.id, fullName: u.fullName, email: u.email }));
//   res.json({ success: true, users: list });
// });

// app.get("/api/messages/:id", auth, (req, res) => {
//   const other = req.params.id;
//   const conv = messages.filter(m => (m.from === req.user.id && m.to === other) || (m.from === other && m.to === req.user.id));
//   res.json({ success: true, messages: conv });
// });

// app.post("/api/messages/send/:id", auth, (req, res) => {
//   const to = req.params.id;
//   const { text } = req.body || {};
//   const msg = { from: req.user.id, to, text, createdAt: Date.now(), seen: false };
//   messages.push(msg);
//   // emit to receiver
//   io.to(to).emit("newMessage", msg);
//   res.json({ success: true, newMessage: msg });
// });

// // --- Socket.io ---
// const userSocketMap = new Map(); // userId -> socketId
// io.on("connection", (socket) => {
//   const userId = socket.handshake.query?.userId;
//   if (userId) userSocketMap.set(userId, socket.id);
//   socket.on("disconnect", () => {
//     if (userId) userSocketMap.delete(userId);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log("Server running on " + PORT));
