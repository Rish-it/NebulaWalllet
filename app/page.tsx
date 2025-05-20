"use client";

import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import WalletGenerator from "@/components/WalletGenerator";
import SendTransaction from "@/components/SendTransaction";
import DeFiHub from "@/components/DeFiHub";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnifiedWalletConnector from "@/components/UnifiedWalletConnector";
import { useEthereumWallet } from "@/context/EthereumWalletProvider";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { 
  WalletIcon, 
  CircleDollarSign, 
  BarChart4, 
  ExternalLink,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Sparkles
} from "lucide-react";
import Image from 'next/image';
import { motion } from "framer-motion";

export default function Home() {
  const { isConnected: localWalletConnected } = useWallet();
  const [showWalletGenerator, setShowWalletGenerator] = useState(false);
  const { connected: solanaConnected } = useSolanaWallet();
  const { isConnected: ethConnected } = useEthereumWallet();

  const anyWalletConnected = solanaConnected || ethConnected || localWalletConnected;

  return (
    <main className="notion-like min-h-screen flex flex-col">
      <header className="border-b border-border py-3 px-4">
        <div className="container max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-medium text-xl tracking-tight flex items-center gap-2">
            <Image src="/nebula.png" alt="Nebula" width={40} height={40} className="h-12 w-12" />
            <span>NebulaWallet</span>
          </h1>

          <div className="flex items-center gap-3">
            <UnifiedWalletConnector size="sm" showBalance={true} />
          </div>
        </div>
      </header>

      <section className="flex-1">
        <div className="container max-w-5xl mx-auto px-4">
          {!anyWalletConnected ? (
            <>
              {!showWalletGenerator ? (
                <div className="py-16 md:py-24">
                  {/* Hero Section */}
                  <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 mb-16 overflow-hidden relative">
                    {/* Floating Crypto Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                      {/* Bitcoin Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          left: '5%',
                          top: '10%',
                        }}
                        animate={{
                          y: [0, -60, 0],
                          rotate: [0, 15, 0],
                          opacity: [0.6, 0.9, 0.6]
                        }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Image 
                          src="/bitcoin-cryptocurrency.svg" 
                          alt="Bitcoin" 
                          width={100} 
                          height={100} 
                          className="opacity-60 dark:opacity-40 drop-shadow-lg"
                        />
                      </motion.div>
                      
                      {/* Ethereum Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          right: '8%',
                          top: '15%',
                        }}
                        animate={{
                          y: [0, -40, 0],
                          x: [0, 30, 0],
                          rotate: [0, -10, 0],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      >
                        <Image 
                          src="/ethereum-cryptocurrency.svg" 
                          alt="Ethereum" 
                          width={120} 
                          height={120} 
                          className="opacity-60 dark:opacity-40 drop-shadow-lg"
                        />
                      </motion.div>
                      
                      {/* Solana Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          left: '20%',
                          bottom: '5%',
                        }}
                        animate={{
                          y: [0, 40, 0],
                          x: [0, -20, 0],
                          rotate: [0, 20, 0],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                          duration: 18,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      >
                        <Image 
                          src="/solana-sol.svg" 
                          alt="Solana" 
                          width={110} 
                          height={110} 
                          className="opacity-60 dark:opacity-40 drop-shadow-lg"
                        />
                      </motion.div>
                      
                      {/* USD Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          right: '20%',
                          bottom: '15%',
                        }}
                        animate={{
                          y: [0, 50, 0],
                          rotate: [0, -15, 0],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 14,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 3
                        }}
                      >
                        <Image 
                          src="/usd-cryptocurrency.svg" 
                          alt="USD" 
                          width={90} 
                          height={90} 
                          className="opacity-50 dark:opacity-30 drop-shadow-lg"
                        />
                      </motion.div>
                      
                      {/* EUR Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          left: '40%',
                          top: '-5%',
                        }}
                        animate={{
                          y: [0, -30, 0],
                          x: [0, 20, 0],
                          rotate: [0, 10, 0],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                          duration: 16,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 4
                        }}
                      >
                        <Image 
                          src="/eur-cryptocurrency.svg" 
                          alt="EUR" 
                          width={95} 
                          height={95} 
                          className="opacity-50 dark:opacity-30 drop-shadow-lg"
                        />
                      </motion.div>
                      
                      {/* Additional Nebula Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          right: '35%',
                          top: '30%',
                        }}
                        animate={{
                          y: [0, 30, 0],
                          x: [0, -10, 0],
                          rotate: [0, 360],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "easeInOut",
                          rotate: {
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                          }
                        }}
                      >
                        <Image 
                          src="/nebula.png" 
                          alt="Nebula" 
                          width={80} 
                          height={80} 
                          className="opacity-60 dark:opacity-40 drop-shadow-lg"
                        />
                      </motion.div>
                    </div>

                    <div className="flex-1 z-10">
                      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        The Secure Multi-Chain Wallet for Web3
                      </h1>
                      <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        NebulaWallet provides a secure, fast, and user-friendly way to manage your 
                        Solana and Ethereum tokens and interact with decentralized applications.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6"
                          onClick={() => setShowWalletGenerator(true)}
                        >
                          Create Wallet <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <UnifiedWalletConnector size="lg" />
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center z-10">
                      <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <CircleDollarSign className="w-32 h-32 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
                    {/* Background crypto icons for features section */}
                    <motion.div
                      className="absolute left-0 -top-10 opacity-20 dark:opacity-10"
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image 
                        src="/bitcoin-cryptocurrency.svg" 
                        alt="Bitcoin" 
                        width={50} 
                        height={50}
                        className="drop-shadow-lg"
                      />
                    </motion.div>
                    
                    <motion.div
                      className="absolute right-0 bottom-0 opacity-20 dark:opacity-10"
                      animate={{
                        y: [0, 15, 0],
                        rotate: [0, -8, 0],
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image 
                        src="/ethereum-cryptocurrency.svg" 
                        alt="Ethereum" 
                        width={60} 
                        height={60}
                        className="drop-shadow-lg"
                      />
                    </motion.div>
                    
                    <motion.div
                      className="absolute right-1/3 -bottom-5 opacity-15 dark:opacity-10"
                      animate={{
                        y: [0, 10, 0],
                        x: [0, -10, 0],
                      }}
                      transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image 
                        src="/solana-sol.svg" 
                        alt="Solana" 
                        width={45} 
                        height={45}
                        className="drop-shadow-lg"
                      />
                    </motion.div>
                    
                    <div className="p-6 border border-border rounded-xl bg-card/50 hover:shadow-md transition-all z-10">
                      <Shield className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">Secure by Design</h3>
                      <p className="text-muted-foreground">
                        Your keys are encrypted with AES-256-GCM and never leave your device.
                      </p>
                    </div>
                    <div className="p-6 border border-border rounded-xl bg-card/50 hover:shadow-md transition-all z-10">
                      <Zap className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">Lightning Fast</h3>
                      <p className="text-muted-foreground">
                        Optimized transactions and minimal overhead for the best performance.
                      </p>
                    </div>
                    <div className="p-6 border border-border rounded-xl bg-card/50 hover:shadow-md transition-all z-10">
                      <Globe className="h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">Multi-Chain Ready</h3>
                      <p className="text-muted-foreground">
                        Seamlessly interact with dApps on Solana and Ethereum ecosystems.
                      </p>
                    </div>
                  </div>
                  
                  {/* CTA Section */}
                  <div className="py-10 px-8 bg-gradient-to-r from-primary/10 to-purple-400/10 rounded-2xl text-center relative overflow-hidden">
                    {/* Floating Crypto Icons in CTA */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {/* Bitcoin Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          left: '5%',
                          top: '15%',
                        }}
                        animate={{
                          y: [0, -15, 0],
                          rotate: [0, 10, 0],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Image 
                          src="/bitcoin-cryptocurrency.svg" 
                          alt="Bitcoin" 
                          width={40} 
                          height={40} 
                          className="opacity-30 dark:opacity-20 drop-shadow-md"
                        />
                      </motion.div>
                      
                      {/* Ethereum Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          right: '10%',
                          bottom: '20%',
                        }}
                        animate={{
                          y: [0, 15, 0],
                          rotate: [0, -8, 0],
                          opacity: [0.2, 0.35, 0.2]
                        }}
                        transition={{
                          duration: 9,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      >
                        <Image 
                          src="/ethereum-cryptocurrency.svg" 
                          alt="Ethereum" 
                          width={45} 
                          height={45} 
                          className="opacity-30 dark:opacity-20 drop-shadow-md"
                        />
                      </motion.div>
                      
                      {/* Solana Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          right: '5%',
                          top: '15%',
                        }}
                        animate={{
                          y: [0, -12, 0],
                          x: [0, 8, 0],
                          opacity: [0.15, 0.3, 0.15]
                        }}
                        transition={{
                          duration: 7,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      >
                        <Image 
                          src="/solana-sol.svg" 
                          alt="Solana" 
                          width={35} 
                          height={35} 
                          className="opacity-30 dark:opacity-20 drop-shadow-md"
                        />
                      </motion.div>
                      
                      {/* USD Icon */}
                      <motion.div
                        className="absolute"
                        style={{
                          left: '10%',
                          bottom: '20%',
                        }}
                        animate={{
                          y: [0, 10, 0],
                          opacity: [0.15, 0.25, 0.15]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Image 
                          src="/usd-cryptocurrency.svg" 
                          alt="USD" 
                          width={30} 
                          height={30} 
                          className="opacity-30 dark:opacity-20 drop-shadow-md"
                        />
                      </motion.div>
                    </div>
                    <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Web3 Journey?</h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Connect your wallet in seconds and start exploring the future of finance.
                    </p>
                    <div className="flex justify-center">
                      <UnifiedWalletConnector size="lg" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto py-8">
                  <Button 
                    variant="ghost" 
                    className="mb-6 text-sm"
                    onClick={() => setShowWalletGenerator(false)}
                  >
                    ← Back to Home
                  </Button>
                  <WalletGenerator />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 py-8">
              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="w-full max-w-md mx-auto mb-6 bg-secondary/50 rounded-full">
                  <TabsTrigger value="send" className="flex-1 rounded-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Send & Receive</span>
                  </TabsTrigger>
                  <TabsTrigger value="defi" className="flex-1 rounded-full">
                    <BarChart4 className="h-4 w-4 mr-2" />
                    <span>DeFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex-1 rounded-full">
                    <WalletIcon className="h-4 w-4 mr-2" />
                    <span>Wallet</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="send">
                  <SendTransaction />
                </TabsContent>
                <TabsContent value="defi">
                  <DeFiHub />
                </TabsContent>
                <TabsContent value="wallet">
                  <div className="max-w-4xl mx-auto">
                    <WalletGenerator />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
