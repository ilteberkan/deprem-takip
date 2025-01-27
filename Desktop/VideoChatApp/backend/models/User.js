const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema); 