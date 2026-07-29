import Product from '../models/Product.js';


/**
 * Calculates cart totals by fetching real product data from MongoDB.
 * @param {Array<{ id: string, quantity: number }>} cartItems - Cart items from frontend
 * @returns {Promise<{ verifiedItems: Array, totalPrice: number, totalItems: number }>}
 */
export async function calculateCartTotal(cartItems) {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { verifiedItems: [], totalPrice: 0, totalItems: 0 };
  }

  // 1. Extract all product IDs from the incoming cart array
  const productIds = cartItems.map((item) => item._id || item.id);

  // 2. Fetch matching products in a single database query
  const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();

  // 3. Create a Quick-Lookup Map
  const productMap = new Map(
    dbProducts.map((p) => [p._id.toString(), p])
  );

  let totalPrice = 0;
  let totalItems = 0;
  const verifiedItems = [];

  // 4. Calculate total using official database values
  for (const item of cartItems) {
    const itemId = (item._id || item.id)?.toString();
    const dbProduct = productMap.get(itemId);

    if (!dbProduct) continue;

    const rawQty = Math.max(1, parseInt(item.quantity) || 1);
    const validQuantity = dbProduct.stock !== undefined 
      ? Math.min(rawQty, dbProduct.stock) 
      : rawQty;

    const itemTotal = dbProduct.price * validQuantity;

    totalPrice += itemTotal;
    totalItems += validQuantity;

    // Matches `orderSchema.items` array structure:
    verifiedItems.push({
      product: dbProduct._id,           // Matches schema `product: ObjectId`
      quantity: validQuantity,          // Matches schema `quantity`
      priceAtPurchase: dbProduct.price, // Matches schema `priceAtPurchase`
    });
  }

  return {
    verifiedItems,
    totalItems,
    totalPrice: Number(totalPrice.toFixed(2)),
  };
}
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