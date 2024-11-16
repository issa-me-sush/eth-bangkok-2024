import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'
import { usePrivy } from '@privy-io/react-auth';

export default function Profile() {
  const { user } = usePrivy();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      if (user?.wallet?.address) {
        try {
          console.log('🔍 Fetching tags for wallet:', user.wallet.address);
          const response = await fetch(`/api/get-tags?walletAddress=${user.wallet.address}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch tags');
          }
          
          const data = await response.json();
          console.log('✅ Fetched tags:', data.tags);
          setTags(data.tags);
        } catch (error) {
          console.error('❌ Error fetching tags:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTags();
  }, [user?.wallet?.address]);

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
          <div className='w-32 h-32 bg-gray-200 rounded-full'></div>
        </div>
        <div className='border border-opacity-20 border-white rounded-lg p-5 mt-10'>
          <h1 className='md:text-4xl text-xl font-bold opacity-50 mb-3'>interests</h1>
          <div className='flex flex-wrap gap-2'>
            {loading ? (
              <div className='text-sm opacity-50'>Loading tags...</div>
            ) : tags.length > 0 ? (
              tags.map((tag, index) => (
                <div key={index} className='bg-white bg-opacity-20 p-1 px-2 rounded-full text-xs'>
                  {tag}
                </div>
              ))
            ) : (
              <div className='text-sm opacity-50'>No interests found</div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}