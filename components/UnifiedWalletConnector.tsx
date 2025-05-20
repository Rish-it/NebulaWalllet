"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useEthereumWallet } from '@/context/EthereumWalletProvider';
import { Button } from './ui/button';
import { WalletIcon, Power, Scan, ChevronDown, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQRCode } from 'next-qrcode';
import { Input } from "./ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type WalletType = 'solana' | 'ethereum' | 'local' | 'qr';

interface UnifiedWalletConnectorProps {
  size?: 'default' | 'sm' | 'lg';
  showBalance?: boolean;
}

const UnifiedWalletConnector: React.FC<UnifiedWalletConnectorProps> = ({
  size = 'default',
  showBalance = false,
}) => {
  const { 
    balance, 
    isConnected: localWalletConnected, 
    disconnectWallet: disconnectLocalWallet, 
    connectWallet: connectLocalWallet,
    isWalletLocked,
    account: localWalletAccount
  } = useWallet();
  
  const { publicKey, connected: solanaConnected, disconnect: disconnectSolana } = useSolanaWallet();
  const { account: ethAccount, isConnected: ethConnected, connectWallet: connectEth, disconnectWallet: disconnectEth } = useEthereumWallet();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { Canvas } = useQRCode();
  
  // Initialize the Solana wallet button ID
  const solanaButtonId = "hidden-solana-wallet-button";

  const anyWalletConnected = solanaConnected || ethConnected || localWalletConnected;
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Generate a connection URL for QR code
  const connectionUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    
    // Use Solana's protocol format that Phantom mobile can recognize
    // Generate a random encryption key for better security
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const encPublicKey = btoa(Array.from(randomBytes, byte => String.fromCharCode(byte)).join(''));
    const hostUrl = window.location.origin;
    const cluster = 'devnet'; // or 'mainnet-beta' depending on your app
    
    // Format that works with Phantom mobile
    return `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(hostUrl)}&dapp_encryption_public_key=${encodeURIComponent(encPublicKey)}&redirect_url=${encodeURIComponent(hostUrl)}?cluster=${cluster}`;
  }, []);

  const handleConnectWallet = (type: WalletType) => {
    if (type === 'ethereum') {
      connectEth();
    } else if (type === 'solana') {
      // Find and click the Solana wallet button by class name
      const solanaButton = document.querySelector<HTMLElement>('.solana-wallet-button');
      if (solanaButton) {
        solanaButton.click();
      } else {
        // Fallback to find any wallet-adapter-button
        const walletButton = document.querySelector<HTMLElement>('.wallet-adapter-button-trigger');
        if (walletButton) walletButton.click();
      }
    } else if (type === 'local') {
      setIsPasswordModalOpen(true);
    } else if (type === 'qr') {
      setQrModalOpen(true);
    }
    setWalletModalOpen(false);
  };

  const handlePasswordConnect = () => {
    connectLocalWallet(passwordInput);
    setPasswordInput('');
    setIsPasswordModalOpen(false);
  };

  const handleDisconnect = () => {
    if (solanaConnected) disconnectSolana();
    if (ethConnected) disconnectEth();
    if (localWalletConnected) disconnectLocalWallet();
  };

  return (
    <div className="wallet-connector">
      {/* Hidden Solana wallet button that we'll trigger programmatically */}
      <div className="hidden">
        <WalletMultiButton className="wallet-adapter-button-trigger" />
      </div>

      {anyWalletConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
              className="bg-primary hover:bg-primary/90 text-white rounded-full flex items-center gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              {showBalance && balance && parseFloat(balance) > 0 && (
                <span>{parseFloat(balance).toFixed(4)} SOL</span>
              )}
              {publicKey && (
                <span className="hidden sm:inline">{formatAddress(publicKey.toString())}</span>
              )}
              {ethAccount && (
                <span className="hidden sm:inline">{formatAddress(ethAccount)}</span>
              )}
              {localWalletAccount && !publicKey && !ethAccount && (
                <span className="hidden sm:inline">{formatAddress(localWalletAccount)}</span>
              )}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
            <DropdownMenuLabel className="font-normal text-muted-foreground">Connected Wallets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {solanaConnected && (
              <DropdownMenuItem className="py-2 cursor-default">
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Solana</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-1">
                    {publicKey?.toString()}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            
            {ethConnected && (
              <DropdownMenuItem className="py-2 cursor-default">
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ethereum</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Connected</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-1">
                    {ethAccount}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            
            {localWalletConnected && (
              <DropdownMenuItem className="py-2 cursor-default">
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Local Wallet</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {isWalletLocked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground mt-1">
                    {localWalletAccount}
                  </span>
                </div>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer rounded-lg"
              onClick={handleDisconnect}
            >
              <Power className="h-4 w-4 mr-2" />
              <span>Disconnect All Wallets</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
          <DialogTrigger asChild>
            <Button 
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
              className="bg-primary hover:bg-primary/90 text-white rounded-full flex items-center gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-semibold text-center">Connect Wallet</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-2 space-y-4">
              <div 
                className="p-4 border border-border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => handleConnectWallet('solana')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <img src="/solana-sol.svg" alt="Solana" className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Solana Wallet</h3>
                    <p className="text-xs text-muted-foreground">Connect to Phantom, Solflare etc.</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-4 border border-border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => handleConnectWallet('ethereum')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png" alt="MetaMask" className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ethereum Wallet</h3>
                    <p className="text-xs text-muted-foreground">Connect to MetaMask</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 border border-border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => handleConnectWallet('local')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <KeyRound className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Password Wallet</h3>
                    <p className="text-xs text-muted-foreground">Use locally created wallet</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-4 border border-border rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors flex items-center justify-between"
                onClick={() => handleConnectWallet('qr')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Scan className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Scan with Mobile</h3>
                    <p className="text-xs text-muted-foreground">Connect using QR code</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-sm rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Scan with Phantom App</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-white rounded-lg mx-auto">
            <Canvas
              text={connectionUrl}
              options={{
                type: 'image/jpeg',
                quality: 0.3,
                margin: 3,
                scale: 4,
                width: 200,
              }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2 space-y-2">
            <p className="font-medium">Instructions:</p>
            <ol className="text-left space-y-1 pl-5 list-decimal">
              <li>Open Phantom app on your mobile device</li>
              <li>Tap the scan button in the Phantom app</li>
              <li>Scan this QR code with your camera</li>
              <li>Approve the connection request</li>
            </ol>
            <p className="text-xs pt-2">
              This QR code only works with the Phantom mobile app
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-sm rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Enter Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="rounded-lg"
            />
            <Button 
              className="w-full rounded-lg"
              onClick={handlePasswordConnect}
            >
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedWalletConnector; 