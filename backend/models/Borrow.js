const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  },
  fine: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Auto-set due date to 14 days from borrow
borrowSchema.pre('save', function (next) {
  if (this.isNew && !this.dueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    this.dueDate = due;
  }
  next();
});

// Check overdue and compute fine (₹5 per day)
borrowSchema.methods.computeFine = function () {
  if (this.status === 'returned') return 0;
  const today = new Date();
  if (today > this.dueDate) {
    const daysLate = Math.floor((today - this.dueDate) / (1000 * 60 * 60 * 24));
    return daysLate * 5;
  }
  return 0;
};

module.exports = mongoose.model('Borrow', borrowSchema);
