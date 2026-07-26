import catchAsync from '../utils/catchAsyncError.js';
import * as productService from "../servises/productService.js";

// --- CREATE ---
export const createProduct = catchAsync(async (req, res, next) => {
  const newProductData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.categoryId,
    imageUrl: req.body.imageUrl
  };

  const product = await productService.createProduct(newProductData);
  return res.status(201).json(product);
});

// --- READ (GET ALL) ---
export const getAllProducts = catchAsync(async (req, res, next) => {
  // Pass query parameters (like filtering by category or sorting) if needed
  const products = await productService.getAllProducts(req.query);
  return res.status(200).json(products);
});

// --- READ (GET ONE BY ID) ---
export const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(product);
});

// --- UPDATE ---
export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.categoryId,
    imageUrl: req.body.imageUrl
  };

  const updatedProduct = await productService.updateProduct(id, updateData);

  if (!updatedProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(updatedProduct);
});

// --- DELETE ---
export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedProduct = await productService.deleteProduct(id);

  if (!deletedProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json({ message: 'Product deleted successfully' });
});