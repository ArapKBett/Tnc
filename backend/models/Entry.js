const mongoose = require('mongoose');
const entrySchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['character', 'place', 'food', 'weapon', 'other'] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  content: Object, // flexible, for nested sections, e.g. { bio, age, origin, etc }
  links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
  images: [String],
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedAt: Date,
});
module.exports = mongoose.model('Entry', entrySchema);
