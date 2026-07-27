import catchAsync from '../utils/catchAsyncError.js';
import * as categoryService from "../servises/categoryService.js";

// --- CREATE ---
export const createNewCategory = catchAsync(async (req, res, next) => {
 
  const newCategory = {
    name: req.body.categoryName,
    description: req.body.description
  };

  const category = await categoryService.createCategory(newCategory);
  return res.status(201).json(category);
});

// --- READ (GET ALL) ---
export const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryService.getAllCategories();
  return res.status(200).json(categories);
});

// --- READ (GET ONE BY ID) ---
export const getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await categoryService.getCategoryById(id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.status(200).json(category);
});

// --- UPDATE ---
export const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = {
    name: req.body.categoryName,
    description: req.body.description
  };

  const updatedCategory = await categoryService.updateCategory(id, updateData);

  if (!updatedCategory) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.status(200).json(updatedCategory);
});

// --- DELETE ---
export const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedCategory = await categoryService.deleteCategory(id);

  if (!deletedCategory) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.status(200).json({ message: 'Category deleted successfully' });
});