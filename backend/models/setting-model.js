import mongoose from "mongoose";

// Generic key-value settings store. Supports primitive types and nested objects.
// We'll store price range under key "priceRange" => { min: Number, max: Number }.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
