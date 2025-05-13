"use client";

import { Button } from "./ui/button";
import { ArrowRightLeft, Send, ArrowDownToLine } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";

export default function WalletHero() {
  const { account, balance, isConnected, connectWallet } = useWallet();
  
  // Calculate USD value (this would normally come from an API)
  const ethPrice = 1850; // Example price in USD
  const usdValue = isConnected 
    ? (parseFloat(balance) * ethPrice).toFixed(2) 
    : "2,649.57"; // Show default if not connected
  
  // Format wallet address if connected
  const displayAddress = account 
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50 py-12 md:py-20 dark:from-gray-900 dark:to-gray-800">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100 rounded-full opacity-30 blur-3xl dark:bg-purple-900 dark:opacity-10"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200 rounded-full opacity-30 blur-3xl dark:bg-purple-900 dark:opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="md:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 md:mb-6 tracking-tight dark:text-gray-100">
              Welcome to <span className="text-purple-600 dark:text-purple-400">Nebula</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-slate-700 mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto md:mx-0 dark:text-gray-300">
              A secure wallet for managing digital assets, connecting to decentralized applications, and exploring the blockchain ecosystem with complete control and privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link href="#wallet" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 sm:px-8 dark:bg-purple-500 dark:hover:bg-purple-600">
                  Generate Wallet
                </Button>
              </Link>
              {!isConnected && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={connectWallet}
                  className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full px-6 sm:px-8 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-gray-800"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
          
          <div className="hidden md:block relative mt-10 md:mt-0">
            <div className="relative z-10 bg-white p-4 rounded-3xl shadow-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
              <div className="bg-gradient-to-r from-purple-600 to-purple-400 p-1 rounded-2xl">
                <div className="bg-white rounded-xl p-4 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-slate-800 dark:text-gray-100">Nebula Wallet</div>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                      isConnected 
                        ? "text-purple-600 bg-purple-50 dark:bg-gray-800 dark:text-purple-400" 
                        : "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl mb-4 dark:bg-gray-800">
                    <div className="text-sm text-slate-500 mb-1 dark:text-gray-400">Total Balance</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-gray-100">
                      {isConnected ? `${balance} ETH` : '1.43 ETH'}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">≈ ${usdValue} USD</div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`flex-1 p-3 rounded-xl text-center ${
                      isConnected ? 'bg-purple-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                    }`}>
                      <div className="text-xs text-slate-600 mb-1 dark:text-gray-400">Send</div>
                      <Send size={18} className="mx-auto text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={`flex-1 p-3 rounded-xl text-center ${
                      isConnected ? 'bg-purple-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                    }`}>
                      <div className="text-xs text-slate-600 mb-1 dark:text-gray-400">Receive</div>
                      <ArrowDownToLine size={18} className="mx-auto text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className={`flex-1 p-3 rounded-xl text-center ${
                      isConnected ? 'bg-purple-50 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                    }`}>
                      <div className="text-xs text-slate-600 mb-1 dark:text-gray-400">Swap</div>
                      <ArrowRightLeft size={18} className="mx-auto text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-2xl opacity-70 z-0 dark:bg-purple-900 dark:opacity-20"></div>
            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-purple-200 rounded-full blur-xl opacity-70 z-0 dark:bg-purple-900 dark:opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 