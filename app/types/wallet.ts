
export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
}

export interface AppKitConfig {
  projectId: string;
  networks: Network[];
  metadata: AppMetadata;
}

export interface Network {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
  testnet?: boolean;
}

export interface AppMetadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

// Legacy Chain type for backward compatibility
export interface Chain {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
}

export interface WalletConfig {
  projectId: string;
  chains: Chain[];
  metadata: AppMetadata;
}
