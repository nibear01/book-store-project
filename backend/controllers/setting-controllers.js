import Setting from "../models/setting-model.js";
import User from "../models/user-model.js";
import bcrypt from "bcrypt";

// Helpers
const clampNumber = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

// Simple in-memory cache with TTL to reduce DB hits
const cache = new Map(); // key -> { value, expires }
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

const getSetting = async (key, defVal) => {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value;
  const s = await Setting.findOne({ key }).lean();
  const v = s ? s.value : defVal;
  cache.set(key, { value: v, expires: now + DEFAULT_TTL_MS });
  return v;
};

const setSetting = async (key, value, description = "") => {
  const existing = await Setting.findOne({ key });
  if (existing) {
    existing.value = value;
    if (description) existing.description = description;
    await existing.save();
    // update cache immediately
    cache.set(key, { value, expires: Date.now() + DEFAULT_TTL_MS });
    return existing.toObject();
  }
  const created = await Setting.create({ key, value, description });
  cache.set(key, { value, expires: Date.now() + DEFAULT_TTL_MS });
  return created.toObject();
};

// GET /api/settings/price-range
export const getPriceRange = async (req, res) => {
  try {
    const value = await getSetting("priceRange", { min: 0, max: 1500 });
    // Normalize to numbers
    const out = {
      min: Number(value?.min) || 0,
      max: Number(value?.max) || 1500,
    };
    // Ensure sane ordering
    if (out.min > out.max) {
      const t = out.min;
      out.min = out.max;
      out.max = t;
    }
    return res.json({ success: true, data: out });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to get price range", error: error.message });
  }
};

// PUT /api/settings/price-range
// Body: { min, max }
export const updatePriceRange = async (req, res) => {
  try {
    let { min, max } = req.body || {};
    const nmin = clampNumber(min, 0);
    const nmax = clampNumber(max, 0);

    if (nmin === null || nmax === null) {
      return res.status(400).json({ success: false, message: "min and max must be numbers" });
    }
    if (nmin < 0 || nmax < 0) {
      return res.status(400).json({ success: false, message: "min and max must be >= 0" });
    }

    // Order
    let outMin = nmin;
    let outMax = nmax;
    if (outMin > outMax) {
      const t = outMin;
      outMin = outMax;
      outMax = t;
    }

    const saved = await setSetting("priceRange", { min: outMin, max: outMax }, "Global price filter range for UI");
    return res.json({ success: true, data: saved.value });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update price range", error: error.message });
  }
};

export default { getPriceRange, updatePriceRange };

// ------------------- PRINT PRICING CONFIG -------------------
// Shape stored under key "printPricingConfig":
// {
//   basePerPage: number,               // printing cost per page in base units
//   contentFee: number,                // fixed content price added before margin
//   multipliers: {                     // multipliers per option id
//     quality: { economy: 1, standard: 1.15, premium: 1.3 },
//     side: { single: 1, double: 0.92 },
//     size: { A5: 0.85, A4: 1, A3: 1.25 },
//     color: { bw: 1, color: 1.4 }
//   },
//   margin: { type: 'percent'|'flat', value: number }
// }

const DEFAULT_PRINT_CONFIG = Object.freeze({
  basePerPage: 0.05,
  contentFee: 0,
  multipliers: {
    quality: { economy: 1.0, standard: 1.15, premium: 1.3 },
    side: { single: 1.0, double: 0.92 },
    size: { A5: 0.85, A4: 1.0, A3: 1.25 },
    color: { bw: 1.0, color: 1.4 },
  },
  margin: { type: "percent", value: 10 },
  mode: "derived", // 'derived' | 'relative' (relative adjusts from admin-set book.price as baseline of default options)
});

