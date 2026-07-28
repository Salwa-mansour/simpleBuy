import dotenv from 'dotenv';
dotenv.config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE } = process.env;

const base = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// 1. Get Access Token from PayPal
const getAccessToken = async () => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('MISSING_PAYPAL_CREDENTIALS');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to get PayPal access token');
  }

  return data.access_token;
};

// 2. Create PayPal Order
export const createPayPalOrderService = async (totalAmount) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: Number(totalAmount).toFixed(2), // Must strictly be formatted as string decimal e.g. "19.99"
          },
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create PayPal order');
  }

  return data; // Returns the PayPal Order object containing id
};

// 3. Capture PayPal Payment
export const capturePayPalOrderService = async (paypalOrderId) => {
  const accessToken = await getAccessToken();

  const response = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to capture PayPal payment');
  }

  return data; // Returns transaction capture details
};