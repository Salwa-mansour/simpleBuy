import Product from '../models/Product.js';

// --- CREATE ---
export const createProduct = async (productData) => {
  return await Product.create(productData);
};

// --- READ ALL ---
export const getAllProducts = async (queryParams = {}) => {
  const filter = {};
  
  // Optional: filter products by category if passed in query string (e.g. /api/products?category=ID)
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  // .populate('category') fills in the full category details instead of just the ObjectId
  return await Product.find(filter)
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
};

// --- READ BY ID ---
export const getProductById = async (id) => {
  return await Product.findById(id).populate('category', 'name description');
};

// --- UPDATE ---
export const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(
    id,
    updateData,
    {  returnDocument: 'after', runValidators: true }
  ).populate('category', 'name description');
};

// --- DELETE ---
export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};