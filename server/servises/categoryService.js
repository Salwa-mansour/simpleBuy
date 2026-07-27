import Category from '../models/Category.js';

// --- CREATE ---
export const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

// --- READ ALL ---
export const getAllCategories = async () => {
  return await Category.find().sort({ createdAt: -1 });
};

// --- READ BY ID ---
export const getCategoryById = async (id) => {
 
  return await Category.findById(id);
};

// --- UPDATE ---
export const updateCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(
    id,
    updateData,
    { returnDocument: 'after', runValidators: true } // Return updated doc & run schema validations
  );
};

// --- DELETE ---
export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};