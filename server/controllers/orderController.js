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
  const saveTheNewAddress = req.body.saveTheNewAddress;

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
  if(saveTheNewAddress){
  await updateUserAddressService(userId, addressData);
  }
  
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


