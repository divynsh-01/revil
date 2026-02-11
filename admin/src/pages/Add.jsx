import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {

  // Color-specific images: { color: [file1, file2, ...], "Black": [img1, img2], "White": [img3] }
  const [colorImages, setColorImages] = useState({});
  const [generalImages, setGeneralImages] = useState([]); // For products without colors

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
  const [variantPrices, setVariantPrices] = useState({}); // NEW: Per-variant pricing

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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {

      const formData = new FormData()

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
      formData.append("variantPrices", JSON.stringify(variantPrices)) // NEW: Send variant prices

      // Handle image uploads
      if (colors.length > 0) {
        // Upload color-specific images
        let imageIndex = 0;
        colors.forEach(color => {
          if (colorImages[color]) {
            colorImages[color].forEach(img => {
              if (img) {
                formData.append(`image${imageIndex}`, img);
                formData.append(`imageColor${imageIndex}`, color);
                imageIndex++;
              }
            });
          }
        });
      } else {
        // Upload general images (no color association)
        generalImages.forEach((img, index) => {
          if (img) {
            formData.append(`image${index}`, img);
            formData.append(`imageColor${index}`, ""); // Empty string for no color
          }
        });
      }

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setTitle('')
        setDescription('')
        setBrand('')
        setPrice('')
        setDiscountPrice('')
        setSizes([])
        setColors([])
        setStockByVariant({})
        setVariantPrices({}) // Reset variant prices
        setColorImages({})
        setGeneralImages([])
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

      {/* Image Upload Section */}
      <div className='w-full'>
        <p className='mb-2 font-medium'>Upload Product Images</p>

        {colors.length > 0 ? (
          // Color-specific image uploads
          <div className='flex flex-col gap-4'>
            {colors.map(color => (
              <div key={color} className='border p-4 rounded bg-gray-50'>
                <p className='mb-2 font-medium text-sm'>{color} Images</p>
                <div className='flex gap-2'>
                  {[0, 1, 2, 3].map(index => (
                    <label key={index} htmlFor={`${color}-image-${index}`}>
                      <img
                        className='w-20 cursor-pointer'
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
            <div className='flex gap-2'>
              {[0, 1, 2, 3].map(index => (
                <label key={index} htmlFor={`general-image-${index}`}>
                  <img
                    className='w-20 cursor-pointer'
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
        <p className='mb-2'>Brand Name</p>
        <input onChange={(e) => setBrand(e.target.value)} value={brand} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Enter brand name' />
      </div>


      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div className='flex-1'>
          <p className='mb-2'>Product category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div className='flex-1'>
          <p className='mb-2'>Sub category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div className='flex-1'>
          <p className='mb-2'>Base Price (₹)</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2' type="Number" placeholder='499' required />
          <p className='text-xs text-gray-500 mt-1'>💡 Default price for variants. You can set specific prices below.</p>
        </div>

        <div className='flex-1'>
          <p className='mb-2'>Discount Price (₹)</p>
          <input onChange={(e) => setDiscountPrice(e.target.value)} value={discountPrice} className='w-full px-3 py-2' type="Number" placeholder='399' />
          <p className='text-xs text-gray-500 mt-1'>Optional. For display purposes only.</p>
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

      <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

    </form>
  )
}

export default Add