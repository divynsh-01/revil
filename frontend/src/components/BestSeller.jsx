import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import Loader from './Loader';

const BestSeller = () => {

  const { products, loading } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => (item.bestseller));
    setBestSeller(bestProduct.slice(0, 5))
  }, [products])

  return (
    <div className='my-20 px-4 sm:px-0'>
      <div className='text-center mb-12'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 leading-relaxed'>
          Our most loved pieces. Customer favorites that never go out of style.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-8'>
          {
            bestSeller.map((item, index) => (
              <ProductItem key={index} id={item._id} name={item.title || item.name} image={item.images || item.image} price={item.discountPrice || item.price} variants={item.variants} />
            ))
          }
        </div>
      )}
    </div>
  )
}

export default BestSeller
