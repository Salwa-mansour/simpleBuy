import Cart from "./Cart";
import '../../css/cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function CartPopup({ showCart,setShowCart ,clearCart}) {
   

    return (
        <div  className="cart-popup" style={{display: showCart ? "block" : "none"}}>
           
                 <div className="popup-header" >

                     <button
                        onClick={() => setShowCart(false)}
                        aria-label="Close cart popup"
                        className="close-cart btn-reset"
                    >
                       <FontAwesomeIcon icon={faTimes} />
                    </button>

                    <button
                        onClick={clearCart}
                        className="clear-cart btn-reset"
                    >
                        Clear Cart
                    </button>
                  </div>
                 <Cart />
        </div>
    );
}

export default CartPopup;