import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, 
    currency: "USD",
    intent: "capture",
};

export default function App() {
    return (
        <PayPalScriptProvider options={initialOptions}>
            {/* Your Checkout component goes here */}
            
        </PayPalScriptProvider>
    );
}