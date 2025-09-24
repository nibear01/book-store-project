import Category from "../models/category-model.js";

// Default categories to seed (names should match book.genre values for counts)
const DEFAULT_CATEGORIES = [
  { name: "Programming", description: "Coding, software development and related topics" },
  { name: "Science Fiction", description: "Sci-fi and speculative futures" },
  { name: "Romance", description: "Love and relationship stories" },
  { name: "Fantasy", description: "Fantasy worlds, magic and epic tales" },
  { name: "Classic", description: "Classic literature and timeless works" },
  { name: "Mystery", description: "Whodunits, thrillers and detective stories" },
  { name: "Adventure", description: "Action and exploration stories" },
];

export const seedDefaultCategories = async () => {
  const existing = await Category.countDocuments();
  if (existing > 0) return { seeded: false, message: "Categories already exist" };

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, order: idx }))
  );
  return { seeded: true, message: `Seeded ${DEFAULT_CATEGORIES.length} categories` };
};

export default seedDefaultCategories;
