import { PrivyProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from 'react';

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },

        embeddedWallets: { 
            createOnLogin: 'users-without-wallets' 
        } 
      }}
    >
      {children}
    </PrivyProvider>
  );
}