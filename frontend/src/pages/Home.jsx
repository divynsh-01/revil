import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'


const Home = () => {
  return (
    <div>
      <div className='pt-2'>
        <Hero />
      </div>
      <div className='pt-0 px-4 sm:px-[5vw] md:px-[7vw] lg:px-3'>
        <LatestCollection />
        <BestSeller />
        <OurPolicy />

      </div>
    </div>
  )
}

export default Home
