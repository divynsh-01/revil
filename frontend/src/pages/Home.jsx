import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div>
      <div className='pt-6'>
        <Hero />
      </div>
      <div className='pt-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <LatestCollection />
        <BestSeller />
        <OurPolicy />
        <NewsletterBox />
      </div>
    </div>
  )
}

export default Home
