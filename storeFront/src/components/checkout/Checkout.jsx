import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useInput from '../../hooks/useInput';

import PayPalCheckoutSection from './PaypalCheckoutSection';

function Checkout() {
    const { cart, totalPrice } = useCart();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // 1. Form state managed by custom useInput
    const [fullName, setFullName, fullNameAttribs] = useInput('checkout_fullName', '');
    const [address, setAddress, addressAttribs] = useInput('checkout_address', '');
    const [city, setCity, cityAttribs] = useInput('checkout_city', '');
    const [postalCode, setPostalCode, postalCodeAttribs] = useInput('checkout_postalCode', '');
    const [country, setCountry, countryAttribs] = useInput('checkout_country', '');

    // 2. Checkbox & logic flags
    const [saveTheNewAddress, setSaveTheNewAddress] = useState(false);
    const [hasExistingAddress, setHasExistingAddress] = useState(false);
    
    // UI states
    const [orderComplete, setOrderComplete] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // 3. Assemble shippingInfo payload
    const shippingInfo = {
        fullName,
        address,
        city,
        postalCode,
        country,
    };

    // 4. Fetch server address on mount
// 4. Fetch server address on mount, but prefer LocalStorage if present
useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAddress = async () => {
        try {
            const response = await axiosPrivate.get('/user/address', {
                signal: controller.signal,
            });

            if (isMounted) {
                const savedAddress = response.data;
                
                if (savedAddress && Object.keys(savedAddress).length > 0) {
                    setHasExistingAddress(true);

                    // ONLY fill from server if LocalStorage state is currently empty
                    if (!fullName) setFullName(savedAddress.fullName || '');
                    if (!address) setAddress(savedAddress.address || '');
                    if (!city) setCity(savedAddress.city || '');
                    if (!postalCode) setPostalCode(savedAddress.postalCode || '');
                    if (!country) setCountry(savedAddress.country || '');
                } else {
                    setSaveTheNewAddress(true);
                }
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            console.error('Failed to load saved address:', err);
        }
    };

    fetchAddress();

    return () => {
        isMounted = false;
        controller.abort();
    };
}, [axiosPrivate]); // Keep dependencies clean
    if (orderComplete) {
        return (
            <div>
                <div>🎉</div>
                <h2>Order Confirmed!</h2>
                <p>
                    Thank you, <strong>{fullName}</strong>. We've received your order and will process it shortly.
                </p>
                <button onClick={() => navigate('/')}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    if (!cart || cart.length === 0) {
        return (
            <div>
                <h3>Your cart is empty</h3>
                <p>Add some items to your cart before proceeding to checkout.</p>
                <Link to="/">Browse Products</Link>
            </div>
        );
    }

    return (
        <section>
            <h2>Checkout</h2>

            {statusMessage && (
                <div className={`status-${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}

            <div>
                {/* Left Column: Shipping Form */}
                <div>
                    <h3>Shipping Details</h3>

                    <form id="checkout-form" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                {...fullNameAttribs}
                            />
                        </div>

                        <div>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={auth?.email || ''}
                                disabled
                            />
                        </div>

                        <div>
                            <label htmlFor="address">Street Address *</label>
                            <input
                                id="address"
                                type="text"
                                required
                                {...addressAttribs}
                            />
                        </div>

                        <div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="city">City *</label>
                                <input
                                    id="city"
                                    type="text"
                                    required
                                    {...cityAttribs}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="postalCode">Postal Code *</label>
                                <input
                                    id="postalCode"
                                    type="text"
                                    required
                                    {...postalCodeAttribs}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="country">Country *</label>
                            <input
                                id="country"
                                type="text"
                                required
                                {...countryAttribs}
                            />
                        </div>

                        <div>
                            <label htmlFor="saveAddress">
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    checked={saveTheNewAddress}
                                    onChange={(e) => setSaveTheNewAddress(e.target.checked)}
                                />
                                {hasExistingAddress
                                    ? 'Save changes as my new default address'
                                    : 'Save this address to my profile'}
                            </label>
                        </div>
                    </form>
                </div>

                {/* Right Column: Order Summary & PayPal */}
                <div>
                    <h3>Order Summary</h3>

                    <div>
                        {cart.map((item) => {
                            const itemId = item._id || item.id;
                            return (
                                <div key={itemId}>
                                    <div>
                                        <p style={{ margin: 0 }}>{item.title}</p>
                                        <small>Qty: {item.quantity}</small>
                                    </div>
                                    <span>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <hr />

                    <div>
                        <div>
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div>
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>
                        <div>
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <PayPalCheckoutSection
                            shippingInfo={shippingInfo}
                            saveTheNewAddress={saveTheNewAddress || !hasExistingAddress}
                            setOrderComplete={setOrderComplete}
                            setStatusMessage={setStatusMessage}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Checkout;