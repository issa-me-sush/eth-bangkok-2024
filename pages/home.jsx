import { useState, useEffect } from 'react'
import Head from 'next/head'
import BottomNav from '../components/BottomNav'
import { usePrivy, useLogout } from '@privy-io/react-auth'
import Link from 'next/link';

export default function Home() {
    const { user } = usePrivy();
    const { logout } = useLogout();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log(user?.wallet?.address)
    useEffect(() => {
        const fetchUserTags = async () => {
            if (user?.wallet?.address) {
                try {
                    console.log('🔍 Fetching tags for wallet:', user.wallet.address);
                    const response = await fetch(`/api/get-tags?walletAddress=${user.wallet.address}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch tags');
                    }

                    const data = await response.json();
                    console.log('✅ Fetched tags:', data.tags);

                    const tagCommunities = data.tags.map((tag, index) => ({
                        id: index + 1,
                        name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Community`,
                        image: `${tag}.jpg`,
                        tag: tag
                    }));

                    setCommunities(tagCommunities);
                } catch (error) {
                    console.error('❌ Error fetching tags:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserTags();
    }, [user?.wallet?.address]);

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
                <h1 className='md:text-4xl text-2xl font-bold mb-10'>my circles</h1>

                {loading ? (
                    <div className="text-center text-gray-500 animate-pulse flex justify-center items-center">
                        <img src='frencircle-dark.png' className='w-10 h-10 animate-spin' />
                    </div>
                ) : communities.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {communities.map((community) => (
                            <Link href={`/chat?tag=${community.tag}`}>
                                <div
                                    key={community.id}
                                    className='relative h-48 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200'
                                >
                                    <div
                                        className='absolute inset-0 bg-cover bg-center grayscale'
                                        style={{
                                            backgroundImage: `url(${community.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
                                    <div className='absolute bottom-4 left-4 text-white'>
                                        <h1 className='text-xl font-bold'>
                                            {community.name}
                                        </h1>
                                        <div className='flex space-x-3 text-xs mt-3'>
                                            <div className='bg-white text-black rounded-full p-1 px-2'>
                                                member
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        No communities found. Join some conversations to discover your interests!
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}