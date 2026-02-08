import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {

  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [filterProducts, setFilterProducts] = useState([]);

  // Filter states
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  const [sortType, setSortType] = useState('relevance');

  // Available filter options
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#8B4513' },
  ];

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value))
    } else {
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSize = (size) => {
    if (sizes.includes(size)) {
      setSizes(prev => prev.filter(item => item !== size))
    } else {
      setSizes(prev => [...prev, size])
    }
  }

  const toggleColor = (colorName) => {
    if (colors.includes(colorName)) {
      setColors(prev => prev.filter(item => item !== colorName))
    } else {
      setColors(prev => [...prev, colorName])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => {
        const productName = item.title || item.name || '';
        return productName.toLowerCase().includes(search.toLowerCase());
      })
    }

    // Category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    // SubCategory filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    // Size filter
    if (sizes.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return item.sizes && item.sizes.some(size => sizes.includes(size));
      });
    }

    // Color filter
    if (colors.length > 0) {
      productsCopy = productsCopy.filter(item => {
        return item.colors && item.colors.some(color => colors.includes(color));
      });
    }

    // Price range filter
    productsCopy = productsCopy.filter(item => {
      const price = item.discountPrice || item.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => ((a.discountPrice || a.price) - (b.discountPrice || b.price))));
        break;

      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => ((b.discountPrice || b.price) - (a.discountPrice || a.price))));
        break;

      case 'newest':
        setFilterProducts(fpCopy.sort((a, b) => new Date(b.date) - new Date(a.date)));
        break;

      case 'bestseller':
        setFilterProducts(fpCopy.filter(item => item.bestseller));
        break;

      default:
        applyFilter();
        break;
    }
  }

  const clearAllFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSizes([]);
    setColors([]);
    setPriceRange({ min: 0, max: 10000 });
    setSortType('relevance');
  }

  const removeFilter = (type, value) => {
    switch (type) {
      case 'category':
        setCategory(prev => prev.filter(item => item !== value));
        break;
      case 'subCategory':
        setSubCategory(prev => prev.filter(item => item !== value));
        break;
      case 'size':
        setSizes(prev => prev.filter(item => item !== value));
        break;
      case 'color':
        setColors(prev => prev.filter(item => item !== value));
        break;
      default:
        break;
    }
  }

  const hasActiveFilters = () => {
    return category.length > 0 || subCategory.length > 0 || sizes.length > 0 || colors.length > 0 ||
      priceRange.min > 0 || priceRange.max < 10000;
  }

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, sizes, colors, priceRange, search, showSearch, products])

  useEffect(() => {
    sortProduct();
  }, [sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      {/* Filter Options */}
      <div className='w-full sm:min-w-60 sm:max-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory} checked={category.includes('Men')} /> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory} checked={category.includes('Women')} /> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory} checked={category.includes('Kids')} /> Kids
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} onChange={toggleSubCategory} checked={subCategory.includes('Topwear')} /> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory} checked={subCategory.includes('Bottomwear')} /> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory} checked={subCategory.includes('Winterwear')} /> Winterwear
            </p>
          </div>
        </div>

        {/* Size Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>SIZE</p>
          <div className='flex flex-wrap gap-2'>
            {availableSizes.map((size, index) => (
              <button
                key={index}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 border text-sm ${sizes.includes(size) ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>COLOR</p>
          <div className='flex flex-wrap gap-2'>
            {availableColors.map((color, index) => (
              <button
                key={index}
                onClick={() => toggleColor(color.name)}
                className={`w-8 h-8 rounded-full border-2 ${colors.includes(color.name) ? 'border-black' : 'border-gray-300'}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {colors.includes(color.name) && (
                  <svg className='w-full h-full' fill='white' viewBox='0 0 24 24'>
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          <div className='flex flex-col gap-2 text-sm'>
            <div className='flex gap-2 items-center'>
              <input
                type='number'
                placeholder='Min'
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className='border px-2 py-1 w-20'
              />
              <span>-</span>
              <input
                type='number'
                placeholder='Max'
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className='border px-2 py-1 w-20'
              />
            </div>
          </div>
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className='w-full border border-black py-2 text-sm hover:bg-black hover:text-white transition-colors mt-4'
          >
            CLEAR ALL FILTERS
          </button>
        )}
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between items-center text-base sm:text-2xl mb-4 gap-2'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
            className='border border-gray-300 rounded-sm text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:border-gray-400 bg-white cursor-pointer'
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="bestseller">Bestsellers</option>
          </select>
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters() && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {category.map((cat, index) => (
              <div key={index} className='flex items-center gap-1 bg-gray-200 px-3 py-1 text-sm'>
                {cat}
                <button onClick={() => removeFilter('category', cat)} className='ml-1'>×</button>
              </div>
            ))}
            {subCategory.map((sub, index) => (
              <div key={index} className='flex items-center gap-1 bg-gray-200 px-3 py-1 text-sm'>
                {sub}
                <button onClick={() => removeFilter('subCategory', sub)} className='ml-1'>×</button>
              </div>
            ))}
            {sizes.map((size, index) => (
              <div key={index} className='flex items-center gap-1 bg-gray-200 px-3 py-1 text-sm'>
                Size: {size}
                <button onClick={() => removeFilter('size', size)} className='ml-1'>×</button>
              </div>
            ))}
            {colors.map((color, index) => (
              <div key={index} className='flex items-center gap-1 bg-gray-200 px-3 py-1 text-sm'>
                {color}
                <button onClick={() => removeFilter('color', color)} className='ml-1'>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.length > 0 ? (
            filterProducts.map((item, index) => (
              <ProductItem key={index} name={item.title || item.name} id={item._id} price={item.discountPrice || item.price} image={item.images || item.image} />
            ))
          ) : (
            <div className='col-span-full text-center py-20'>
              <p className='text-2xl text-gray-400'>No products found</p>
              <p className='text-gray-500 mt-2'>Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Collection
