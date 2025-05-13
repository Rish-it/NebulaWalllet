# NebulaWallet

<div align="center">
  <img src="public/web.png" alt="NebulaWallet Banner" width="100%" />
  <br />
  <h3>Your secure gateway to the decentralized web and digital assets</h3>
</div>

## Features

- **Modern & Intuitive Interface** - Beautiful UI designed with the latest design principles
- **Enhanced Security** - Secure wallet generation and management
- **Real-time Crypto Tracking** - Live prices, trends, and market data powered by CoinGecko
- **Multi-currency Support** - Support for major cryptocurrencies
- **Cross-platform Compatibility** - Works seamlessly across devices
- **Portfolio Management** - Track your assets and performance with ease

## Live Demo

Experience NebulaWallet at [nebulawallet.vercel.app](https://nebulawallet.vercel.app)

## Technology Stack

- **Next.js** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **bip39 & ed25519** - Cryptographic key generation
- **Solana Web3.js** - Blockchain integration
- **CoinGecko API** - Real-time cryptocurrency data

## Dependencies

The project uses the following key dependencies:

- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **Blockchain**: Solana Web3.js, ethers, wagmi, viem
- **Cryptography**: bip39, tweetnacl, ed25519-hd-key, bs58
- **Theming**: next-themes
- **Animation**: Framer Motion
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Rish-it/NebulaWallet.git
cd NebulaWallet
```

2. Install all dependencies with a single command
```bash
npm install
```
or if you prefer yarn:
```bash
yarn install
```

3. Create a local environment file
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your specific configuration values if needed.

4. Run the development server
```bash
npm run dev
```
or with yarn:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Setup

The application uses environment variables for configuration. Create a `.env.local` file in the root directory with the following variables:

```
# API Keys (example)
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_if_you_have_one
```

Note: The application can run without API keys, but certain features may be rate-limited.

## Responsive Design

NebulaWallet is built with a mobile-first approach, ensuring it works beautifully on all screen sizes.

## Security

- All sensitive operations are performed client-side
- Private keys are never stored or transmitted
- Optional visibility toggles for sensitive information
- Environment files with secrets are ignored by git

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License.

## Author

Designed and developed by [Rishit](https://github.com/rish-it)
