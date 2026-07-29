import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';


export const createBendingOrderService =async(userId,shippingAddress,orderItems,totalAmount)=>{
  // 4. Create and persist the new Order

  const newOrder = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      address: shippingAddress.address,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    totalAmount,
   
    status: 'pending',
  });

  return newOrder;
}


export const vierifyAndUpdateOrder = async ({ userId, orderId, paymentData }) => {
  // 1. Find order by ID
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Authorization check: ensure order belongs to the authenticated user
  if (order.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this order.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Prevent duplicate updates if order is already processed
  if (order.status === 'paid') {
    return order; // Already completed, return early safely
  }

  // 4. Extract PayPal details
  const captureStatus = paymentData.status; // e.g. 'COMPLETED'
  const paymentDetails = paymentData.purchase_units?.[0]?.payments?.captures?.[0];
  const detailedStatus = paymentDetails?.status || captureStatus; // fallback to top status

  // 5. Update payment details
  order.paymentInfo.id = paymentData.id || paymentDetails?.id;
  order.paymentInfo.status = detailedStatus; // 'COMPLETED', 'PENDING', 'DECLINED', etc.

  // 6. Handle status transition
  if (captureStatus === 'COMPLETED' || detailedStatus === 'COMPLETED') {
    order.status = 'paid'; // Set top-level order status to paid

    // Option A: Deduct stock from Product model upon successful payment
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  } else if (['DECLINED', 'FAILED'].includes(detailedStatus)) {
    order.status = 'failed';
  } else if (detailedStatus === 'PENDING') {
    order.status = 'pending';
  }

  // 7. Save updated order document
  await order.save();

  return order;
};
export const createOrderService = async ({ userId, items, shippingAddress, paymentProvider, saveAddress }) => {
  // 1. Fetch products from DB to verify existence and get real server-side prices
  const productIds = items.map((item) => item.product);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  if (dbProducts.length !== items.length) {
    const error = new Error('One or more items in your cart are invalid or missing.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Build verified order items & calculate total price
  let subtotal = 0;
  const verifiedOrderItems = items.map((item) => {
    const dbProduct = dbProducts.find((p) => p._id.toString() === item.product);
    const price = dbProduct.price;

    subtotal += price * item.quantity;

    return {
      product: dbProduct._id,
      quantity: item.quantity,
      priceAtPurchase: price,
    };
  });

  // Calculate shipping (e.g., free shipping over $50)
  const shippingFee = subtotal > 50 ? 0 : 5.99;
  const totalAmount = parseFloat((subtotal + shippingFee).toFixed(2));

  // 3. Save address to User profile if requested
  if (saveAddress) {
    await saveAddressToUserProfile(userId, shippingAddress);
  }

  // 4. Create and persist the new Order
  const newOrder = await Order.create({
    user: userId,
    items: verifiedOrderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      address: shippingAddress.address,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    totalAmount,
    paymentProvider: paymentProvider || 'paypal',
    status: 'pending',
  });

  return newOrder;
};

/**
 * Helper function to push a new address to a user's address array if not already saved.
 */
const saveAddressToUserProfile = async (userId, shippingAddress) => {
  const user = await User.findById(userId);
  if (!user) return;

  const { fullName, address, city, postalCode, country } = shippingAddress;

  const addressExists = user.addresses.some(
    (addr) =>
      addr.address.toLowerCase() === address.toLowerCase() &&
      addr.postalCode.toLowerCase() === postalCode.toLowerCase()
  );

  if (!addressExists) {
    user.addresses.push({
      fullName,
      address,
      city,
      postalCode,
      country,
      isDefault: user.addresses.length === 0,
    });
    await user.save();
  }
};
export const verifyAndPayOrderService = async ({ orderId, userId, paymentId, paymentProvider }) => {
  // 1. Find order by ID
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Authorization check: ensure order belongs to the authenticated user
  if (order.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this order.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Prevent re-paying an already processed order
  if (order.status === 'paid') {
    const error = new Error('Order is already marked as paid.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Update order details
  order.status = 'paid';
  order.paymentId = paymentId;
  if (paymentProvider) {
    order.paymentProvider = paymentProvider;
  }

  const updatedOrder = await order.save();
  return updatedOrder;
};

// export const getUserAddressesService = async (userId) => {
//   const user = await User.findById(userId).select('addresses');

//   if (!user) {
//     const error = new Error('User not found.');
//     error.statusCode = 404;
//     throw error;
//   }

//   return user.addresses || [];
// };
