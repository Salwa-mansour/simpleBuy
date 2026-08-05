import { Link } from 'react-router-dom';
import useFetchItems from '../../hooks/useFetchItems';
import { useCart } from '../../context/CartProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faCartPlus } from '@fortawesome/free-solid-svg-icons';


function ProductList() {
    // Reusing your custom hook to fetch all products
    const [products, loading, error] = useFetchItems('/product');
    const { addToCart } = useCart();

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading storefront...</p>;
    
    if (error) {
        return (
            <p style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>
                {typeof error === 'string' ? error : error.message || 'Failed to load store products.'}
            </p>
        );
    }

    return (
        <section className="main-container">
            <h2 className='title'>Store Products</h2>

            {!products || products.length === 0 ? (
                <p>No products available yet. Check back soon!</p>
            ) : (
                <div 
                    className="product-grid"
                >
                    {products.map((product) => {
                        const productId = product._id || product.id;
                        const categoryName = typeof product.category === 'object' 
                            ? product.category?.name 
                            : 'General';
                        const isOutOfStock = product.stock <= 0;

                        return (
                            <div 
                                key={productId} 
                                className="product-card"
                               
                            >
                                
                                    {/* Image Display */}
                                        <Link 
                                            to={`/products/${productId}`}>
                                            <figure >
                                                {product.imageUrl ? (
                                                    <img 
                                                        src={product.imageUrl} 
                                                        alt={product.title} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>No Image</span>
                                                )}
                                            </figure>
                                    </Link>
                                    <div className="product-data" >
                                        {/* Category & Title */}
                                        <span 
                                            style={{ 
                                                fontSize: '0.75rem', 
                                                color: '#718096', 
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            {categoryName}
                                        </span>
                                        
                                        <h5 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
                                            {product.title}
                                        </h5>

                                        {/* Description Preview */}
                                        {/* {product.description && (
                                            <p style={{ 
                                                fontSize: '0.875rem', 
                                                color: '#4a5568', 
                                                margin: '0 0 1rem 0',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {product.description}
                                            </p>
                                        )} */}
                                
                                       {/* Price, Stock & Action Buttons */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2b6cb0' }}>
                                                    ${Number(product.price).toFixed(2)}
                                                </span>

                                                <span style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: !isOutOfStock ? '#38a169' : '#e53e3e',
                                                    fontWeight: '600'
                                                }}>
                                                    {!isOutOfStock ? `${product.stock} in stock` : 'Out of Stock'}
                                                </span>
                                            </div>

                                            {/* Actions Group */}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link 
                                                    to={`/products/${productId}`}
                                                    style={{
                                                        flex: 1,
                                                        textAlign: 'center',
                                                        backgroundColor: '#edf2f7',
                                                        color: '#2d3748',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        textDecoration: 'none',
                                                        fontWeight: '500',
                                                        fontSize: '0.875rem'
                                                    }}
                                                    title={`View details of ${product.title}`}
                                                >
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(product, 1)}
                                                    disabled={isOutOfStock}
                                                    style={{
                                                        flex: 1.2,
                                                        backgroundColor: isOutOfStock ? '#cbd5e0' : '#3182ce',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        fontWeight: '500',
                                                        fontSize: '0.875rem',
                                                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    title='add to cart'
                                                >
                                                    <FontAwesomeIcon icon={faCartPlus} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProductList;