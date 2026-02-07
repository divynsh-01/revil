import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex items-center gap-3 mb-6'>
      <h2 className='text-2xl sm:text-3xl font-medium text-neutral-900'>
        <span className='text-neutral-500 uppercase tracking-wider'>{text1}</span>{' '}
        <span className='text-black uppercase tracking-wider font-semibold'>{text2}</span>
      </h2>
      <div className='w-12 h-[2px] bg-black'></div>
    </div>
  )
}

export default Title
