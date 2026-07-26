import { Router } from 'express';
const router = Router();
import ROLES_LIST from '../config/rolesList.js';
import * as categoryController from "../controllers/categoryContoller.js";
import verifyRoles from "../middleware/verifyRoles.js";
import auth from "../middleware/authMiddleware.js";

// --- CREATE ---
// Admin only: Create a new category
router.post('/create', auth, verifyRoles(ROLES_LIST.ADMIN), categoryController.createNewCategory);

// --- READ ---
// Public: Get all categories
router.get('/', categoryController.getAllCategories);

// Public: Get a single category by ID
router.get('/:id', categoryController.getCategoryById);

// --- UPDATE ---
// Admin only: Edit/Update a category by ID
router.put('/:id', auth, verifyRoles(ROLES_LIST.ADMIN), categoryController.updateCategory);

// --- DELETE ---
// Admin only: Delete a category by ID
router.delete('/:id', auth, verifyRoles(ROLES_LIST.ADMIN), categoryController.deleteCategory);

export default router;