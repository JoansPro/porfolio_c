const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'portfolio'
    },
    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    repos: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    sourceCodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    skills: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    expertises: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    about: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    cv: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Content', ContentSchema);
