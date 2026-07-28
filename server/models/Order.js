import mongoose from 'mongoose';

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false } // No separate ID needed for embedded address snapshots
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
        // Save price at moment of purchase so future price changes don't corrupt history
        priceAtPurchase: { 
          type: Number, 
          required: true 
        } 
      }
    ],
    // Snapshot of shipping info at the exact moment of order placement
    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    paymentProvider: { 
      type: String, 
      enum: ['paypal', 'stripe'], 
      default: 'paypal' 
    },
    paymentId: { 
      type: String, 
      default: null 
    }, // Set once payment verification completes
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'shipped', 'cancelled'], 
      default: 'pending' 
    }
  }, 
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);