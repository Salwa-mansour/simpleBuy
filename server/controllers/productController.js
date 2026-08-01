import catchAsync from '../utils/catchAsyncError.js';
import * as productService from "../servises/productService.js";

// --- CREATE ---
export const createProduct = catchAsync(async (req, res, next) => {

  const newProductData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    category: req.body.category || req.body.categoryId,
    imageUrl: req.body.imageUrl,

    // --- NEW SHIPPING DATA ---
    // Handle weight object or direct weight value
    ...(req.body.weight && {
      weight: typeof req.body.weight === 'object' 
        ? req.body.weight 
        : { value: req.body.weight }
    }),

    // Handle dimensions object or direct length/width/height values
    ...(req.body.dimensions && {
      dimensions: req.body.dimensions
    })
  };

  // If dimensions were sent flat in req.body (e.g., req.body.length, req.body.width, req.body.height)
  if (!req.body.dimensions && (req.body.length || req.body.width || req.body.height)) {
    newProductData.dimensions = {
      length: req.body.length,
      width: req.body.width,
      height: req.body.height,
      unit: req.body.dimensionUnit || 'in'
    };
  }

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
    category: req.body.categoryId || req.body.category,
    imageUrl: req.body.imageUrl,

    // --- NEW SHIPPING DATA ---
    ...(req.body.weight && {
      weight: typeof req.body.weight === 'object' 
        ? req.body.weight 
        : { value: req.body.weight }
    }),

    ...(req.body.dimensions && {
      dimensions: req.body.dimensions
    })
  };

  // If dimensions are sent flat (e.g. req.body.length, req.body.width, req.body.height)
  if (!req.body.dimensions && (req.body.length || req.body.width || req.body.height)) {
    updateData.dimensions = {
      length: req.body.length,
      width: req.body.width,
      height: req.body.height,
      unit: req.body.dimensionUnit || 'in'
    };
  }

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