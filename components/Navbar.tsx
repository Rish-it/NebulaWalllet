"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./ui/theme-button";
import { Button } from "./ui/button";
import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import WalletTypeSelector from "./WalletTypeSelector";

const Navbar = () => {
  const { connectWallet, disconnectWallet, isConnected, account, isConnecting } = useWallet();
  const [displayAddress, setDisplayAddress] = useState<string>("");
  
  useEffect(() => {
    if (account) {
      // Format the address to show first 6 and last 4 characters
      setDisplayAddress(`${account.substring(0, 6)}...${account.substring(account.length - 4)}`);
    }
  }, [account]);

  return (
    <header className="bg-white border-b border-purple-100 sticky top-0 z-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-purple-600 rounded-full p-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="tracking-tight text-2xl font-bold text-slate-800 flex items-center dark:text-gray-100">
                Nebula
                <span className="ml-2 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 dark:bg-gray-800 dark:border-gray-700">
                  v1.0
                </span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Features
            </Link>
            <Link href="#wallet" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Wallet
            </Link>
            <Link href="#defi" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              DeFi
            </Link>
            <Link href="#market" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Market
            </Link>
            <Link href="#resources" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Resources
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <WalletTypeSelector />
            </div>
            {isConnected ? (
              <Button 
                variant="outline"
                onClick={disconnectWallet}
                className="hidden md:inline-flex border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full dark:border-purple-400 dark:text-purple-400 dark:hover:bg-gray-800"
              >
                {displayAddress}
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={connectWallet}
                disabled={isConnecting}
                className="hidden md:inline-flex border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full dark:border-purple-400 dark:text-purple-400 dark:hover:bg-gray-800"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            )}
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600">
              Get Started
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
