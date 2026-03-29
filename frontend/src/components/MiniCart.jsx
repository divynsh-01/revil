import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const MiniCart = () => {

    const { showMiniCart, setShowMiniCart, cartItems, products, currency, getCartAmount, updateQuantity, token, getBackendCartItems, getUserCart } = useContext(ShopContext)
    const navigate = useNavigate()

    const [cartData, setCartData] = useState([])
    const [cartTotal, setCartTotal] = useState(0)

    useEffect(() => {
        if (!showMiniCart) return

        const buildCart = async () => {
            if (token) {
                const backendCart = await getBackendCartItems()
                setCartData(backendCart)
            } else {
                const rows = []
                for (const productId in cartItems) {
                    const productInfo = products.find(p => p._id === productId)
                    if (!productInfo) continue
                    for (const variantKey in cartItems[productId]) {
                        const qty = cartItems[productId][variantKey]
                        if (qty <= 0) continue
                        const isVariantId = variantKey.length === 24 && !variantKey.includes('-')
                        if (isVariantId && productInfo.variants) {
                            const variant = productInfo.variants.find(v => v._id.toString() === variantKey)
                            rows.push({
                                productId,
                                variantId: variantKey,
                                title: productInfo.name,
                                image: productInfo.images?.[0]?.url || productInfo.image?.[0] || '',
                                price: variant?.price ?? productInfo.discountPrice ?? productInfo.price ?? 0,
                                size: variant?.size || '',
                                color: variant?.color || '',
                                quantity: qty,
                            })
                        } else {
                            const parts = variantKey.split('-')
                            const size = parts[0]
                            const color = parts.length > 1 ? parts.slice(1).join('-') : null
                            rows.push({
                                productId,
                                variantId: null,
                                title: productInfo.name,
                                image: productInfo.images?.[0]?.url || productInfo.image?.[0] || '',
                                price: productInfo.discountPrice ?? productInfo.price ?? 0,
                                size,
                                color,
                                quantity: qty,
                            })
                        }
                    }
                }
                setCartData(rows)
            }
        }

        buildCart()
    }, [showMiniCart, cartItems, products, token])

    useEffect(() => {
        if (!showMiniCart) return

        const fetchTotal = async () => {
            const total = await getCartAmount()
            setCartTotal(total)
        }
        fetchTotal()
    }, [showMiniCart, cartItems, getCartAmount])

    const handleUpdateQuantity = async (item, newQty) => {
        const key = item.variantId || (item.color ? `${item.size}-${item.color}` : item.size)
        await updateQuantity(item.productId, key, newQty)
        if (token) {
            await getUserCart(token)
        }
    }

    const handleViewCart = () => {
        setShowMiniCart(false)
        navigate('/cart')
    }

    if (!showMiniCart) return null

    return (
        <div className='fixed inset-0 z-50'>
            {/* Backdrop */}
            <div 
                className='absolute inset-0 bg-black bg-opacity-50'
                onClick={() => setShowMiniCart(false)}
            ></div>

            {/* Sidebar */}
            <div className='absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out'>
                <div className='flex flex-col h-full'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-4 border-b'>
                        <h2 className='text-lg font-semibold'>Shopping Cart</h2>
                        <button 
                            onClick={() => setShowMiniCart(false)}
                            className='p-2 hover:bg-gray-100 rounded-full'
                        >
                            <img src={assets.cross_icon} alt="Close" className='w-4 h-4' />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className='flex-1 overflow-y-auto p-4'>
                        {cartData.length === 0 ? (
                            <div className='text-center py-8'>
                                <p className='text-gray-500'>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {cartData.map((item, index) => (
                                    <div key={index} className='flex items-center space-x-4 border-b pb-4'>
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className='w-16 h-16 object-cover rounded'
                                        />
                                        <div className='flex-1'>
                                            <h3 className='font-medium text-sm'>{item.title}</h3>
                                            <p className='text-gray-600 text-sm'>{currency}{item.price}</p>
                                            <div className='flex items-center space-x-2 mt-1'>
                                                {item.size && <span className='text-xs bg-gray-100 px-2 py-1 rounded'>{item.size}</span>}
                                                {item.color && <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>{item.color}</span>}
                                            </div>
                                            <div className='flex items-center space-x-2 mt-2'>
                                                <button 
                                                    onClick={() => {
                                                        if (item.quantity <= 1) return;
                                                        handleUpdateQuantity(item, item.quantity - 1)
                                                    }}
                                                    className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className='w-8 text-center'>{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                    className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50'
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdateQuantity(item, 0)}
                                            className='p-1 hover:bg-gray-100 rounded'
                                        >
                                            <img src={assets.bin_icon} alt="Remove" className='w-4 h-4' />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartData.length > 0 && (
                        <div className='border-t p-4 space-y-4'>
                            <div className='flex justify-between items-center'>
                                <span className='font-semibold'>Total:</span>
                                <span className='font-semibold'>{currency}{cartTotal}</span>
                            </div>
                            <button 
                                onClick={handleViewCart}
                                className='w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors'
                            >
                                View Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MiniCart