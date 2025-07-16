require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const entryRoutesFactory = require("./routes/entry"); // requires io

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://sienc.onrender.com";

// Configure CORS for Express
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Allow parsing JSON bodies
app.use(express.json());

// Configure Socket.IO with matching CORS
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, credentials: true },
});

// Make io available in routes
app.set("io", io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/entries", entryRoutesFactory(io));

// Basic root route
app.get("/", (req, res) => {
  res.send("TV Series Encyclopedia backend is running");
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Socket.IO connection handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
