// Give every book (and category) without a slug one, built from its title/name.
// Books saved without a slug (Bangla titles before slugs supported them, or rows inserted
// directly into the database) can't be found by search or linked by a readable URL.
// Usage (from the backend folder):
//   node scripts/backfill-book-slugs.js           -> dry run: lists what would change
//   node scripts/backfill-book-slugs.js --apply   -> writes the slugs
// Uses MONGO_URI from backend/.env (or the environment).
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Book from "../models/book-model.js";
import Category from "../models/category-model.js";
import { slugify } from "../utils/slugify.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const apply = process.argv.includes("--apply");
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set (backend/.env).");
  process.exit(1);
}
console.log(`Database: ${process.env.MONGO_URI.replace(/\/\/[^@]*@/, "//***@").split("?")[0]}`);
console.log(apply ? "Mode: APPLY (writing changes)\n" : "Mode: dry run (nothing is written; add --apply to write)\n");

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

const missing = { $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] };
const SHOW = 15; // rows to print; the rest are counted
const BATCH = 500;

async function backfill(model, label, nameOf, fallback) {
  // Load every slug in use once, then pick unique ones in memory (fast for thousands of rows)
  const taken = new Set((await model.find({ slug: { $nin: [null, ""] } }).select("slug").lean()).map((d) => d.slug));
  const docs = await model.find(missing).select("title meta_title name").lean();
  let ops = [];
  let written = 0;
  for (const [i, doc] of docs.entries()) {
    const base = nameOf(doc) || fallback(doc);
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    if (i < SHOW) console.log(`${label.padEnd(9)} ${doc._id}  "${doc.title || doc.name}"  ->  ${slug}`);
    ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { slug } } } });
    if (apply && ops.length === BATCH) {
      written += (await model.bulkWrite(ops, { ordered: false })).modifiedCount;
      ops = [];
      process.stdout.write(`  ...${written} ${label}s written\r`);
    }
  }
  if (apply && ops.length) written += (await model.bulkWrite(ops, { ordered: false })).modifiedCount;
  if (docs.length > SHOW) console.log(`... and ${docs.length - SHOW} more ${label}s`);
  return { found: docs.length, written };
}

const books = await backfill(
  Book,
  "book",
  (b) => slugify(b.meta_title) || slugify(b.title),
  (b) => `book-${b._id}`
);
const cats = await backfill(Category, "category", (c) => slugify(c.name), (c) => `category-${c._id}`);

const found = books.found + cats.found;
console.log(
  found === 0
    ? "Every book and category already has a slug. Nothing to do."
    : apply
      ? `\nDone: ${books.written} book slug(s) and ${cats.written} category slug(s) written.`
      : `\n${books.found} book(s) and ${cats.found} category(s) need a slug. Run again with --apply to save them.`
);
await mongoose.disconnect();
