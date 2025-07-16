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
const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io); // make accessible in routes

app.use(cors());
app.use(express.json());

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

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/entries", entryRoutesFactory(io));

// Optional basic route
app.get("/", (req, res) => {
  res.send("TV Series Encyclopedia backend is running");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
