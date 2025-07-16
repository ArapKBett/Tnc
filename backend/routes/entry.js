const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

// Get single entry by ID
router.get("/:id", authMiddleware(), async (req, res) => {
  try {
    const entryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(entryId))
      return res.status(400).json({ message: "Invalid entry ID" });

    const entry = await Entry.findById(entryId)
      .populate("links", "title")
      .lean();

    if (!entry) return res.status(404).json({ message: "Entry not found" });

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Search entries by query
router.get("/search", authMiddleware(), async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length === 0) return res.json([]);

    // Text search on title or bio within content
    // You might want to add MongoDB indexes for better performance

    const regex = new RegExp(q, "i");
    const entries = await Entry.find({
      $or: [
        { title: regex },
        { "content.bio": regex }
      ]
    }).limit(50).select("title _id").lean();

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get multiple entries by IDs (used for related links loading)
router.get("/related", authMiddleware(), async (req, res) => {
  try {
    const ids = req.query.ids || "";
    const idArray = ids.split(",").filter(id => mongoose.Types.ObjectId.isValid(id));

    const entries = await Entry.find({ _id: { $in: idArray } })
      .select("title _id")
      .lean();

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new entry (writers only)
router.post("/", authMiddleware(["writer"]), async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      content,
      links,
      images
    } = req.body;

    if (!title || !type || !category) {
      return res.status(400).json({ message: "Title, type, and category are required" });
    }

    const entry = new Entry({
      title,
      type,
      category,
      content,
      links: links || [],
      images: images || [],
      createdBy: req.user.id,
      updatedAt: new Date()
    });

    await entry.save();

    if (req.app.get("io")) req.app.get("io").emit("sidebar-updated");

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update existing entry (writers + animators with limited permissions)
router.put("/:id", authMiddleware(["writer", "animator"]), async (req, res) => {
  try {
    const entryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(entryId))
      return res.status(400).json({ message: "Invalid entry ID" });

    const entry = await Entry.findById(entryId);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Writers can edit everything, animators only upload assets and update content but not title/type/category
    if (req.user.role === "animator") {
      // You could restrict fields here, e.g.:
      if (req.body.title && req.body.title !== entry.title)
        return res.status(403).json({ message: "Animators cannot change title" });
      if (req.body.type && req.body.type !== entry.type)
        return res.status(403).json({ message: "Animators cannot change type" });
      if (req.body.category && String(req.body.category) !== String(entry.category))
        return res.status(403).json({ message: "Animators cannot change category" });
    }

    // Update fields from request body
    if ("title" in req.body) entry.title = req.body.title;
    if ("type" in req.body) entry.type = req.body.type;
    if ("category" in req.body) entry.category = req.body.category;
    if ("content" in req.body) entry.content = req.body.content;
    if ("links" in req.body) entry.links = req.body.links;
    if ("images" in req.body) entry.images = req.body.images;

    entry.updatedAt = new Date();

    await entry.save();

    if (req.app.get("io")) req.app.get("io").emit("entry-updated", entry);

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete entry (writers only)
router.delete("/:id", authMiddleware(["writer"]), async (req, res) => {
  try {
    const entryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(entryId))
      return res.status(400).json({ message: "Invalid entry ID" });

    await Entry.findByIdAndDelete(entryId);

    if (req.app.get("io")) req.app.get("io").emit("sidebar-updated");

    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = (io) => {
  const routerWithSocket = router;

  // Attach io to app for emitting real-time events
  routerWithSocket.use((req, res, next) => {
    req.app.set("io", io);
    next();
  });

  return routerWithSocket;
};
    
