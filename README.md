# NebulaWallet

<div align="center">
  <img src="public/web.png" alt="NebulaWallet Banner" width="100%" />
</div>

A secure and intuitive cryptocurrency wallet for managing digital assets and accessing decentralized web applications.

## Features

- **Multi-Chain Support**: Support for both Ethereum and Solana blockchains
- **Generate Wallet**: Create new wallets with secure key generation
- **Import Wallet**: Enter existing recovery phrases to access wallets
- **Real-time Market Data**: Track crypto prices and trends via CoinGecko
- **DeFi Hub**: Staking, swaps, and other DeFi functionalities
- **Test Mode**: Simulate transactions without real funds
- **Security Controls**: Toggle visibility of sensitive information
- **Copy to Clipboard**: Easily copy keys and recovery phrases

## Installation

1. Clone the repository
```bash
git clone https://github.com/Rish-it/NebulaWallet.git
cd NebulaWallet
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Required Dependencies

```bash
npm install next react react-dom @solana/web3.js bip39 tweetnacl ed25519-hd-key ethers viem @web3modal/ethereum lucide-react
```

## Environment Setup

Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
```

## Architecture

NebulaWallet is built with a modern tech stack, focusing on performance, security, and user experience:

### Core Technologies
- **Next.js 14**: Framework for the React frontend with file-based routing
- **TypeScript**: Static typing for improved developer experience
- **TailwindCSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Reusable UI components based on Radix UI
- **Context API**: For global state management

### Key Components

1. **Wallet Context (`/context/WalletContext.tsx`)**
   - Central state management for wallet operations
   - Handles wallet connection, disconnection, and balance updates
   - Manages wallet type switching between Ethereum and Solana
   - Provides test mode functionality for simulating transactions

2. **Wallet Generation (`/components/WalletGenerator.tsx`)**
   - BIP39 mnemonic generation
   - Key derivation for Ethereum and Solana
   - Secure display and storage of sensitive information

3. **DeFi Hub (`/components/DeFiHub.tsx`)**
   - Staking interface for Ethereum and Solana
   - Token swap functionality
   - Yield farming options (placeholders for future implementation)

4. **Market Data (`/components/CryptoStats.tsx`)**
   - Real-time cryptocurrency price data
   - Market trends and statistics
   - Support for multiple price displays (USD, USDC, USDT)

5. **Test Mode System**
   - Simulated balances stored in localStorage
   - Test transaction capabilities without real funds
   - Mock validators for staking simulation

### Data Flow

```
User Interaction → Component UI → Context Actions → Blockchain Operations → State Update → UI Reflection
```

### Security Model

- Client-side operations for maximum security
- No server storage of private keys or seeds
- Masked display options for sensitive data
- Read-only operations by default, explicit confirmation for transactions

## Implementation Status

NebulaWallet is currently a functional prototype with the following status:

✅ Complete
- UI/UX design and implementation
- Wallet generation and import
- Cryptocurrency market data display
- Test mode functionality
- Wallet type switching (Ethereum/Solana)

⚠️ Partial Implementation
- DeFi staking interface (UI and test mode only)
- Token swap interface (UI and test mode only)

❌ Future Implementation
- **Smart contract integration**: Actual blockchain transactions for staking, swapping
- **Production validator connections**: Real validator data and staking mechanics
- **Liquidity pools**: Actual DEX integrations for token swaps
- **Cross-chain operations**: True bridging between Ethereum and Solana
- **Hardware wallet support**: Integration with Ledger, Trezor, etc.
- **Mobile app version**: React Native implementation

## How to Implement Actual Blockchain Operations

To transform NebulaWallet from a prototype to a production wallet, the following implementations would be needed:

### For Ethereum Integration

1. **Replace `ethers` mock functionality with actual transactions**
   - Implement ERC-20 token transfers
   - Use actual gas estimation
   - Connect to Ethereum staking contracts

2. **DeFi Integration**
   - Add Lido or Rocket Pool contracts for ETH staking
   - Implement Uniswap, Sushiswap, or other DEX contracts for swaps
   - Integrate with yield aggregators like Yearn

### For Solana Integration

1. **Implement actual Solana transactions**
   - Replace mock stake accounts with actual stake program calls
   - Use actual SOL transfers instead of localStorage simulation
   - Create stake accounts on-chain when staking

2. **DeFi Integration**
   - Connect to SPL token program for token management
   - Implement Raydium or Orca integration for swaps
   - Add Marinade or Lido for liquid staking

### General Production Readiness

1. **Security Enhancements**
   - Proper transaction signing flows
   - Confirmation dialogs with transaction details
   - Fee estimation and display

2. **Error Handling**
   - Network error recovery
   - Transaction failure handling
   - Improved user feedback

3. **Network Selection**
   - Mainnet/Testnet toggle
   - Network fee customization

## Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## State Management

- **`mnemonicWords`