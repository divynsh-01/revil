import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import Loader from '../components/Loader';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')

  // Zoom functionality states
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        // Handle both old (array of strings) and new (array of objects) image formats
        const firstImage = item.images && item.images.length > 0
          ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
          : (item.image && item.image[0] ? item.image[0] : '');
        setImage(firstImage)
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  // Handle mouse move for zoom
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return productData ? (
    <div className='border-t-1.5 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full scrollbar-hide'>
            {
              (productData.images || productData.image || []).map((item, index) => {
                const imgUrl = typeof item === 'string' ? item : item.url;
                return (
                  <img
                    onClick={() => setImage(imgUrl)}
                    src={imgUrl}
                    key={index}
                    className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-neutral-300 transition-all'
                    alt=""
                  />
                )
              })
            }
          </div>

          {/* Main Image with Zoom */}
          <div className='w-full sm:w-[80%] relative overflow-hidden bg-neutral-50'>
            <img
              className='w-full h-auto cursor-crosshair'
              src={image}
              alt="Product"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            />

            {/* Zoomed Image Overlay */}
            {showZoom && (
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.title || productData.name}</h1>
          {productData.brand && <p className='text-gray-600 mt-1 text-sm'>Brand: <span className='font-medium'>{productData.brand}</span></p>}
          <div className=' flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className='pl-2'>(122)</p>
          </div>
          <div className='mt-5 flex items-center gap-3'>
            {productData.discountPrice ? (
              <>
                <p className='text-3xl font-medium text-orange-600'>{currency}{productData.discountPrice}</p>
                <p className='text-xl text-gray-400 line-through'>{currency}{productData.price}</p>
                <span className='bg-orange-100 text-orange-600 px-2 py-1 text-xs font-medium rounded'>SAVE {Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)}%</span>
              </>
            ) : (
              <p className='text-3xl font-medium'>{currency}{productData.price}</p>
            )}
          </div>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Color Selector */}
          {productData.colors && productData.colors.length > 0 && (
            <div className='flex flex-col gap-4 my-6'>
              <p>Select Color</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.colors.map((item, index) => (
                  <button
                    onClick={() => setColor(item)}
                    className={`border py-2 px-4 bg-gray-100 ${item === color ? 'border-orange-500 bg-orange-50' : ''}`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className='flex flex-col gap-4 my-6'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => {
                const stock = productData.stockByVariant ? productData.stockByVariant[item] : null;
                const isOutOfStock = stock !== null && stock === 0;
                return (
                  <button
                    onClick={() => !isOutOfStock && setSize(item)}
                    className={`border py-2 px-4 relative ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100'
                      } ${item === size ? 'border-orange-500' : ''}`}
                    key={index}
                    disabled={isOutOfStock}
                  >
                    {item}
                    {stock !== null && stock < 5 && stock > 0 && (
                      <span className='absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded'>{stock}</span>
                    )}
                    {isOutOfStock && <span className='absolute inset-0 flex items-center justify-center text-xs'>Out</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={() => addToCart(productData._id, size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <Loader />
}

export default Product
