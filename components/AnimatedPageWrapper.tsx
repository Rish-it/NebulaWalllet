"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCoin from "./AnimatedCoin";
import Link from "next/link";
import Image from 'next/image';

interface AnimatedPageWrapperProps {
  children: ReactNode;
}

export default function AnimatedPageWrapper({ children }: AnimatedPageWrapperProps) {
  const [showIntro, setShowIntro] = useState(false); // Default to false to skip intro
  const [isLoaded, setIsLoaded] = useState(false);

  // Crypto icons config
  const cryptoIcons = [
    { src: "/bitcoin-cryptocurrency.svg", alt: "Bitcoin", size: 80 },
    { src: "/ethereum-cryptocurrency.svg", alt: "Ethereum", size: 90 },
    { src: "/solana-sol.svg", alt: "Solana", size: 75 },
    { src: "/usd-cryptocurrency.svg", alt: "USD", size: 65 },
    { src: "/eur-cryptocurrency.svg", alt: "EUR", size: 70 },
    { src: "/nebula.png", alt: "Nebula", size: 60 },
  ];

  useEffect(() => {
    // Skip intro animation since user doesn't want it
    setShowIntro(false);
    
    // Mark page as loaded
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Main content with page transition */}
      <AnimatePresence mode="wait">
        <motion.main
          key="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {/* Floating Interactive Elements */}
      <div className="fixed top-0 right-0 pointer-events-none w-full h-full overflow-hidden">
        {isLoaded && (
          <>
            {/* Large floating crypto icons replacing orbs */}
            {[...Array(3)].map((_, i) => {
              const icon = cryptoIcons[i % cryptoIcons.length];
              const size = icon.size * 1.5; // Make them larger
              
              return (
                <motion.div
                  key={`large-crypto-${i}`}
                  className="absolute"
                  style={{
                    right: `${10 + (i * 25)}%`,
                    top: `${15 + (i * 20)}%`,
                  }}
                  animate={{
                    y: [0, -30, 0, 20, 0],
                    x: [0, 20, 0, -20, 0],
                    rotate: i === 2 ? [0, 360] : [0, 15, 0, -15, 0],
                  }}
                  transition={{
                    duration: 20 + (i * 5),
                    repeat: Infinity,
                    ease: "easeInOut",
                    rotate: i === 2 ? {
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear"
                    } : undefined
                  }}
                >
                  <div className="opacity-10 dark:opacity-5 blur-sm">
                    <Image 
                      src={icon.src} 
                      alt={icon.alt} 
                      width={size} 
                      height={size}
                    />
                  </div>
                </motion.div>
              );
            })}
            
            {/* Small floating crypto icons */}
            {[...Array(8)].map((_, i) => {
              const icon = cryptoIcons[(i + 3) % cryptoIcons.length];
              const size = (icon.size * 0.4) + (i % 3) * 5; // Smaller versions with slight variation
              
              return (
                <motion.div
                  key={`small-crypto-${i}`}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -10 - (i % 5) * 5, 0, 10 + (i % 3) * 5, 0],
                    x: [0, 10 + (i % 4) * 5, 0, -10 - (i % 3) * 5, 0],
                    rotate: [0, i % 2 === 0 ? 20 : -20, 0, i % 2 === 0 ? -20 : 20, 0],
                    opacity: [0.3, 0.5, 0.3, 0.2, 0.3],
                  }}
                  transition={{
                    duration: 10 + (i * 2),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="opacity-30 dark:opacity-15">
                    <Image 
                      src={icon.src} 
                      alt={icon.alt}
                      width={size}
                      height={size}
                    />
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
} 