import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage so it persists on refresh
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('shopping_cart');
        return localData ? JSON.parse(localData) : [];
    });
    const [showCart, setShowCart] = useState(false);
    useEffect(() => {
        localStorage.setItem('shopping_cart', JSON.stringify(cart));
    }, [cart]);

    // Add item to cart (or update quantity if already exists)
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
        const productId = product._id || product.id;
        const existingIndex = prevCart.findIndex(
            (item) => (item._id || item.id) === productId
        );

        if (existingIndex > -1) {
            const updatedCart = [...prevCart];
            const newQty = updatedCart[existingIndex].quantity + quantity;
            const maxQty = product.stock ? Math.min(newQty, product.stock) : newQty;
            
            updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                quantity: maxQty,
            };
            return updatedCart;
        }

        return [...prevCart, { ...product, quantity }];
    });

    // Auto-open the popup when a new item is added!
    setShowCart(true);
};
    // Remove item completely
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== id));
    };

    // Update specific item quantity directly (+ / - buttons in cart view)
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) => {
                const itemId = item._id || item.id;
                if (itemId === id) {
                    const maxQty = item.stock ? Math.min(newQuantity, item.stock) : newQuantity;
                    return { ...item, quantity: maxQty };
                }
                return item;
            })
        );
    };

    // Clear entire cart (for checkout or reset)
    const clearCart = () => setCart([]);

    // Calculated fields
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                showCart,
                setShowCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);