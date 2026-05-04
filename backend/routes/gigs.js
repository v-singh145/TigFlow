const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Gig = require('../models/Gig');

// GET /api/gigs/user/history - get all gigs posted by user (for history page)
router.get('/user/history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const gigs = await Gig.find({ ownerId: userId }).populate('ownerId', '_id name email');
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/gigs?search=title
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const q = { status: 'open' };
    if (search) q.title = { $regex: search, $options: 'i' };
    const gigs = await Gig.find(q).populate('ownerId', '_id name email');
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gigs
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    if (!title || !description || !budget) return res.status(400).json({ message: 'Missing fields' });
    const gig = await Gig.create({ title, description, budget, ownerId: req.user._id });
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
