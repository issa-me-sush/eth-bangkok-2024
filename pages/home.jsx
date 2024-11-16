import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'

export default function Home() {

  return (
    <div className="">
      <Head>
        <title>FriendCircle</title>
      </Head>
      <div>
        <div className='flex justify-center p-5 items-center'>
          <div className='hidden md:flex space-x-10'>
            <h1>team</h1>
            <h1>github</h1>
          </div>
          <img className='w-10 h-10' src='frencircle-dark.png' />
        </div>
      </div>
      <div className='p-10'>
        <h1>home</h1>
      </div>
     <BottomNav />
    </div>
  )
}