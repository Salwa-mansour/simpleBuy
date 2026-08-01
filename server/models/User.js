import mongoose from 'mongoose';
import ROLES_LIST from '../config/rolesList.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    roles: {
      type: [Number],
      enum: Object.values(ROLES_LIST),
      default: [ROLES_LIST.CUSTOMER],
    },
    // Single nested address object instead of an array
    address: {
      fullName: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      postalCode: { type: String, default: null },
      country: { type: String, default: null },
      state: { type: String, default: null }
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);