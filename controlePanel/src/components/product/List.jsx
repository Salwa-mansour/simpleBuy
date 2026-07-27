import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useFetchItems from '../../hooks/useFetchItems';
import useDeleteItem from '../../hooks/useDeleteItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const ProductList = () => {
    const [fetchedProducts, loading, error] = useFetchItems('/product');
    const [productList, setProductList] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    // Callback passed to useDeleteItem so state updates cleanly without closure issues
    const handleDeleteSuccess = (deletedId) => {
        setProductList(prev => prev.filter(prod => String(prod._id || prod.id) !== String(deletedId)));
    };

    const deleteItem = useDeleteItem('/product', handleDeleteSuccess);

    useEffect(() => {
        if (fetchedProducts) {
            setProductList(fetchedProducts);
        }
    }, [fetchedProducts]);

    useEffect(() => {
        if (error) {
            console.error('Error fetching products:', error);
        }
    }, [error, navigate, location]);

    const handleDeleteClick = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            deleteItem(id);
        }
    };

    if (loading) return <p>Loading Products...</p>;
    if (error) return <p style={{ color: 'red' }}>Error fetching Products: {typeof error === 'string' ? error : error.message}</p>;

    return (
        <section>
            <h2>Products List</h2>
            <Link to="/createproduct">Create New Product</Link>

            {productList.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {productList.map((product) => {
                        const productId = product._id || product.id;
                        return (
                            <li key={productId} style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
                                {product.imageUrl && (
                                    <img src={product.imageUrl} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                )}
                                <div>
                                    <strong>{product.title}</strong> - ${product.price} (Stock: {product.stock})
                                    <br />
                                    <small>Category: {product.category?.name || 'Uncategorized'}</small>
                                </div>
                                
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                    <Link to={`/product/${productId}/edit`} title="Edit Product">
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Link>

                                    <button 
                                        onClick={() => handleDeleteClick(productId)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}
                                        title="Delete Product"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No Products found.</p>
            )}
        </section>
    );
};

export default ProductList;