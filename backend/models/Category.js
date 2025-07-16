const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
  createdBy: mongoose.Schema.Types.ObjectId,
});
module.exports = mongoose.model('Category', categorySchema);
