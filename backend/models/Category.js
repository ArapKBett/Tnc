const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  entries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entry",
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
