import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    slug: { type: String, unique: true, index: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    status: {
      type: String,
      enum: ["unverified", "pending", "verified", "cancelled"],
      default: "pending",
      index: true,
    },
    dob: { type: Date, default: null },
  },
  { timestamps: true }
);

// Generate a URL-friendly slug supporting Unicode letters and digits
// Keeps non-Latin script characters (e.g., Bengali) instead of stripping them
const slugify = (str) =>
  String(str)
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    // Replace any sequence of characters that are NOT letters (\p{L}) or digits (\p{N}) with a single dash
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    // Trim leading/trailing dashes
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

// Set slug on create/save when name changes
authorSchema.pre("save", async function (next) {
  try {
    if (this.isModified("name")) {
      const base = slugify(this.name);
      this.slug = await generateUniqueSlug(this.constructor, base, this._id);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Update slug on findOneAndUpdate/findByIdAndUpdate when name is updated
authorSchema.pre("findOneAndUpdate", async function (next) {
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

export default mongoose.model("Author", authorSchema);
