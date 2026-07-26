import { useEffect, useState } from "react";
import useFetchOneItem from "../../hooks/useFetchOneItem";
import { useParams, useNavigate } from "react-router";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [category, loading, fetchError] = useFetchOneItem("category", id);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (category) {
      setNewName(category.name || "");
      setNewDescription(category.description || "");
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Payload keys match req.body expectations in Express controller
    const newCategoryData = {
      categoryName: newName,
      description: newDescription
    };

    try {
      setUpdating(true);
      setUpdateError(null);
      
      await axiosPrivate.put(`/category/${id}`, newCategoryData);

      setNewName("");
      setNewDescription("");
      navigate('/categories');
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message || err.message || "Failed to update category";
      setUpdateError(serverMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading category details...</p>;

  return (
    <section>
      <h2>Edit Category</h2>

      {/* Render fetch error if the initial GET request fails */}
      {fetchError && (
        <p style={{ color: 'red' }}>
          {typeof fetchError === 'string' ? fetchError : fetchError.message || "Failed to load category"}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Category Name:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={newName}
            required
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description">Category Description:</label>
          <textarea
            name="description"
            id="description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={updating}>
          {updating ? 'Updating...' : 'Update Category'}
        </button>
      </form>

      {updateError && <p style={{ color: 'red' }}>{updateError}</p>}
    </section>
  );
}

export default EditCategory;