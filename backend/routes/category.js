const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Entry = require("../models/Entry");
const authMiddleware = require("../middleware/auth");

// Get all categories (no auth needed or only for logged in)
router.get("/", authMiddleware(), async (req, res) => {
  try {
    const categories = await Category.find({}).select("-entries").lean();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get entries of a category
router.get("/:id/entries", authMiddleware(), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const entries = await Entry.find({ category: categoryId }).select("title _id").lean();
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new category (only writers)
router.post("/", authMiddleware(["writer"]), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = new Category({
      name,
      description,
      createdBy: req.user.id,
    });
    await category.save();

    // Notify clients about sidebar update
    if (req.app.get("io")) req.app.get("io").emit("sidebar-updated");

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update category (only writers)
router.put("/:id", authMiddleware(["writer"]), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();

    if (req.app.get("io")) req.app.get("io").emit("sidebar-updated");

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete category (only writers)
router.delete("/:id", authMiddleware(["writer"]), async (req, res) => {
  try {
    const categoryId = req.params.id;
    await Entry.deleteMany({ category: categoryId }); // Remove all entries within
    await Category.findByIdAndDelete(categoryId);

    if (req.app.get("io")) req.app.get("io").emit("sidebar-updated");

    res.json({ message: "Category and entries deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
           
