import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ProductForm = ({ token, initialData, isEdit }) => {

    const navigate = useNavigate();

    // Color-specific images: { color: [file1, file2, ...], "Black": [img1, img2], "White": [img3] }
    const [colorImages, setColorImages] = useState({});
    const [generalImages, setGeneralImages] = useState([]); // For products without colors
    const [existingImages, setExistingImages] = useState([]); // To show existing images logic if needed (Edit mode)

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [brand, setBrand] = useState("Revi'L");
    const [isBrandManual, setIsBrandManual] = useState(false);
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [bestseller, setBestseller] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [stockByVariant, setStockByVariant] = useState({});
    const [variantPrices, setVariantPrices] = useState({});
    const [colorTitles, setColorTitles] = useState({});
    const [defaultListingColor, setDefaultListingColor] = useState("");

    const [catList, setCatList] = useState([]);
    const [subCatList, setSubCatList] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data for Edit mode
    useEffect(() => {
        if (isEdit && initialData) {
            setTitle(initialData.title || "");
            setDescription(initialData.description || "");
            setPrice(initialData.price || "");
            setDiscountPrice(initialData.discountPrice || "");
            setBrand(initialData.brand || "Revi'L");
            setIsBrandManual(initialData.brand !== "Revi'L");
            setCategory(initialData.category || "");
            setSubCategory(initialData.subCategory || "");
            setBestseller(initialData.bestseller || false);
            setIsFeatured(initialData.isFeatured || false);
            setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
            setSizes(initialData.sizes || []);
            setColors(initialData.colors || []);
            setStockByVariant(initialData.stockByVariant || {});

            // Parse variants to populate prices/titles/listing color
            if (initialData.variants) {
                const prices = {};
                const titles = {};
                let defaultCol = "";

                initialData.variants.forEach(v => {
                    const key = `${v.size}-${v.color}`;
                    prices[key] = v.price;
                    if (v.variantTitle) titles[v.color] = v.variantTitle;
                    if (v.isListingVariant) defaultCol = v.color;
                });
                setVariantPrices(prices);
                setColorTitles(titles);
                setDefaultListingColor(defaultCol);
            }

            // We don't pre-fill file inputs, but we could show existing images if we improved the UI
            setExistingImages(initialData.images || []);
        }
    }, [initialData, isEdit]);


    // Handle image upload for a specific color
    const handleColorImageUpload = (color, index, file) => {
        setColorImages(prev => {
            const newImages = { ...prev };
            if (!newImages[color]) {
                newImages[color] = [];
            }
            newImages[color][index] = file;
            return newImages;
        });
    };

    // Handle general image upload (for products without colors)
    const handleGeneralImageUpload = (index, file) => {
        setGeneralImages(prev => {
            const newImages = [...prev];
            newImages[index] = file;
            return newImages;
        });
    };


    const fetchCategories = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/category/list')
            if (response.data.success) {
                setCatList(response.data.categories)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axios.get(backendUrl + '/api/subcategory/active/' + categoryId)
            if (response.data.success) {
                setSubCatList(response.data.subCategories)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const fetchColors = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/color/list')
            if (response.data.success) {
                setAvailableColors(response.data.colors)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchColors()
    }, [])

    useEffect(() => {
        if (catList.length > 0) {
            // Only default if NOT in edit mode or if category is empty
            if (!category) {
                let selectedCat = catList[0]
                setCategory(selectedCat.name)
            }

            const selectedCat = catList.find(cat => cat.name === category);
            if (selectedCat) {
                fetchSubCategories(selectedCat.categoryId)
            }
        }
    }, [category, catList])


    useEffect(() => {
        // Only default subcategory if not set (or if invalid)
        if (subCatList.length > 0 && !subCategory) {
            setSubCategory(subCatList[0].name)
        }
    }, [subCatList, subCategory])

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const formData = new FormData()

            if (isEdit) {
                formData.append("productId", initialData._id);
            }

            formData.append("title", title)
            formData.append("description", description)
            formData.append("price", price)
            formData.append("discountPrice", discountPrice)
            formData.append("brand", brand)
            formData.append("category", category)
            formData.append("subCategory", subCategory)
            formData.append("bestseller", bestseller)
            formData.append("isFeatured", isFeatured)
            formData.append("isActive", isActive)
            formData.append("sizes", JSON.stringify(sizes))
            formData.append("colors", JSON.stringify(colors))
            formData.append("stockByVariant", JSON.stringify(stockByVariant))
            formData.append("variantPrices", JSON.stringify(variantPrices))
            formData.append("colorTitles", JSON.stringify(colorTitles))
            formData.append("defaultListingColor", defaultListingColor)

            // Handle image uploads
            // For Edit: we only send NEW images. Backend needs to handle partial updates or replacement.
            // Current backend logic replaces ALL. Future improvement: granular updates.
            if (colors.length > 0) {
                let imageIndex = 0;
                colors.forEach(color => {
                    const specificImages = colorImages[color] && colorImages[color].some(img => img) ? colorImages[color] : [];
                    // If editing, we might not have new images for every color.
                    // Ideally we only append if `specificImages` has something.

                    if (specificImages.length > 0) {
                        specificImages.forEach(img => {
                            if (img) {
                                formData.append(`imageColor${imageIndex}`, color);
                                formData.append(`image${imageIndex}`, img);
                                imageIndex++;
                            }
                        });
                    }
                });
            } else {
                generalImages.forEach((img, index) => {
                    if (img) {
                        formData.append(`imageColor${index}`, "");
                        formData.append(`image${index}`, img);
                    }
                });
            }

            const endpoint = isEdit ? "/api/product/update" : "/api/product/add";
            const response = await axios.post(backendUrl + endpoint, formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                if (isEdit) {
                    navigate('/list');
                } else {
                    // Reset form
                    setTitle('')
                    setDescription('')
                    setBrand('Revi\'L')
                    setIsBrandManual(false)
                    setPrice('')
                    setDiscountPrice('')
                    setSizes([])
                    setColors([])
                    setStockByVariant({})
                    setVariantPrices({})
                    setColorTitles({})
                    setDefaultListingColor("")
                    setColorImages({})
                    setGeneralImages([])
                }
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
            {isEdit && <h2 className='text-2xl font-bold mb-4'>Edit Product</h2>}

            {/* Image Upload Section */}
            <div className='w-full'>
                <p className='mb-2 font-medium'>Upload Product Images {isEdit && "(Upload new to replace)"}</p>

                {colors.length > 0 ? (
                    // Color-specific image uploads
                    <div className='flex flex-col gap-4'>
                        {colors.map(color => (
                            <div key={color} className='border p-4 rounded bg-gray-50'>
                                <p className='mb-2 font-medium text-sm'>{color} Images</p>

                                {/* Show existing images simple view for context if edit */}
                                {isEdit && existingImages.filter(img => img.color === color).length > 0 && (
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-xs text-gray-500">Current:</span>
                                        {existingImages.filter(img => img.color === color).map((img, i) => (
                                            <img key={i} src={img.url} className="w-10 h-10 object-cover rounded" alt="Current" />
                                        ))}
                                    </div>
                                )}

                                <div className='flex gap-2'>
                                    {[0, 1, 2, 3].map(index => (
                                        <label key={index} htmlFor={`${color}-image-${index}`}>
                                            <img
                                                className='w-20 cursor-pointer object-cover aspect-square'
                                                src={colorImages[color]?.[index] ? URL.createObjectURL(colorImages[color][index]) : assets.upload_area}
                                                alt=""
                                            />
                                            <input
                                                onChange={(e) => handleColorImageUpload(color, index, e.target.files[0])}
                                                type="file"
                                                id={`${color}-image-${index}`}
                                                hidden
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // General image uploads (no color)
                    <div>
                        <p className='text-sm text-gray-500 mb-2'>Select colors to upload color-specific images, or upload general images below</p>
                        {isEdit && existingImages.length > 0 && (
                            <div className="flex gap-2 mb-2">
                                <span className="text-xs text-gray-500">Current:</span>
                                {existingImages.map((img, i) => (
                                    <img key={i} src={img.url || img} className="w-10 h-10 object-cover rounded" alt="Current" />
                                ))}
                            </div>
                        )}
                        <div className='flex gap-2'>
                            {[0, 1, 2, 3].map(index => (
                                <label key={index} htmlFor={`general-image-${index}`}>
                                    <img
                                        className='w-20 cursor-pointer object-cover aspect-square'
                                        src={generalImages[index] ? URL.createObjectURL(generalImages[index]) : assets.upload_area}
                                        alt=""
                                    />
                                    <input
                                        onChange={(e) => handleGeneralImageUpload(index, e.target.files[0])}
                                        type="file"
                                        id={`general-image-${index}`}
                                        hidden
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className='w-full'>
                <p className='mb-2'>Product Title</p>
                <input onChange={(e) => setTitle(e.target.value)} value={title} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
            </div>

            <div className='w-full'>
                <p className='mb-2'>Product Description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Write content here' rows='3' required />
            </div>

            <div className='w-full'>
                <div className='flex justify-between items-center mb-2 max-w-[500px]'>
                    <p>Brand Name</p>
                    <div className='flex items-center gap-2'>
                        <input
                            type="checkbox"
                            id="manualBrand"
                            checked={isBrandManual}
                            onChange={() => {
                                setIsBrandManual(prev => {
                                    if (prev) setBrand("Revi'L"); // Reset if unchecking
                                    return !prev;
                                });
                            }}
                        />
                        <label htmlFor="manualBrand" className='text-sm text-gray-600 cursor-pointer'>Manual Brand Name</label>
                    </div>
                </div>
                <input
                    onChange={(e) => setBrand(e.target.value)}
                    value={brand}
                    className={`w-full max-w-[500px] px-3 py-2 ${!isBrandManual ? 'bg-gray-100 text-gray-500' : ''}`}
                    type="text"
                    placeholder='Enter brand name'
                    disabled={!isBrandManual}
                />
            </div>


            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

                <div className='flex-1'>
                    <p className='mb-2'>Product category</p>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
                        {catList.map((item) => (
                            <option key={item._id} value={item.name}>{item.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1'>
                    <p className='mb-2'>Sub category</p>
                    <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
                        {subCatList.map((item) => (
                            <option key={item._id} value={item.name}>{item.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1'>
                    <p className='mb-2'>Base Price (₹)</p>
                    <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2' type="Number" placeholder='499' required />
                    <p className='text-xs text-gray-500 mt-1'>💡 Default price for variants.</p>
                </div>

                <div className='flex-1'>
                    <p className='mb-2'>Discount Price (₹)</p>
                    <input onChange={(e) => setDiscountPrice(e.target.value)} value={discountPrice} className='w-full px-3 py-2' type="Number" placeholder='399' />
                </div>
            </div>

            <div>
                <p className='mb-2'>Product Sizes</p>
                <div className='flex gap-3'>
                    {["S", "M", "L", "XL", "XXL"].map(size => (
                        <div key={size} onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}>
                            <p className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>{size}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <p className='mb-2'>Available Colors</p>
                <div className='flex gap-3 flex-wrap mb-4'>
                    {availableColors.map((item) => (
                        <div key={item._id} onClick={() => setColors(prev => prev.includes(item.name) ? prev.filter(c => c !== item.name) : [...prev, item.name])}>
                            <p className={`${colors.includes(item.name) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer text-sm flex items-center gap-2`}>
                                {item.hexCode && <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.hexCode }}></span>}
                                {item.name}
                            </p>
                        </div>
                    ))}
                </div>

                {colors.length > 0 && (
                    <div className='flex flex-col gap-3 mt-2'>
                        <p className='text-sm font-medium'>Color-wise Titles (Optional)</p>
                        {colors.map(color => (
                            <div key={color} className='flex items-center gap-3'>
                                <span className='w-16 text-sm'>{color}:</span>
                                <input
                                    type="text"
                                    placeholder={`Title for ${color} variant`}
                                    className='border px-3 py-1 w-full max-w-[400px] text-sm'
                                    value={colorTitles[color] || ""}
                                    onChange={(e) => setColorTitles(prev => ({ ...prev, [color]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Default Listing Color Selection */}
                {colors.length > 0 && (
                    <div className='mt-4'>
                        <p className='mb-2 font-medium text-sm'>Default Listing Color (Show on Home)</p>
                        <div className='flex gap-3 flex-wrap'>
                            {colors.map(color => (
                                <div
                                    key={color}
                                    onClick={() => setDefaultListingColor(color)}
                                    className={`px-3 py-1 border cursor-pointer text-sm ${defaultListingColor === color ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                                >
                                    {color}
                                </div>
                            ))}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>Select which color variant will be displayed on the main product listing.</p>
                    </div>
                )}
            </div>

            <div className='w-full'>
                <p className='mb-2'>Variant Management (Stock & Price per variant)</p>
                {colors.length > 0 ? (
                    // Grid view for size + color combinations with PRICE
                    <div className='overflow-x-auto'>
                        <table className='border-collapse border border-gray-300 w-full'>
                            <thead>
                                <tr>
                                    <th className='border border-gray-300 px-3 py-2 bg-gray-50 text-sm'>Size / Color</th>
                                    {colors.map((color) => (
                                        <th key={color} className='border border-gray-300 px-3 py-2 bg-gray-50 text-sm' colSpan={2}>
                                            {color}
                                        </th>
                                    ))}
                                </tr>
                                <tr>
                                    <th className='border border-gray-300 px-2 py-1 bg-gray-100 text-xs'></th>
                                    {colors.map((color) => (
                                        <React.Fragment key={color}>
                                            <th className='border border-gray-300 px-2 py-1 bg-blue-50 text-xs'>Stock</th>
                                            <th className='border border-gray-300 px-2 py-1 bg-green-50 text-xs'>Price (₹)</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.map((size) => (
                                    <tr key={size}>
                                        <td className='border border-gray-300 px-3 py-2 bg-gray-50 font-medium text-sm'>{size}</td>
                                        {colors.map((color) => {
                                            const variantKey = `${size}-${color}`;
                                            return (
                                                <React.Fragment key={variantKey}>
                                                    <td className='border border-gray-300 p-1'>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-300"
                                                            value={stockByVariant[variantKey] || ''}
                                                            onChange={(e) => setStockByVariant(prev => ({ ...prev, [variantKey]: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </td>
                                                    <td className='border border-gray-300 p-1'>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder={price || "499"}
                                                            className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-green-300"
                                                            value={variantPrices[variantKey] || ''}
                                                            onChange={(e) => setVariantPrices(prev => ({ ...prev, [variantKey]: parseInt(e.target.value) || 0 }))}
                                                        />
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className='text-xs text-gray-500 mt-2'>💡 Enter stock and price for each size+color combination. Leave price blank to use base price.</p>
                    </div>
                ) : (
                    // Size-only for products without colors
                    <div>
                        <p className='text-sm text-gray-500 mb-2'>ℹ️ Select colors to track stock and price per size+color combination</p>
                        {sizes.length > 0 && (
                            <div className='flex flex-col gap-2'>
                                {sizes.map((size) => (
                                    <div key={size} className='flex items-center gap-3'>
                                        <label className='w-12 text-sm font-medium'>{size}:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Stock"
                                            className="px-3 py-1 border border-gray-300 text-sm w-24"
                                            value={stockByVariant[size] || ''}
                                            onChange={(e) => setStockByVariant(prev => ({ ...prev, [size]: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {sizes.length === 0 && <p className='text-sm text-gray-500'>Please select sizes first</p>}
                {sizes.length > 0 && colors.length === 0 && <p className='text-sm text-orange-600 mt-2'>Note: No colors selected. Stock will be tracked by size only.</p>}
            </div>

            <div className='flex gap-4 mt-2 flex-wrap'>
                <div className='flex gap-2'>
                    <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
                    <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
                </div>

                <div className='flex gap-2'>
                    <input onChange={() => setIsFeatured(prev => !prev)} checked={isFeatured} type="checkbox" id='featured' />
                    <label className='cursor-pointer' htmlFor="featured">Featured Product</label>
                </div>

                <div className='flex gap-2'>
                    <input onChange={() => setIsActive(prev => !prev)} checked={isActive} type="checkbox" id='active' />
                    <label className='cursor-pointer' htmlFor="active">Active (Visible to customers)</label>
                </div>
            </div>

            <button
                type="submit"
                className={`w-28 py-3 mt-4 text-white transition-opacity ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black active:bg-gray-700'}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? "PROCESSING..." : (isEdit ? "UPDATE" : "ADD")}
            </button>

        </form>
    )
}

export default ProductForm
