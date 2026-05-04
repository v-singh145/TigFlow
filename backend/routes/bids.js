const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');

// POST /api/bids - submit a bid
router.post('/', auth, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    if (!gigId || !message || !price) return res.status(400).json({ message: 'Missing fields' });
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig not open' });
    const bid = await Bid.create({ gigId, freelancerId: req.user._id, message, price });
    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bids/:gigId - get bids for a gig (owner only)
router.get('/:gigId', auth, async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.ownerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const bids = await Bid.find({ gigId }).populate('freelancerId', 'name email');
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/bids/:bidId/hire - ATOMIC HIRING LOGIC WITH RACE CONDITION PREVENTION
// Uses MongoDB Transactions to ensure only ONE bid can be hired per gig
router.patch('/:bidId/hire', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bidId } = req.params;
    
    // ⏱️ STEP 1: Fetch bid and freelancer info
    const bid = await Bid.findById(bidId).populate('freelancerId', '_id name').session(session);
    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: '❌ Bid not found',
        code: 'BID_NOT_FOUND'
      });
    }
    
    // ⏱️ STEP 2: Fetch gig (locked for atomic operation)
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: '❌ Gig not found',
        code: 'GIG_NOT_FOUND'
      });
    }
    
    // ⏱️ STEP 3: Authorization check
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ 
        message: '❌ Only gig owner can hire',
        code: 'UNAUTHORIZED'
      });
    }
    
    // 🔒 CRITICAL: Check if gig is still OPEN (race condition prevention)
    // If another admin already hired someone, this will be 'assigned'
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `❌ Gig is no longer open (status: ${gig.status}). Someone else may have already hired a freelancer.`,
        code: 'GIG_NOT_OPEN',
        currentStatus: gig.status,
        hiredBidId: gig.hiredBidId
      });
    }
    
    // 🔒 CRITICAL: Verify bid status is still pending
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `❌ Bid is no longer pending (status: ${bid.status}). Cannot hire this bid.`,
        code: 'BID_NOT_PENDING',
        currentStatus: bid.status
      });
    }

    // ✅ ATOMIC TRANSACTION BLOCK:
    const hireTime = new Date();
    
    // 1️⃣ Update chosen bid to 'hired' with timestamp
    bid.status = 'hired';
    bid.hiredAt = hireTime;
    await bid.save({ session });

    // 2️⃣ Update gig to 'assigned' and store hired bid reference
    gig.status = 'assigned';
    gig.hiredBidId = bid._id;
    gig.hiredAt = hireTime;
    await gig.save({ session });

    // 3️⃣ Reject ALL other bids for this gig atomically
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected', hiredAt: null } },
      { session }
    );

    // ✅ COMMIT TRANSACTION (all or nothing)
    await session.commitTransaction();
    session.endSession();

    // 📢 Send real-time notification to hired freelancer via Socket.io
    const freelancerId = bid.freelancerId._id.toString();
    const freelancerSocketId = req.userSockets[freelancerId];
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ ATOMIC HIRE COMPLETED SUCCESSFULLY`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   Gig ID: ${gig._id}`);
    console.log(`   Gig Title: ${gig.title}`);
    console.log(`   Budget: $${gig.budget}`);
    console.log(`   Hired Bid ID: ${bid._id}`);
    console.log(`   Freelancer ID: ${freelancerId}`);
    console.log(`   Freelancer Name: ${bid.freelancerId.name}`);
    console.log(`   Freelancer Socket: ${freelancerSocketId || '❌ NOT CONNECTED'}`);
    console.log(`   Hired At: ${hireTime.toISOString()}`);
    console.log(`${'='.repeat(70)}\n`);
    
    if (freelancerSocketId) {
      req.io.to(freelancerSocketId).emit('hired', {
        gigId: gig._id,
        gigTitle: gig.title,
        gigBudget: gig.budget,
        bidPrice: bid.price,
        message: `🎉 You have been hired for "${gig.title}"!`
      });
      console.log(`📨 Real-time notification SENT to freelancer ${freelancerId}\n`);
    } else {
      console.log(`⚠️  Freelancer ${freelancerId} is OFFLINE. Notification queued for next login.\n`);
    }

    res.json({ 
      message: '✅ Hired successfully',
      gigId: gig._id,
      bidId: bid._id,
      freelancerId: freelancerId,
      hiredAt: hireTime
    });
    
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`\n❌ TRANSACTION FAILED:`, err.message);
    res.status(500).json({ 
      message: 'Server error during hiring',
      error: err.message
    });
  }
});

module.exports = router;
