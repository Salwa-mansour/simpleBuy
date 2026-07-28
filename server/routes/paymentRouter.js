import express from 'express';
import { createPayPalOrder ,capturePayPalOrder } from '../controllers/paymentController.js';
import auth from "../middleware/authMiddleware.js"; // Adjust pathway to your JWT middleware

const router = express.Router();

// Apply auth middleware so only logged-in users can place orders
router.use(auth);
// 1. Create PayPal Order
router.post('/create-paypal-order',  createPayPalOrder);

// 2. Capture PayPal Order
router.post('/capture-paypal-order', capturePayPalOrder);

export default router;