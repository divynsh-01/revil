import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Hero = () => {
  const scrollRef = useRef(null);

  const slides = [
    { id: 1, image: assets.web_home, title: 'Premium Essentials', link: '/collection' },
    { id: 2, image: assets.web_home_2, title: 'Summer Collection', link: '/collection' },
    { id: 3, image: assets.hero_img, title: 'New Arrivals', link: '/collection' },
    { id: 4, image: assets.p_img2_1, title: 'Streetwear', link: '/collection' },
    { id: 5, image: assets.p_img1, title: 'Womenswear', link: '/collection' }
  ];

  const scrollNext = () => {
    if (scrollRef.current) {
      const cardElement = scrollRef.current.firstElementChild;
      if (cardElement) {
        // scroll by one card width plus the gap (gap-4 or gap-6)
        const gap = window.innerWidth >= 640 ? 24 : 16;
        scrollRef.current.scrollBy({ left: cardElement.offsetWidth + gap, behavior: 'smooth' });
      }
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      const cardElement = scrollRef.current.firstElementChild;
      if (cardElement) {
        const gap = window.innerWidth >= 640 ? 24 : 16;
        scrollRef.current.scrollBy({ left: -(cardElement.offsetWidth + gap), behavior: 'smooth' });
      }
    }
  };

  return (
    <div className='w-full overflow-hidden bg-white'>

      {/* Hero Header Section */}
      <div className='flex flex-col items-center justify-center text-center mb-8 px-4'>
        <div className='flex items-center gap-4 mb-4 sm:mb-6'>
          <div className='w-8 sm:w-16 h-[2px] bg-[#333333]'></div>
          <p className='font-bold text-xs sm:text-sm uppercase tracking-[0.2em] text-[#333333] font-sans'>
            Discover
          </p>
          <div className='w-8 sm:w-16 h-[2px] bg-[#333333]'></div>
        </div>
        <h1 className='text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1a1a1a] font-serif tracking-tight max-w-2xl'>
          Curated Collections
        </h1>
      </div>

      {/* Slider Container */}
      <div className='relative w-full pb-16 group'>

        {/* Track - Native Scroll Snap */}
        <div
          ref={scrollRef}
          className='flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pb-4 lg:scroll-p-[9vw] md:scroll-p-[7vw] sm:scroll-p-[5vw] scroll-p-4 hide-scrollbar'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar via internal style string for tailwind simplicity without custom plugins */}
          <style>{`.hide - scrollbar:: -webkit - scrollbar { display: none; } `}</style>

          {slides.map((slide) => (
            <div
              key={slide.id}
              // 70% width allows the active image to be massive, while letting the *next* image comfortably peek in from the right edge.
              className='snap-start w-[85vw] sm:w-[70vw] lg:w-[65vw] max-w-[1200px] h-[55vh] min-h-[450px] max-h-[700px] flex-shrink-0 relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#f0eee9] group/card shadow-sm'
            >
              {/* Image */}
              <img
                className='absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-105'
                src={slide.image}
                alt={slide.title}
              />

              {/* Gradient Overlay for Text Readability */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80' />

              {/* Card Content Overlay */}
              <div className='absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16 flex flex-col items-start translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500'>
                <h3 className='text-white text-3xl sm:text-4xl lg:text-5xl font-serif tracking-wide mb-6 leading-tight drop-shadow-lg'>
                  {slide.title}
                </h3>
                <Link
                  to={slide.link}
                  className='inline-flex items-center justify-center px-8 py-3.5 bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-500 hover:bg-black hover:text-white shadow-xl'
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          ))}

          {/* Spacer to allow the last item to scroll far enough left on desktop so it isn't forced back */}
          <div className='w-[10vw] flex-shrink-0'></div>
        </div>

        {/* Navigation Controls */}
        <div className='absolute bottom-0 left-0 right-0 flex justify-center items-center gap-6 z-20 mt-4'>
          <button
            onClick={scrollPrev}
            className='w-14 h-14 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-800 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-md'
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button
            onClick={scrollNext}
            className='w-14 h-14 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-800 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-md'
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Hero
