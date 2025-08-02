const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const Credential = require('../models/Credential');
const authMiddleware = require('../middleware/authMiddleware');
const { deriveKey, encryptText, decryptText } = require('../utils/cryptoUtils');

const router = express.Router();

// GET /api/credentials
router.get('/', authMiddleware, async (req, res) => {
  try {
    const credentials = await Credential.find({ userId: req.user.id });
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve credentials' });
  }
});

// POST /api/credentials
router.post('/',
  authMiddleware,
  [
    body('website').notEmpty().withMessage('Website is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { website, username, password, tags } = req.body;

    try {
      const key = await deriveKey(req.cookies.token, req.user.id);
      const { encrypted, iv } = encryptText(password, key);

      const newCredential = new Credential({
        userId: req.user.id,
        website,
        username,
        passwordEncrypted: encrypted,
        iv,
        tags
      });

      await newCredential.save();
      res.status(201).json(newCredential);
    } catch (err) {
      res.status(500).json({ message: 'Failed to store credential' });
    }
  }
);

// PUT /api/credentials/:id
router.put('/:id',
  authMiddleware,
  [
    body('website').notEmpty().withMessage('Website is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { website, username, password, tags } = req.body;

    try {
      const credential = await Credential.findById(req.params.id);
      if (!credential || credential.userId.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Credential not found' });
      }

      const key = await deriveKey(req.cookies.token, req.user.id);
      const { encrypted, iv } = encryptText(password, key);

      credential.website = website;
      credential.username = username;
      credential.passwordEncrypted = encrypted;
      credential.iv = iv;
      credential.tags = tags;
      await credential.save();

      res.json(credential);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update credential' });
    }
  }
);

// DELETE /api/credentials/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential || credential.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    await Credential.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete credential' });
  }
});

module.exports = router;
