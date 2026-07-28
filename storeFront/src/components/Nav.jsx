import { useState } from "react";
import { Link } from 'react-router-dom';
import LogoutBtn from "./LogoutBtn";
import CartPopup from "./cart/CartPopup";
import { useCart } from "../context/CartProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";

function Nav() {
    const { totalItems, showCart, setShowCart } = useCart();
    const {auth} =useAuth();

    const toggleCart = () => {
        setShowCart((prev) => !prev);
    };

    return (
        <nav>
            <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none' }}>
                <li>
                    <Link to="/">home</Link>
                </li>
               
                    {!auth?.accessToken && (
                        <li>
                        <Link to="/login">login</Link>
                        </li>
                    )}
                {/* Cart Icon & Trigger */}
                <li className="cart-link" style={{ position: "relative" }}>
                    <button
                        type="button"
                        onClick={toggleCart}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0.5rem',
                            fontSize: '1.2rem'
                        }}
                        aria-label="Toggle Shopping Cart"
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        
                        {totalItems > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '0px',
                                    right: '0px',
                                    backgroundColor: '#e53e3e',
                                    color: '#ffffff',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    minWidth: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2px'
                                }}
                            >
                                {totalItems > 99 ? '99+' : totalItems}
                            </span>
                        )}
                    </button>

                    {/* Cart Popup Overlay */}
                    <CartPopup showCart={showCart} setShowCart={setShowCart} />
                </li>
                {auth?.accessToken && (
                <li>
                    <LogoutBtn />
                </li>
                )}
              
            </ul>
        </nav>
    );
}

export default Nav;