// backend/models/order-model.js
import mongoose from 'mongoose';

// Internal workflow stages (linear business flow)
export const INTERNAL_STAGES = [
  'OM_INTAKE',              // Order Manager received
  'CSM_ADDRESS_CHECK',      // Customer Support verifying address
  'CSM_CLARIFIED',          // Address / customer clarified, ready for Finance
  'FM_REVIEW',              // Finance reviewing payment
  'FM_APPROVED',            // Finance approved -> Printing queue next
  'FM_REJECTED',            // Finance rejected (terminal cancelled)
  'PM_QUEUE',               // Printing manager queued
  'PM_PREP',                // Preparing print
  'PM_RUN',                 // Printing in progress
  'PM_FINISH',              // Printing finished -> Delivery queue next
  'DM_QUEUE',               // Delivery queued
  'DM_PACKING',             // Packing
  'DM_IN_TRANSIT',          // In transit between facilities
  'DM_OUT_FOR_DELIVERY',    // Out for final delivery
  'DM_DELIVERED',           // Delivered to customer
  'CSM_FEEDBACK',           // Post-delivery feedback collection by CSM
  'OM_COMPLETED',           // Final confirmation by Order Manager (terminal success)
  'TERMINATED_OM',          // Terminated early by OM (terminal cancelled)
  'CANCELLED_CSM',          // Cancelled during CSM phase (terminal cancelled)
  'CANCELLED_FM'            // Cancelled by Finance (terminal cancelled)
];

export const TERMINAL_STAGES = [
  'OM_COMPLETED', 'TERMINATED_OM', 'CANCELLED_CSM', 'CANCELLED_FM', 'FM_REJECTED'
];

// History subdocument for audit trail
const workflowHistorySchema = new mongoose.Schema({
  from: { type: String },
  to: { type: String, required: true },
  role: { type: String }, // role string e.g. order_manager, customer_support, admin
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String, trim: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    book_title: { type: String, required: true },
    book_cover: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    configured: { type: Boolean, default: false },
    variant: {
      paperQuality: { type: String, default: null },
      printSide: { type: String, default: null },
      paperSize: { type: String, default: null },
      colorMode: { type: String, default: null },
    },
    pricing: {
      contentPrice: { type: Number, default: null },
      printCost: { type: Number, default: null },
      margin: { type: Number, default: null },
      baseCost: { type: Number, default: null },
      finalPrice: { type: Number, default: null },
    }
  }],
  // Pricing breakdown
  subtotal_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  discount_label: { type: String, default: '' },
  shipping_amount: { type: Number, default: 0 },
  grand_total: { type: Number, required: true },
  total_amount: { type: Number, required: true }, // mirrors grand_total for backward compatibility

  // Public (customer-facing) simplified status
  order_status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Internal current workflow stage (single source of truth internally)
  internal_stage: {
    type: String,
    enum: INTERNAL_STAGES,
    default: 'OM_INTAKE',
    index: true
  },

  // Current handler role (which queue / dashboard should show the order)
  current_handler_role: {
    type: String,
    enum: [
      'order_manager',
      'customer_support',
      'finance_manager',
      'printing_manager',
      'delivery_manager',
      'admin'
    ],
    default: 'order_manager',
    index: true
  },

  // Audit trail for all transitions
  workflow_history: [workflowHistorySchema],

  // Optional cancellation reason text
  cancellation_reason: { type: String, trim: true },

  shipping_address: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    shippingLocation: String // insideDhaka | outsideDhaka (decides shipping cost)
  },

  payment_info: {
    method: { type: String, required: true },
    status: { type: String, default: 'pending' }, // pending | paid | refunded etc.
    reviewed_at: { type: Date },
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true }
  }
}, { timestamps: true });

// Compound index for dashboard filtering by handler role + stage chronological
orderSchema.index({ current_handler_role: 1, internal_stage: 1, createdAt: -1 });

// Map internal stage to public customer-facing status (kept concise for storefront)
function mapInternalToPublic(stage) {
  if (!stage) return 'pending';
  if (['TERMINATED_OM','CANCELLED_CSM','CANCELLED_FM','FM_REJECTED'].includes(stage)) return 'cancelled';
  if (['DM_OUT_FOR_DELIVERY'].includes(stage)) return 'shipped';
  if (['DM_DELIVERED','CSM_FEEDBACK','OM_COMPLETED'].includes(stage)) return 'delivered';
  if ([
    'FM_APPROVED','PM_QUEUE','PM_PREP','PM_RUN','PM_FINISH',
    'DM_QUEUE','DM_PACKING','DM_IN_TRANSIT'
  ].includes(stage)) return 'processing';
  return 'pending';
}

// Pre-save hook: keep order_status synchronized automatically
orderSchema.pre('save', function(next) {
  if (this.isModified('internal_stage')) {
    this.order_status = mapInternalToPublic(this.internal_stage);
  }
  next();
});

// Instance method to advance stage (service/controller should validate transition & role)
orderSchema.methods.advance = function(nextStage, { userId, role, remarks, nextHandlerRole } = {}) {
  if (TERMINAL_STAGES.includes(this.internal_stage)) {
    throw new Error('Order already in a terminal stage');
  }
  this.workflow_history.push({
    from: this.internal_stage,
    to: nextStage,
    role,
    changedBy: userId,
    remarks
  });
  this.internal_stage = nextStage;
  // nextHandlerRole indicates which queue owns it after transition; fallback to existing
  if (nextHandlerRole) {
    this.current_handler_role = nextHandlerRole;
  }
};

export default mongoose.model('Order', orderSchema);