// GET /api/settings/print-config
export const getPrintConfig = async (req, res) => {
  try {
    const value = await getSetting("printPricingConfig", DEFAULT_PRINT_CONFIG);
    // sanitize numbers
    const cfg = {
      basePerPage: Number(value?.basePerPage) >= 0 ? Number(value.basePerPage) : DEFAULT_PRINT_CONFIG.basePerPage,
      contentFee: Number(value?.contentFee) >= 0 ? Number(value.contentFee) : DEFAULT_PRINT_CONFIG.contentFee,
      multipliers: {
        quality: {
          economy: Number(value?.multipliers?.quality?.economy) || DEFAULT_PRINT_CONFIG.multipliers.quality.economy,
          standard: Number(value?.multipliers?.quality?.standard) || DEFAULT_PRINT_CONFIG.multipliers.quality.standard,
          premium: Number(value?.multipliers?.quality?.premium) || DEFAULT_PRINT_CONFIG.multipliers.quality.premium,
        },
        side: {
          single: Number(value?.multipliers?.side?.single) || DEFAULT_PRINT_CONFIG.multipliers.side.single,
          double: Number(value?.multipliers?.side?.double) || DEFAULT_PRINT_CONFIG.multipliers.side.double,
        },
        size: {
          A5: Number(value?.multipliers?.size?.A5) || DEFAULT_PRINT_CONFIG.multipliers.size.A5,
          A4: Number(value?.multipliers?.size?.A4) || DEFAULT_PRINT_CONFIG.multipliers.size.A4,
          A3: Number(value?.multipliers?.size?.A3) || DEFAULT_PRINT_CONFIG.multipliers.size.A3,
        },
        color: {
          bw: Number(value?.multipliers?.color?.bw) || DEFAULT_PRINT_CONFIG.multipliers.color.bw,
          color: Number(value?.multipliers?.color?.color) || DEFAULT_PRINT_CONFIG.multipliers.color.color,
        },
      },
      margin: {
        type: value?.margin?.type === "flat" ? "flat" : "percent",
        value: Number(value?.margin?.value) || DEFAULT_PRINT_CONFIG.margin.value,
      },
      mode: value?.mode === "relative" ? "relative" : "derived",
    };
    return res.json({ success: true, data: cfg });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to get print config", error: error.message });
  }
};

// PUT /api/settings/print-config
// Body: { basePerPage, multipliers, margin }
export const updatePrintConfig = async (req, res) => {
  try {
    const body = req.body || {};
    let basePerPage = Number(body.basePerPage);
    if (!Number.isFinite(basePerPage) || basePerPage < 0) basePerPage = DEFAULT_PRINT_CONFIG.basePerPage;
    let contentFee = Number(body.contentFee);
    if (!Number.isFinite(contentFee) || contentFee < 0) contentFee = DEFAULT_PRINT_CONFIG.contentFee;

    const safeNum = (v, def) => (Number.isFinite(Number(v)) ? Number(v) : def);

    const multipliers = {
      quality: {
        economy: safeNum(body?.multipliers?.quality?.economy, DEFAULT_PRINT_CONFIG.multipliers.quality.economy),
        standard: safeNum(body?.multipliers?.quality?.standard, DEFAULT_PRINT_CONFIG.multipliers.quality.standard),
        premium: safeNum(body?.multipliers?.quality?.premium, DEFAULT_PRINT_CONFIG.multipliers.quality.premium),
      },
      side: {
        single: safeNum(body?.multipliers?.side?.single, DEFAULT_PRINT_CONFIG.multipliers.side.single),
        double: safeNum(body?.multipliers?.side?.double, DEFAULT_PRINT_CONFIG.multipliers.side.double),
      },
      size: {
        A5: safeNum(body?.multipliers?.size?.A5, DEFAULT_PRINT_CONFIG.multipliers.size.A5),
        A4: safeNum(body?.multipliers?.size?.A4, DEFAULT_PRINT_CONFIG.multipliers.size.A4),
        A3: safeNum(body?.multipliers?.size?.A3, DEFAULT_PRINT_CONFIG.multipliers.size.A3),
      },
      color: {
        bw: safeNum(body?.multipliers?.color?.bw, DEFAULT_PRINT_CONFIG.multipliers.color.bw),
        color: safeNum(body?.multipliers?.color?.color, DEFAULT_PRINT_CONFIG.multipliers.color.color),
      },
    };

    const marginType = body?.margin?.type === "flat" ? "flat" : "percent";
    let marginValue = Number(body?.margin?.value);
    if (!Number.isFinite(marginValue) || marginValue < 0) marginValue = DEFAULT_PRINT_CONFIG.margin.value;
    const margin = { type: marginType, value: marginValue };

    const mode = body?.mode === "relative" ? "relative" : "derived";

    const saved = await setSetting(
      "printPricingConfig",
      { basePerPage, contentFee, multipliers, margin, mode },
      "Global print-on-demand pricing configuration"
    );
    return res.json({ success: true, data: saved.value });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update print config", error: error.message });
  }
};

