const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  from_name: {
    type: String,
    required: true
  },
  from_email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Contact', ContactSchema);
