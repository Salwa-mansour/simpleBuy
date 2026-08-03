import Order from '../models/Order.js';
import { sendDeliveryEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

export const handleShippoWebhook = async (req, res) => {
  try {
    // 1. SECURITY: Verify Webhook Signature
    const signature = req.headers['shippo-signature'] || req.headers['x-shippo-signature'];
    const webhookSecret = process.env.SHIPPO_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Calculate HMAC SHA256 signature using raw body
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');

      if (signature !== computedSignature) {
        console.error('⚠️ Invalid Webhook Signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const { event, data } = req.body;

    // 2. Filter for Tracking Update events
    if (event === 'track_updated') {
      const trackingNumber = data.tracking_number;
      const trackingStatus = data.tracking_status?.status; // e.g. 'DELIVERED', 'TRANSIT'

      // 3. Only act on DELIVERED status
      if (trackingStatus === 'DELIVERED') {
        // Find order by tracking number and populate user details
        const order = await Order.findOne({
          'shippingDetails.trackingNumber': trackingNumber
        }).populate('user', 'email name');//???????????????????????

        // Idempotency Check: Don't send duplicate emails if status is already 'delivered'
        if (order && order.status !== 'delivered') {
          // Update status in DB
          order.status = 'delivered';
          await order.save();

          // Send Delivery Email asynchronously
          sendDeliveryEmail({
            toEmail: order.user.email,
            fullName: order.user.name || 'Customer',
            orderId: order._id,
            trackingNumber: trackingNumber
          }).catch(err => console.error('Failed to send delivery email:', err));

          console.log(`✅ Order ${order._id} marked as DELIVERED and email triggered.`);
        }
      }
    }

    // 4. ALWAYS respond 200 OK quickly to prevent Shippo retries
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200/500 depending on retry preferences (200 prevents infinite loops on bad payloads)
    return res.status(200).json({ received: true });
  }
};