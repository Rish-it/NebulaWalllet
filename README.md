# NebulaWallet

<div align="center">
  <img src="public/web.png" alt="NebulaWallet Banner" width="100%" />
</div>

A secure and intuitive cryptocurrency wallet for managing digital assets and accessing decentralized web applications.

## Features

- **Generate Wallet**: Create new wallets with secure key generation
- **Import Wallet**: Enter existing recovery phrases to access wallets
- **Real-time Market Data**: Track crypto prices and trends via CoinGecko
- **Multi-currency Support**: Manage various cryptocurrencies
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
npm install next react react-dom @solana/web3.js bip39 tweetnacl ed25519-hd-key sonner lucide-react
```

## Environment Setup

Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here
```

## State Management

- **`mnemonicWords`**: Recovery phrase words
- **`seed`**: Cryptographic seed derived from mnemonic
- **`privateKeys`**: Generated private keys for transactions
- **`publicKeys`**: Public wallet addresses
- **`showMnemonic`**: Toggle visibility of recovery phrase
- **`showPrivateKeys`**: Toggle visibility of private keys

## How It Works

1. **Wallet Generation**:
   - Creates a random mnemonic phrase using BIP39
   - Derives seed and generates ED25519 keypairs
   - Converts to Solana-compatible format

2. **Wallet Import**:
   - Validates and processes user-provided recovery phrases
   - Derives keys from existing mnemonics

3. **Security**:
   - All operations performed client-side
   - No storage of private keys
   - Masked display options for sensitive data

## Contributing

Contributions welcome. Please submit issues or pull requests via GitHub.

## License

MIT License
