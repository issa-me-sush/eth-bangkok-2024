import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'
import { usePrivy, useLogout } from '@privy-io/react-auth'

export default function Profile() {
  const { logout } = useLogout();
  const { user } = usePrivy();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCids, setUserCids] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState(false);

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

  const handleDownload = async () => {
    if (!user?.wallet?.address) return;
    setDownloadLoading(true);
    
    try {
      // First fetch CIDs for this user
      const response = await fetch(`/api/get-cids?walletAddress=${user.wallet.address}`);
      const data = await response.json();
      
      if (!data.cids || !Array.isArray(data.cids)) {
        console.error('Invalid CIDs response:', data);
        throw new Error('No CIDs found');
      }

      console.log('Fetched CIDs:', data.cids);
      
      // Fetch content from each CID
      const contents = await Promise.all(
        data.cids.map(cid => 
          fetch(`https://${cid}.ipfs.w3s.link/`)
            .then(res => res.text())
        )
      );

      // Combine all contents
      const combinedContent = contents.join('\n\n--- New Entry ---\n\n');
      
      // Create and trigger download
      const blob = new Blob([combinedContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `friendcircle-data-${user.wallet.address.slice(0,6)}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

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
                    <button
                        onClick={logout}
                        className='bg-white text-black px-4 py-2 rounded-full'
                    >
                        Logout
                    </button>
                </div>
      </div>
      <div className='p-10 mb-20'>
        <h1 className='md:text-4xl text-2xl font-bold mb-10'>profile</h1>
        <div className='flex justify-center'>
          <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.wallet?.address}`} className='w-32 h-32 bg-gray-200 rounded-full' />
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
        <div className='border border-opacity-20 border-white rounded-lg p-5 mt-10'>
          <h1 className='md:text-4xl text-xl font-bold opacity-50 mb-3'>user data</h1>
          <button 
            onClick={handleDownload}
            disabled={downloadLoading}
            className='bg-white text-black px-4 py-2 rounded-full disabled:opacity-50'
          >
            {downloadLoading ? 'Downloading...' : 'download from storacha'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}