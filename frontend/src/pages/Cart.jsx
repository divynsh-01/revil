import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import Loader from '../components/Loader';

const Cart = () => {

  const { currency, updateQuantity, navigate, getBackendCartItems, getUserCart, token } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (token) {
      const fetchCartData = async () => {
        setLoading(true);
        const backendCart = await getBackendCartItems();
        setCartData(backendCart);
        setLoading(false);
      };
      fetchCartData();
    } else if (!localStorage.getItem('token')) {
      // If no token and no token in local storage, stop loading (guest or logged out)
      setLoading(false);
      setCartData([]); // Clear cart data
    }
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {
          cartData.length === 0 ? (
            <p className='text-center text-gray-500 py-10'>Your cart is empty</p>
          ) : (
            cartData.map((item, index) => {
              const currentStock = item.stock || 100; // Default to 100 if not provided
              const isDeleting = loading === item.productId + (item.variantId || item.size); // Use loading state for specific item deletion if needed, but better to use a unique ID

              return (
                <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className=' flex items-start gap-6'>
                    <img className='w-16 sm:w-20' src={item.image || ''} alt="" />
                    <div>
                      <p className='text-xs sm:text-lg font-medium'>{item.title}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{item.price}</p>
                        <div className='flex gap-2'>
                          <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                          {item.color && <p className='px-2 sm:px-3 sm:py-1 border bg-blue-50 text-blue-700'>{item.color}</p>}
                        </div>
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>Stock: {currentStock}</p>
                    </div>
                  </div>

                  <div className='flex flex-col gap-1 items-start'>
                    <div className='flex items-center border border-gray-300 rounded-md overflow-hidden h-8 sm:h-10'>
                      <button
                        onClick={() => {
                          const newQty = item.quantity - 1;
                          if (newQty < 1) return;
                          const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                          // Optimistic update
                          const updatedCartData = cartData.map(cartItem => {
                            const isSameItem = cartItem.productId === item.productId &&
                              cartItem.variantId === item.variantId &&
                              cartItem.size === item.size &&
                              cartItem.color === item.color;
                            if (isSameItem) {
                              return { ...cartItem, quantity: newQty };
                            }
                            return cartItem;
                          });
                          setCartData(updatedCartData);
                          updateQuantity(item.productId.toString(), key, newQty);
                        }}
                        className='px-3 h-full bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600'
                        disabled={item.quantity <= 1}
                      >-</button>

                      <div className='w-10 sm:w-16 h-full flex items-center justify-center font-medium text-gray-700 text-sm border-x border-gray-200 bg-white'>
                        {item.quantity}
                      </div>

                      <button
                        onClick={() => {
                          const newQty = item.quantity + 1;
                          if (newQty > currentStock) return;
                          const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                          // Optimistic update
                          const updatedCartData = cartData.map(cartItem => {
                            const isSameItem = cartItem.productId === item.productId &&
                              cartItem.variantId === item.variantId &&
                              cartItem.size === item.size &&
                              cartItem.color === item.color;
                            if (isSameItem) {
                              return { ...cartItem, quantity: newQty };
                            }
                            return cartItem;
                          });
                          setCartData(updatedCartData);
                          updateQuantity(item.productId.toString(), key, newQty);
                        }}
                        className='px-3 h-full bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600'
                        disabled={item.quantity >= currentStock}
                      >+</button>
                    </div>
                    {/* Stock feedback */}
                    <p className='text-xs font-medium'>
                      {currentStock < 5 ? (
                        currentStock > 0 ? <span className="text-orange-500">Only {currentStock} left</span> : <span className="text-red-500">Out of Stock</span>
                      ) : null}
                    </p>
                  </div>

                  <div className='flex justify-end'>
                    {actionLoading === (item.productId + (item.variantId || (item.color ? `${item.size}-${item.color}` : item.size))) ? (
                      <div className='w-4 h-4 mr-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin'></div>
                    ) : (
                      <img
                        onClick={async () => {
                          const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                          const uniqueId = item.productId + key;
                          // Set specific loading state for this item
                          setActionLoading(uniqueId);
                          await updateQuantity(item.productId.toString(), key, 0);
                          // Refresh local cart display
                          const refreshedCart = await getBackendCartItems();
                          setCartData(refreshedCart);
                          // Refresh global cart state so CartTotal updates
                          if (token) {
                            await getUserCart(token);
                          }
                          setActionLoading(null); // Reset loading state
                        }}
                        className='w-4 mr-4 sm:w-5 cursor-pointer hover:scale-110 transition-transform'
                        src={assets.bin_icon}
                        alt="Delete"
                      />
                    )}
                  </div>
                </div>
              )
            })
          )
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>

    </div>
  )

}

export default Cart
