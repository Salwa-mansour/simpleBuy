import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useFetchItems from '../../hooks/useFetchItems';

function CreateProduct() {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    // Fetch categories for the select dropdown
    const [categories, categoriesLoading, categoriesError] = useFetchItems('/category');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('1');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // Shipping states
    const [weightValue, setWeightValue] = useState('1');
    const [weightUnit, setWeightUnit] = useState('lb');
    const [length, setLength] = useState('6');
    const [width, setWidth] = useState('4');
    const [height, setHeight] = useState('2');
    const [dimensionUnit, setDimensionUnit] = useState('in');

    const [createError, setCreateError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setCreateError(null);

        let uploadedImageUrl = '';

        // Step 1: Upload image to Cloudinary if selected
        if (imageFile) {
            const ONE_MEGABYTE = 1 * 1024 * 1024;
            if (imageFile.size > ONE_MEGABYTE) {
                alert("File is too large! Please choose an image smaller than 1MB.");
                setSubmitting(false);
                return;
            }

            try {
                // Fetch secure signature parameters from backend
                const sigResponse = await axiosPrivate.get('/product/generate-upload-signature');
                const { signature, timestamp, apiKey, cloudName } = sigResponse.data;
             
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);
                formData.append('folder', 'simleBuy');
                formData.append('transformation', 'w_400,c_limit');

                // Upload directly to Cloudinary
                const cloudResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formData
                );

                uploadedImageUrl = cloudResponse.data.secure_url;
            } catch (err) {
                console.error('Cloudinary upload failed:', err);
                setCreateError('Failed to upload image. Please try again.');
                setSubmitting(false);
                return;
            }
        }

        // Step 2: Send Product payload to backend
        try {
            const productData = {
                title,
                description,
                price: Number(price),
                stock: Number(stock),
                category,
                imageUrl: uploadedImageUrl,
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

            await axiosPrivate.post('/product/create', productData);
            navigate('/products');
        } catch (err) {
            console.error(err);
            const serverMessage = err.response?.data?.message || err.message || "Failed to create product";
            setCreateError(serverMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section>
            <h2>Create New Product</h2>

            {categoriesError && (
                <p style={{ color: 'red' }}>Failed to load categories for dropdown.</p>
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

                <div>
                    <label htmlFor="image">Product Image:</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
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

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Uploading & Creating...' : 'Create Product'}
                </button>
            </form>

            {createError && <p style={{ color: 'red' }}>{createError}</p>}
        </section>
    );
}

export default CreateProduct;