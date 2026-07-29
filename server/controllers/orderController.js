import { createBendingOrderService ,vierifyAndUpdateOrder} from "../servises/orderService.js";
import { updateUserAddressService } from "../servises/userService.js";
import { calculateCartTotal } from "../servises/productService.js";
import { createPayPalOrderService,capturePayPalOrderService } from "../servises/paypalService.js";
import catchAsync from "../utils/catchAsyncError.js";

/**
 * @desc   Create a new order & initiate PayPal payment
 * @route  POST /api/orders
 * @access Private
 */
export const registerOrderWithPayment = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;
  
  const addressData = req.body.shippingAddress;
  const cartItems = req.body.items;

  // 1. Basic payload validations
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided.' });
  }

  if (!addressData) {
    return res.status(400).json({ message: 'Shipping address is required.' });
  }

  // 2. Validate products & prices directly against DB
  const { verifiedItems, totalPrice } = await calculateCartTotal(cartItems);

  if (!verifiedItems || verifiedItems.length === 0) {
    return res.status(400).json({ message: 'Selected items are invalid or out of stock.' });
  }

  // 3. Save / Update User Address
  await updateUserAddressService(userId, addressData);

  // 4. Create pending DB order with verified items
  const order = await createBendingOrderService(userId, addressData, verifiedItems, totalPrice);

  // 5. Create PayPal payment session
  const paypalOrder = await createPayPalOrderService(totalPrice);

  // 6. Send response
 return res.status(201).json({
    orderID: order._id,
    paymentId: paypalOrder.id,
    paymentStatus: paypalOrder.status,
  });
});

export const approveOrderPayment = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;
  const orderId = req.body.orderID;
  const paymentId = req.body.paymentId;
  console.log('aprove')
  console.log({userId,orderId,paymentId})
  // 1. Basic validation
  if (!orderId || !paymentId) {
    return res.status(400).json({ message: 'Both orderID and paymentId are required.' });
  }

  // 2. Capture payment with PayPal
  const paymentData = await capturePayPalOrderService(paymentId);

  // 3. Verify order ownership & update DB status (Passing as an object)
  const order = await vierifyAndUpdateOrder({ userId, orderId, paymentData });

  // 4. Return updated order
  return res.status(200).json({
    success: true,
    data: order,
  });
});

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentProvider, saveAddress } = req.body;
    const userId = req.user; // Set by verifyJWT middleware

    // Basic HTTP request validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided.' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required.' });
    }

    const { fullName, address, city, postalCode, country } = shippingAddress;
    if (!fullName || !address || !city || !postalCode || !country) {
      return res.status(400).json({ message: 'Please provide all required shipping fields.' });
    }

    // Call service layer to process order business logic
    const order = await createOrderService({
      userId,
      items,
      shippingAddress,
      paymentProvider,
      saveAddress,
    });

    return res.status(201).json({
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error creating order.',
    });
  }
};

export const updateOrderToPaid = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { paymentId, paymentProvider } = req.body;
    const userId = req.user; // Set by verifyJWT middleware

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment transaction ID is required.' });
    }

    const updatedOrder = await verifyAndPayOrderService({
      orderId,
      userId,
      paymentId,
      paymentProvider,
    });

    return res.status(200).json({
      message: 'Payment verified and order updated to paid.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error processing payment update.',
    });
  }
};