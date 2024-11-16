import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const communities = [
    {
      id: 1,
      name: 'Football Community',
      image: 'football.jpg', 
    },
    {
      id: 2,
      name: 'Anime Community',
      image: 'football.jpg',
    },
    {
      id: 3,
      name: 'Gaming Community',
      image: 'football.jpg',
    },
    {
        id: 4,
        name: 'Gaming Community',
        image: 'football.jpg',
      }
  ];

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
        <h1 className='md:text-4xl text-2xl font-bold mb-10'>my circles</h1>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {communities.map((community) => (
            <div 
              key={community.id}
              className='relative h-48 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200'
            >
              <div 
                className='absolute inset-0 bg-cover bg-center grayscale'
                style={{ backgroundImage: `url(${community.image})` }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
              <div className='absolute bottom-4 left-4 text-white'>
               <h1 className='text-xl font-bold'>
                 {community.name}
                </h1>
              <div className='flex space-x-3 text-xs mt-3'>
                <div className='bg-white text-black rounded-full p-1 px-2' >member</div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}