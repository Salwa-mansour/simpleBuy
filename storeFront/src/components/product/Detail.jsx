import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetchOneItem from '../../hooks/useFetchOneItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
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
                <Link to="/" style={{ color: '#3182ce', textDecoration: 'none' }}>
                    <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '6px' }} />
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
            <Link to="/"   >
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Store
            </Link>

            <article className="product-Detail" >
                {/* Left Column: Product Image */}
                <figure >
                    {product.imageUrl ? (
                        <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                    ) : (
                        <span style={{ color: '#a0aec0', fontSize: '1rem' }}>No Image Available</span>
                    )}
                </figure>

                {/* Right Column: Product Information */}
                <div className='product-info' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        {/* Category Tag */}
                        <span 
                            style={{ 
                                display: 'inline-block',
                                backgroundColor: '#ebf8ff',
                                color: '#2b6cb0',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                marginBottom: '0.75rem'
                            }}
                        >
                            {categoryName}
                        </span>

                        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', color: '#1a202c' }}>
                            {product.title}
                        </h1>

                        <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2b6cb0', margin: '0 0 1rem 0' }}>
                            ${Number(product.price).toFixed(2)}
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span 
                                style={{ 
                                    fontWeight: '600',
                                    color: isOutOfStock ? '#e53e3e' : '#38a169',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                            </span>
                        </div>

                        {/* Description */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>Description</h4>
                            <p style={{ color: '#718096', lineHeight: '1.6', margin: 0 }}>
                                {product.description || "No description provided for this item."}
                            </p>
                        </div>

                        {/* Shipping Specifications Section */}
                        {(formattedWeight || formattedDimensions) && (
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>Shipping Specifications</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#718096', lineHeight: '1.8' }}>
                                    {formattedWeight && (
                                        <li>
                                            <strong style={{ color: '#4a5568' }}>Weight: </strong> 
                                            {formattedWeight}
                                        </li>
                                    )}
                                    {formattedDimensions && (
                                        <li>
                                            <strong style={{ color: '#4a5568' }}>Dimensions (L × W × H): </strong> 
                                            {formattedDimensions}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Quantity & Cart Action */}
                    {!isOutOfStock && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '4px' }}>
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    style={{ padding: '0.5rem 0.8rem', border: 'none', background: '#f7fafc', cursor: 'pointer' }}
                                >
                                    -
                                </button>
                                <span style={{ padding: '0.5rem 1rem', fontWeight: '600' ,color:'black'}}>{quantity}</span>
                                <button 
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    style={{ padding: '0.5rem 0.8rem', border: 'none', background: '#f7fafc', cursor: 'pointer' }}
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#3182ce',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            </article>
        </section>
    );
}

export default ProductDetails;