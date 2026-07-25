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
      default: [ROLES_LIST.CUSTOMER], // New signups start as CUSTOMER
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);