const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// @route  GET /api/books
// @desc   Get all books with search & filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, available, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (available === 'true') query.availableCopies = { $gt: 0 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      books
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  GET /api/books/:id
// @desc   Get single book
router.get('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  POST /api/books
// @desc   Add a new book (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Book added successfully', book });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'ISBN already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  PUT /api/books/:id
// @desc   Update a book (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book updated successfully', book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route  DELETE /api/books/:id
// @desc   Delete a book (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
