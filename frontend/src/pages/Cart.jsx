import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { currency, updateQuantity, navigate, getBackendCartItems, getUserCart, token } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      setLoading(true);
      const backendCart = await getBackendCartItems();
      setCartData(backendCart);
      setLoading(false);
    };

    fetchCartData();
  }, []);

  if (loading) {
    return <div className='border-t pt-14 text-center'>Loading cart...</div>;
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
            cartData.map((item, index) => (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className=' flex items-start gap-6'>
                  {/* Use cart item's stored image (variant-specific or product image) */}
                  <img className='w-16 sm:w-20' src={item.image || ''} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{item.title}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      {/* Use cart item's stored price (variant price at time of add) */}
                      <p>{currency}{item.price}</p>
                      <div className='flex gap-2'>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                        {item.color && <p className='px-2 sm:px-3 sm:py-1 border bg-blue-50 text-blue-700'>{item.color}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) => {
                    const newQty = Number(e.target.value);
                    if (e.target.value === '' || newQty === 0) return;

                    // For variant model, use variantId; for old model, use size-color key
                    const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                    updateQuantity(item.productId.toString(), key, newQty);
                  }}
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                />
                <img
                  onClick={async () => {
                    const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size);
                    await updateQuantity(item.productId.toString(), key, 0);
                    // Refresh local cart display
                    const refreshedCart = await getBackendCartItems();
                    setCartData(refreshedCart);
                    // Refresh global cart state so CartTotal updates
                    if (token) {
                      await getUserCart(token);
                    }
                  }}
                  className='w-4 mr-4 sm:w-5 cursor-pointer'
                  src={assets.bin_icon}
                  alt=""
                />
              </div>
            ))
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
