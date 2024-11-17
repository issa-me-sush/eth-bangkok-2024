import { PrivyProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from 'react';
import { baseSepolia } from 'viem/chains';
export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['google','email'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        defaultChain: baseSepolia,
        supportedChains: [
       baseSepolia
        ],
        embeddedWallets: { 
            createOnLogin: 'users-without-wallets' 
        } 
      }}
    >
      {children}
    </PrivyProvider>
  );
}