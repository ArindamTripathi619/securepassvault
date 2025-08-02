const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  website: {
    type: String,
    required: [true, 'Website is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  passwordEncrypted: {
    type: String,
    required: [true, 'Encrypted password is required']
  },
  iv: {
    type: String,
    required: [true, 'Encryption IV is required']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

credentialSchema.index({ userId: 1, website: 1, username: 1 }, { unique: true });

module.exports = mongoose.model('Credential', credentialSchema);
