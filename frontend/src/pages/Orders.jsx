import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import Loader from '../components/Loader';

const Orders = () => {

  const { backendUrl, token, currency, navigate } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOrderData = async () => {
    try {
      setLoading(true);
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success && Array.isArray(response.data.orders)) {
        // Group by order — each order shown once with all its items
        const ordersWithItems = response.data.orders.map((order) => ({
          orderId: order.orderId,
          items: order.items,
          orderStatus: order.orderStatus,
          payment: order.payment,
          pricing: order.pricing,
          tracking: order.tracking,
          date: order.createdAt,
        }));
        setOrderData(ordersWithItems.reverse())
      }

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='border-t pt-16'>

        <div className='text-2xl'>
          <Title text1={'MY'} text2={'ORDERS'} />
        </div>

        {loading ? (
          <Loader />
        ) : orderData.length > 0 ? (
          <div>
            {
              orderData.map((order, index) => (
                <div key={index} className='py-6 border-t border-b text-gray-700 flex flex-col gap-4 mb-2'>
                  {/* Order Header */}
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-2'>
                        <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                        <p className='text-sm md:text-base font-medium'>{order.orderStatus}</p>
                      </div>
                      <span className='text-gray-300'>|</span>
                      <p className='text-sm text-gray-500'>Order ID: <span className='font-medium text-gray-700'>{order.orderId}</span></p>
                    </div>
                    <div className='flex items-center gap-3 text-sm text-gray-500'>
                      <p>Date: <span className='text-gray-600'>{new Date(order.date).toDateString()}</span></p>
                      <span className='text-gray-300'>|</span>
                      <p>Payment: <span className='text-gray-600'>{order.payment?.method} — {order.payment?.status}</span></p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className='flex flex-col gap-3'>
                    {order.items.map((item, idx) => (
                      <div key={idx} className='flex items-start gap-4 text-sm'>
                        <img className='w-16 sm:w-20 flex-shrink-0' src={item.image} alt={item.title} />
                        <div>
                          <p className='sm:text-base font-medium'>{item.title}</p>
                          <div className='flex items-center gap-3 mt-1 text-gray-600'>
                            <p>{currency}{item.price?.toFixed(2)}</p>
                            <p>Qty: {item.quantity}</p>
                            {item.size && <p>Size: {item.size}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown — shown once per order */}
                  {order.pricing && (
                    <div className='bg-gray-50 p-3 rounded text-sm flex flex-wrap gap-x-6 gap-y-1'>
                      <p>Subtotal: <span className='font-medium'>{currency}{order.pricing.subtotal?.toFixed(2)}</span></p>
                      {order.pricing.shipping > 0 && <p>Shipping: <span className='font-medium'>{currency}{order.pricing.shipping?.toFixed(2)}</span></p>}
                      {order.pricing.discount > 0 && <p className='text-green-600'>Discount: <span className='font-medium'>-{currency}{order.pricing.discount?.toFixed(2)}</span></p>}
                      <p className='font-semibold'>Total: {currency}{order.pricing.total?.toFixed(2)}</p>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.tracking?.trackingId && (
                    <div className='text-sm border border-blue-100 bg-blue-50 p-3 rounded'>
                      <p>Courier: <span className='font-medium'>{order.tracking.courier}</span></p>
                      <p>Tracking ID: <span className='font-medium'>{order.tracking.trackingId}</span></p>
                      {order.tracking.trackingUrl && (
                        <a href={order.tracking.trackingUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                          Track Order →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 gap-5'>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            <h2 className='text-xl font-bold tracking-widest text-gray-800 uppercase'>No Orders Yet</h2>
            <p className='text-sm text-gray-500 text-center'>You haven&apos;t placed any orders yet.<br/>Start shopping to see your orders here.</p>
            <button
              onClick={() => navigate('/collection')}
              className='bg-black text-white text-sm font-bold tracking-widest py-3 px-8 hover:bg-gray-800 transition-colors'
            >
              SHOP NOW
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Orders
