import mongoose from 'mongoose';

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, default: null }
  },
  { _id: false }
);

// --- NEW SHIPPING METADATA SCHEMA ---
const shippingDetailsSchema = new mongoose.Schema(
  {
    rateId: { type: String }, // Shippo rate ID selected by customer
    carrier: { type: String }, // e.g., 'USPS', 'FedEx', 'UPS'
    serviceName: { type: String }, // e.g., 'Priority Mail', 'Ground Advantage'
    shippingCost: { type: Number, default: 0 }, // Cost charged for shipping
    
    // Label & Tracking info generated after purchasing via Shippo
    transactionId: { type: String }, // Shippo transaction object ID
    trackingNumber: { type: String }, // e.g., 9400100000000000000000
    trackingUrl: { type: String },
    labelUrl: { type: String } // Printable PDF URL provided by Shippo
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Product', 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true, 
          default: 1 
        },
        priceAtPurchase: { 
          type: Number, 
          required: true 
        } 
      }
    ],
    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    // --- NEW SHIPPING DATA ATTACHMENT ---
    shippingDetails: {
      type: shippingDetailsSchema,
      default: () => ({})
    },
    subtotal: { 
      type: Number, 
      required: true 
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    paymentInfo: {
      id: { type: String },
      status: { 
        type: String, 
        enum: ['COMPLETED', 'DECLINED', 'PENDING','FAILED','REFUNDED'], 
        default: 'PENDING' 
      },
      provider: { 
        type: String, 
        enum: ['paypal', 'stripe'], 
        default: 'paypal' 
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'label_created', 'shipped', 'delivered', 'failed', 'cancelled'], 
      default: 'pending' 
    }
  }, 
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);