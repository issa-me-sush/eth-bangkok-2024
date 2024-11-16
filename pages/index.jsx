import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { LoginButton  } from '@/components/auth/Login'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()

  return (
    <div className="">
      <Head>
        <title>FriendCircle</title>
      </Head>
      <div>
        <div className='flex justify-between p-5 items-center'>
          <div className='hidden md:flex space-x-10'>
            <h1>team</h1>
            <h1>github</h1>
          </div>
          <img className='w-10 h-10' src='frencircle-dark.png' />
          <LoginButton />
        </div>
      </div>
      <div className='items-center mt-40'>
        <h1 className='md:text-4xl text-2xl text-center font-bold'>
          discover friend circles based
          <br />
          on your everyday interactions
        </h1>
        <div className='flex justify-center w-full md:mt-20'>
          <div className='rounded-xl h-96 md:w-1/2 w-full m-10 md:m-0 bg-white opacity-10' />
        </div>    
      </div>
    </div>
  )
}