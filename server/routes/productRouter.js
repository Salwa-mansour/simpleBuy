import { Router } from 'express';
const router = Router();
import ROLES_LIST from '../config/rolesList.js';
import * as productController from "../controllers/productController.js";
import verifyRoles from "../middleware/verifyRoles.js";
import auth from "../middleware/authMiddleware.js";

// --- CREATE ---
// Admin only: Create a new product
router.post('/create', auth, verifyRoles(ROLES_LIST.ADMIN), productController.createProduct);

// --- READ ---
// Public: Browse all products (supports optional category query filter e.g. /api/products?category=ID)
router.get('/', productController.getAllProducts);

// Public: Get a single product details by ID
router.get('/:id', productController.getProductById);

// --- UPDATE ---
// Admin only: Edit/Update product details or stock
router.put('/:id', auth, verifyRoles(ROLES_LIST.ADMIN), productController.updateProduct);

// --- DELETE ---
// Admin only: Remove a product by ID
router.delete('/:id', auth, verifyRoles(ROLES_LIST.ADMIN), productController.deleteProduct);

export default router;