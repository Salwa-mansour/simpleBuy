import { useEffect, useState } from 'react';
import useFetchItems from '../../hooks/useFetchItems';
import useDeleteItem from '../../hooks/useDeleteItem';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CategoryList = () => {
    const [fetchedCategories, loading, error] = useFetchItems('/category');
    const [categoryList, setCategoryList] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    // Pass a callback to useDeleteItem that accepts the deleted ID directly!
    const handleDeleteSuccess = (deletedId) => {
        setCategoryList(prev => prev.filter(cat => String(cat._id || cat.id) !== String(deletedId)));
    };

    const deleteItem = useDeleteItem('/category', handleDeleteSuccess);

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

    const handleDeleteClick = async (id) => {
        // If your useDeleteItem hook takes (id, onSuccessCallback) directly when called:
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
                                
                                <Link to={`/category/${categoryId}/edit`} title="Edit Category">
                                    <FontAwesomeIcon icon={faEdit} />
                                </Link>

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

export default CategoryList;