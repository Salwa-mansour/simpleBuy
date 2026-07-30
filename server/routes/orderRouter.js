import express from 'express';
import { approveOrderPayment ,registerOrderWithPayment} from '../controllers/orderController.js';
import auth from "../middleware/authMiddleware.js"; // Adjust pathway to your JWT middleware

const router = express.Router();

// Apply auth middleware so only logged-in users can place orders
router.use(auth);

// POST /api/orders
// router.post('/', createOrder);


// router.put('/:id/pay', updateOrderToPaid);
router.post("/register",registerOrderWithPayment);
router.post("/approve",approveOrderPayment);

export default router;