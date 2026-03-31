import React, { useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import Loader from '../components/Loader';

const Cart = () => {

  const { currency, updateQuantity, navigate, getBackendCartItems, getUserCart, token, cartItems, products } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const buildCart = async () => {
      const isFirstLoad = !hasLoaded.current;
      if (isFirstLoad) setLoading(true);

      if (token) {
        if (isFirstLoad) {
          // Initial load only: fetch full cart data from backend (images, prices, stock).
          const backendCart = await getBackendCartItems();
          setCartData(backendCart);
        } else {
          // Subsequent updates (e.g. triggered by updateQuantity / getUserCart):
          // Update quantities locally from the already-synced cartItems context.
          // This avoids a backend round-trip whose stale response causes the 1-2-1-2 flicker.
          setCartData(prev =>
            prev
              .map(item => {
                const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                const qty = cartItems[item.productId]?.[key];
                if (qty === undefined || qty <= 0) return null; // item was removed
                return { ...item, quantity: qty };
              })
              .filter(Boolean)
          );
        }
      } else {
        // Guest: build display rows from local cartItems + products
        const rows = [];
        for (const productId in cartItems) {
          const productInfo = products.find(p => p._id === productId);
          if (!productInfo) continue;
          for (const variantKey in cartItems[productId]) {
            const qty = cartItems[productId][variantKey];
            if (qty <= 0) continue;
            const isVariantId = variantKey.length === 24 && !variantKey.includes('-');
            if (isVariantId && productInfo.variants) {
              const variant = productInfo.variants.find(v => v._id.toString() === variantKey);
              rows.push({
                productId,
                variantId: variantKey,
                title: productInfo.name,
                image: productInfo.images?.[0]?.url || productInfo.image?.[0] || '',
                price: variant?.price ?? productInfo.discountPrice ?? productInfo.price ?? 0,
                size: variant?.size || '',
                color: variant?.color || '',
                quantity: qty,
                stock: variant?.stock ?? 100,
              });
            } else {
              const parts = variantKey.split('-');
              const size = parts[0];
              const color = parts.length > 1 ? parts.slice(1).join('-') : null;
              rows.push({
                productId,
                variantId: null,
                title: productInfo.name,
                image: productInfo.images?.[0]?.url || productInfo.image?.[0] || '',
                price: productInfo.discountPrice ?? productInfo.price ?? 0,
                size,
                color,
                quantity: qty,
                stock: 100,
              });
            }
          }
        }
        setCartData(rows);
      }

      if (isFirstLoad) {
        hasLoaded.current = true;
        setLoading(false);
      }
    };
    // Only wait for products to load before showing guest cart
    if (!token && products.length === 0) return;
    buildCart();
  }, [token, cartItems, products]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='border-t pt-14'>

        <div className='flex flex-col lg:flex-row gap-10 lg:gap-20'>

          <div className='flex-1'>
            <div className=' text-2xl mb-3'>
              <Title text1={'YOUR'} text2={'CART'} />
            </div>
            {
              cartData.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 gap-5'>
                  {/* Shopping Bag SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <h2 className='text-xl font-bold tracking-widest text-gray-900 uppercase'>Your Bag is Empty</h2>
                  <p className='text-sm text-gray-500'>Your cart is ready to roll, but it&apos;s feeling a bit empty without some stylish finds.</p>
                  <div className='flex w-full max-w-md mt-2 gap-3'>
                    <button
                      onClick={() => navigate('/collection')}
                      className='flex-1 bg-black text-white text-sm font-bold tracking-widest py-4 hover:bg-gray-800 transition-colors'
                    >
                      START SHOPPING
                    </button>
                    <button
                      onClick={() => navigate('/wishlist')}
                      className='flex-1 border border-black text-black text-sm font-bold tracking-widest py-4 hover:bg-gray-50 transition-colors'
                    >
                      ADD FROM WISHLIST
                    </button>
                  </div>
                </div>
              ) : (
                cartData.map((item, index) => {
                  const currentStock = item.stock || 100; // Default to 100 if not provided
                  const isDeleting = loading === item.productId + (item.variantId || item.size); // Use loading state for specific item deletion if needed, but better to use a unique ID

                  return (
                    <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_1fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                      <div className=' flex items-start gap-6'>
                        <img className='w-16 sm:w-20' src={item.image || ''} alt="" />
                        <div>
                          <p className='text-xs sm:text-lg font-medium'>{item.title}</p>
                          <div className='flex items-center gap-5 mt-2'>
                            <p>{currency}{item.price?.toFixed(2)}</p>
                            <div className='flex gap-2'>
                              <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                              {item.color && <p className='px-2 sm:px-3 sm:py-1 border bg-blue-50 text-blue-700'>{item.color}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col gap-2 items-center sm:flex-row sm:items-center sm:col-span-2'>
                        <div className='flex justify-center sm:justify-end sm:flex-1 sm:order-2'>
                          {actionLoading === (item.productId + (item.variantId || (item.color ? `${item.size}-${item.color}` : item.size))) ? (
                            <div className='w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin'></div>
                          ) : (
                            <img
                              onClick={async () => {
                                const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                                const uniqueId = item.productId + key;
                                setActionLoading(uniqueId);
                                await updateQuantity(item.productId.toString(), key, 0);
                                if (token) {
                                  // Logged-in: refresh from backend
                                  const refreshedCart = await getBackendCartItems();
                                  setCartData(refreshedCart);
                                  await getUserCart(token);
                                } else {
                                  // Guest: filter out the deleted item locally
                                  setCartData(prev => prev.filter(
                                    ci => !(ci.productId === item.productId &&
                                      (ci.variantId || (ci.color ? `${ci.size}-${ci.color}` : ci.size)) === key)
                                  ));
                                }
                                setActionLoading(null);
                              }}
                              className='w-4 sm:w-5 cursor-pointer hover:scale-110 transition-transform'
                              src={assets.bin_icon}
                              alt="Delete"
                            />
                          )}
                        </div>

                        <div className='flex flex-col gap-1 items-start sm:order-1 scale-[0.8] sm:scale-100'>
                          <div className='flex items-center border border-gray-300 rounded-md overflow-hidden h-8 sm:h-10'>
                            <button
                              onClick={async () => {
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
                                await updateQuantity(item.productId.toString(), key, newQty);
                                // Refresh global cart state so CartTotal updates
                                if (token) {
                                  await getUserCart(token);
                                }
                              }}
                              className='px-3 h-full bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600'
                              disabled={item.quantity <= 1}
                            >-</button>

                            <div className='w-10 sm:w-16 h-full flex items-center justify-center font-medium text-gray-700 text-sm border-x border-gray-200 bg-white'>
                              {item.quantity}
                            </div>

                            <button
                              onClick={async () => {
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
                                await updateQuantity(item.productId.toString(), key, newQty);
                                // Refresh global cart state so CartTotal updates
                                if (token) {
                                  await getUserCart(token);
                                }
                              }}
                              className='px-3 h-full bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600'
                              disabled={item.quantity >= currentStock}
                            >+</button>
                          </div>
                          {/* Stock feedback */}
                          <p className='text-xs font-medium'>
                            {currentStock <= 10 ? (
                            currentStock > 0 ? <span className="text-orange-500 text-xs font-medium">Only {currentStock} left</span> : <span className="text-red-500 text-xs font-medium uppercase tracking-wider">Out of Stock</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            }
          </div>

          {cartData.length > 0 && (
            <div className='w-full lg:w-[450px]'>
              <CartTotal />
              <div className=' w-full text-end'>
                <button onClick={() => token ? navigate('/place-order') : navigate('/login?redirect=/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
              </div>
            </div>
          )}

        </div>


      </div>
    </div>
  )

}

export default Cart
