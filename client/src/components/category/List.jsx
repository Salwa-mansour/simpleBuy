import { useEffect, useState } from 'react';
import useFetchItems from '../../hooks/useFetchItems';
import useDeleteItem from '../../hooks/useDeleteItem';
import { useNavigate, useLocation, Link } from 'react-router'; 
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Categories = () => {
    const [fetchedCategories, loading, error] = useFetchItems('/category');
    const [categoryList, setCategoryList] = useState([]);
    const [lastDeletedId, setLastDeletedId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Callback passed to useDeleteItem to remove item from UI state upon successful deletion
    const handleDeleteSuccess = () => {
        if (lastDeletedId) {
            setCategoryList(prev => prev.filter(cat => (cat._id || cat.id) !== lastDeletedId));
            setLastDeletedId(null);
        }
    };

    // Instantiate your custom hook
    const deleteItem = useDeleteItem('/category', handleDeleteSuccess);

    // Keep local list in sync with fetched items
    useEffect(() => {
        if (fetchedCategories) {
            setCategoryList(fetchedCategories);
        }
    }, [fetchedCategories]);

    useEffect(() => {
        if (error) {
            console.error('Error fetching categories:', error);
        }
    }, [error, navigate, location]);

    const handleDeleteClick = (id) => {
        setLastDeletedId(id);
        deleteItem(id);
    };

    if (loading) return <p>Loading Categories...</p>;

    if (error) return <p style={{ color: 'red' }}>Error fetching Categories: {typeof error === 'string' ? error : error.message}</p>;

    return (
        <section>
            <h2>Categories List</h2>
            <Link to="/createcategory">Create New Category</Link>

            {categoryList.length > 0 ? (
                <ul>
                    {categoryList.map((category) => {
                        const categoryId = category._id || category.id;
                        return (
                            <li key={categoryId} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                <strong>{category.name}</strong>
                                
                                {/* Edit Link */}
                                <Link to={`/categories/${categoryId}/edit`} title="Edit Category">
                                    <FontAwesomeIcon icon={faEdit} />
                                </Link>

                                {/* Delete Button */}
                                <button 
                                    onClick={() => handleDeleteClick(categoryId)} 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}
                                    title="Delete Category"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No Categories found.</p>
            )}
        </section>
    );
};

export default Categories;