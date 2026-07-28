import { createOrderService,verifyAndPayOrderService } from '../servises/orderService.js';

/**
 * @desc   Create a new order
 * @route  POST /api/orders
 * @access Private
 */

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