import Order from '../models/Order.js';
import Product from '../models/Product.js';


export const createBendingOrderService =async(userId,shippingAddress,orderItems,totalAmount,shippingCost,subtotal)=>{
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
    shippingDetails:{
      shippingCost,
    }
    ,
    totalAmount,
   subtotal,
    status: 'pending',
  });

  return newOrder;
}

export const verifyAndUpdateOrder = async (userId, orderId, paymentData, shippingLabelData) => {


  if(!shippingLabelData){
    const error = new Error('shipping Label Data not found.');
    error.statusCode = 404;
    throw error;
    }
  
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Authorization check
  if (order.user.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this order.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Idempotency: Prevent re-processing paid/labeled orders
  if (['paid', 'label_created', 'shipped', 'delivered'].includes(order.status)) {
    return order;
  }

  // 4. Extract PayPal payment details
  const captureStatus = paymentData.status; // e.g., 'COMPLETED'
  const paymentDetails = paymentData.purchase_units?.[0]?.payments?.captures?.[0];
  const detailedStatus = paymentDetails?.status || captureStatus;

  // 5. Update paymentInfo subdocument
  if (!order.paymentInfo) order.paymentInfo = {};
  order.paymentInfo.id = paymentData.id || paymentDetails?.id;
  order.paymentInfo.status = detailedStatus;

  // 6. Merge Shipping Label Details without erasing existing shipping details
  if (shippingLabelData) {
    order.shippingDetails = {
      ...order.shippingDetails?.toObject?.() || order.shippingDetails,
      transactionId: shippingLabelData.transactionId,
      trackingNumber: shippingLabelData.trackingNumber,
      trackingUrl: shippingLabelData.trackingUrl,
      labelUrl: shippingLabelData.labelUrl,
      qrCodeUrl: shippingLabelData.qrCodeUrl || null,
      carrier: shippingLabelData.provider || order.shippingDetails?.carrier,
      purchasedAt: shippingLabelData.purchasedAt || new Date(),
    
    };
  }

  // 7. Handle Order Status Transition & Inventory Deduction
  if (captureStatus === 'COMPLETED' || detailedStatus === 'COMPLETED') {
    // Transition to label_created if label was generated, otherwise paid
    order.status = shippingLabelData ? 'label_created' : 'paid';

    // Deduct stock for each item in the order
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

  // 8. Persist and return updated order
  await order.save();

  return order;
};
