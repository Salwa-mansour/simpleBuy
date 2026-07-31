import Cart from "./Cart";
import '../../css/cart.css';

function CartPopup({ showCart,setShowCart }) {
   

    return (
        <div  className="cart-popup" style={{display: showCart ? "block" : "none"}}>
            <button
                    onClick={() => setShowCart(false)}
                    aria-label="Close cart popup"
                    className="close-cart"
                >
                    &times;
                </button>
            <Cart />
        </div>
    );
}

export default CartPopup;