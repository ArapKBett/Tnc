const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['writer', 'animator', 'viewer'] },
  createdBy: mongoose.Schema.Types.ObjectId, // only two people can create users
});
module.exports = mongoose.model('User', userSchema);
