import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 1, 
    min: 0 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  // --- NEW SHIPPING DATA ---
  weight: {
    value: { type: Number, required: true, default: 1 }, // e.g. 1.5
    unit: { type: String, enum: ['lb', 'oz', 'kg', 'g'], default: 'g' }
  },
  dimensions: {
    length: { type: Number, required: true, default: 6 }, // e.g. 6 inches
    width: { type: Number, required: true, default: 4 },  // e.g. 4 inches
    height: { type: Number, required: true, default: 2 }, // e.g. 2 inches
    unit: { type: String, enum: ['in', 'cm'], default: 'in' }
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);