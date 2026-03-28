import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Addresses from './pages/Addresses'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Verify from './pages/Verify'
import LoginModal from './components/LoginModal'
import MiniCart from './components/MiniCart'
import { ShopContext } from './context/ShopContext'

// Redirects to /login if user is not authenticated
const ProtectedRoute = ({ element }) => {
  const { token } = useContext(ShopContext);
  return token ? element : <Navigate to='/login' replace />;
};

const App = () => {
  return (
    <div className='w-full'>
      <Navbar />
      <LoginModal />
      <MiniCart />
      <SearchBar />
      <div>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<ProtectedRoute element={<PlaceOrder />} />} />
          <Route path='/orders' element={<ProtectedRoute element={<Orders />} />} />
          <Route path='/addresses' element={<ProtectedRoute element={<Addresses />} />} />
          <Route path='/wishlist' element={<ProtectedRoute element={<Wishlist />} />} />
          <Route path='/profile' element={<ProtectedRoute element={<Profile />} />} />
          <Route path='/verify' element={<Verify />} />
        </Routes>
        <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App
