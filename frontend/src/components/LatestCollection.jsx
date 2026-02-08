import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import Loader from './Loader';

const LatestCollection = () => {

  const { products, loading } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products])

  return (
    <div className='my-20 px-4 sm:px-0'>
      <div className='text-center mb-12'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 leading-relaxed'>
          Discover our newest arrivals. Fresh styles, timeless pieces.
        </p>
      </div>

      {/* Rendering Products */}
      {loading ? (
        <Loader />
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8'>
          {
            latestProducts.map((item, index) => (
              <ProductItem key={index} id={item._id} image={item.images || item.image} name={item.title || item.name} price={item.discountPrice || item.price} />
            ))
          }
        </div>
      )}
    </div>
  )
}

export default LatestCollection
