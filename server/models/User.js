const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  masterPasswordHash: {
    type: String,
    required: [true, 'Master password is required'],
    minlength: [8, 'Master password must be at least 8 characters']
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ email: 1 });

// Hash master password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('masterPasswordHash')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.masterPasswordHash = await bcrypt.hash(this.masterPasswordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.masterPasswordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.masterPasswordHash;
  delete userObject.__v;
  return userObject;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
