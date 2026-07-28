import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

function Checkout() {
    const { cart, totalPrice, clearCart } = useCart();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // Saved address management state
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);

    // Form and submission state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // 1. Fetch saved addresses on mount
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchAddresses = async () => {
            try {
                const response = await axiosPrivate.get('/user/addresses', {
                    signal: controller.signal,
                });

                if (isMounted) {
                    const addresses = response.data?.addresses || [];
                    setSavedAddresses(addresses);

                    if (addresses.length > 0) {
                        const defaultAddr = addresses.find((addr) => addr.isDefault) || addresses[0];
                        fillFormWithAddress(defaultAddr);
                        setSelectedAddressId(defaultAddr._id);
                    }
                }
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error('Failed to load saved addresses:', err);
            }
        };

        fetchAddresses();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [axiosPrivate]);

    const fillFormWithAddress = (addr) => {
        setShippingInfo({
            fullName: addr.fullName || '',
            address: addr.address || '',
            city: addr.city || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
        });
    };

    const clearForm = () => {
        setShippingInfo({
            fullName: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 2. Update an existing address
    const handleUpdateAddress = async () => {
        if (!selectedAddressId || selectedAddressId === 'new') return;

        setIsUpdatingAddress(true);
        setStatusMessage(null);

        try {
            const response = await axiosPrivate.put(
                `/users/addresses/${selectedAddressId}`,
                shippingInfo
            );

            // Update local state with updated array returned from backend
            const updatedAddresses = response.data?.addresses || [];
            setSavedAddresses(updatedAddresses);

            setStatusMessage({ type: 'success', text: 'Address updated successfully!' });
        } catch (err) {
            console.error('Failed to update address:', err.response?.data?.message || err.message);
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update address.',
            });
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    // 3. Submit Order
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const orderData = {
                items: cart.map((item) => ({
                    product: item._id || item.id,
                    quantity: item.quantity,
                })),
                shippingAddress: shippingInfo,
                paymentProvider: 'paypal',
                saveAddress: selectedAddressId === 'new' ? saveAddressForFuture : false,
            };

            await axiosPrivate.post('/order', orderData);

            setOrderComplete(true);
            clearCart();
        } catch (err) {
            console.error('Order creation failed:', err.response?.data?.message || err.message);
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.message || 'Order creation failed. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: '#2b6cb0', marginBottom: '1rem' }}>Order Confirmed!</h2>
                <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
                    Thank you, <strong>{shippingInfo.fullName}</strong>. We've received your order and will process it shortly.
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: '#3182ce',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                    }}
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2rem' }}>
                <h3>Your cart is empty</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
                    Add some items to your cart before proceeding to checkout.
                </p>
                <Link
                    to="/"
                    style={{
                        backgroundColor: '#3182ce',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontWeight: '500',
                    }}
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    const shippingFee = totalPrice > 50 ? 0 : 5.99;
    const finalTotal = totalPrice + shippingFee;

    return (
        <section style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #edf2f7', paddingBottom: '0.75rem' }}>
                Checkout
            </h2>

            {statusMessage && (
                <div
                    style={{
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        borderRadius: '4px',
                        backgroundColor: statusMessage.type === 'success' ? '#c6f6d5' : '#fed7d7',
                        color: statusMessage.type === 'success' ? '#22543d' : '#742a2a',
                    }}
                >
                    {statusMessage.text}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem',
                    alignItems: 'start',
                }}
            >
                {/* Left Column: Shipping Address Details */}
                <div
                    style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        color: 'black',
                    }}
                >
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>Shipping Details</h3>

                    {/* Saved Addresses Dropdown */}
                    {savedAddresses.length > 0 && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem',
                                }}
                            >
                                Choose Saved Address
                            </label>
                            <select
                                value={selectedAddressId}
                                onChange={(e) => {
                                    const addressId = e.target.value;
                                    setSelectedAddressId(addressId);
                                    if (addressId === 'new') {
                                        clearForm();
                                    } else {
                                        const selected = savedAddresses.find((a) => a._id === addressId);
                                        if (selected) fillFormWithAddress(selected);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e0',
                                    backgroundColor: '#ffffff',
                                }}
                            >
                                {savedAddresses.map((addr) => (
                                    <option key={addr._id} value={addr._id}>
                                        {addr.fullName} - {addr.address}, {addr.city}
                                    </option>
                                ))}
                                <option value="new">+ Enter a new address</option>
                            </select>
                        </div>
                    )}

                    <form onSubmit={handleSubmitOrder} id="checkout-form">
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={shippingInfo.fullName}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={auth?.email || ''}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e0',
                                    backgroundColor: '#edf2f7',
                                    cursor: 'not-allowed',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                Street Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={shippingInfo.address}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={shippingInfo.city}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                    Postal Code *
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    required
                                    value={shippingInfo.postalCode}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                Country *
                            </label>
                            <input
                                type="text"
                                name="country"
                                required
                                value={shippingInfo.country}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                            />
                        </div>

                        {/* Action when selecting an existing saved address */}
                        {selectedAddressId && selectedAddressId !== 'new' && (
                            <button
                                type="button"
                                onClick={handleUpdateAddress}
                                disabled={isUpdatingAddress}
                                style={{
                                    marginTop: '0.5rem',
                                    display: 'block',
                                    width: '100%',
                                    backgroundColor: '#4a5568',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    cursor: isUpdatingAddress ? 'not-allowed' : 'pointer',
                                    fontWeight: '500',
                                }}
                            >
                                {isUpdatingAddress ? 'Updating Address...' : 'Save Changes to This Address'}
                            </button>
                        )}

                        {/* Save checkbox when typing a new address */}
                        {(savedAddresses.length === 0 || selectedAddressId === 'new') && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    checked={saveAddressForFuture}
                                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                                />
                                <label htmlFor="saveAddress" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                                    Save this address to my profile for future orders
                                </label>
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div
                    style={{
                        backgroundColor: '#f7fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        color: 'black',
                    }}
                >
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>Order Summary</h3>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                        {cart.map((item) => {
                            const itemId = item._id || item.id;
                            return (
                                <div
                                    key={itemId}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.5rem 0',
                                        borderBottom: '1px dashed #e2e8f0',
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>{item.title}</p>
                                        <span style={{ fontSize: '0.8rem', color: '#718096' }}>Qty: {item.quantity}</span>
                                    </div>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ borderTop: '1px solid #cbd5e0', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#4a5568' }}>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#4a5568' }}>Shipping</span>
                            <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                        </div>
                        {shippingFee === 0 && (
                            <p style={{ fontSize: '0.75rem', color: '#38a169', margin: '0 0 0.5rem 0' }}>
                                Qualified for Free Shipping!
                            </p>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '1.15rem',
                                fontWeight: 'bold',
                                marginTop: '1rem',
                                paddingTop: '0.75rem',
                                borderTop: '2px solid #e2e8f0',
                            }}
                        >
                            <span>Total</span>
                            <span style={{ color: '#2b6cb0' }}>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            backgroundColor: isSubmitting ? '#a0aec0' : '#38a169',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            marginTop: '1.5rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isSubmitting ? 'Processing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Checkout;