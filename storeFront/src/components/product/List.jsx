import { Link } from 'react-router-dom';
import useFetchItems from '../../hooks/useFetchItems';
import { useCart } from '../../context/CartProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faCartPlus } from '@fortawesome/free-solid-svg-icons';
import '../../css/product.css';


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
                            <div  key={productId} className="product-card" >
                                    {/* Image Display */}
                                    <figure >
                                            <img 
                                                src={product?.imageUrl} 
                                                alt={product?.title} 
                                                
                                            />
                                    </figure>
                                   
                                    <div className="product-data" >
                                        {/* Category & Title */}
                                        <span 
                                           className="category-label"
                                        >
                                            {categoryName}
                                        </span>
                                        
                                        <h5 >
                                            {product.title}
                                        </h5>

                                     
                                
                                       {/* Price, Stock & Action Buttons */}
                                     
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <span className='price'>
                                                    ${Number(product.price).toFixed(2)}
                                                </span>

                                                <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                                                    {!isOutOfStock ? `${product.stock} in stock` : 'Out of Stock'}
                                                </span>
                                            </div>

                                        

                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(product, 1)}
                                                    disabled={isOutOfStock}
                                                   className={`add-to-cart-btn main-btn ${isOutOfStock ? 'disabled' : ''}`}
                                                    title='add to cart'
                                                >
                                                    add to cart
                                                </button>
                                            
                                       
                                    </div>
                                     <Link  to={`/products/${productId}`} className="view-details-link"
                                     title={`View details of ${product.title}`} ></Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProductList;