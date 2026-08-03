
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // e.g., 'smtp.gmail.com' or 'smtp.sendgrid.net'
  port: process.env.EMAIL_PORT || 587,
  secure: false,                       // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,     // SMTP username / email address
    pass: process.env.EMAIL_PASS      // SMTP password / App Password
  }
});

export const sendOrderConfirmationEmail = async ( order,toEmail ) => {

  const { _id, totalAmount,subtotal, shippingDetails, items,shippingAddress } = order;

  const trackingUrl = shippingDetails?.trackingUrl || '#';
  const trackingNumber = shippingDetails?.trackingNumber || 'N/A';
  const carrier = shippingDetails?.carrier || 'Carrier';

  // Build item rows
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.priceAtPurchase.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563eb;">Thank you for your order,${shippingAddress.fullName} !</h2>
      <p>We've received your order <strong>#${_id}</strong> and are preparing it for shipment.</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #ddd;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <h4 style="text-align: right; margin-top: 16px; margin-bottom: 0;">Cart: $${totalAmount.toFixed(2)}</h4>
        <h4 style="text-align: right; margin-top: 16px; margin-bottom: 0;">Shipping: $${shippingDetails.shippingCost.toFixed(2)}</h4>
        <h4 style="text-align: right; margin-top: 16px; margin-bottom: 0;">Total: $${subtotal.toFixed(2)}</h4>
      </div>

      <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px;">
        <h3 style="margin-top: 0;">Shipping Information</h3>
        <p style="margin: 4px 0;"><strong>Carrier:</strong> ${carrier}</p>
        <p style="margin: 4px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
        
        ${
          trackingUrl !== '#'
            ? `<div style="margin-top: 12px;">
                <a href="${trackingUrl}" style="background-color: #2563eb; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Track Package
                </a>
              </div>`
            : ''
        }
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        * Note: Tracking status may take up to 24 hours to update after label creation.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `${process.env.STORE_NAME} <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmation #${_id}`,
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};