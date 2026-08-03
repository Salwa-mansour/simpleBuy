import Order from '../models/Order.js';
import { sendDeliveryEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';


export const handleShippoWebhook = async (req, res) => {
  try {
    // 1. SECURITY: Check URL secret token
    const token = req.query.token;
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN || 'my_super_secret_token_123';

    if (token !== expectedToken) {
      console.error('⚠️ Unauthorized webhook attempt: Invalid token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { event, data } = req.body;

    // 2. Process tracking update
    if (event === 'track_updated') {
      const trackingNumber = data.tracking_number;
      const trackingStatus = data.tracking_status?.status;

      if (trackingStatus === 'DELIVERED') {
        const order = await Order.findOne({
          'shippingDetails.trackingNumber': trackingNumber
        }).populate('user', 'email name');

        if (order && order.status !== 'delivered') {
          order.status = 'delivered';
          await order.save();

          sendDeliveryEmail({
            toEmail: order.user.email,
            fullName: order.user.name || 'Customer',
            orderId: order._id,
            trackingNumber: trackingNumber
          }).catch(err => console.error('Failed to send email:', err));

          console.log(`✅ Order ${order._id} marked DELIVERED.`);
        }
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ received: true });
  }
};