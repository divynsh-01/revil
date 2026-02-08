import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'

const Edit = ({ token }) => {

    const { productId } = useParams()
    const navigate = useNavigate()

    const [image1, setImage1] = useState(false)
    const [image2, setImage2] = useState(false)
    const [image3, setImage3] = useState(false)
    const [image4, setImage4] = useState(false)

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("Men");
    const [subCategory, setSubCategory] = useState("Topwear");
    const [bestseller, setBestseller] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [stockByVariant, setStockByVariant] = useState({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.post(backendUrl + '/api/product/single', { productId })
                if (response.data.success) {
                    const product = response.data.product
                    setTitle(product.title || product.name)
                    setDescription(product.description)
                    setPrice(product.price)
                    setDiscountPrice(product.discountPrice || "")
                    setBrand(product.brand)
                    setCategory(product.category)
                    setSubCategory(product.subCategory)
                    setBestseller(product.bestseller)
                    setIsFeatured(product.isFeatured)
                    setIsActive(product.isActive)
                    setSizes(product.sizes)
                    setColors(product.colors || [])
                    setStockByVariant(product.stockByVariant || {})

                    // Note: We can't set file inputs with URL, so we just show them. 
                    // New uploads will replace them if needed.
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

        fetchProduct()
    }, [productId])

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {

            const formData = new FormData()

            formData.append("productId", productId)
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

            image1 && formData.append("image1", image1)
            image2 && formData.append("image2", image2)
            image3 && formData.append("image3", image3)
            image4 && formData.append("image4", image4)

            const response = await axios.post(backendUrl + "/api/product/update", formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                navigate('/list')
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
            <h2 className='text-2xl font-bold mb-4'>Edit Product</h2>

            <div>
                <p className='mb-2'>Update Images (Optional - Uploading new will replace existing)</p>

                <div className='flex gap-2'>
                    <label htmlFor="image1">
                        <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
                        <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
                    </label>
                    <label htmlFor="image2">
                        <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
                        <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
                    </label>
                    <label htmlFor="image3">
                        <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
                        <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
                    </label>
                    <label htmlFor="image4">
                        <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
                        <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
                    </label>
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2'>Product Title</p>
                <input onChange={(e) => setTitle(e.target.value)} value={title} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
            </div>

            <div className='w-full'>
                <p className='mb-2'>Brand Name</p>
                <input onChange={(e) => setBrand(e.target.value)} value={brand} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Enter brand name' />
            </div>

            <div className='w-full'>
                <p className='mb-2'>Product description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required />
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

                <div>
                    <p className='mb-2'>Product category</p>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Sub category</p>
                    <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
                        <option value="Topwear">Topwear</option>
                        <option value="Bottomwear">Bottomwear</option>
                        <option value="Winterwear">Winterwear</option>
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Product Price</p>
                    <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='1499' required />
                </div>

                <div>
                    <p className='mb-2'>Discount Price</p>
                    <input onChange={(e) => setDiscountPrice(e.target.value)} value={discountPrice} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='1299' />
                </div>

            </div>

            <div>
                <p className='mb-2'>Product Sizes</p>
                <div className='flex gap-3'>
                    <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}>
                        <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>S</p>
                    </div>

                    <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}>
                        <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>M</p>
                    </div>

                    <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}>
                        <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>L</p>
                    </div>

                    <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}>
                        <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XL</p>
                    </div>

                    <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}>
                        <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XXL</p>
                    </div>
                </div>
            </div>

            <div>
                <p className='mb-2'>Available Colors</p>
                <div className='flex gap-3 flex-wrap'>
                    {["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Gray", "Navy", "Beige"].map((color) => (
                        <div key={color} onClick={() => setColors(prev => prev.includes(color) ? prev.filter(item => item !== color) : [...prev, color])}>
                            <p className={`${colors.includes(color) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer text-sm`}>{color}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2'>Stock Quantity (per size)</p>
                <div className='flex gap-3 flex-wrap'>
                    {sizes.map((size) => (
                        <div key={size} className='flex flex-col'>
                            <label className='text-sm mb-1'>{size}</label>
                            <input
                                type="number"
                                min="0"
                                placeholder='0'
                                className='w-20 px-2 py-1 border'
                                value={stockByVariant[size] || ''}
                                onChange={(e) => setStockByVariant(prev => ({ ...prev, [size]: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    ))}
                </div>
                {sizes.length === 0 && <p className='text-sm text-gray-500'>Please select sizes first</p>}
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

            <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>UPDATE</button>

        </form>
    )
}

export default Edit
