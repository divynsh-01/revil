import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {

  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setOrderData] = useState([])

  const loadOrderData = async () => {
    try {

      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item['orderStatus'] = order.orderStatus
            item['payment'] = order.payment
            item['pricing'] = order.pricing
            item['tracking'] = order.tracking
            item['orderId'] = order.orderId
            item['date'] = order.createdAt
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  return (
    <div className='border-t pt-16'>

      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {
          orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image} alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.title}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>Order ID: <span className='font-medium'>{item.orderId}</span></p>
                  <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                  <p className='mt-1'>Payment: <span className='text-gray-400'>{item.payment?.method} - {item.payment?.status}</span></p>

                  {/* Pricing Breakdown */}
                  {item.pricing && (
                    <div className='mt-2 text-sm'>
                      <p>Subtotal: {currency}{item.pricing.subtotal}</p>
                      {item.pricing.shipping > 0 && <p>Shipping: {currency}{item.pricing.shipping}</p>}
                      {item.pricing.discount > 0 && <p className='text-green-600'>Discount: -{currency}{item.pricing.discount}</p>}
                      <p className='font-medium'>Total: {currency}{item.pricing.total}</p>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {item.tracking?.trackingId && (
                    <div className='mt-2 text-sm'>
                      <p>Courier: <span className='font-medium'>{item.tracking.courier}</span></p>
                      <p>Tracking ID: <span className='font-medium'>{item.tracking.trackingId}</span></p>
                      {item.tracking.trackingUrl && (
                        <a href={item.tracking.trackingUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                          Track Order →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>{item.orderStatus}</p>
                </div>
                <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
              </div>
            </div>
          ))
        }
      </div>

    </div>
  )
}

export default Orders
