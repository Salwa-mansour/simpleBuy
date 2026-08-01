import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useFetchOneItem from "../../hooks/useFetchOneItem";
import useFetchItems from "../../hooks/useFetchItems";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const [product, loading, fetchError] = useFetchOneItem("product", id);
    const [categories, categoriesLoading] = useFetchItems("/category");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");

    // Shipping states
    const [weightValue, setWeightValue] = useState("1");
    const [weightUnit, setWeightUnit] = useState("lb");
    const [length, setLength] = useState("6");
    const [width, setWidth] = useState("4");
    const [height, setHeight] = useState("2");
    const [dimensionUnit, setDimensionUnit] = useState("in");
    
    // Image states
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [newImageFile, setNewImageFile] = useState(null);

    const [updateError, setUpdateError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (product) {
            setTitle(product.title || "");
            setDescription(product.description || "");
            setPrice(product.price !== undefined ? product.price : "");
            setStock(product.stock !== undefined ? product.stock : "");
            setCategory(product.category?._id || product.category || "");
            setExistingImageUrl(product.imageUrl || "");

            // Populate shipping fields if available
            if (product.weight) {
                setWeightValue(product.weight.value !== undefined ? product.weight.value : "1");
                setWeightUnit(product.weight.unit || "lb");
            }
            if (product.dimensions) {
                setLength(product.dimensions.length !== undefined ? product.dimensions.length : "6");
                setWidth(product.dimensions.width !== undefined ? product.dimensions.width : "4");
                setHeight(product.dimensions.height !== undefined ? product.dimensions.height : "2");
                setDimensionUnit(product.dimensions.unit || "in");
            }
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateError(null);

        let finalImageUrl = existingImageUrl;

        // Step 1: Upload image to Cloudinary if new file selected
        if (newImageFile) {
            const ONE_MEGABYTE = 1 * 1024 * 1024;
            if (newImageFile.size > ONE_MEGABYTE) {
                alert("File is too large! Please choose an image smaller than 1MB.");
                setUpdating(false);
                return;
            }

            try {
                const sigResponse = await axiosPrivate.get('/product/generate-upload-signature');
                const { signature, timestamp, apiKey, cloudName } = sigResponse.data;

                const formData = new FormData();
                formData.append('file', newImageFile);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);
                formData.append('folder', 'simleBuy');
                formData.append('transformation', 'w_400,c_limit');

                const cloudResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formData
                );

                finalImageUrl = cloudResponse.data.secure_url;
            } catch (err) {
                console.error('Cloudinary upload failed:', err);
                setUpdateError('Failed to upload new image. Please try again.');
                setUpdating(false);
                return;
            }
        }

        // Step 2: Send updated data to backend
        try {
            const updatedProductData = {
                title,
                description,
                price: Number(price),
                stock: Number(stock),
                category,
                imageUrl: finalImageUrl,
                weight: {
                    value: Number(weightValue),
                    unit: weightUnit
                },
                dimensions: {
                    length: Number(length),
                    width: Number(width),
                    height: Number(height),
                    unit: dimensionUnit
                }
            };

            await axiosPrivate.put(`/product/${id}`, updatedProductData);
            navigate('/products');
        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.message || err.message || "Failed to update product";
            setUpdateError(serverMessage);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p>Loading product details...</p>;

    return (
        <section>
            <h2>Edit Product</h2>

            {fetchError && (
                <p style={{ color: 'red' }}>
                    {typeof fetchError === 'string' ? fetchError : fetchError.message || "Failed to load product"}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title *:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        required
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="price">Price ($) *:</label>
                    <input
                        type="number"
                        id="price"
                        step="0.01"
                        min="0"
                        value={price}
                        required
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="stock">Stock *:</label>
                    <input
                        type="number"
                        id="stock"
                        min="0"
                        value={stock}
                        required
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="category">Category *:</label>
                    <select
                        id="category"
                        value={category}
                        required
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={categoriesLoading}
                    >
                        <option value="">-- Select a Category --</option>
                        {categories && categories.map((cat) => (
                            <option key={cat._id || cat.id} value={cat._id || cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {existingImageUrl && (
                    <div>
                        <p>Current Image:</p>
                        <img 
                            src={existingImageUrl} 
                            alt="Current Product" 
                            width="80"
                            height="80"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="image">Change Product Image:</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => setNewImageFile(e.target.files[0])}
                    />
                </div>

                <hr />
                <h3>Shipping Specifications</h3>

                <div>
                    <label htmlFor="weightValue">Weight *:</label>
                    <input
                        type="number"
                        id="weightValue"
                        step="0.1"
                        min="0"
                        value={weightValue}
                        required
                        onChange={(e) => setWeightValue(e.target.value)}
                    />
                    <select
                        id="weightUnit"
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                    >
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="length">Length *:</label>
                    <input
                        type="number"
                        id="length"
                        step="0.1"
                        min="0"
                        value={length}
                        required
                        onChange={(e) => setLength(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="width">Width *:</label>
                    <input
                        type="number"
                        id="width"
                        step="0.1"
                        min="0"
                        value={width}
                        required
                        onChange={(e) => setWidth(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="height">Height *:</label>
                    <input
                        type="number"
                        id="height"
                        step="0.1"
                        min="0"
                        value={height}
                        required
                        onChange={(e) => setHeight(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="dimensionUnit">Dimension Unit *:</label>
                    <select
                        id="dimensionUnit"
                        value={dimensionUnit}
                        onChange={(e) => setDimensionUnit(e.target.value)}
                    >
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                    </select>
                </div>

                <button type="submit" disabled={updating}>
                    {updating ? 'Uploading & Updating...' : 'Update Product'}
                </button>
            </form>

            {updateError && <p style={{ color: 'red' }}>{updateError}</p>}
        </section>
    );
}

export default EditProduct;