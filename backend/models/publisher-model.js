import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    publisher_id: { type: String, unique: true, index: true }, // 6-digit unique ID
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    slug: { type: String, unique: true, index: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    country: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    founded_year: { type: Number, default: null },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Generate a URL-friendly slug
const slugify = (str) =>
  String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Ensure slug uniqueness by appending "-n" if needed
async function generateUniqueSlug(model, baseSlug, excludeId) {
  let slug = baseSlug || "";
  if (!slug) slug = Math.random().toString(36).slice(2, 8);
  let i = 0;
  const baseFilter = excludeId ? { _id: { $ne: excludeId } } : {};
  // eslint-disable-next-line no-await-in-loop
  while (await model.exists({ slug, ...baseFilter })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  return slug;
}

// Generate unique 6-digit publisher ID
async function generateUniquePublisherId(model) {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Generate 6-digit number (100000 to 999999)
    const id = String(Math.floor(100000 + Math.random() * 900000));
    
    // Check if it exists
    const exists = await model.exists({ publisher_id: id });
    if (!exists) return id;
    
    attempts += 1;
  }
  
  // Fallback: use timestamp-based ID if random generation fails
  return String(Date.now()).slice(-6);
}

// Set slug and publisher_id on create/save
publisherSchema.pre("save", async function (next) {
  try {
    if (this.isModified("name")) {
      const base = slugify(this.name);
      this.slug = await generateUniqueSlug(this.constructor, base, this._id);
    }
    
    // Generate publisher_id if not set
    if (!this.publisher_id) {
      this.publisher_id = await generateUniquePublisherId(this.constructor);
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Update slug on findOneAndUpdate/findByIdAndUpdate when name is updated
publisherSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() || {};
    const name =
      update.name ??
      (update.$set && update.$set.name) ??
      undefined;

    if (name) {
      const base = slugify(name);
      const filter = this.getFilter ? this.getFilter() : {};
      const excludeId = filter && filter._id ? filter._id : undefined;
      const slug = await generateUniqueSlug(this.model, base, excludeId);

      if (update.$set) {
        update.$set.slug = slug;
      } else {
        update.slug = slug;
      }
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Publisher", publisherSchema);
