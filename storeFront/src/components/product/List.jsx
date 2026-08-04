import { Link } from 'react-router-dom';
import useFetchItems from '../../hooks/useFetchItems';
import { useCart } from '../../context/CartProvider';

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
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '1.5rem'
                    }}
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
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div>
                                    {/* Image Display */}
                                    <div 
                                        style={{ 
                                            width: '100%', 
                                            height: '180px', 
                                            backgroundColor: '#f7fafc',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        {product.imageUrl ? (
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>No Image</span>
                                        )}
                                    </div>

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
                                    
                                    <h3 style={{ fontSize: '1.1rem', margin: '0.25rem 0 0.5rem 0' }}>
                                        {product.title}
                                    </h3>

                                    {/* Description Preview */}
                                    {product.description && (
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
                                    )}
                                </div>

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
                                        >
                                            Details
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
                                        >
                                            Add to Cart
                                        </button>
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