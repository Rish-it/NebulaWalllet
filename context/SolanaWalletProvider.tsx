"use client";

import { FC, ReactNode, useMemo, useEffect } from "react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CloverWalletAdapter,
  SolongWalletAdapter,
  CoinbaseWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { toast } from "sonner";

// Import the required styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Custom Modal Provider Component
const CustomWalletModalProvider: FC<{children: ReactNode}> = ({ children }) => {
  // Add the subtitle content after wallet modal renders
  useEffect(() => {
    const addSubtitle = () => {
      const modalTitle = document.querySelector('.wallet-adapter-modal-title');
      if (modalTitle && !document.querySelector('.wallet-adapter-modal-subtitle')) {
        const subtitle = document.createElement('p');
        subtitle.className = 'wallet-adapter-modal-subtitle';
        subtitle.textContent = 'Select your preferred wallet.';
        modalTitle.insertAdjacentElement('afterend', subtitle);
      }
    };

    // Use MutationObserver to detect when the modal appears in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const modalWrapper = document.querySelector('.wallet-adapter-modal-wrapper');
          if (modalWrapper) {
            addSubtitle();
          }
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <WalletModalProvider>{children}</WalletModalProvider>;
};

interface SolanaWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({
  children,
  network = WalletAdapterNetwork.Devnet,
  endpoint,
}) => {
  // You can also provide a custom RPC endpoint
  const rpcEndpoint = useMemo(() => {
    return endpoint || clusterApiUrl(network);
  }, [network, endpoint]);

  // Wallet connection error handler
  const onError = (error: WalletError) => {
    console.error(error);
    toast.error(`Wallet Error: ${error.message}`);
  };

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // and lazy loading. Only the wallets you configure here will be compiled into your
  // application, and only the dependencies of wallets that your users connect to will be
  // loaded.
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CloverWalletAdapter(),
      new SolongWalletAdapter(),
      new CoinbaseWalletAdapter()
    ],
    [network]
  );

  // Check for URL parameters indicating a mobile wallet connection request
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // Detect if we're returning from a mobile wallet connection
      if (urlParams.has("cluster") || urlParams.has("phantom_encryption_public_key")) {
        toast.success("Mobile wallet connection detected! Please approve the connection request.");
      }
    }
  }, []);

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect 
        onError={onError}
      >
        <CustomWalletModalProvider>
          {children}
        </CustomWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 