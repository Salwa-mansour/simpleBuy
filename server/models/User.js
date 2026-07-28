import mongoose from 'mongoose';
import ROLES_LIST from '../config/rolesList.js';


const userAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

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
    // Array of saved addresses for checkout convenience
    addresses: [userAddressSchema],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);