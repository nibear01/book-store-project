// Migration script: normalize legacy book.genre values to arrays.
// Usage: node scripts/migrate-genres-to-array.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/book-model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/bookstore';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { autoIndex: true });
    console.log('Connected to MongoDB');

    const cursor = Book.find({ $or: [
      { genre: { $exists: false } },
      { genre: { $type: 'string' } },
      { genre: { $type: 'array', $size: 0 } },
    ] }).cursor();

    let processed = 0; let updated = 0; let skipped = 0;

    for await (const doc of cursor) {
      processed += 1;
      let raw = doc.genre;
      let arr;
      if (!raw) arr = [];
      else if (Array.isArray(raw)) arr = raw.map(v => String(v).trim()).filter(Boolean);
      else if (typeof raw === 'string') {
        arr = raw.split(',').map(s => s.trim()).filter(Boolean);
      } else arr = [];

      // If still empty but we have a comma-separated single string, keep as is.
      if (!Array.isArray(arr)) arr = [];

      // Deduplicate while preserving order
      const seen = new Set();
      arr = arr.filter(g => { const k = g.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

      const changed = JSON.stringify(arr) !== JSON.stringify(doc.genre);
      if (changed) {
        doc.genre = arr;
        await doc.save();
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    console.log(`Processed: ${processed}, Updated: ${updated}, Unchanged: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
