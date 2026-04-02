import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='bg-white'>

      {/* Split Hero */}
      <div className='grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]'>

        {/* Left — Image (hidden on mobile) */}
        <div className='hidden lg:block relative overflow-hidden'>
          <img
            src={assets.contact_img}
            alt='Revi L'
            className='w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-[1.5s]'
          />
          <div className='absolute inset-0 bg-black/20'></div>
        </div>

        {/* Right — Brand Statement */}
        <div className='bg-[#0e0e0e] flex flex-col justify-center px-8 sm:px-16 py-6 lg:py-20'>
          <p className='text-[10px] tracking-[0.4em] text-gray-500 uppercase mb-4'>Revi'L — Est. 2024</p>
          <h1 className='text-2xl sm:text-3xl md:text-5xl font-extralight text-white leading-tight tracking-wide mb-4 lg:mb-6'>
            Style Is A <span className='italic text-gray-400'>Language.</span><br />
            We Speak It.
          </h1>
          <div className='w-12 h-px bg-gray-600 mb-8'></div>
          <p className='text-gray-400 text-sm font-light leading-7 max-w-md'>
            At Revi'L, every piece is carefully curated to help you express who you are without saying a word. Reach out to us — we're always here for our community.
          </p>
        </div>
      </div>

      {/* Contact Info Band */}
      <div className='bg-[#f7f7f5] py-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <div className='text-center mb-14'>
          <p className='text-[10px] tracking-[0.4em] text-gray-400 uppercase mb-3'>Reach Out</p>
          <h2 className='text-2xl font-light tracking-[0.2em] text-gray-900 uppercase'>Get In Touch</h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 border border-gray-200'>

          {/* Email */}
          <div className='flex flex-col items-center justify-center text-center py-12 px-8 bg-white group hover:bg-[#0e0e0e] transition-all duration-500 cursor-default'>
            <div className='w-12 h-12 border border-gray-200 group-hover:border-gray-600 flex items-center justify-center mb-5 transition-colors duration-500'>
              <svg className='w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
              </svg>
            </div>
            <p className='text-[9px] tracking-[0.35em] uppercase text-gray-400 group-hover:text-gray-500 mb-3 transition-colors duration-500'>Email Us</p>
            <p className='text-sm text-gray-800 group-hover:text-white font-light transition-colors duration-500'>admin@revil.com</p>
          </div>

          {/* Phone */}
          <div className='flex flex-col items-center justify-center text-center py-12 px-8 bg-white group hover:bg-[#0e0e0e] transition-all duration-500 cursor-default'>
            <div className='w-12 h-12 border border-gray-200 group-hover:border-gray-600 flex items-center justify-center mb-5 transition-colors duration-500'>
              <svg className='w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
              </svg>
            </div>
            <p className='text-[9px] tracking-[0.35em] uppercase text-gray-400 group-hover:text-gray-500 mb-3 transition-colors duration-500'>Call Us</p>
            <p className='text-sm text-gray-800 group-hover:text-white font-light transition-colors duration-500'>(415) 555-0132</p>
          </div>

          {/* Response Time */}
          <div className='flex flex-col items-center justify-center text-center py-12 px-8 bg-white group hover:bg-[#0e0e0e] transition-all duration-500 cursor-default'>
            <div className='w-12 h-12 border border-gray-200 group-hover:border-gray-600 flex items-center justify-center mb-5 transition-colors duration-500'>
              <svg className='w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <p className='text-[9px] tracking-[0.35em] uppercase text-gray-400 group-hover:text-gray-500 mb-3 transition-colors duration-500'>Response Time</p>
            <p className='text-sm text-gray-800 group-hover:text-white font-light transition-colors duration-500'>Within 24 Hours</p>
          </div>

        </div>
      </div>

      {/* Bottom Brand Strip */}
      <div className='bg-[#0e0e0e] py-14 px-4 text-center'>
        <p className='text-[10px] tracking-[0.5em] text-gray-600 uppercase mb-3'>Our Promise</p>
        <p className='text-xl md:text-2xl font-extralight text-white tracking-widest uppercase'>
          Every Query. Every Customer. Every Time.
        </p>
      </div>

    </div>
  )
}

export default Contact
