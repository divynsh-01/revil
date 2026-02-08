import React from 'react'

const Loader = () => {
    return (
        <div className='flex items-center justify-center min-h-[400px] w-full'>
            <div className='relative'>
                {/* Outer spinning ring */}
                <div className='w-16 h-16 border-4 border-neutral-200 border-t-black rounded-full animate-spin'></div>

                {/* Inner pulsing dot */}
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                    <div className='w-3 h-3 bg-black rounded-full animate-pulse'></div>
                </div>
            </div>
        </div>
    )
}

export default Loader
