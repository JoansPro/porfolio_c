const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['automation', 'electronics', 'ai', 'arduino', 'plc', 'programming', 'other'],
    required: true
  },
  technologies: [{
    type: String
  }],
  objectives: {
    type: String,
    default: ''
  },
  results: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  github: {
    type: String,
    default: ''
  },
  client: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  team: {
    type: String,
    default: ''
  },
  documents: [{
    id: String,
    title: String,
    description: String,
    type: String,
    url: String,
    size: String,
    icon: String,
    downloadUrl: String
  }],
  sourceCodes: [{
    id: String,
    title: String,
    description: String,
    language: String,
    size: String,
    downloadUrl: String,
    fileType: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
