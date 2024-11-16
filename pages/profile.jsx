import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'

export default function Profile() {

  return (
    <div className="">
      <Head>
        <title>FriendCircle</title>
      </Head>
      <div>
        <div className='flex justify-center md:justify-between p-5 items-center'>
          <div className='hidden md:flex space-x-10'>
            <h1>team</h1>
            <h1>github</h1>
          </div>
          <img className='w-10 h-10' src='frencircle-dark.png' />
        </div>
      </div>
      <div className='p-10 mb-20'>
        <h1 className='md:text-4xl text-2xl font-bold mb-10'>profile</h1>
        <div className='flex justify-center'>
            <div  className='w-32 h-32 bg-gray-200 rounded-full'></div>
        </div>
        <div className='border border-opacity-20 border-white rounded-lg p-5 mt-10'>
        <h1 className='md:text-4xl text-xl font-bold opacity-50 mb-3'>interests</h1>
        <div className='flex flex-wrap gap-2'>
        <div className='bg-white bg-opacity-20 p-1 px-2 rounded-full text-xs'>football</div>
        <div className='bg-white bg-opacity-20 p-1 px-2 rounded-full text-xs'>therapy</div>
        <div className='bg-white bg-opacity-20 p-1 px-2 rounded-full text-xs'>yoga</div>
        </div> 
        </div>
</div>
      
      <BottomNav />
    </div>
  )
}