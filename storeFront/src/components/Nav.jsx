import { useState } from "react";
import { Link } from 'react-router-dom';
import LogoutBtn from "./LogoutBtn";
import CartPopup from "./cart/CartPopup";
import { useCart } from "../context/CartProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import '../css/cart.css';

function Nav() {
    const { totalItems, showCart, setShowCart } = useCart();
    const {auth} =useAuth();

    const toggleCart = () => {
        setShowCart((prev) => !prev);
    };

    return (
        <nav>
            <ul className="nav-links" >
                <li>
                    <Link to="/">
                    <img src='./logoipsum-blackandwhite.svg' width="100" className="logo" />
                    </Link>
                </li>
               
                    {!auth?.accessToken && (
                        <li>
                        <Link to="/login">login</Link>
                        </li>
                    )}
                {/* Cart Icon & Trigger */}
                <li className="cart-link" >
                    <button
                        type="button"
                        onClick={toggleCart}
            
                        className="cart-toggler"
                        aria-label="Toggle Shopping Cart"
                    >
                        <FontAwesomeIcon icon={faShoppingCart} />
                        {totalItems > 0 && (
                            <span className="cart-count" >
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