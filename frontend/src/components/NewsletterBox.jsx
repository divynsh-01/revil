import React from 'react'

const NewsletterBox = () => {

  const onSubmitHandler = (event) => {
    event.preventDefault();
  }

  return (
    <div className='text-center py-20 px-4'>
      <h2 className='text-2xl sm:text-3xl font-semibold text-black mb-3'>
        Subscribe & Get 20% Off
      </h2>
      <p className='text-neutral-600 mb-8 max-w-md mx-auto'>
        Join our community and be the first to know about new arrivals, exclusive offers, and more.
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-2/3 lg:w-1/2 mx-auto flex flex-col sm:flex-row gap-3'>
        <input
          className='input flex-1'
          type="email"
          placeholder='Enter your email'
          required
        />
        <button type='submit' className='btn btn-primary px-10'>
          Subscribe
        </button>
      </form>
    </div>
  )
}

export default NewsletterBox
