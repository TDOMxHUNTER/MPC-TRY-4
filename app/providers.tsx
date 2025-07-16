'use client';

import { useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { monadTestnet } from './config/chains';
import { ReactNode } from 'react'

// Setup queryClient
const queryClient = new QueryClient();

// Your WalletConnect Cloud project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2a3cb8da4f7f897a2306f192152dfa98';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set - wallet functionality will be limited');
}

// Create a metadata object
const metadata = {
  name: 'Monad Profile Card',
  description: 'Create and customize your unique Monad profile card with holographic effects',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://monadprofilecard.vercel.app/',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Convert your Monad testnet to AppKit format
const networks = [
  {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
      name: 'MON',
      symbol: 'MON',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://testnet-rpc.monad.xyz/'],
      },
      public: {
        http: ['https://testnet-rpc.monad.xyz/'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Monad Explorer',
        url: 'https://testnet.monadexplorer.com/',
      },
    },
    testnet: true,
  },
  mainnet,
  arbitrum
];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  storage: typeof window !== 'undefined' ? localStorage : undefined,
  ssr: true,
  projectId,
  networks
});

// Create the modal with optimized settings
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [monadTestnet, mainnet, arbitrum, polygon],
  defaultNetwork: monadTestnet,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': '2000',
    '--w3m-accent': '#667eea'
  },
  enableAnalytics: false // Reduces initialization time
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000000',
        color: '#ffffff'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}