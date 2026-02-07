import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Wishlist = () => {
    const { products, currency, wishlist, removeFromWishlist, addToCart, navigate } = useContext(ShopContext);
    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            const filteredProducts = products.filter(product => wishlist.includes(product._id));
            setWishlistProducts(filteredProducts);
        }
    }, [wishlist, products]);

    const handleAddToCart = (productId) => {
        const product = products.find(p => p._id === productId);
        if (product && product.sizes && product.sizes.length > 0) {
            // Add first available size
            addToCart(productId, product.sizes[0]);
        }
    };

    const handleMoveAllToCart = () => {
        wishlistProducts.forEach(product => {
            if (product.sizes && product.sizes.length > 0) {
                addToCart(product._id, product.sizes[0]);
            }
        });
    };

    return (
        <div className='border-t pt-14'>
            <div className='text-2xl mb-3'>
                <Title text1={'MY'} text2={'WISHLIST'} />
            </div>

            {wishlistProducts.length > 0 ? (
                <>
                    <div className='flex justify-between items-center mb-6'>
                        <p className='text-gray-600'>{wishlistProducts.length} item{wishlistProducts.length > 1 ? 's' : ''} in wishlist</p>
                        <button
                            onClick={handleMoveAllToCart}
                            className='bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 transition-colors'
                        >
                            MOVE ALL TO CART
                        </button>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                        {wishlistProducts.map((item, index) => (
                            <div key={index} className='relative'>
                                <ProductItem
                                    id={item._id}
                                    image={item.images}
                                    name={item.title || item.name}
                                    price={item.discountPrice || item.price}
                                />
                                <div className='flex gap-2 mt-2'>
                                    <button
                                        onClick={() => handleAddToCart(item._id)}
                                        className='flex-1 bg-black text-white py-2 text-xs hover:bg-gray-800 transition-colors'
                                    >
                                        ADD TO CART
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(item._id)}
                                        className='flex-1 border border-gray-300 py-2 text-xs hover:bg-gray-100 transition-colors'
                                    >
                                        REMOVE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='text-center py-20'>
                    <svg className='w-24 h-24 mx-auto mb-4 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                    </svg>
                    <h3 className='text-2xl font-medium mb-2'>Your wishlist is empty</h3>
                    <p className='text-gray-600 mb-6'>Save your favorite items here</p>
                    <button
                        onClick={() => navigate('/collection')}
                        className='bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors'
                    >
                        CONTINUE SHOPPING
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
