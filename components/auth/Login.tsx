import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export function LoginButton() {
  const { login, authenticated, user, ready } = usePrivy();
  const router = useRouter();
  
  // Handle auto-open login modal
  useEffect(() => {
    // Only run this effect once when component is mounted and ready
    if (ready && !authenticated && router.isReady) {
      const shouldOpenLogin = router.query.open === 'true';
      if (shouldOpenLogin) {
        login();
      }
    }
  }, [ready, router.isReady]);

  // Handle successful authentication
  useEffect(() => {
    const handleAuth = async () => {
      const uid = router.query.uid;
      if (authenticated && user?.wallet?.address && uid) {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: user.wallet.address,
              uid,
            }),
          });

          const data = await response.json();
          console.log('User registered:', data);

          router.push(`/home`);
        } catch (error) {
          console.error('Failed to register user:', error);
        }
      }
    };

    handleAuth();
  }, [authenticated]); // Only depend on authentication state

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          Welcome, {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className='bg-white text-black px-4 py-2 rounded-full'
    >
      Login
    </button>
  );
}