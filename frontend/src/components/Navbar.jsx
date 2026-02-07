import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {

    const [visible, setVisible] = useState(false);

    const { setShowSearch, getCartCount, getWishlistCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
    }

    return (
        <nav className='flex items-center justify-between py-6 px-4 sm:px-0 font-medium border-b border-neutral-200'>

            <Link to='/' className='transition-opacity hover:opacity-70'>
                <img src={assets.logo} className='w-32 sm:w-36' alt="Logo" />
            </Link>

            {/* Desktop Navigation */}
            <ul className='hidden sm:flex gap-8 text-sm text-neutral-900 uppercase tracking-wider'>
                <NavLink to='/' className='relative flex flex-col items-center gap-1 group'>
                    <span className='font-medium'>Home</span>
                    <hr className='w-0 group-hover:w-full border-none h-[2px] bg-black transition-all duration-300' />
                </NavLink>
                <NavLink to='/collection' className='relative flex flex-col items-center gap-1 group'>
                    <span className='font-medium'>Collection</span>
                    <hr className='w-0 group-hover:w-full border-none h-[2px] bg-black transition-all duration-300' />
                </NavLink>
                <NavLink to='/about' className='relative flex flex-col items-center gap-1 group'>
                    <span className='font-medium'>About</span>
                    <hr className='w-0 group-hover:w-full border-none h-[2px] bg-black transition-all duration-300' />
                </NavLink>
                <NavLink to='/contact' className='relative flex flex-col items-center gap-1 group'>
                    <span className='font-medium'>Contact</span>
                    <hr className='w-0 group-hover:w-full border-none h-[2px] bg-black transition-all duration-300' />
                </NavLink>
            </ul>

            {/* Icons Section */}
            <div className='flex items-center gap-5 sm:gap-6'>
                {/* Search Icon */}
                <button
                    onClick={() => { setShowSearch(true); navigate('/collection') }}
                    className='transition-transform hover:scale-110 active:scale-95'
                    aria-label='Search'
                >
                    <img src={assets.search_icon} className='w-5 h-5 cursor-pointer' alt="Search" />
                </button>

                {/* Wishlist Icon */}
                <Link to='/wishlist' className='relative transition-transform hover:scale-110 active:scale-95'>
                    <svg className='w-5 h-5 cursor-pointer transition-colors hover:text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                    </svg>
                    {getWishlistCount() > 0 && (
                        <span className='absolute -right-1.5 -bottom-1.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full text-[8px] font-semibold'>
                            {getWishlistCount()}
                        </span>
                    )}
                </Link>

                {/* Profile Dropdown */}
                <div className='group relative'>
                    <button
                        onClick={() => token ? null : navigate('/login')}
                        className='transition-transform hover:scale-110 active:scale-95'
                        aria-label='Profile'
                    >
                        <img className='w-5 h-5 cursor-pointer inline-block' src={assets.profile_icon} alt="Profile" />
                    </button>

                    {/* Dropdown Menu */}
                    {token && (
                        <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50'>
                            <div className='flex flex-col gap-1 w-44 py-4 px-0 glass rounded-sm shadow-premium overflow-hidden'>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className='px-5 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors'
                                >
                                    My Profile
                                </button>
                                <button
                                    onClick={() => navigate('/wishlist')}
                                    className='px-5 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors'
                                >
                                    Wishlist
                                </button>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className='px-5 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors'
                                >
                                    Orders
                                </button>
                                <button
                                    onClick={() => navigate('/addresses')}
                                    className='px-5 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 hover:text-black transition-colors'
                                >
                                    Addresses
                                </button>
                                <hr className='divider my-1' />
                                <button
                                    onClick={logout}
                                    className='px-5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Icon */}
                <Link to='/cart' className='relative transition-transform hover:scale-110 active:scale-95'>
                    <img src={assets.cart_icon} className='w-5 h-5 min-w-5' alt="Cart" />
                    <span className='absolute -right-1.5 -bottom-1.5 w-4 h-4 flex items-center justify-center bg-black text-white rounded-full text-[8px] font-semibold'>
                        {getCartCount()}
                    </span>
                </Link>

                {/* Mobile Menu Icon */}
                <button
                    onClick={() => setVisible(true)}
                    className='sm:hidden transition-transform hover:scale-110 active:scale-95'
                    aria-label='Menu'
                >
                    <img src={assets.menu_icon} className='w-5 h-5 cursor-pointer' alt="Menu" />
                </button>
            </div>

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 right-0 bottom-0 z-50 bg-white shadow-xl transition-all duration-300 ${visible ? 'w-full sm:w-80' : 'w-0'} overflow-hidden`}>
                <div className='flex flex-col h-full'>
                    {/* Sidebar Header */}
                    <div onClick={() => setVisible(false)} className='flex items-center gap-3 p-5 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
                        <span className='font-medium text-sm uppercase tracking-wider'>Back</span>
                    </div>

                    {/* Sidebar Links */}
                    <div className='flex flex-col'>
                        <NavLink
                            onClick={() => setVisible(false)}
                            className='py-4 px-6 border-b border-neutral-100 text-sm uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors'
                            to='/'
                        >
                            Home
                        </NavLink>
                        <NavLink
                            onClick={() => setVisible(false)}
                            className='py-4 px-6 border-b border-neutral-100 text-sm uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors'
                            to='/collection'
                        >
                            Collection
                        </NavLink>
                        <NavLink
                            onClick={() => setVisible(false)}
                            className='py-4 px-6 border-b border-neutral-100 text-sm uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors'
                            to='/about'
                        >
                            About
                        </NavLink>
                        <NavLink
                            onClick={() => setVisible(false)}
                            className='py-4 px-6 border-b border-neutral-100 text-sm uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors'
                            to='/contact'
                        >
                            Contact
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {visible && (
                <div
                    onClick={() => setVisible(false)}
                    className='fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden'
                />
            )}

        </nav>
    )
}

export default Navbar
