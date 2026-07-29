import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useCart } from '../../context/CartProvider';

function PayPalCheckoutSection({ shippingInfo, setOrderComplete, setStatusMessage }) {
  const axiosPrivate = useAxiosPrivate();
  const { cart, totalPrice, clearCart } = useCart();

  // 1. Get the current SDK loading status
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  const handleCreateOrder = async () => {
    try {
      const response = await axiosPrivate.post('/payment/create-paypal-order', {
        items: cart,
        shippingAddress: shippingInfo,
      });

      return response.data.id; 
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
    console.log(`aprove data ${data}`)
    try {
      const response = await axiosPrivate.post('/payment/capture-paypal-order', {
        paypalOrderId: data.orderID,
        items: cart,
        shippingAddress: shippingInfo,
        totalAmount: totalPrice,
      });

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

  // 2. Loading State: Display while the SDK script is fetching
  if (isPending) {
    return (
      <div className="paypal-loading-container">
        <p>Loading payment options...</p>
        {/* You can replace this text with a CSS spinner or skeleton box */}
      </div>
    );
  }

  // 3. Error State: Display if script download fails (e.g. adblocker or network issue)
  if (isRejected) {
    return (
      <div className="paypal-error-container">
        <p>Failed to load PayPal. Please refresh or check your internet connection.</p>
      </div>
    );
  }

  // 4. Render buttons once script is fully ready
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