import mongoose from "mongoose";

// Helper slugify (duplicated lightweight version; could be refactored later)
const slugify = (s = "") =>
	String(s)
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");

const categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, unique: true },
		slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
		description: { type: String, trim: true },
		image: { type: String, default: null },
		synonyms: [{ type: String, trim: true }], // optional alternative names
		is_active: { type: Boolean, default: true },
		order: { type: Number, default: 0 }, // for custom ordering in UI
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

// Pre-save slug generation & uniqueness handling
categorySchema.pre("save", async function (next) {
	if (!this.isModified("name") && !this.isModified("slug")) return next();
	if (!this.slug) this.slug = slugify(this.name);
	if (!this.slug) return next(new Error("Invalid slug"));

	// Ensure uniqueness by appending -2, -3 ...
	const base = this.slug;
	let candidate = base;
	let i = 2;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const exists = await mongoose.models.Category.findOne({ slug: candidate, _id: { $ne: this._id } });
		if (!exists) break;
		candidate = `${base}-${i}`;
		i += 1;
	}
	this.slug = candidate;
	return next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
