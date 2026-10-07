import multer from "multer";
import fs from "fs";
import path from "path";
import { BACKEND_ROOT } from "../utils/paths.js";

const uploadRoot = path.resolve(BACKEND_ROOT, "uploads");
const imgDir = path.join(uploadRoot, "images", "books");
const fileDir = path.join(uploadRoot, "files", "books");
const userImgDir = path.join(uploadRoot, "images", "users"); // added
const authorImgDir = path.join(uploadRoot, "images", "authors"); // added
const publisherImgDir = path.join(uploadRoot, "images", "publishers"); // added
const tmpDir = path.join(uploadRoot, "tmp"); // short-lived imports (CSV), never served

// Ensure upload directories exist
for (const dir of [imgDir, fileDir, userImgDir, authorImgDir, publisherImgDir, tmpDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover_image") return cb(null, imgDir);
    if (file.fieldname === "file_url") return cb(null, fileDir);
    if (file.fieldname === "profile_image") return cb(null, userImgDir); // added
    if (file.fieldname === "photo") return cb(null, authorImgDir); // added (author profile)
    if (file.fieldname === "logo") return cb(null, publisherImgDir); // added (publisher logo)
    // NEW: bulk fields
    if (file.fieldname === "bulk_images") return cb(null, imgDir);
    if (file.fieldname === "bulk_files") return cb(null, fileDir);
    return cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    cb(null, `${ts}-${safe}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cover_image") {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Invalid image file type"), false);
  }
  if (file.fieldname === "file_url") {
    const allowed = new Set(["application/pdf", "application/epub+zip"]);
    if (allowed.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Invalid book file type"), false);
  }
  if (file.fieldname === "profile_image") {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true); // added
    return cb(new Error("Invalid profile image file type"), false);
  }
  if (file.fieldname === "photo") {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true); // added (author profile)
    return cb(new Error("Invalid author photo file type"), false);
  }
  if (file.fieldname === "logo") {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true); // added (publisher logo)
    return cb(new Error("Invalid publisher logo file type"), false);
  }
  // NEW: bulk fields
  if (file.fieldname === "bulk_images") {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Invalid bulk image file type"), false);
  }
  if (file.fieldname === "bulk_files") {
    const allowed = new Set(["application/pdf", "application/epub+zip"]);
    if (allowed.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Invalid bulk book file type"), false);
  }
  cb(null, false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 6, // 5 images + 1 book file
  },
});

// Preconfigured middleware for book assets
export const uploadBookAssets = upload.fields([
  { name: "cover_image", maxCount: 5 },
  { name: "file_url", maxCount: 1 },
]);

// NEW: bulk uploader with larger limits
const uploadBulk = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 500, // bulk
  },
});

export const uploadBulkAssets = uploadBulk.fields([
  { name: "bulk_images", maxCount: 400 },
  { name: "bulk_files", maxCount: 100 },
]);

// CSV import (single file in field "file"), stored in uploads/tmp and deleted after processing
const CSV_TYPES = new Set(["text/csv", "application/vnd.ms-excel", "text/plain", "application/csv"]);
export const uploadCsv = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tmpDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.csv`),
  }),
  fileFilter: (req, file, cb) => {
    if (CSV_TYPES.has(file.mimetype) || /\.csv$/i.test(file.originalname)) return cb(null, true);
    return cb(new Error("Please upload a .csv file"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("file");

// Author profile photo (single)
export const uploadAuthorPhoto = upload.single("photo"); // added

// Publisher logo (single)
export const uploadPublisherLogo = upload.single("logo"); // added

// Optional export if you need paths elsewhere
export const uploadPaths = { uploadRoot, imgDir, fileDir, userImgDir, authorImgDir, publisherImgDir }; // added publisherImgDir
