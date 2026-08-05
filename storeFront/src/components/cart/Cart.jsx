import { Link,useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import '../../css/cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems,setShowCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <section className="cart-container empty" >
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
            </section>
        );
    }

    return (
        <section  className="cart-container" >
            <div className="cart-header" >
                <h2>Your Shopping Cart ({totalItems} items)</h2>
                <button
                    onClick={clearCart}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: '500' }}
                >
                    Clear Cart
                </button>
            </div>

            <div className="cart-contents" >
                {/* Cart Items List */}
                <ul className="cart-items" >
                    {cart.map((item) => {
                        const itemId = item._id || item.id;
                        return (
                            <li
                                key={itemId}
                                className="cart-item"
                               
                            >
                                <figure >
                                        <img src={item?.imageUrl} alt={item.title} width="150" />
                                </figure>
                                <div className="cart-item-details" >
                                            <div >
                                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.title}</h4>
                                                <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</span>
                                            </div>
                                            <div className="quantity-contolles" >
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <span className="quantity">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>

                                            <button onClick={() => removeFromCart(itemId)}className="cart-item-delete">
                                                &times;
                                            </button>
                               </div>
                            </li>
                        );
                    })}

                    <Link onClick={()=>setShowCart(false)} to="/" >
                        <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                    </Link>
                </ul>
             </div>
                {/* Summary Box */}
                <div className="summary-box" >
                    <h3 className='title'>Order Summary</h3>

                    <div className="summary-item">
                        <span >Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="summary-item">
                        <span style={{ color: '#718096' }}>Shipping</span>
                        <span style={{ color: '#38a169', fontWeight: '500' }}>Free</span>
                    </div>

                  
                    <div className="summary-item"   >
                        <span>Total</span>
                        <span style={{ color: '#2b6cb0' }}>${totalPrice.toFixed(2)}</span>
                    </div>

                                <button
                                onClick={() => {
                                    setShowCart(false);
                                    navigate('/checkout');
                                }}
                              
                                >
                                Proceed to Checkout
                                </button>
                </div>
           
        </section>
    );
};

export default Cart;