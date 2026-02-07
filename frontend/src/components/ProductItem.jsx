import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price }) => {

  const { currency, wishlist, addToWishlist, removeFromWishlist } = useContext(ShopContext);

  // Handle both old (array of strings) and new (array of objects) image formats
  const getImageUrl = () => {
    if (!image || !image[0]) return '';
    return typeof image[0] === 'string' ? image[0] : image[0].url;
  };

  const isInWishlist = wishlist.includes(id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <div className='group relative'>
      <Link onClick={() => scrollTo(0, 0)} className='block' to={`/product/${id}`}>
        {/* Product Image Container */}
        <div className='relative overflow-hidden bg-neutral-100 mb-4 aspect-portrait'>
          <img
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
            src={getImageUrl()}
            alt={name}
          />

          {/* Wishlist Heart - Always visible on hover */}
          <button
            onClick={toggleWishlist}
            className='absolute top-3 right-3 bg-white rounded-full p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10'
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <svg className='w-5 h-5 text-red-500' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
              </svg>
            ) : (
              <svg className='w-5 h-5 text-neutral-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
            )}
          </button>
        </div>

        {/* Product Info */}
        <div className='space-y-1'>
          <h3 className='text-sm text-neutral-900 font-medium line-clamp-2 group-hover:text-black transition-colors'>
            {name}
          </h3>
          <p className='text-base font-semibold text-black'>
            {currency}{price}
          </p>
        </div>
      </Link>
    </div>
  )
}

export default ProductItem
