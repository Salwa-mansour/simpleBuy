import { Link,useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems,setShowCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: '3rem', color: '#a0aec0', marginBottom: '1rem' }} />
                <h2>Your cart is empty</h2>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link
                    to="/"
                    style={{
                        backgroundColor: '#3182ce',
                        color: '#fff',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Your Shopping Cart ({totalItems} items)</h2>
                <button
                    onClick={clearCart}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: '500' }}
                >
                    Clear Cart
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Cart Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item) => {
                        const itemId = item._id || item.id;
                        return (
                            <div
                                key={itemId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    backgroundColor: '#fff',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#f7fafc', borderRadius: '4px', overflow: 'hidden' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#a0aec0' }}>
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.title}</h4>
                                    <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</span>
                                </div>

                                {/* Quantity selector */}
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '4px' }}>
                                    <button
                                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                        style={{ padding: '0.25rem 0.6rem', border: 'none', background: '#f7fafc', cursor: 'pointer' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem', fontWeight: '600',color:'black' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                        style={{ padding: '0.25rem 0.6rem', border: 'none', background: '#f7fafc', cursor: 'pointer' }}
                                    >
                                        +
                                    </button>
                                </div>

                                <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>

                                <button
                                    onClick={() => removeFromCart(itemId)}
                                    style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '0.5rem' }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        );
                    })}

                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3182ce', textDecoration: 'none', marginTop: '1rem' }}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </div>

                {/* Summary Box */}
                <div
                    style={{
                        backgroundColor: '#fff',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        height: 'fit-content'
                    }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem' }}>Order Summary</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#718096' }}>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#718096' }}>Shipping</span>
                        <span style={{ color: '#38a169', fontWeight: '500' }}>Free</span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: '1rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        <span>Total</span>
                        <span style={{ color: '#2b6cb0' }}>${totalPrice.toFixed(2)}</span>
                    </div>

                                <button
                                onClick={() => {
                                    setShowCart(false);
                                    navigate('/checkout');
                                }}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#3182ce',
                                    color: '#fff',
                                    padding: '0.6rem',
                                    borderRadius: '4px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '1rem',
                                }}
                                >
                                Proceed to Checkout
                                </button>
                </div>
            </div>
        </section>
    );
};

export default Cart;