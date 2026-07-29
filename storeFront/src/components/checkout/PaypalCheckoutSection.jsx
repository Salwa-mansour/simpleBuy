import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useRef } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useCart } from '../../context/CartProvider';

function PayPalCheckoutSection({ shippingInfo, setOrderComplete, setStatusMessage }) {
  const axiosPrivate = useAxiosPrivate();
  const { cart, clearCart } = useCart();

  // 1. Get current SDK script status
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  // 2. Use a Ref  to immediately hold the MongoDB Order ID synchronously
  const dbOrderIdRef = useRef(null);

  const handleCreateOrder = async () => {
    // Basic validation check
    if (!shippingInfo) {
      if (setStatusMessage) {
        setStatusMessage({
          type: 'error',
          text: 'Please provide a shipping address before proceeding to payment.',
        });
      }
      throw new Error('Missing shipping address');
    }

    try {
      const response = await axiosPrivate.post('/order/register', {
        items: cart,
        shippingAddress: shippingInfo,
      });

      // Save database order ID into ref immediately
      dbOrderIdRef.current = response.data.orderID;

      // Return PayPal's payment/order ID to the SDK
      return response.data.paymentId;
    } catch (err) {
      console.error('Failed to create PayPal order:', err);
      if (setStatusMessage) {
        setStatusMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to initialize PayPal order.',
        });
      }
      throw err;
    }
  };

  const handleApprove = async (data) => {
    try {
      // Use the stored ref value
      const dbOrderId = dbOrderIdRef.current;
console.log(`dborderid ${dbOrderId}`)
      const response = await axiosPrivate.post('/order/approve', {
        paymentId: data.orderID, // PayPal's order ID
        orderID: dbOrderId,     // Your DB order ID from ref
      });
      console.log(response.data)
      if (response.data.success) {
        clearCart();
        if (setOrderComplete) setOrderComplete(true);
      } else {
        throw new Error(response.data.message || 'Payment capture failed.');
      }
    } catch (err) {
      console.error('Failed to capture PayPal payment:', err);
      if (setStatusMessage) {
        setStatusMessage({
          type: 'error',
          text: err.response?.data?.message || 'Payment failed. Please try again.',
        });
      }
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="paypal-loading-container">
        <p>Loading payment options...</p>
      </div>
    );
  }

  // Error state
  if (isRejected) {
    return (
      <div className="paypal-error-container">
        <p>Failed to load PayPal. Please refresh or check your internet connection.</p>
      </div>
    );
  }

  // Render buttons
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
      createOrder={handleCreateOrder}
      onApprove={handleApprove}
      onError={(err) => {
        console.error('PayPal Button Error:', err);
        if (setStatusMessage) {
          setStatusMessage({
            type: 'error',
            text: 'An error occurred with PayPal. Please try again or use another method.',
          });
        }
      }}
    />
  );
}

export default PayPalCheckoutSection;