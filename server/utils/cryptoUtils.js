const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Derive encryption key from master password using PBKDF2
const deriveKey = async (token, userId) => {
  try {
    // Get master password from token (for key derivation only)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use userId as salt for key derivation
    const salt = Buffer.from(userId.padStart(32, '0').slice(0, 32), 'utf8');
    
    // We'll use a fixed string as the password base since we can't access the actual master password
    // In a real implementation, this would require the master password to be sent with each request
    // For this demo, we'll use the JWT secret + userId as the key derivation base
    const keyMaterial = process.env.JWT_SECRET + userId;
    
    // Derive 32-byte key using PBKDF2
    const key = crypto.pbkdf2Sync(keyMaterial, salt, 100000, 32, 'sha256');
    return key;
  } catch (error) {
    throw new Error('Key derivation failed');
  }
};

// Encrypt text using AES-256-CBC
const encryptText = (text, key) => {
  try {
    const iv = crypto.randomBytes(16); // 16 bytes for AES-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed: ' + error.message);
  }
};

// Decrypt text using AES-256-CBC
const decryptText = (encryptedData, iv, key) => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed: ' + error.message);
  }
};

module.exports = {
  deriveKey,
  encryptText,
  decryptText
};
