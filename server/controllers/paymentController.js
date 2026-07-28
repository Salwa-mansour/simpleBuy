import { createPayPalOrderService, capturePayPalOrderService } from '../servises/paypalService.js';
import Order from '../models/Order.js'; // Your Mongoose Order Model

export const createPayPalOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    // Optional: Recalculate price on the server to avoid tampering
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const paypalOrder = await createPayPalOrderService(totalAmount);

    res.status(201).json({
      id: paypalOrder.id,
      status: paypalOrder.status
    });
  } catch (error) {
    console.error('Error in createPayPalOrder:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const capturePayPalOrder = async (req, res) => {
  try {
    const { paypalOrderId, items, shippingAddress, totalAmount } = req.body;
    const userId = req.user.userId || req.user.id;

    // Capture payment through PayPal API
    const captureData = await capturePayPalOrderService(paypalOrderId);

    if (captureData.status === 'COMPLETED') {
      // Save order to your database
      const newOrder = await Order.create({
        user: userId,
        items,
        shippingAddress,
        totalAmount,
        paymentInfo: {
          id: captureData.id,
          status: captureData.status,
          provider: 'paypal'
        },
        isPaid: true,
        paidAt: new Date()
      });

      return res.status(200).json({ success: true, order: newOrder });
    }

    res.status(400).json({ message: 'Payment capture was not successful' });
  } catch (error) {
    console.error('Error in capturePayPalOrder:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};