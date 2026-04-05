import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { useNotification } from '../context/NotificationContext';

const LoginModal = () => {
    const { backendUrl, token, setToken, showLoginModal, setShowLoginModal, pendingWishlistId, setPendingWishlistId, addToWishlist } = useContext(ShopContext);
    const { show } = useNotification();

    const [currentState, setCurrentState] = useState('Enter Phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Complete Profile states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tempToken, setTempToken] = useState('');

    // Reset fields whenever modal opens
    useEffect(() => {
        if (showLoginModal) {
            setCurrentState('Enter Phone');
            setPhone('');
            setOtp('');
            setName('');
            setEmail('');
            setTempToken('');
        }
    }, [showLoginModal]);

    // Once token is set after login, add the pending wishlist product
    useEffect(() => {
        if (token && pendingWishlistId) {
            addToWishlist(pendingWishlistId);
            setPendingWishlistId(null);
        }
    }, [token]);

    const requestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/user/send-otp', { phone });
            if (response.data.success) {
                if (response.data.testOtp) {
                    show(`Test OTP: ${response.data.testOtp}`, 'success');
                } else {
                    show('OTP sent successfully!', 'success');
                }
                setCurrentState('Enter OTP');
            } else {
                show(response.data.message, 'error');
            }
        } catch (error) {
            console.log(error);
            show(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/user/verify-otp', { phone, otp });
            if (response.data.success) {
                const userData = response.data.user;
                if (!userData.name || userData.name === 'User' || !userData.email) {
                    setTempToken(response.data.token);
                    if (userData.name !== 'User') setName(userData.name);
                    if (userData.email) setEmail(userData.email);
                    setCurrentState('Complete Profile');
                } else {
                    setToken(response.data.token);
                    localStorage.setItem('token', response.data.token);
                    setShowLoginModal(false);
                    show('Logged in successfully', 'success');
                }
            } else {
                show(response.data.message, 'error');
            }
        } catch (error) {
            console.log(error);
            show(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleProfileCompletion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/user/update-profile',
                { name, email },
                { headers: { token: tempToken } }
            );
            if (response.data.success) {
                setToken(tempToken);
                localStorage.setItem('token', tempToken);
                setShowLoginModal(false);
                show('Logged in successfully!', 'success');
            } else {
                show(response.data.message, 'error');
            }
        } catch (error) {
            console.log(error);
            show(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setShowLoginModal(false);
        setPendingWishlistId(null);
    };

    if (!showLoginModal) return null;

    return (
        <div
            className='fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
            onClick={handleClose}
        >
            <div
                className='relative bg-white rounded-sm shadow-2xl w-[90%] max-w-sm p-8 animate-fadeIn'
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className='absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors text-xl leading-none'
                    aria-label='Close'
                >
                    ✕
                </button>

                {/* Header */}
                <div className='mb-6 text-center'>
                    <svg className='w-8 h-8 mx-auto mb-3 text-red-400' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                    </svg>
                    <h2 className='text-xl font-semibold text-black'>
                        {currentState === 'Complete Profile' ? 'Complete Profile' : 'Login to add to Wishlist'}
                    </h2>
                    <p className='text-sm text-neutral-500 mt-1'>
                        {currentState === 'Complete Profile' ? 'Just one more step!' : 'Sign in to save this item'}
                    </p>
                </div>

                {/* Form */}
                {currentState === 'Enter Phone' ? (
                    <form onSubmit={requestOtp} className='flex flex-col gap-4'>
                        <p className='text-xs text-center text-neutral-500'>Enter your mobile number to receive an OTP.</p>
                        <input
                            type='tel'
                            placeholder='Mobile Number'
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors'
                            required
                            autoFocus
                        />
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-400'
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : currentState === 'Enter OTP' ? (
                    <form onSubmit={verifyOtp} className='flex flex-col gap-4'>
                        <p className='text-xs text-center text-neutral-500'>Enter the 6-digit OTP sent to {phone}.</p>
                        <input
                            type='text'
                            placeholder='_ _ _ _ _ _'
                            value={otp}
                            maxLength={6}
                            onChange={e => setOtp(e.target.value)}
                            className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors tracking-widest text-center text-xl'
                            required
                            autoFocus
                        />
                        <div className='w-full flex justify-between text-xs text-neutral-500 mt-1'>
                            <button type='button' onClick={() => setCurrentState('Enter Phone')} className='hover:text-black underline'>Edit Phone Number</button>
                            <button type='button' onClick={requestOtp} className='hover:text-black underline' disabled={loading}>Resend OTP</button>
                        </div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-400'
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleProfileCompletion} className='flex flex-col gap-4'>
                        <input
                            type='text'
                            placeholder='Full Name'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors'
                            required
                            autoFocus
                        />
                        <input
                            type='email'
                            placeholder='Email Address'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors'
                            required
                        />
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-400'
                        >
                            {loading ? 'Saving...' : 'Complete & Sign In'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginModal;
