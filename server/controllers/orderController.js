import { createBendingOrderService ,verifyAndUpdateOrder} from "../servises/orderService.js";
import { updateUserAddressService } from "../servises/userService.js";
import { calculateCartTotal } from "../servises/productService.js";
import { createPayPalOrderService,capturePayPalOrderService } from "../servises/paypalService.js";
import * as shippingService from "../servises/shippingService.js";
import catchAsync from "../utils/catchAsyncError.js";
import { json } from "express";


export const getShippingOptions = catchAsync(async (req, res, next) => {
   const addressData = req.body.shippingAddress;
   const cartItems = req.body.items;

   const {verifiedItems,totalPrice} = await calculateCartTotal(cartItems);
   if (!verifiedItems || verifiedItems.length === 0) {
    return res.status(400).json({ message: 'Selected items are invalid or out of stock.' });
  }
    const packageSizeDetials = await shippingService.calculatePackageSize(verifiedItems);
    const shippingOptions = await shippingService.getShippingOptions(addressData, packageSizeDetials);
   
    return res.status(200).json(shippingOptions);

})

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
  const shippingCost = req.body.shippingCost
  // 1. Basic payload validations
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided.' });
  }

  if (!addressData) {
    return res.status(400).json({ message: 'Shipping address is required.' });
  }

  // 2. Validate products & prices directly against DB
  const { verifiedItems, totalPrice } = await calculateCartTotal(cartItems);
  const subtotal = totalPrice + shippingCost;
  if (!verifiedItems || verifiedItems.length === 0) {
    return res.status(400).json({ message: 'Selected items are invalid or out of stock.' });
  }

  // 3. Save / Update User Address
  if(saveTheNewAddress){
  await updateUserAddressService(userId, addressData);
  }
  
  // 4. Create pending DB order with verified items
  const order = await createBendingOrderService(userId, addressData, verifiedItems, totalPrice,subtotal);

  // 5. Create PayPal payment session
  const paypalOrder = await createPayPalOrderService(subtotal);

  // 6. Send response
 return res.status(201).json({
    orderID: order._id,
    paymentId: paypalOrder.id,
    paymentStatus: paypalOrder.status,
  });
});

export const approveOrderPayment = catchAsync(async (req, res, next) => {
  const userId = req.user.userId || req.user.id;
  const {  orderId, paymentId, rateId } = req.body;

  // 1. Basic validation
  if (!orderId || !paymentId) {
    return res.status(400).json({ message: 'Both orderID and paymentId are required.' });
  }

  // 2. Capture payment with PayPal
  const paymentData = await capturePayPalOrderService(paymentId);

  if (paymentData.status !== 'COMPLETED') {
    return res.status(400).json({ 
      success: false, 
      message: 'Payment capture failed or is pending.' 
    });
  }

  // 3. Generate Shipping Label via Shippo
  let shippingLabelData = null;
  
  // Rate ID can come directly from req.body or be retrieved from your pending order DB record
  const chosenRateId = rateId ;
console.log('Chosen Rate ID:', chosenRateId);
  if (chosenRateId) {
    try {
      shippingLabelData = await shippingService.generateShippingLabel(chosenRateId);
    } catch (error) {
      console.error('Failed to generate shipping label:', error.message);
      // Optional: attach label generation status/warning to logs
    }
  }
console.log('Shipping Label Data:', shippingLabelData);
  // 4. Update Order DB with payment info and shipping label details
  const order = await verifyAndUpdateOrder(userId, orderId, paymentData, shippingLabelData);

  // 5. Return updated order
  return res.status(200).json({
    success: true,
    data: order,
  });
});


