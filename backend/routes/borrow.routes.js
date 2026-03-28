const express = require('express');
const router = express.Router();
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// @route  POST /api/borrow
// @desc   Borrow a book
router.post('/', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Check if user already has this book borrowed
    const existing = await Borrow.findOne({ user: req.user._id, book: bookId, status: 'borrowed' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have this book borrowed' });
    }

    // Check borrow limit (max 3 books)
    const activeBorrows = await Borrow.countDocuments({ user: req.user._id, status: 'borrowed' });
    if (activeBorrows >= 3) {
      return res.status(400).json({ success: false, message: 'Borrow limit reached (max 3 books)' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      user: req.user._id,
      book: bookId,
      dueDate
    });

    // Decrease available copies
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

    const populated = await borrow.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'user', select: 'name email membershipId' }
    ]);

    res.status(201).json({ success: true, message: 'Book borrowed successfully', borrow: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/borrow/return/:id
// @desc   Return a book
router.put('/return/:id', protect, async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found' });

    if (borrow.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    // Only allow own return or admin
    if (borrow.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const fine = borrow.computeFine();
    borrow.status = 'returned';
    borrow.returnDate = new Date();
    borrow.fine = fine;
    await borrow.save();

    // Increase available copies back
    await Book.findByIdAndUpdate(borrow.book, { $inc: { availableCopies: 1 } });

    res.json({ success: true, message: 'Book returned successfully', fine, borrow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/borrow/my
// @desc   Get current user's borrow history
router.get('/my', protect, async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user._id })
      .populate('book', 'title author isbn category coverImage')
      .sort({ createdAt: -1 });

    // Update overdue status
    for (const b of borrows) {
      if (b.status === 'borrowed' && new Date() > b.dueDate) {
        b.status = 'overdue';
        b.fine = b.computeFine();
        await b.save();
      }
    }

    res.json({ success: true, borrows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/borrow/all
// @desc   Get all borrow records (admin only)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('book', 'title author isbn')
      .populate('user', 'name email membershipId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: borrows.length, borrows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
