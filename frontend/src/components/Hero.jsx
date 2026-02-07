import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border-t border-neutral-200'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-16 sm:py-20 px-6 sm:px-12 bg-neutral-50'>
        <div className='text-neutral-900 max-w-lg'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-12 h-[2px] bg-neutral-900'></div>
            <p className='font-medium text-sm uppercase tracking-widest'>Our Bestsellers</p>
          </div>
          <h1 className='prata-regular text-4xl sm:text-5xl lg:text-6xl leading-tight mb-8'>
            Latest Arrivals
          </h1>
          <p className='text-neutral-600 mb-8 leading-relaxed'>
            Discover our newest collection of premium fashion pieces, carefully curated for the modern individual.
          </p>
          <Link
            to='/collection'
            className='btn btn-outline inline-flex items-center gap-3 group'
          >
            <span>Shop Now</span>
            <div className='w-10 h-[2px] bg-black group-hover:w-12 transition-all'></div>
          </Link>
        </div>
      </div>
      {/* Hero Right Side */}
      <div className='w-full sm:w-1/2 relative overflow-hidden'>
        <img
          className='w-full h-full object-cover hover:scale-105 transition-transform duration-700'
          src={assets.hero_img}
          alt="Latest Collection"
        />
      </div>
    </div>
  )
}

export default Hero
