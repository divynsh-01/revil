import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [showTracking, setShowTracking] = useState(null)
  const [trackingData, setTrackingData] = useState({
    courier: '',
    trackingId: '',
    trackingUrl: ''
  })

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleAddTracking = async (orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/tracking',
        { orderId, ...trackingData },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Tracking information added')
        setShowTracking(null)
        setTrackingData({ courier: '', trackingId: '', trackingUrl: '' })
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div>
      <h3 className='text-2xl font-bold mb-4'>Order Management</h3>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <p className='font-medium mb-2'>Order ID: {order.orderId}</p>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}> {item.title} x {item.quantity} <span> {item.size} </span> </p>
                    }
                    else {
                      return <p className='py-0.5' key={index}> {item.title} x {item.quantity} <span> {item.size} </span> ,</p>
                    }
                  })}
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <>
                    <p className='mt-3 mb-2 font-medium'>{order.shippingAddress.name}</p>
                    <div>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    </div>
                    <p>{order.shippingAddress.phone}</p>
                  </>
                )}

                {/* Tracking Info */}
                {order.tracking?.trackingId && (
                  <div className='mt-3 p-2 bg-blue-50 border border-blue-200'>
                    <p className='font-medium'>Tracking:</p>
                    <p>Courier: {order.tracking.courier}</p>
                    <p>ID: {order.tracking.trackingId}</p>
                    {order.tracking.trackingUrl && (
                      <a href={order.tracking.trackingUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline text-xs'>
                        Track →
                      </a>
                    )}
                  </div>
                )}

                {/* Add Tracking Button */}
                {!order.tracking?.trackingId && (
                  <button
                    onClick={() => setShowTracking(order._id)}
                    className='mt-2 text-xs text-blue-600 hover:underline'
                  >
                    + Add Tracking
                  </button>
                )}

                {/* Tracking Form */}
                {showTracking === order._id && (
                  <div className='mt-2 p-3 border bg-gray-50'>
                    <input
                      type='text'
                      placeholder='Courier (e.g., FedEx, DHL)'
                      value={trackingData.courier}
                      onChange={(e) => setTrackingData({ ...trackingData, courier: e.target.value })}
                      className='border px-2 py-1 w-full mb-2 text-xs'
                    />
                    <input
                      type='text'
                      placeholder='Tracking ID'
                      value={trackingData.trackingId}
                      onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                      className='border px-2 py-1 w-full mb-2 text-xs'
                    />
                    <input
                      type='text'
                      placeholder='Tracking URL (optional)'
                      value={trackingData.trackingUrl}
                      onChange={(e) => setTrackingData({ ...trackingData, trackingUrl: e.target.value })}
                      className='border px-2 py-1 w-full mb-2 text-xs'
                    />
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleAddTracking(order._id)}
                        className='bg-black text-white px-3 py-1 text-xs'
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowTracking(null)}
                        className='border px-3 py-1 text-xs'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.payment?.method || 'COD'}</p>
                <p>Payment : {order.payment?.status === 'paid' ? 'Done' : 'Pending'}</p>
                <p>Date : {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Pricing */}
              {order.pricing && (
                <div className='text-sm'>
                  <p>Subtotal: {currency}{order.pricing.subtotal}</p>
                  {order.pricing.shipping > 0 && <p>Shipping: {currency}{order.pricing.shipping}</p>}
                  {order.pricing.discount > 0 && <p className='text-green-600'>Discount: -{currency}{order.pricing.discount}</p>}
                  <p className='font-bold mt-1'>Total: {currency}{order.pricing.total}</p>
                </div>
              )}

              <select onChange={(event) => statusHandler(event, order._id)} value={order.orderStatus} className='p-2 font-semibold'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders