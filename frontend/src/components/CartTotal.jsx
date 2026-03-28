import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useNotification } from '../context/NotificationContext'
import Title from './Title';
import axios from 'axios';

const CartTotal = () => {

  const { currency, delivery_fee, getCartAmount, backendUrl, cartItems, token } = useContext(ShopContext);
  const { show } = useNotification();

  
  const [cartTotal, setCartTotal] = useState(0);

  // Calculate cart total (async)
  useEffect(() => {
    const fetchCartTotal = async () => {
      const total = await getCartAmount();
      setCartTotal(total);
    };
    fetchCartTotal();
  }, [cartItems, getCartAmount]); // Recalculate when cart changes

  const finalTotal = cartTotal === 0 ? 0 : cartTotal + delivery_fee;

  

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{currency} {cartTotal}.00</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{currency} {cartTotal === 0 ? 0 : delivery_fee}.00</p>
        </div>
        <hr />

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {finalTotal.toFixed(2)}</b>
        </div>
      </div>

      {/* Coupon is applied on checkout page now */}
    </div>
  )
}

export default CartTotal
