import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ discount = 0, couponCode = null }) => {

  const { currency, delivery_fee, getCartAmount, cartItems } = useContext(ShopContext);

  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const fetchCartTotal = async () => {
      const total = await getCartAmount();
      setCartTotal(total);
    };
    fetchCartTotal();
  }, [cartItems, getCartAmount]);

  const shipping = cartTotal === 0 ? 0 : delivery_fee;
  const finalTotal = Math.max(0, cartTotal + shipping - discount);

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
          <p>{currency} {shipping}.00</p>
        </div>
        <hr />

        {discount > 0 && (
          <>
            <div className='flex justify-between text-green-600 font-medium'>
              <p>Discount {couponCode ? `(${couponCode})` : ''}</p>
              <p>- {currency} {discount.toFixed(2)}</p>
            </div>
            <hr />
          </>
        )}

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {finalTotal.toFixed(2)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal

