import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartTotal = () => {

  const { currency, delivery_fee, getCartAmount, backendUrl } = useContext(ShopContext);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  const cartTotal = getCartAmount();
  const finalTotal = cartTotal === 0 ? 0 : cartTotal + delivery_fee - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    try {
      const response = await axios.post(backendUrl + '/api/coupon/validate', {
        code: couponCode,
        cartTotal: cartTotal
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponDiscount(response.data.coupon.discount);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to apply coupon');
    }
    setIsApplying(false);
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  }

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

        {/* Coupon Discount */}
        {appliedCoupon && (
          <>
            <div className='flex justify-between text-green-600'>
              <p>Coupon Discount ({appliedCoupon.code})</p>
              <p>- {currency} {couponDiscount.toFixed(2)}</p>
            </div>
            <hr />
          </>
        )}

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{currency} {finalTotal.toFixed(2)}</b>
        </div>
      </div>

      {/* Coupon Input */}
      <div className='mt-6'>
        {!appliedCoupon ? (
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='Enter coupon code'
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className='border px-3 py-2 flex-1 text-sm uppercase'
              disabled={isApplying}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying}
              className='bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 disabled:bg-gray-400'
            >
              {isApplying ? 'APPLYING...' : 'APPLY'}
            </button>
          </div>
        ) : (
          <div className='flex items-center justify-between bg-green-50 border border-green-200 px-4 py-2'>
            <div>
              <p className='text-sm font-medium text-green-700'>
                Coupon Applied: {appliedCoupon.code}
              </p>
              <p className='text-xs text-green-600'>
                {appliedCoupon.type === 'percentage'
                  ? `${appliedCoupon.value}% off`
                  : `$${appliedCoupon.value} off`}
              </p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className='text-red-500 hover:text-red-700 font-bold'
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTotal
