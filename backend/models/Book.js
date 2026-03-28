const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Mathematics', 'Literature', 'Other']
  },
  description: {
    type: String,
    default: ''
  },
  publisher: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies required'],
    min: [1, 'Must have at least 1 copy']
  },
  availableCopies: {
    type: Number
  },
  coverImage: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Set available copies = total copies on creation
bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0;
});

module.exports = mongoose.model('Book', bookSchema);
