import React, { useRef, useState, useEffect, useCallback, useContext } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'

const Hero = () => {
  const { backendUrl } = useContext(ShopContext);
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAutoScrolling = useRef(false);
  const [slides, setSlides] = useState([]);

  const defaultSlides = [
    { id: 1, image: assets.web_home, title: 'Premium Essentials', link: '/collection' },
    { id: 2, image: assets.web_home_2, title: 'Summer Collection', link: '/collection' },
    { id: 3, image: assets.hero_img, title: 'New Arrivals', link: '/collection' },
    { id: 4, image: assets.p_img2_1, title: 'Streetwear', link: '/collection' },
    { id: 5, image: assets.p_img1, title: 'Womenswear', link: '/collection' }
  ];

  const fetchSlides = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + '/api/hero/list');
      if (response.data.success && response.data.heroes.length > 0) {
        setSlides(response.data.heroes);
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.log(error);
      setSlides(defaultSlides);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Helper to get scroll padding
  const getScrollPadding = useCallback(() => {
    if (!scrollRef.current) return 0;
    const style = window.getComputedStyle(scrollRef.current);
    return parseFloat(style.scrollPaddingLeft) || parseFloat(style.paddingLeft) || 0;
  }, []);

  const scrollToIndex = useCallback((index, smooth = true) => {
    if (scrollRef.current && slides.length > 0) {
      const container = scrollRef.current;
      const children = Array.from(container.children).filter(el => el.getAttribute('data-slide') === 'true');
      const targetChild = children[index];

      if (targetChild) {
        isAutoScrolling.current = true;
        const padding = getScrollPadding();
        const targetScrollLeft = targetChild.offsetLeft - padding;

        container.scrollTo({
          left: targetScrollLeft,
          behavior: smooth ? 'smooth' : 'auto'
        });

        setActiveIndex(index);

        // Reset the auto-scrolling flag after the animation completes
        setTimeout(() => {
          isAutoScrolling.current = false;
        }, 700);
      }
    }
  }, [getScrollPadding, slides.length]);

  // Auto-play logic
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollToIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, slides.length, scrollToIndex]);

  // Handle scroll events to update active index
  const handleScroll = () => {
    if (scrollRef.current && !isAutoScrolling.current) {
      const container = scrollRef.current;
      const scrollPosition = container.scrollLeft;
      const padding = getScrollPadding();
      const children = Array.from(container.children).filter(el => el.getAttribute('data-slide') === 'true');

      let closestIndex = 0;
      let minDistance = Infinity;

      children.forEach((child, index) => {
        const childTargetPos = child.offsetLeft - padding;
        const distance = Math.abs(childTargetPos - scrollPosition);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    }
  };

  return (
    <div className='w-full overflow-hidden bg-white'>

      {/* Slider Container */}
      <div className='relative w-full pb-14 group'>

        {/* Track - Truly Edge-to-Edge */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className='flex overflow-x-auto snap-x snap-mandatory gap-0 pb-10 hide-scrollbar'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {slides.map((slide, index) => (
            <div
              key={slide._id || slide.id}
              data-slide="true"
              className={`snap-start w-full md:w-[96vw] lg:w-[98vw] h-[65vh] min-h-[550px] max-h-[950px] flex-shrink-0 relative overflow-hidden bg-[#f3f1ed] group/card transition-all duration-1000 ease-out z-10 ${activeIndex === index ? 'opacity-100' : 'opacity-30 blur-[2px] pointer-events-none'}`}
            >
              <img
                className='absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2000ms] group-hover/card:scale-110'
                src={slide.image}
                alt={slide.title}
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-90' />

              {/* Text Content Container - Scaled for Readability */}
              <div className='absolute inset-0 flex flex-col justify-end p-8 sm:p-20 lg:p-32'>
                <div className='w-full max-w-screen-2xl mx-auto flex flex-col items-start translate-y-8 group-hover/card:translate-y-0 transition-transform duration-1000'>
                  <h3 className={`text-white text-5xl sm:text-7xl lg:text-[10rem] font-serif tracking-tighter leading-[0.85] drop-shadow-2xl ${slide.subtitle ? 'mb-4' : 'mb-10'}`}>
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className='text-white/90 text-lg sm:text-2xl font-light mb-10 tracking-wide drop-shadow-md'>
                      {slide.subtitle}
                    </p>
                  )}
                  <Link
                    to={slide.link}
                    className='inline-flex items-center justify-center px-12 py-5 bg-white text-black text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] rounded-full sm:opacity-0 group-hover/card:opacity-100 transition-all duration-700 hover:bg-black hover:text-white shadow-2xl scale-90 hover:scale-100'
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Minimal spacer if needed, but for full-width w-full it's often not required */}
        </div>

        {/* Dot Indicators */}
        <div className='flex justify-center items-center gap-4 mb-10'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 transition-all duration-500 rounded-full ${activeIndex === index ? 'w-12 bg-black' : 'w-1.5 bg-gray-300 hover:bg-black/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Hero
