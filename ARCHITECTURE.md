# NebulaWallet Architecture Documentation

This document outlines the technical architecture of NebulaWallet, detailing its components, data flow, and implementation details.

## System Overview

NebulaWallet is a multi-chain cryptocurrency wallet supporting Ethereum and Solana networks. Built with Next.js and TypeScript, it provides a secure and intuitive interface for managing digital assets and interacting with DeFi protocols.

## Project Structure

```
NebulaWallet/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── DeFiHub.tsx         # DeFi functionality
│   ├── CryptoStats.tsx     # Market data display
│   ├── WalletGenerator.tsx # Wallet creation/import
│   └── WalletTypeSelector.tsx # Chain selection
├── context/                # React Context providers
│   └── WalletContext.tsx   # Wallet state management
├── lib/                    # Utility functions
│   └── utils.ts            # Helper utilities
├── public/                 # Static assets
└── ...                     # Configuration files
```

## Core Components and Modules

### 1. Wallet Context (`/context/WalletContext.tsx`)

The central state management system for wallet operations:

```typescript
interface WalletContextType {
  // Connection state
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  
  // Wallet type
  walletType: 'ethereum' | 'solana';
  setWalletType: (type: 'ethereum' | 'solana') => void;
  
  // Account info
  account: string | null;
  balance: string;
  
  // Test mode
  isTestMode: boolean;
  toggleTestMode: () => void;
  addTestSol: (amount: string) => void;
}
```

Key responsibilities:
- Manages wallet connection state
- Tracks balances across different networks
- Handles wallet type switching
- Provides test mode functionality for simulated transactions

### 2. DeFi Hub (`/components/DeFiHub.tsx`)

Provides interfaces for decentralized finance operations:

#### Staking Implementation
```typescript
// Validator interface for Solana staking
interface Validator {
  votePubkey: string;
  name: string;
  commission: number;
  activatedStake: number;
  apy: number;
}

// Staking handler
const handleStakeSubmit = async () => {
  if (isTestMode) {
    // Simulate staking in test mode
    // Deduct balance and record stake in localStorage
  } else {
    // In production:
    // 1. Create stake account (Solana) or call staking contract (Ethereum)
    // 2. Sign and send transaction
    // 3. Wait for confirmation
  }
};
```

#### Token Swap Implementation
```typescript
// Token definition
interface Token {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  balance: string;
  price: number;
}

// Swap calculation
const calculateSwapOutput = (): string => {
  // In production:
  // 1. Query actual liquidity pools for price impact
  // 2. Calculate slippage
  // 3. Return estimated output amount
  
  // Simplified mock implementation:
  const inputValue = parseFloat(swapAmount) * fromTokenData.price;
  const outputAmount = inputValue / toTokenData.price;
  return outputAmount.toFixed(6);
};
```

### 3. Wallet Generation (`/components/WalletGenerator.tsx`)

Handles creation and import of cryptocurrency wallets:

```typescript
// Mnemonic generation
const generateMnemonic = () => {
  const entropy = crypto.randomBytes(16);
  const mnemonic = bip39.entropyToMnemonic(entropy);
  return mnemonic.split(' ');
};

// Key derivation for Solana
const deriveSolanaKeypair = async (mnemonic: string) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const derivedSeed = derivePath(`m/44'/501'/0'/0'`, seed.slice(0, 32));
  return Keypair.fromSeed(derivedSeed);
};

// Key derivation for Ethereum
const deriveEthereumWallet = (mnemonic: string) => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
};
```

### 4. Market Data (`/components/CryptoStats.tsx`)

Provides cryptocurrency price information:

```typescript
// Data fetching from CoinGecko API
const fetchCryptoData = async () => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${popularCryptoIds.join(",")}&order=market_cap_desc`
  );
  
  const data = await response.json();
  
  // Process and display data
  // ...
};
```

## Data Flow and State Management

1. **User Authentication Flow**
   - Connect wallet action → WalletContext → Update connection state → UI update
   - Wallet type selection → Context update → Chain-specific UI elements

2. **Transaction Flow** (conceptual for future implementation)
   - User initiates transaction → Confirmation dialog
   - Sign transaction → Broadcast to network → Monitor status → Update UI

3. **Test Mode Flow**
   - Toggle test mode → Initialize localStorage values
   - Simulate transaction → Update local state → Reflect in UI

## Technical Debt and Future Implementation

1. **Real Blockchain Integration**
   
   For Solana:
   ```typescript
   // Current test implementation
   const handleStakeSubmit = async () => {
     // Update localStorage and UI state
   };
   
   // Future production implementation
   const handleStakeSubmit = async () => {
     const connection = new Connection(clusterApiUrl('mainnet-beta'));
     const stakePubkey = await createStakeAccount(
       connection,
       account,
       LAMPORTS_PER_SOL * parseFloat(stakeAmount),
       Authorized,
       Lockup
     );
     
     await delegateStake(
       connection,
       account,
       stakePubkey,
       selectedValidator.votePubkey
     );
   };
   ```

2. **Token Swap Production Code**
   
   ```typescript
   // Current test implementation
   const handleSwapSubmit = async () => {
     // Update localStorage values
   };
   
   // Future Solana implementation with Jupiter aggregator
   const handleSwapSubmit = async () => {
     const routes = await jupiter.computeRoutes({
       inputMint: new PublicKey(fromTokenMint),
       outputMint: new PublicKey(toTokenMint),
       amount: amount * LAMPORTS_PER_SOL,
       slippage: slippage,
     });
     
     const { execute } = await jupiter.exchange({
       routeInfo: routes.routesInfos[0],
     });
     
     const result = await execute();
     // Process result
   };
   ```

## Security Considerations

1. **Private Key Management**
   - All private keys should be stored in memory only
   - For production: Implement proper key encryption
   - Consider hardware wallet integration

2. **Transaction Security**
   - All transactions require explicit user confirmation
   - Fee estimation and display before signing
   - Rate limiting to prevent accidental multiple submissions

3. **Network Security**
   - SSL/TLS for all API communications
   - RPC endpoint security and rotation
   - Rate limiting on third-party API calls

## Performance Optimizations

1. **Wallet State Caching**
   - Cache balance and transaction data with appropriate TTL
   - Implement optimistic UI updates for better UX

2. **API Request Batching**
   - Batch multiple token balance requests
   - Implement proper error handling and retries

3. **Rendering Optimizations**
   - Use React.memo and useMemo for expensive calculations
   - Implement virtualization for long lists of transactions

## Deployment Considerations

1. **Environment Configuration**
   - Separate configs for development, staging, and production
   - Environment-specific RPC endpoints

2. **CI/CD Pipeline**
   - Automated testing before deployment
   - Staged rollouts for critical updates

3. **Monitoring**
   - Error tracking with source maps
   - Performance monitoring of API calls
   - User behavior analytics for feature improvement

---

This architecture document is a living document and will be updated as NebulaWallet evolves from a prototype to a production-ready application. 