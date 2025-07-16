const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["character", "place", "food", "weapon", "other"],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  content: {
    type: Object, // flexible for nested sections e.g. { bio, age, origin, etc }
    default: {},
  },
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entry",
    default: [],
  }],
  images: [{
    type: String, // URL or path to asset
    default: [],
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Make sure updatedAt gets updated on save
EntrySchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Entry", EntrySchema);
