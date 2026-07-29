import express from 'express';
import { getUserAddresses,  } from '../controllers/userController.js';
import auth from "../middleware/authMiddleware.js"; // Adjust pathway to your JWT middleware

const router = express.Router();

// Apply auth middleware so only logged-in users can place orders
router.use(auth);

// GET /api/users/addresses
router.get('/addresses', getUserAddresses);

// PUT /api/users/addresses/:addressId
// router.put('/addresses/:addressId', updateAddress);

export default router;