export const __printDefaults = DEFAULT_PRINT_CONFIG;

// ------------------- DELIVERY COST CONFIG -------------------
// Shape stored under key "deliveryCost":
// {
//   insideDhaka: number,
//   outsideDhaka: number
// }

const DEFAULT_DELIVERY_COST = Object.freeze({
  insideDhaka: 60,
  outsideDhaka: 120,
});

// GET /api/settings/delivery-cost
export const getDeliveryCost = async (req, res) => {
  try {
    const value = await getSetting("deliveryCost", DEFAULT_DELIVERY_COST);
    const cost = {
      insideDhaka: Number(value?.insideDhaka) >= 0 ? Number(value.insideDhaka) : DEFAULT_DELIVERY_COST.insideDhaka,
      outsideDhaka: Number(value?.outsideDhaka) >= 0 ? Number(value.outsideDhaka) : DEFAULT_DELIVERY_COST.outsideDhaka,
    };
    return res.json({ success: true, data: cost });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to get delivery cost", error: error.message });
  }
};

// PUT /api/settings/delivery-cost
// Body: { insideDhaka, outsideDhaka }
export const updateDeliveryCost = async (req, res) => {
  try {
    let { insideDhaka, outsideDhaka } = req.body || {};
    const inside = clampNumber(insideDhaka, 0);
    const outside = clampNumber(outsideDhaka, 0);

    if (inside === null || outside === null) {
      return res.status(400).json({ success: false, message: "insideDhaka and outsideDhaka must be numbers" });
    }
    if (inside < 0 || outside < 0) {
      return res.status(400).json({ success: false, message: "Delivery costs must be >= 0" });
    }

    const saved = await setSetting(
      "deliveryCost",
      { insideDhaka: inside, outsideDhaka: outside },
      "Delivery costs for inside and outside Dhaka"
    );
    return res.json({ success: true, data: saved.value });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update delivery cost", error: error.message });
  }
};

export const __deliveryCostDefaults = DEFAULT_DELIVERY_COST;

// ------------------- PROFILE SETTINGS -------------------
// GET /api/settings/profile
// Returns the current logged-in admin user's profile information
export const getProfileSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({ 
      success: true, 
      data: {
        name: user.name,
        email: user.email,
        roles: user.roles || (user.role ? [user.role] : []),
        profile_image: user.profile_image,
        status: user.status
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to get profile settings", 
      error: error.message 
    });
  }
};

// PUT /api/settings/profile
// Updates the current logged-in admin user's profile
// Body: { name, email, currentPassword, password }
export const updateProfileSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, currentPassword, password } = req.body;

    // Find user with password for verification
    const user = await User.findById(userId).select("+password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    // Handle password change
    if (password || currentPassword) {
      // Require current password for verification
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password"
        });
      }

      // Verify current password — supports both bcrypt hashes and legacy plain text
      const isBcrypt = user.password && user.password.startsWith('$2');
      let isMatch = false;
      if (isBcrypt) {
          isMatch = await bcrypt.compare(currentPassword, user.password);
      } else {
          isMatch = user.password === currentPassword;
      }
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Validate new password
      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long"
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    // Update other fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    // Save with validation disabled for fields we're not updating
    await user.save({ validateModifiedOnly: true });

    // Return updated user without password
    const updatedUser = await User.findById(userId).select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update profile", 
      error: error.message 
    });
  }
};
