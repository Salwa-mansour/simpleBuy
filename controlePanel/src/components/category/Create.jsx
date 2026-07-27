import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors on submit
    setCreating(true);

    if (!categoryName) {
      setError("Category name is required");
      setCreating(false);
      return;
    }

    try {
    const response =  await axiosPrivate.post('/category/create', {
        categoryName,
        description: categoryDesc // Matched key to req.body.description in Express controller
      });

      // Reset form fields
      setCategoryName("");
      setCategoryDesc("");
      
      navigate('/categories');
    } catch (err) {
      console.error(err);
      // Grab response message from Express backend if available
      const serverMessage = err.response?.data?.message || err.message || "Failed to create category";
      setError(serverMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section>
      <h2>Create New Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="categoryDesc">Category Description:</label>
          <textarea
            id="categoryDesc"
            value={categoryDesc}
            onChange={(e) => setCategoryDesc(e.target.value)}
          />
        </div>
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create Category'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  );
};

export default CreateCategory;