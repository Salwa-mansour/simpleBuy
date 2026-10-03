import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetchOneItem from '../../hooks/useFetchOneItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useCart } from '../../context/CartProvider';


function ProductDetails() {
    const { id } = useParams();
    const [product, loading, fetchError] = useFetchOneItem("product", id);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => {
            const nextVal = prev + delta;
            if (nextVal < 1) return 1;
            if (product?.stock && nextVal > product.stock) return product.stock;
            return nextVal;
        });
    };

  
    if (loading) {
        return <p style={{ textAlign: 'center', padding: '3rem' }}>Loading product details...</p>;
    }

    if (fetchError || !product) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'red', marginBottom: '1rem' }}>
                    {typeof fetchError === 'string' 
                        ? fetchError 
                        : fetchError?.message || "Product not found or failed to load."}
                </p>
                <Link to="/" className="main-btn">
                  
                    Back to Store
                </Link>
            </div>
        );
    }

    const categoryName = typeof product.category === 'object' 
        ? product.category?.name 
        : 'General';

    const isOutOfStock = product.stock <= 0;

    // Helper to format dimensions into a single readable string (e.g. "6 x 4 x 2 in")
    const formattedDimensions = product.dimensions
        ? `${product.dimensions.length ?? ''} × ${product.dimensions.width ?? ''} × ${product.dimensions.height ?? ''} ${product.dimensions.unit || ''}`.trim()
        : null;

    // Helper to format weight (e.g. "1.5 lb")
    const formattedWeight = product.weight?.value !== undefined 
        ? `${product.weight.value} ${product.weight.unit || ''}`.trim()
        : null;

    return (
        <section  className="main-container">
            {/* Back Button */}
            <div className='back-link'>
                <Link to="/"   >
                   <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                      <path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l-7 7 7 7"/>
                    </svg>
                    <span>
                          Back to Store
                    </span>
                       
                </Link>
            </div>
           

            <article className="product-Detail" >
                {/* Left Column: Product Image */}
                <figure className='product-image' >
                        <img 
                            src={product?.imageUrl} 
                            alt={product?.title} 
                        />
                </figure>

                {/* Right Column: Product Information */}
                <div className='product-info' >
                  
                        {/* Category Tag */}
                        <span className="category-tag" > {categoryName}</span>

                        <h1 className="product-title"> {product.title}</h1>

                        <p className="product-price">
                            ${Number(product.price).toFixed(2)}
                        </p>

                        <div className="stock-info" >
                            <p  className={` ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                            </p>
                        </div>

                      
                        {/* Shipping Specifications Section */}
                        {(formattedWeight || formattedDimensions) && (
                            <div className='shipping-specs' >
                                <h4 className='title'>Shipping Specifications</h4>
                                <ul >
                                    {formattedWeight && (
                                        <li className='weight' >
                                            <strong >Weight : </strong> 
                                            <span>{formattedWeight}</span> 
                                        </li>
                                    )}
                                    {formattedDimensions && (
                                        <li className='dimensions' >
                                            <strong >Dimensions (L × W × H) : </strong> 
                                            <span>{formattedDimensions}</span> 
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                  

                    {/* Quantity & Cart Action */}
                    {!isOutOfStock && (
                        <div className="add-to-cart-section">
                            {/* Quantity Controls */}
                            <div className='quantity-controles' >
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className='quantity-btn decrease'
                                >
                                    -
                                </button>
                                <span className='quantity'>{quantity}</span>
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                   className='quantity-btn increase'
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                               className="main-btn"
                            >
                                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                            </button>
                        </div>
                    )}
                      {/* Description */}
                        <div className='product-desc'>
                            <h4 className='title'>Description</h4>
                            <p >
                                {product.description || "No description provided for this item."}
                            </p>
                        </div>

                </div>
            </article>
        </section>
    );
}

export default ProductDetails;