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

  // NEW: Variant-based pricing
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(0);

  // Zoom functionality states
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)

        let initialImage = item.images && item.images.length > 0
          ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
          : (item.image && item.image[0] ? item.image[0] : '');

        // Check for listing variant (Admin default) to auto-select color
        if (item.variants && item.variants.length > 0) {
          const listingVariant = item.variants.find(v => v.isListingVariant);
          if (listingVariant) {
            setColor(listingVariant.color);
            // Also update initial image to match this color immediately to prevent flash
            if (item.images) {
              const variantImage = item.images.find(img => img.color === listingVariant.color);
              if (variantImage) {
                initialImage = variantImage.url;
              }
            }
          }
        }

        setImage(initialImage)

        // Set initial price
        const initialPrice = item.basePrice || item.discountPrice || item.price || 0;
        setDisplayPrice(initialPrice);

        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  // Update images when color changes
  useEffect(() => {
    if (productData && productData.images && productData.images.length > 0) {
      // Get images for selected color
      const getDisplayImages = () => {
        if (color && productData.colors?.length > 0) {
          // Show images for selected color OR general images (color=null)
          return productData.images.filter(img =>
            !img.color || img.color === color
          );
        }
        // No color selected or no colors defined - show all images
        return productData.images;
      };

      const displayImages = getDisplayImages();
      if (displayImages.length > 0) {
        const firstImg = displayImages[0];
        const imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url;
        setImage(imageUrl);
      }
    }
  }, [color, productData])

  // NEW: Update selected variant and price when size/color changes
  useEffect(() => {
    if (productData) {
      if (size && color) {
        // Case 1: Both Size and Color selected -> Exact Variant
        if (productData.variants && productData.variants.length > 0) {
          const variant = productData.variants.find(v =>
            v.size === size && v.color === color
          );

          if (variant) {
            setSelectedVariant(variant);
            setDisplayPrice(variant.price);
          }
        } else {
          // Backward compatibility
          setSelectedVariant(null);
          setDisplayPrice(productData.discountPrice || productData.price || 0);
        }
      } else if (color) {
        // Case 2: Only Color selected -> Show Min Price for this Color
        if (productData.variants && productData.variants.length > 0) {
          const colorVariants = productData.variants.filter(v => v.color === color);
          if (colorVariants.length > 0) {
            // Find minimum price among variants of this color
            const minColorPrice = Math.min(...colorVariants.map(v => v.price));
            setDisplayPrice(minColorPrice);
            setSelectedVariant(null); // No specific variant selected yet (needs size)
          }
        } else {
          setDisplayPrice(productData.discountPrice || productData.price || 0);
        }
      } else {
        // Case 3: Nothing selected -> Show Base Price
        setSelectedVariant(null);
        setDisplayPrice(productData.basePrice || productData.discountPrice || productData.price || 0);
      }
    }
  }, [size, color, productData])

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
              (() => {
                // Filter images based on selected color
                let displayImages = productData.images || productData.image || [];

                if (color && productData.colors?.length > 0) {
                  // Show images for selected color OR general images (color=null)
                  displayImages = displayImages.filter(img => {
                    if (typeof img === 'string') return true; // Backward compatibility
                    return !img.color || img.color === color;
                  });
                }

                return displayImages.map((item, index) => {
                  const imgUrl = typeof item === 'string' ? item : item.url;
                  return (
                    <img
                      onClick={() => setImage(imgUrl)}
                      src={imgUrl}
                      key={index}
                      className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-neutral-300 transition-all'
                      alt=""
                    />
                  );
                });
              })()
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
          <h1 className='font-medium text-2xl mt-2'>
            {selectedVariant && selectedVariant.variantTitle ? selectedVariant.variantTitle : (productData.title || productData.name)}
          </h1>
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
            <p className='text-3xl font-medium'>
              {currency}{displayPrice}
              {!selectedVariant && productData.variants && productData.variants.length > 0 && (
                <span className='text-sm text-gray-500 ml-2'>from</span>
              )}
            </p>
            {productData.price && productData.price !== displayPrice && (
              <p className='text-xl text-gray-400 line-through'>{currency}{productData.price}</p>
            )}
          </div>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Color Selector */}
          {productData.colors && productData.colors.length > 0 && (
            <div className='flex flex-col gap-4 my-6'>
              <p>Select Color</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.colors.map((item, index) => {
                  // Check stock using variants array (new model)  or stockByVariant (old model)
                  let stock = 0;
                  let isOutOfStock = false;

                  if (size) {
                    if (productData.variants && productData.variants.length > 0) {
                      // NEW MODEL: Find variant by size and color
                      const variant = productData.variants.find(v => v.size === size && v.color === item);
                      stock = variant ? variant.stock : 0;
                      isOutOfStock = variant ? variant.stock === 0 : true;
                    } else {
                      // OLD MODEL: Use stockByVariant map
                      const variantKey = `${size}-${item}`;
                      stock = productData.stockByVariant ? productData.stockByVariant[variantKey] : 0;
                      isOutOfStock = stock === 0;
                    }
                  }

                  return (
                    <button
                      onClick={() => !isOutOfStock && setColor(item)}
                      className={`border py-2 px-4 relative ${isOutOfStock && size ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100'
                        } ${item === color ? 'border-orange-500 bg-orange-50' : ''}`}
                      key={index}
                      disabled={isOutOfStock && size}
                    >
                      {item}
                      {stock > 0 && stock < 5 && size && (
                        <span className='absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded'>{stock}</span>
                      )}
                      {isOutOfStock && size && <span className='text-xs block mt-1'>Out</span>}
                    </button>
                  );
                })}
              </div>
              {!size && <p className='text-sm text-gray-500'>Select size first to see color availability</p>}
            </div>
          )}

          {/* Size Selector */}
          <div className='flex flex-col gap-4 my-6'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes && productData.sizes.map((item, index) => {
                // Check stock using variants array (new model) or stockByVariant (old model)
                let stock = 0;
                let isOutOfStock = false;

                if (color) {
                  if (productData.variants && productData.variants.length > 0) {
                    // NEW MODEL: Find variant by size and color
                    const variant = productData.variants.find(v => v.size === item && v.color === color);
                    stock = variant ? variant.stock : 0;
                    isOutOfStock = variant ? variant.stock === 0 : true;
                  } else {
                    // OLD MODEL: Use stockByVariant map
                    const variantKey = `${item}-${color}`;
                    stock = productData.stockByVariant ? productData.stockByVariant[variantKey] : 0;
                    isOutOfStock = stock === 0;
                  }
                } else {
                  // No color selected - check if ANY color has stock for this size
                  if (productData.variants && productData.variants.length > 0) {
                    const hasStock = productData.variants.some(v => v.size === item && v.stock > 0);
                    isOutOfStock = !hasStock;
                  }
                }

                return (
                  <button
                    onClick={() => !isOutOfStock && setSize(item)}
                    className={`border py-2 px-4 relative ${isOutOfStock && color ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100'
                      } ${item === size ? 'border-orange-500' : ''}`}
                    key={index}
                    disabled={isOutOfStock && color}
                  >
                    {item}
                    {stock > 0 && stock < 5 && color && (
                      <span className='absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded'>{stock}</span>
                    )}
                    {isOutOfStock && color && <span className='text-xs block mt-1'>Out</span>}
                  </button>
                );
              })}
            </div>
            {!color && productData.colors && productData.colors.length > 0 && (
              <p className='text-sm text-gray-500'>💡 Select color first to see exact stock for each size</p>
            )}
          </div>

          <button
            onClick={() => {
              // If product has variants (new model), send variantId
              if (selectedVariant) {
                addToCart(productData._id, selectedVariant._id);
              } else {
                // Backward compatibility: send size and color
                addToCart(productData._id, size, color);
              }
            }}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>
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
