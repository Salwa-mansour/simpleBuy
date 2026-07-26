import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
    required: true 
  }, // PayPal transaction or order ID
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'shipped', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);