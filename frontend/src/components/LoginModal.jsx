import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { useNotification } from '../context/NotificationContext';

const LoginModal = () => {
    const { backendUrl, token, setToken, showLoginModal, setShowLoginModal, pendingWishlistId, setPendingWishlistId, addToWishlist } = useContext(ShopContext);
    const { show } = useNotification();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset fields whenever modal opens
    useEffect(() => {
        if (showLoginModal) {
            setEmail('');
            setPassword('');
        }
    }, [showLoginModal]);

    // Once token is set after login, add the pending wishlist product
    useEffect(() => {
        if (token && pendingWishlistId) {
            addToWishlist(pendingWishlistId);
            setPendingWishlistId(null);
        }
    }, [token]);

    if (!showLoginModal) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/user/login', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                setShowLoginModal(false);
                show('Logged in successfully', 'success');
            } else {
                show(response.data.message, 'error');
            }
        } catch (error) {
            console.log(error);
            show(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowLoginModal(false);
        setPendingWishlistId(null);
    };

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
                    <h2 className='text-xl font-semibold text-black'>Login to add to Wishlist</h2>
                    <p className='text-sm text-neutral-500 mt-1'>Sign in to save this item</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors'
                        required
                        autoFocus
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className='w-full px-3 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors'
                        required
                    />
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-400'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className='text-xs text-center text-neutral-400 mt-4'>
                    Don't have an account?{' '}
                    <a href='/login' className='text-black underline' onClick={handleClose}>
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
