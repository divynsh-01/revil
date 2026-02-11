import React from 'react'
import ProductForm from '../components/ProductForm'

const Add = ({ token }) => {
  return (
    <div className='w-full'>
      <h2 className='text-2xl font-bold mb-4'>Add Product</h2>
      <ProductForm token={token} />
    </div>
  )
}

export default Add