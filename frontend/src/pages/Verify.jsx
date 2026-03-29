import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useNotification } from '../context/NotificationContext'
import axios from 'axios'

const Verify = () => {

    const { navigate, token, setCartItems, backendUrl, getProductsData } = useContext(ShopContext)
    const { show } = useNotification();
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'failed'

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {
            if (!token) {
                return null
            }

            const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })

            if (response.data.success) {
                setStatus('success')
                setCartItems({})
                await getProductsData() // Refresh product stock after successful payment
                setTimeout(() => navigate('/orders'), 1500)
            } else {
                setStatus('failed')
                setTimeout(() => navigate('/cart'), 1500)
            }

        } catch (error) {
            console.log(error)
            show(error.message, 'error')
            setStatus('failed')
            setTimeout(() => navigate('/cart'), 1500)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center px-4'>
            {status === 'verifying' && (
                <div className='flex flex-col items-center gap-6'>
                    <div className='w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin'></div>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Verifying Payment</h2>
                        <p className='text-sm text-gray-500'>Please wait while we confirm your payment...</p>
                    </div>
                </div>
            )}
            {status === 'success' && (
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                        <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-green-700 mb-2'>Payment Successful!</h2>
                        <p className='text-sm text-gray-500'>Redirecting to your orders...</p>
                    </div>
                </div>
            )}
            {status === 'failed' && (
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                        <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </div>
                    <div className='text-center'>
                        <h2 className='text-xl font-semibold text-red-700 mb-2'>Payment Failed</h2>
                        <p className='text-sm text-gray-500'>Redirecting back to your cart...</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Verify