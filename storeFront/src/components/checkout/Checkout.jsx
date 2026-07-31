import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Country, State, City } from 'country-state-city';

import { useCart } from '../../context/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useInput from '../../hooks/useInput';

import PayPalCheckoutSection from './PaypalCheckoutSection';
import '../../css/checkout.css'

function Checkout() {
    const { cart, totalPrice } = useCart();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // 1. Form state managed by custom useInput
    const [fullName, setFullName, fullNameAttribs] = useInput('checkout_fullName', '');
    const [address, setAddress, addressAttribs] = useInput('checkout_address', '');
    const [city, setCity, cityAttribs] = useInput('checkout_city', '');
    const [state, setState, stateAttribs] = useInput('checkout_state', ''); // Optional State / Region
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
        state,
        postalCode,
        country,
    };

    // --- Dynamic Country / State / City helpers ---
    const countriesList = Country.getAllCountries();
    
    const selectedCountryObj = countriesList.find(c => c.name === country || c.isoCode === country);
    const selectedCountryCode = selectedCountryObj?.isoCode || '';

    const statesList = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
    
    const selectedStateObj = statesList.find(s => s.name === state || s.isoCode === state);
    const selectedStateCode = selectedStateObj?.isoCode || '';

    const citiesList = selectedCountryCode 
        ? (selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : City.getCitiesOfCountry(selectedCountryCode))
        : [];

    // 4. Fetch server address on mount
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

                        // Fall back to server address ONLY if localStorage values are currently empty
                        if (!fullName) setFullName(savedAddress.fullName || '');
                        if (!address) setAddress(savedAddress.address || '');
                        if (!country) setCountry(savedAddress.country || '');
                        if (!state) setState(savedAddress.state || '');
                        if (!city) setCity(savedAddress.city || '');
                        if (!postalCode) setPostalCode(savedAddress.postalCode || '');
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
    }, [axiosPrivate]);

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
        <section className="checkout-page">
            <h3 className='title'>Checkout</h3>

            {statusMessage && (
                <div className={`status-${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}

          
                {/* Left Column: Shipping Form */}
                <div>
                    <h5 className='title'>Shipping Details</h5>

                    <form id="checkout-form" onSubmit={(e) => e.preventDefault()}>
                        <div className='input-box'>
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                {...fullNameAttribs}
                            />
                        </div>

                        <div className='input-box'>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={auth?.email || ''}
                                disabled
                            />
                        </div>

                        <div className='input-box' >
                            <label htmlFor="address">Street Address *</label>
                            <input
                                id="address"
                                type="text"
                                required
                                {...addressAttribs}
                            />
                        </div>

                        {/* Country Select */}
                        <div className='input-box' >
                            <label htmlFor="country">Country *</label>
                            <select
                                id="country"
                                required
                                value={country}
                                onChange={(e) => {
                                    setCountry(e.target.value);
                                    setState('');
                                    setCity('');
                                }}
                            >
                                <option value="">Select Country</option>
                                {countriesList.map((c) => (
                                    <option key={c.isoCode} value={c.name}>
                                        {c.flag} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State & Postal Code Row */}
                      
                            <div className='input-box' >
                                <label htmlFor="state">State / Region <small>(Optional)</small></label>
                                <select
                                    id="state"
                                    value={state}
                                    disabled={!country || statesList.length === 0}
                                    onChange={(e) => {
                                        setState(e.target.value);
                                        setCity('');
                                    }}
                                >
                                    <option value="">
                                        {!country 
                                            ? 'Select Country First' 
                                            : statesList.length === 0 
                                                ? 'No States Available' 
                                                : 'Select State / Region'}
                                    </option>
                                    {statesList.map((s) => (
                                        <option key={s.isoCode} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='input-box' >
                                <label htmlFor="postalCode">Postal Code *</label>
                                <input
                                    id="postalCode"
                                    type="text"
                                    required
                                    {...postalCodeAttribs}
                                />
                            </div>
                       

                        {/* City Select */}
                        <div className='input-box' >
                            <label htmlFor="city">City *</label>
                            <select
                                id="city"
                                required
                                value={city}
                                disabled={!country}
                                onChange={(e) => {
                                    // Directly invoke custom setter to update state + localStorage synchronously
                                    setCity(e.target.value);
                                }}
                            >
                                <option value="">
                                    {!country ? 'Select Country First' : 'Select City'}
                                </option>

                                {/* Fallback option if local city isn't in citiesList yet */}
                                {city && !citiesList.some((c) => c.name === city) && (
                                    <option value={city}>{city}</option>
                                )}

                                {citiesList.map((c) => (
                                    <option key={`${c.name}-${c.latitude}`} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='input-box check-box'>
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
                    <h3 className='title'>Order Summary</h3>

                    <ul className='order-items'>
                        {cart.map((item) => {
                            const itemId = item._id || item.id;
                            return (
                                <li key={itemId} className='order-item'>
                                    <div className='pricing'>
                                        <p style={{ margin: 0 }}>{item.title}</p>
                                        <small>Qty: {item.quantity}</small>
                                    </div>
                                    <span>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <hr />

                    <div className='checkout-sammury'>
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

                    <div >
                        <PayPalCheckoutSection
                            shippingInfo={shippingInfo}
                            saveTheNewAddress={saveTheNewAddress || !hasExistingAddress}
                            setOrderComplete={setOrderComplete}
                            setStatusMessage={setStatusMessage}
                        />
                    </div>
                </div>
            
        </section>
    );
}

export default Checkout;