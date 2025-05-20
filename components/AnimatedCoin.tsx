"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AnimatedCoinProps {
  startDelay?: number;
  flipDuration?: number;
  className?: string;
  autoPlay?: boolean;
}

export default function AnimatedCoin({
  startDelay = 500,
  flipDuration = 2500,
  className = "",
  autoPlay = true
}: AnimatedCoinProps) {
  const [isAnimating, setIsAnimating] = useState(autoPlay);
  const [stage, setStage] = useState<'idle' | 'spinning' | 'showing-nebula' | 'returning'>('idle');
  
  // Start animation sequence
  const startAnimation = () => {
    if (stage !== 'idle') return;
    
    setIsAnimating(true);
    setStage('spinning');
    
    // After initial spinning, show nebula face
    setTimeout(() => {
      setStage('showing-nebula');
      
      // Then return to nebula logo face
      setTimeout(() => {
        setStage('returning');
        
        // Finally reset to idle
        setTimeout(() => {
          setStage('idle');
          setIsAnimating(false);
        }, flipDuration);
      }, flipDuration * 1.2);
    }, flipDuration);
  };

  // Auto-start on mount
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        startAnimation();
      }, startDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, startDelay]);

  // Enhanced animation variants with more realistic physics
  const containerVariants = {
    idle: { 
      rotateY: 0,
      scale: 1,
      rotateX: 0,
      z: 0
    },
    spinning: {
      rotateY: [0, 720, 1440, 1800],
      rotateX: [0, 45, -20, 10, 0],
      scale: [1, 1.1, 0.9, 1.05, 1],
      z: [0, 50, 100, 50, 0],
      transition: {
        duration: flipDuration / 1000,
        times: [0, 0.3, 0.7, 0.9, 1],
        ease: [0.32, 0.72, 0.24, 1.02], // Custom spring-like easing
      }
    },
    "showing-nebula": {
      rotateY: 180,
      rotateX: 0,
      scale: 1.05,
      z: 20,
      transition: {
        duration: flipDuration / 2000,
        ease: "easeOut",
      }
    },
    returning: {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      z: 0,
      transition: {
        duration: flipDuration / 2000,
        ease: "easeIn",
      }
    }
  };

  // Enhanced shadow animation for the coin "in air" effect
  const shadowVariants = {
    idle: { 
      scale: 1,
      opacity: 0.5
    },
    spinning: {
      scale: [1, 0.6, 0.4, 0.8, 1],
      opacity: [0.5, 0.2, 0.1, 0.3, 0.5],
      transition: {
        duration: flipDuration / 1000,
        times: [0, 0.3, 0.7, 0.9, 1],
      }
    },
    "showing-nebula": {
      scale: 1.05,
      opacity: 0.4,
      transition: {
        duration: flipDuration / 2000,
      }
    },
    returning: {
      scale: 1,
      opacity: 0.5,
      transition: {
        duration: flipDuration / 2000,
      }
    }
  };

  // Shine animation for metallic effect
  const shineVariants = {
    idle: { 
      opacity: 0.3,
      x: "100%",
    },
    spinning: {
      opacity: [0.3, 0.7, 0.3],
      x: ["-100%", "100%", "-100%"],
      transition: {
        duration: flipDuration / 1000,
        times: [0, 0.5, 1],
        ease: "easeInOut",
        repeat: 2
      }
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onClick={() => !isAnimating && startAnimation()}
    >
      {/* Shadow beneath the coin */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/5 bg-black/20 dark:bg-black/40 rounded-full blur-md"
        variants={shadowVariants}
        animate={stage}
      />
      
      {/* The coin */}
      <div className="perspective-[2000px] w-full h-full">
        <motion.div
          className="relative w-full h-full preserve-3d cursor-pointer"
          variants={containerVariants}
          animate={stage}
        >
          {/* Front side (Nebula Logo) */}
          <div className="absolute inset-0 backface-hidden">
            <div className="h-full w-full flex items-center justify-center rounded-full">
              {/* Outer ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.7)] dark:shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
              
              {/* Inner coin face */}
              <div className="absolute inset-[3px] bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center border-[3px] border-purple-300/70 dark:border-purple-400/70">
                {/* Realistic coin texture */}
                <div className="absolute inset-[1px] rounded-full bg-gradient-radial from-purple-200 via-purple-400 to-purple-500 opacity-80" />
                
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full overflow-hidden"
                  variants={shineVariants}
                  animate={stage}
                >
                  <div className="absolute inset-[-25%] skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-[200%] transform" />
                </motion.div>
                
                {/* Edge ridges */}
                <div className="absolute inset-0 rounded-full border-8 border-purple-400/20" />
                
                {/* Nebula logo */}
                <div className="z-10 relative w-3/4 h-3/4 flex items-center justify-center">
                  <Image 
                    src="/nebula.png"
                    alt="NebulaWallet"
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Back side (Nebula Text) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="h-full w-full flex items-center justify-center rounded-full">
              {/* Outer ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.7)] dark:shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
              
              {/* Inner coin face */}
              <div className="absolute inset-[3px] rounded-full flex items-center justify-center border-[3px] border-purple-300/70 dark:border-purple-400/70 overflow-hidden">
                {/* Nebula background effect */}
                <div className="absolute inset-0 bg-gradient-radial from-indigo-400 via-purple-500 to-indigo-800">
                  <div className="absolute inset-0 bg-[url('/nebula-texture.png')] bg-cover opacity-60 mix-blend-overlay" />
                </div>
                
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 overflow-hidden"
                  variants={shineVariants}
                  animate={stage}
                >
                  <div className="absolute inset-[-25%] skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-[200%] transform" />
                </motion.div>
                
                {/* Edge ridges */}
                <div className="absolute inset-0 rounded-full border-8 border-purple-500/20" />
                
                {/* Fine grain texture */}
                <div className="absolute inset-0 backdrop-filter backdrop-contrast-125 backdrop-brightness-110 rounded-full" />
                
                <span className="z-10 text-white font-extrabold text-lg drop-shadow-lg tracking-wide">NEBULA</span>
              </div>
            </div>
          </div>
          
          {/* Edge highlight */}
          <div className="absolute inset-0 rounded-full border-[1px] border-white/40 shadow-lg pointer-events-none" />
        </motion.div>
      </div>
      
      {/* Enhanced glow effect */}
      <div className="absolute inset-0 rounded-full bg-transparent shadow-[0_0_20px_5px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_5px_rgba(139,92,246,0.2)] pointer-events-none"></div>
    </div>
  );
} 