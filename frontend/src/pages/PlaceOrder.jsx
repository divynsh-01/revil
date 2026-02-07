import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    // Fetch saved addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.post(backendUrl + '/api/address/list', {}, { headers: { token } });
                if (response.data.success) {
                    setAddresses(response.data.addresses);
                    // Auto-select default address
                    const defaultAddr = response.data.addresses.find(addr => addr.isDefault);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr._id);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (token) {
            fetchAddresses();
        }
    }, [token, backendUrl]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setNewAddress(data => ({ ...data, [name]: value }));
    }

    const handleAddNewAddress = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/address/add', newAddress, { headers: { token } });
            if (response.data.success) {
                toast.success('Address added successfully');
                // Refresh addresses
                const listResponse = await axios.post(backendUrl + '/api/address/list', {}, { headers: { token } });
                if (listResponse.data.success) {
                    setAddresses(listResponse.data.addresses);
                    setSelectedAddressId(response.data.addressId);
                }
                setShowNewAddressForm(false);
                setNewAddress({
                    name: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    pincode: ''
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log(response)
                try {
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', response, { headers: { token } })
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error)
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        if (!selectedAddressId && !showNewAddressForm) {
            toast.error('Please select a delivery address');
            return;
        }

        try {
            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = products.find(product => product._id === items)
                        if (itemInfo) {
                            orderItems.push({
                                productId: itemInfo._id,
                                title: itemInfo.title || itemInfo.name,
                                price: itemInfo.discountPrice || itemInfo.price,
                                image: itemInfo.images?.[0]?.url || itemInfo.images?.[0] || itemInfo.image?.[0] || "",
                                size: item,
                                quantity: cartItems[items][item]
                            })
                        }
                    }
                }
            }

            let orderData = {
                addressId: selectedAddressId,
                items: orderItems,
                discount: 0
            }

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
                    if (response.data.success) {
                        setCartItems({})
                        toast.success('Order placed successfully!')
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } })
                    if (responseStripe.data.success) {
                        const { session_url } = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':
                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } })
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order)
                    }
                    break;

                default:
                    break;
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'ADDRESS'} />
                </div>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                    <div className='flex flex-col gap-3'>
                        <p className='text-sm font-medium'>Select a saved address:</p>
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                onClick={() => setSelectedAddressId(address._id)}
                                className={`border p-3 cursor-pointer ${selectedAddressId === address._id ? 'border-black border-2' : 'border-gray-300'}`}
                            >
                                {address.isDefault && <span className='bg-black text-white text-xs px-2 py-0.5 mr-2'>DEFAULT</span>}
                                <p className='font-medium'>{address.name}</p>
                                <p className='text-sm text-gray-600'>{address.phone}</p>
                                <p className='text-sm'>{address.addressLine1}</p>
                                {address.addressLine2 && <p className='text-sm'>{address.addressLine2}</p>}
                                <p className='text-sm'>{address.city}, {address.state} - {address.pincode}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Address Button */}
                <button
                    type='button'
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className='border border-black px-4 py-2 text-sm'
                >
                    {showNewAddressForm ? 'CANCEL' : '+ ADD NEW ADDRESS'}
                </button>

                {/* New Address Form */}
                {showNewAddressForm && (
                    <div className='flex flex-col gap-3 border p-4'>
                        <input required onChange={onChangeHandler} name='name' value={newAddress.name} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Full Name' />
                        <input required onChange={onChangeHandler} name='phone' value={newAddress.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="tel" placeholder='Phone Number' />
                        <input required onChange={onChangeHandler} name='addressLine1' value={newAddress.addressLine1} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Address Line 1' />
                        <input onChange={onChangeHandler} name='addressLine2' value={newAddress.addressLine2} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Address Line 2 (Optional)' />
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='city' value={newAddress.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                            <input required onChange={onChangeHandler} name='state' value={newAddress.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                        </div>
                        <input required onChange={onChangeHandler} name='pincode' value={newAddress.pincode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Pincode' />
                        <button type='button' onClick={handleAddNewAddress} className='bg-black text-white px-4 py-2 text-sm'>
                            SAVE ADDRESS
                        </button>
                    </div>
                )}

                <button
                    type='button'
                    onClick={() => navigate('/addresses')}
                    className='text-sm text-blue-600 hover:underline text-left'
                >
                    Manage all addresses →
                </button>
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
