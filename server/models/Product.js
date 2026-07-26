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
  }, // e.g. 19.99
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
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);