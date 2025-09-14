const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  genre: String,
  language: String,
  isbn: String,
  cover_image: [{ type: String }], // Array of image paths
  file_url: { type: String, default: null },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  published_date: Date,
  rating: { type: Number, default: 0 },
  num_reviews: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Book', bookSchema);
