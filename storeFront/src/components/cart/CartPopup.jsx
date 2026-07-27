import Cart from "./Cart";

function CartPopup({ showCart,setShowCart }) {
    const style = {
        position: "absolute",
        top: "100%",
        right: "0",
        width: "320px",
        maxHeight: "450px",
        overflowY: "auto",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        padding: "1rem",
        zIndex: 1000,
        display: showCart ? "block" : "none"
    };

    return (
        <div style={style}>
            <button
                    onClick={() => setShowCart(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: '#a0aec0',
                        padding: '0 0.25rem',
                        lineHeight: '1'
                    }}
                    aria-label="Close cart popup"
                >
                    &times;
                </button>
            <Cart />
        </div>
    );
}

export default CartPopup;