"use client";

import { useState, useEffect } from "react";
import { 
  Coins, 
  LineChart, 
  GanttChart, 
  Gem, 
  Droplet, 
  Layers, 
  ExternalLink, 
  ArrowRightLeft,
  ChevronDown,
  Construction,
  Info,
  Loader2,
  Beaker,
  Plus,
  CoinsIcon,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  StakeProgram, 
  Authorized, 
  Lockup, 
  sendAndConfirmTransaction, 
  LAMPORTS_PER_SOL,
  Transaction
} from '@solana/web3.js';
import { motion } from "framer-motion";
import AnimatedCoin from "./AnimatedCoin";

// Validator interface
interface Validator {
  votePubkey: string;
  name: string;
  commission: number;
  activatedStake: number;
  apy: number;
}

// Add token interface for swap functionality
interface Token {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  balance: string;
  price: number;
}

interface ProtocolCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  apy: string;
  protocol: string;
  action: string;
  comingSoon?: boolean;
  onClick: () => void;
}

const ProtocolCard = ({ 
  name, 
  description, 
  icon, 
  apy, 
  protocol, 
  action, 
  comingSoon, 
  onClick 
}: ProtocolCardProps) => {
  return (
    <div 
      className={`
        flex flex-col p-6 rounded-3xl border 
        ${comingSoon ? 'border-purple-200' : 'border-purple-300'} 
        bg-gradient-to-b from-white to-purple-50 shadow-sm hover:shadow-md 
        transition-all duration-300 relative overflow-hidden h-full 
        dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
        ${!comingSoon ? 'cursor-pointer' : ''}
      `}
      onClick={!comingSoon ? onClick : undefined}
    >
      {comingSoon && (
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100 rounded-full flex items-end justify-start p-3 dark:bg-gray-800">
          <div className="flex items-center gap-1 text-xs font-medium text-purple-600 rotate-45 ml-3 dark:text-purple-400">
            <Construction size={14} />
            <span>Coming Soon</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center dark:bg-gray-800">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">{name}</h3>
          <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
            <span>{protocol}</span>
          </div>
        </div>
      </div>
      
      <p className="text-slate-600 text-sm mb-4 dark:text-gray-300">{description}</p>
      
      {!comingSoon ? (
        <>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-gray-400">Est. APY</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{apy}</span>
            </div>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {action}
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-auto pt-2 border-t border-purple-100 flex items-center justify-between dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-purple-300 animate-pulse dark:bg-purple-400"></div>
            <span className="text-sm text-purple-600 dark:text-purple-400">In Development</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DeFiHub() {
  const { isConnected, walletType, balance, account, connectWallet, isTestMode, toggleTestMode, addTestSol } = useWallet();
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [stakeResult, setStakeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [isLoadingValidators, setIsLoadingValidators] = useState<boolean>(false);
  const [showTestDialog, setShowTestDialog] = useState<boolean>(false);
  const [testAmount, setTestAmount] = useState<string>('5');
  const [userStakes, setUserStakes] = useState<{validator: Validator, amount: string, date: Date}[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Swap functionality state
  const [showSwapDialog, setShowSwapDialog] = useState<boolean>(false);
  const [fromToken, setFromToken] = useState<string>('SOL');
  const [toToken, setToToken] = useState<string>('USDC');
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapResult, setSwapResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testTokens, setTestTokens] = useState<{[key: string]: string}>({
    'SOL': '0',
    'USDC': '0',
    'BTC': '0',
    'ETH': '0'
  });

  // Fetch Solana validators when the component mounts
  useEffect(() => {
    if (walletType === 'solana' && isConnected) {
      fetchValidators();
      
      // Load previously staked amounts from localStorage when in test mode
      if (isTestMode) {
        const storedStakes = localStorage.getItem('testSolStakes');
        if (storedStakes) {
          try {
            const parsedStakes = JSON.parse(storedStakes);
            // Convert date strings back to Date objects
            const processedStakes = parsedStakes.map((stake: any) => ({
              ...stake,
              date: new Date(stake.date)
            }));
            setUserStakes(processedStakes);
          } catch (error) {
            console.error('Error parsing stored stakes:', error);
          }
        }
        
        // Load test tokens from localStorage
        const storedTokens = localStorage.getItem('testTokens');
        if (storedTokens) {
          try {
            const parsedTokens = JSON.parse(storedTokens);
            setTestTokens(prev => ({...prev, ...parsedTokens}));
          } catch (error) {
            console.error('Error parsing stored tokens:', error);
          }
        } else {
          // Initialize test tokens with some default values
          const initialTokens = {
            'SOL': balance,
            'USDC': '100.0000',
            'BTC': '0.0050',
            'ETH': '0.2500'
          };
          setTestTokens(initialTokens);
          localStorage.setItem('testTokens', JSON.stringify(initialTokens));
        }
      }
    }
  }, [walletType, isConnected, isTestMode, balance]);

  // Update SOL balance in test tokens whenever balance changes
  useEffect(() => {
    if (isTestMode && walletType === 'solana' && isConnected) {
      setTestTokens(prev => {
        const updated = {...prev, 'SOL': balance};
        // Also save to localStorage
        localStorage.setItem('testTokens', JSON.stringify(updated));
        return updated;
      });
    }
  }, [balance, isTestMode, walletType, isConnected]);

  // Function to fetch Solana validators
  const fetchValidators = async () => {
    setIsLoadingValidators(true);
    try {
      const connection = new Connection(clusterApiUrl('mainnet-beta'));
      
      // In a real implementation, you would fetch actual validator data
      // For now, we'll use mock data for demonstration
      const mockValidators: Validator[] = [
        {
          votePubkey: 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu',
          name: 'Certus One',
          commission: 7,
          activatedStake: 2500000 * LAMPORTS_PER_SOL,
          apy: 5.2
        },
        {
          votePubkey: 'GBU4potq4TjsmXCUSJXbXwnkYZP8725ZEaeDrLrdQhbA',
          name: 'Everstake',
          commission: 8,
          activatedStake: 2200000 * LAMPORTS_PER_SOL,
          apy: 5.1
        },
        {
          votePubkey: 'FtsqNsLuzNb7Bpn2GZXemYVqQmvK4iFh8qgbU3MJRodd',
          name: 'Chorus One',
          commission: 8,
          activatedStake: 1900000 * LAMPORTS_PER_SOL,
          apy: 5.3
        }
      ];
      
      setValidators(mockValidators);
      if (mockValidators.length > 0) {
        setSelectedValidator(mockValidators[0]);
      }
    } catch (error) {
      console.error('Error fetching validators:', error);
    } finally {
      setIsLoadingValidators(false);
    }
  };

  const stakingOptions = [
    {
      name: "ETH Staking",
      description: "Stake your ETH and earn rewards while supporting network security.",
      icon: <Coins className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "3.8%",
      protocol: "Ethereum",
      action: "Stake ETH",
      enabled: walletType === 'ethereum'
    },
    {
      name: "SOL Staking",
      description: "Stake SOL to validators and earn passive rewards.",
      icon: <Gem className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "5.2%",
      protocol: "Solana",
      action: "Stake SOL",
      enabled: walletType === 'solana'
    },
    {
      name: "Liquid Staking",
      description: "Stake assets while maintaining liquidity with derivative tokens.",
      icon: <Droplet className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "4.5%",
      protocol: "Lido",
      action: "Deposit",
      comingSoon: true
    }
  ];

  const yieldOptions = [
    {
      name: "Lending Pool",
      description: "Provide liquidity to lending pools and earn interest on your assets.",
      icon: <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "6.2%",
      protocol: "Aave",
      action: "Deposit",
      comingSoon: true
    },
    {
      name: "Liquidity Mining",
      description: "Provide liquidity to DEXs and earn trading fees plus incentives.",
      icon: <GanttChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "8.5%",
      protocol: "Uniswap",
      action: "Add Liquidity",
      comingSoon: true
    },
    {
      name: "Yield Aggregator",
      description: "Automatically optimize yield across multiple DeFi protocols.",
      icon: <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      apy: "7.3%",
      protocol: "Yearn Finance",
      action: "Deposit",
      comingSoon: true
    }
  ];

  const handleProtocolSelect = (protocolName: string) => {
    setActiveProtocol(protocolName);
    setStakeResult(null);
  };

  const handleCloseDialog = () => {
    setActiveProtocol(null);
    setStakeAmount('');
    setStakeResult(null);
  };

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  };

  const handleMaxAmount = () => {
    // Set max amount (leaving a small amount for transaction fees)
    if (walletType === 'solana') {
      const maxAmount = Math.max(parseFloat(balance) - 0.01, 0);
      setStakeAmount(maxAmount.toString());
    } else {
      setStakeAmount(balance);
    }
  };

  const handleStakeSubmit = async () => {
    if (!account || !selectedValidator || !stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setIsStaking(true);
    setStakeResult(null);
    
    try {
      if (walletType === 'solana') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isTestMode) {
          // In test mode, we'll simulate a successful stake by updating the test balance
          // and recording the stake in state and localStorage
          
          // Deduct the staked amount from the balance
          const currentBalance = parseFloat(balance);
          const amountToStake = parseFloat(stakeAmount);
          
          if (amountToStake > currentBalance) {
            throw new Error('Insufficient balance for staking');
          }
          
          // Update the balance (this triggers a call to addTestSol with a negative amount)
          const newBalance = (currentBalance - amountToStake).toFixed(4);
          localStorage.setItem('testSolBalance', newBalance);
          
          // Record the stake
          const newStake = {
            validator: selectedValidator,
            amount: stakeAmount,
            date: new Date()
          };
          
          const updatedStakes = [...userStakes, newStake];
          setUserStakes(updatedStakes);
          
          // Save to localStorage
          localStorage.setItem('testSolStakes', JSON.stringify(updatedStakes));
          
          // Force update balance in parent context
          addTestSol("-" + stakeAmount);
          
          setStakeResult({
            success: true,
            message: `Successfully staked ${stakeAmount} SOL to validator ${selectedValidator.name}. Your stake will start earning rewards in the next epoch.`
          });
        } else {
          // For a real implementation, this would contain the actual staking logic
          setStakeResult({
            success: true,
            message: `Successfully staked ${stakeAmount} SOL to validator ${selectedValidator.name}. Your stake will start earning rewards in the next epoch.`
          });
        }
      }
    } catch (error) {
      console.error('Staking error:', error);
      setStakeResult({
        success: false,
        message: `Failed to stake: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsStaking(false);
    }
  };

  // Calculate total staked SOL in test mode
  const calculateTotalStaked = () => {
    if (!userStakes.length) return "0";
    
    const total = userStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0);
    return total.toFixed(4);
  };

  // Calculate estimated rewards based on stakes and validator APY
  const calculateEstimatedRewards = () => {
    if (!userStakes.length) return "0";
    
    const now = new Date();
    let totalRewards = 0;
    
    userStakes.forEach(stake => {
      const validator = stake.validator;
      const amount = parseFloat(stake.amount);
      const stakedDate = stake.date;
      
      // Calculate days since staking
      const daysSinceStaking = Math.max(0, (now.getTime() - stakedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Daily interest rate based on APY
      const dailyRate = validator.apy / 365 / 100;
      
      // Calculate rewards (compound interest formula for simplicity)
      const reward = amount * dailyRate * daysSinceStaking;
      totalRewards += reward;
    });
    
    return totalRewards.toFixed(4);
  };

  const handleTestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTestAmount(value);
    }
  };

  const addTestBalance = () => {
    if (testAmount && parseFloat(testAmount) > 0) {
      addTestSol(testAmount);
      setShowTestDialog(false);
    }
  };

  // Token data for swap functionality
  const availableTokens: Token[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: <Gem className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      balance: testTokens['SOL'],
      price: 138.25
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: <CoinsIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      balance: testTokens['USDC'],
      price: 1.00
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: <Coins className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
      balance: testTokens['BTC'],
      price: 61250.50
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: <Droplet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      balance: testTokens['ETH'],
      price: 3420.75
    }
  ];

  // Get token by symbol
  const getToken = (symbol: string): Token | undefined => {
    return availableTokens.find(token => token.symbol === symbol);
  };

  // Swap related handlers
  const handleSwapAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSwapAmount(value);
    }
  };

  const handleFromTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFromToken = e.target.value;
    setFromToken(newFromToken);
    
    // If to token is the same as from token, switch to a different token
    if (newFromToken === toToken) {
      const differentToken = availableTokens.find(t => t.symbol !== newFromToken);
      if (differentToken) {
        setToToken(differentToken.symbol);
      }
    }
  };
  
  const handleToTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newToToken = e.target.value;
    setToToken(newToToken);
    
    // If from token is the same as to token, switch to a different token
    if (newToToken === fromToken) {
      const differentToken = availableTokens.find(t => t.symbol !== newToToken);
      if (differentToken) {
        setFromToken(differentToken.symbol);
      }
    }
  };

  const handleMaxSwapAmount = () => {
    const fromTokenData = getToken(fromToken);
    if (fromTokenData) {
      setSwapAmount(fromTokenData.balance);
    }
  };

  const calculateSwapOutput = (): string => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) return '0';
    
    const fromTokenData = getToken(fromToken);
    const toTokenData = getToken(toToken);
    
    if (!fromTokenData || !toTokenData) return '0';
    
    const inputValue = parseFloat(swapAmount) * fromTokenData.price;
    const outputAmount = inputValue / toTokenData.price;
    
    return outputAmount.toFixed(6);
  };

  const handleSwapSubmit = async () => {
    if (!isTestMode || !swapAmount || parseFloat(swapAmount) <= 0) return;
    
    const fromTokenData = getToken(fromToken);
    const toTokenData = getToken(toToken);
    
    if (!fromTokenData || !toTokenData) return;
    
    const swapInputAmount = parseFloat(swapAmount);
    const fromTokenBalance = parseFloat(fromTokenData.balance);
    
    if (swapInputAmount > fromTokenBalance) {
      setSwapResult({
        success: false,
        message: `Insufficient ${fromToken} balance for swap`
      });
      return;
    }
    
    setIsSwapping(true);
    setSwapResult(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate the output amount
      const outputAmount = calculateSwapOutput();
      
      // Update token balances
      const updatedTokens = {...testTokens};
      updatedTokens[fromToken] = (fromTokenBalance - swapInputAmount).toFixed(4);
      updatedTokens[toToken] = (parseFloat(testTokens[toToken]) + parseFloat(outputAmount)).toFixed(4);
      
      setTestTokens(updatedTokens);
      localStorage.setItem('testTokens', JSON.stringify(updatedTokens));
      
      // If we swapped SOL, update the main balance as well
      if (fromToken === 'SOL') {
        addTestSol("-" + swapAmount);
      } else if (toToken === 'SOL') {
        addTestSol(outputAmount);
      }
      
      setSwapResult({
        success: true,
        message: `Successfully swapped ${swapAmount} ${fromToken} for ${outputAmount} ${toToken}`
      });
    } catch (error) {
      console.error('Swap error:', error);
      setSwapResult({
        success: false,
        message: `Failed to complete swap: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // Add dummy staking data for demonstration
  const addDummyStake = () => {
    if (!validators.length) return;
    
    // Select a random validator
    const randomValidator = validators[Math.floor(Math.random() * validators.length)];
    
    // Generate a random amount between 1 and 5 SOL
    const randomAmount = (1 + Math.random() * 4).toFixed(2);
    
    // Create a past date (between 1-30 days ago)
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    
    // Create the new stake
    const newStake = {
      validator: randomValidator,
      amount: randomAmount,
      date: pastDate
    };
    
    // Add it to the stakes
    const updatedStakes = [...userStakes, newStake];
    setUserStakes(updatedStakes);
    
    // Save to localStorage
    localStorage.setItem('testSolStakes', JSON.stringify(updatedStakes));
    
    // Set success message
    setSuccessMessage(`Added ${randomAmount} SOL staked ${daysAgo} days ago with ${randomValidator.name}`);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Create initial dummy stakes if none exist and validators are loaded
  useEffect(() => {
    if (isTestMode && walletType === 'solana' && validators.length > 0 && userStakes.length === 0) {
      // Create 1-3 initial stakes for demonstration
      const numStakes = Math.floor(Math.random() * 3) + 1;
      const newStakes = [];
      
      for (let i = 0; i < numStakes; i++) {
        // Select a random validator
        const randomValidator = validators[Math.floor(Math.random() * validators.length)];
        
        // Generate a random amount between 1 and 5 SOL
        const randomAmount = (1 + Math.random() * 4).toFixed(2);
        
        // Create a past date (between 5-60 days ago)
        const daysAgo = Math.floor(Math.random() * 55) + 5;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysAgo);
        
        // Create the new stake
        newStakes.push({
          validator: randomValidator,
          amount: randomAmount,
          date: pastDate
        });
      }
      
      setUserStakes(newStakes);
      localStorage.setItem('testSolStakes', JSON.stringify(newStakes));
    }
  }, [isTestMode, walletType, validators, userStakes.length]);

  // Add a handler function for the connect wallet button
  const handleConnectWallet = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    connectWallet();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      id="defi" 
      className="py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="text-center mb-12">
        <motion.h2 
          className="text-3xl font-bold text-slate-800 mb-3 dark:text-gray-100"
          variants={itemVariants}
        >
          DeFi Hub
        </motion.h2>
        <motion.p 
          className="text-slate-600 max-w-2xl mx-auto dark:text-gray-300"
          variants={itemVariants}
        >
          Access decentralized finance protocols to earn passive income on your crypto assets.
        </motion.p>
        
        {/* Position the AnimatedCoin here */}
        <motion.div
          className="relative mx-auto"
          variants={itemVariants}
        >
          <div className="absolute -top-12 right-0 lg:right-20 w-20 h-20 z-10">
            <AnimatedCoin startDelay={1000} flipDuration={1500} />
          </div>
        </motion.div>
        
        {/* Test Mode Controls */}
        {walletType === 'solana' && (
          <motion.div 
            className="mt-4 flex items-center justify-center gap-2"
            variants={itemVariants}
          >
            <Button 
              onClick={toggleTestMode}
              variant={isTestMode ? "default" : "outline"}
              className={`rounded-full text-xs ${isTestMode ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
              size="sm"
            >
              <Beaker size={14} className="mr-1" />
              {isTestMode ? 'Test Mode Active' : 'Enable Test Mode'}
            </Button>
            
            {isTestMode && (
              <Button
                onClick={() => setShowTestDialog(true)}
                variant="outline"
                className="rounded-full text-xs"
                size="sm"
              >
                <Plus size={14} className="mr-1" />
                Add Test SOL
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {isConnected ? (
        <>
          <div className="bg-purple-50 rounded-3xl p-6 mb-8 dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">Your DeFi Portfolio</h3>
                <p className="text-slate-600 dark:text-gray-300">Start earning passive income with your crypto</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                  <div className="text-sm text-slate-500 dark:text-gray-400">Available to Stake</div>
                  <div className="font-bold text-slate-800 dark:text-gray-100">
                    {balance} {walletType === 'ethereum' ? 'ETH' : 'SOL'}
                  </div>
                </div>
                <Button 
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white h-full dark:bg-purple-500 dark:hover:bg-purple-600"
                  onClick={() => isTestMode ? setShowSwapDialog(true) : null}
                >
                  <ArrowRightLeft size={16} className="mr-2" />
                  Swap
                </Button>
              </div>
            </div>
            
            {/* Test Mode Token Balances */}
            {isTestMode && walletType === 'solana' && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-800 mb-2 dark:text-gray-100">Your Token Balances</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {availableTokens.map((token) => (
                    <div key={token.symbol} className="bg-white p-4 rounded-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-50 rounded-full w-8 h-8 flex items-center justify-center dark:bg-gray-800">
                          {token.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 dark:text-gray-100">{token.symbol}</div>
                          <div className="text-xs text-slate-500 dark:text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-gray-100">{testTokens[token.symbol]}</div>
                      <div className="text-xs text-slate-500 dark:text-gray-400">
                        ${(parseFloat(testTokens[token.symbol]) * token.price).toFixed(2)} USD
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Test Mode Portfolio Stats */}
            {isTestMode && walletType === 'solana' && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-800 dark:text-gray-100">Portfolio Stats</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full border-purple-200 text-purple-600 dark:border-gray-700 dark:text-purple-400"
                      onClick={addDummyStake}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Dummy Stake
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full border-purple-200 text-purple-600 dark:border-gray-700 dark:text-purple-400"
                      onClick={() => setShowHistory(prev => !prev)}
                    >
                      {showHistory ? "Show Stats" : "Show History"}
                    </Button>
                  </div>
                </div>

                <div className="relative perspective-1000 w-full h-[200px]">
                  {successMessage && (
                    <div className="absolute top-0 left-0 right-0 p-2 bg-green-100 text-green-800 rounded-lg z-10 text-center dark:bg-green-900 dark:text-green-300">
                      {successMessage}
                    </div>
                  )}
                  <div className={`absolute w-full h-full transition-all duration-500 transform-style-preserve-3d ${showHistory ? 'rotate-y-180' : ''}`}>
                    {/* Front side - Stats */}
                    <div className={`absolute w-full h-full backface-hidden ${showHistory ? 'hidden md:block opacity-0' : 'opacity-100'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                          <div className="text-sm text-slate-500 dark:text-gray-400">Total Staked</div>
                          <div className="font-bold text-slate-800 dark:text-gray-100">
                            {calculateTotalStaked()} SOL
                          </div>
                          {parseFloat(calculateTotalStaked()) > 0 && (
                            <div className="text-xs text-purple-600 mt-1 dark:text-purple-400">
                              ${(parseFloat(calculateTotalStaked()) * 138.25).toFixed(2)} USD
                            </div>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                          <div className="text-sm text-slate-500 dark:text-gray-400">Est. Rewards</div>
                          <div className="font-bold text-green-600 dark:text-green-400">
                            {calculateEstimatedRewards()} SOL
                          </div>
                          {parseFloat(calculateEstimatedRewards()) > 0 && (
                            <div className="text-xs text-purple-600 mt-1 dark:text-purple-400">
                              ${(parseFloat(calculateEstimatedRewards()) * 138.25).toFixed(2)} USD
                            </div>
                          )}
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                          <div className="text-sm text-slate-500 dark:text-gray-400">Active Stakes</div>
                          <div className="font-bold text-slate-800 dark:text-gray-100">
                            {userStakes.length}
                          </div>
                          {userStakes.length === 0 && (
                            <div className="text-xs text-slate-500 mt-1 dark:text-gray-400">
                              No active stakes yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Back side - History */}
                    <div className={`absolute w-full h-full backface-hidden rotate-y-180 ${showHistory ? 'opacity-100' : 'hidden md:block opacity-0'}`}>
                      <div className="bg-white rounded-xl border border-purple-100 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
                        {userStakes.length > 0 ? (
                          <div className="max-h-[200px] overflow-y-auto">
                            {userStakes.map((stake, index) => (
                              <div key={index} className="p-3 flex justify-between items-center border-b last:border-b-0 border-purple-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center dark:bg-gray-800">
                                    <CoinsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-800 dark:text-gray-100">{stake.validator.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400">
                                      {stake.date.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-slate-800 dark:text-gray-100">{stake.amount} SOL</div>
                                  <div className="text-xs text-green-600 dark:text-green-400">{stake.validator.apy}% APY</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <div className="bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 dark:bg-gray-800">
                              <CoinsIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-slate-800 font-medium dark:text-gray-100">No Staking History</p>
                            <p className="text-slate-500 text-sm mt-1 dark:text-gray-400">
                              When you stake SOL, your history will appear here
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">Staking Options</h3>
              <Button variant="outline" className="rounded-full border-purple-200 text-purple-600 dark:border-gray-700 dark:text-purple-400">
                <Info size={14} className="mr-1" />
                Learn about staking
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stakingOptions.map((option, index) => (
                <ProtocolCard
                  key={`staking-${index}`}
                  name={option.name}
                  description={option.description}
                  icon={option.icon}
                  apy={option.apy}
                  protocol={option.protocol}
                  action={option.action}
                  comingSoon={option.comingSoon || (option.enabled === false && !option.comingSoon)}
                  onClick={() => handleProtocolSelect(option.name)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">Yield Farming</h3>
              <Button variant="outline" className="rounded-full border-purple-200 text-purple-600 dark:border-gray-700 dark:text-purple-400">
                <Info size={14} className="mr-1" />
                Learn about yields
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yieldOptions.map((option, index) => (
                <ProtocolCard
                  key={`yield-${index}`}
                  name={option.name}
                  description={option.description}
                  icon={option.icon}
                  apy={option.apy}
                  protocol={option.protocol}
                  action={option.action}
                  comingSoon={option.comingSoon}
                  onClick={() => handleProtocolSelect(option.name)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <motion.div 
          className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm text-center dark:bg-gray-900 dark:border-gray-700"
          variants={cardVariants}
          whileHover="hover"
        >
          <motion.div 
            className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-gray-800"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Layers className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <motion.h3 
            className="text-xl font-bold text-slate-800 mb-3 dark:text-gray-100"
            variants={itemVariants}
          >
            Connect Your Wallet
          </motion.h3>
          <motion.p 
            className="text-slate-600 max-w-md mx-auto mb-6 dark:text-gray-300"
            variants={itemVariants}
          >
            Connect your {walletType === 'ethereum' ? 'Ethereum' : walletType === 'solana' ? 'Solana' : 'crypto'} wallet to access DeFi protocols and start earning passive income on your assets.
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
          <Button 
              onClick={handleConnectWallet}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            Connect Wallet
          </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Protocol Interaction Dialog */}
      <Dialog open={!!activeProtocol} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeProtocol}</DialogTitle>
            <DialogDescription>
              Stake your assets to earn rewards and support the network.
            </DialogDescription>
          </DialogHeader>
          
          {/* Loading State */}
          {isStaking && (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 size={40} className="animate-spin text-purple-600 mb-4" />
              <p className="text-slate-700 dark:text-gray-300">Processing your stake transaction...</p>
            </div>
          )}

          {/* Success/Error Message */}
          {stakeResult && (
            <div className={`p-4 mb-4 rounded-lg ${stakeResult.success ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              <p>{stakeResult.message}</p>
            </div>
          )}

          {/* Staking Form */}
          {!isStaking && !stakeResult && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600 dark:text-gray-300">Available Balance</span>
                  <span className="font-bold text-slate-800 dark:text-gray-100">
                    {balance} {walletType === 'ethereum' ? 'ETH' : 'SOL'}
                  </span>
                </div>
                
                {/* Validator Selection (Solana only) */}
                {activeProtocol === "SOL Staking" && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-600 mb-2 dark:text-gray-300">Select Validator</div>
                    <div className="relative">
                      <select
                        className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        value={selectedValidator?.votePubkey || ''}
                        onChange={(e) => {
                          const selected = validators.find(v => v.votePubkey === e.target.value);
                          if (selected) setSelectedValidator(selected);
                        }}
                      >
                        {isLoadingValidators ? (
                          <option>Loading validators...</option>
                        ) : (
                          validators.map((validator) => (
                            <option key={validator.votePubkey} value={validator.votePubkey}>
                              {validator.name} - {validator.apy}% APY (Commission: {validator.commission}%)
                            </option>
                          ))
                        )}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={18} className="text-slate-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2 dark:text-gray-300">Amount to Stake</div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={handleStakeAmountChange}
                      className="w-full p-3 rounded-l-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                    />
                    <button 
                      className="bg-purple-100 text-purple-800 p-3 rounded-r-lg border border-l-0 border-purple-200 font-medium flex items-center dark:bg-gray-700 dark:text-purple-300 dark:border-gray-600"
                      onClick={handleMaxAmount}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-slate-600 dark:text-gray-300">Estimated APY</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {activeProtocol === "ETH Staking" 
                      ? "3.8%" 
                      : activeProtocol === "SOL Staking" && selectedValidator 
                        ? `${selectedValidator.apy}%` 
                        : "0%"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-6">
                  <span className="text-slate-600 dark:text-gray-300">Network Fee</span>
                  <span className="font-medium text-slate-800 dark:text-gray-100">~0.001 {walletType === 'ethereum' ? 'ETH' : 'SOL'}</span>
                </div>
                
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
                  onClick={handleStakeSubmit}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > parseFloat(balance)}
                >
                  Stake Now
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-slate-500 dark:text-gray-400">
                <p>
                  {activeProtocol === "SOL Staking" 
                    ? "Staking SOL helps secure the Solana network while earning you rewards. You can unstake anytime, but there is a cooling-off period of approximately 2-3 days before your funds are available." 
                    : "Staking your assets helps secure the network and earn rewards. There may be a lockup period depending on the protocol."}
                  {' '}
                  <Link href="#" className="text-purple-600 hover:underline dark:text-purple-400">Learn more about staking risks</Link>.
                </p>
              </div>
            </>
          )}
          
          {/* Actions after staking */}
          {stakeResult && stakeResult.success && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-purple-200 text-purple-600 rounded-full dark:border-gray-700 dark:text-purple-400"
                onClick={handleCloseDialog}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
                onClick={() => {
                  setStakeResult(null);
                  setStakeAmount('');
                }}
              >
                Stake More
              </Button>
            </div>
          )}
          
          {/* Error retry */}
          {stakeResult && !stakeResult.success && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-purple-200 text-purple-600 rounded-full dark:border-gray-700 dark:text-purple-400"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
                onClick={() => setStakeResult(null)}
              >
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Balance Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test SOL</DialogTitle>
            <DialogDescription>
              Add SOL to your test wallet for trying out the staking functionality.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-purple-50 rounded-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 dark:text-gray-300">Current Balance</span>
              <span className="font-bold text-slate-800 dark:text-gray-100">
                {balance} SOL
              </span>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-slate-600 mb-2 dark:text-gray-300">Amount to Add</div>
              <input
                type="text"
                placeholder="5.0"
                value={testAmount}
                onChange={handleTestAmountChange}
                className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
              onClick={addTestBalance}
              disabled={!testAmount || parseFloat(testAmount) <= 0}
            >
              Add Test SOL
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 dark:text-gray-400">
            <p>
              This is for testing purposes only. No real transactions are occurring.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Swap Tokens</DialogTitle>
            <DialogDescription>
              Exchange one token for another at current market rates.
            </DialogDescription>
          </DialogHeader>
          
          {/* Loading State */}
          {isSwapping && (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 size={40} className="animate-spin text-purple-600 mb-4" />
              <p className="text-slate-700 dark:text-gray-300">Processing your swap transaction...</p>
            </div>
          )}

          {/* Success/Error Message */}
          {swapResult && (
            <div className={`p-4 mb-4 rounded-lg ${swapResult.success ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              <p>{swapResult.message}</p>
            </div>
          )}

          {/* Swap Form */}
          {!isSwapping && !swapResult && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg dark:bg-gray-800">
                {/* From Token */}
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2 dark:text-gray-300">From</div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <select
                        className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        value={fromToken}
                        onChange={handleFromTokenChange}
                      >
                        {availableTokens.map((token) => (
                          <option key={`from-${token.symbol}`} value={token.symbol}>
                            {token.symbol} - {token.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={18} className="text-slate-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="0.0"
                          value={swapAmount}
                          onChange={handleSwapAmountChange}
                          className="w-full p-3 rounded-l-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        />
                        <button 
                          className="absolute right-0 top-0 bottom-0 bg-purple-100 text-purple-800 px-3 rounded-r-lg border border-l-0 border-purple-200 font-medium flex items-center dark:bg-gray-700 dark:text-purple-300 dark:border-gray-600"
                          onClick={handleMaxSwapAmount}
                        >
                          MAX
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 dark:text-gray-400">
                        Balance: {getToken(fromToken)?.balance || '0'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Swap Direction */}
                <div className="flex justify-center my-2">
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-purple-100 dark:bg-gray-900 dark:border-gray-700">
                    <ArrowLeftRight size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                
                {/* To Token */}
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2 dark:text-gray-300">To</div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <select
                        className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                        value={toToken}
                        onChange={handleToTokenChange}
                      >
                        {availableTokens.map((token) => (
                          <option key={`to-${token.symbol}`} value={token.symbol}>
                            {token.symbol} - {token.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={18} className="text-slate-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        disabled
                        value={calculateSwapOutput()}
                        className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none bg-white/50 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200"
                      />
                      <div className="text-xs text-slate-500 mt-1 dark:text-gray-400">
                        Balance: {getToken(toToken)?.balance || '0'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rate */}
                <div className="flex justify-between items-center text-sm mb-6 p-2 bg-white rounded-lg dark:bg-gray-900">
                  <span className="text-slate-600 dark:text-gray-300">Rate</span>
                  <span className="font-medium text-slate-800 dark:text-gray-100">
                    1 {fromToken} = {(getToken(fromToken)?.price || 0) / (getToken(toToken)?.price || 1)} {toToken}
                  </span>
                </div>
                
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
                  onClick={handleSwapSubmit}
                  disabled={!swapAmount || parseFloat(swapAmount) <= 0 || parseFloat(swapAmount) > parseFloat(getToken(fromToken)?.balance || '0')}
                >
                  Swap Tokens
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-slate-500 dark:text-gray-400">
                <p>
                  This is a simulated swap in test mode. In a real implementation, swaps would occur through a decentralized exchange protocol with fees and slippage.
                </p>
              </div>
            </>
          )}
          
          {/* Actions after swapping */}
          {swapResult && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-purple-200 text-purple-600 rounded-full dark:border-gray-700 dark:text-purple-400"
                onClick={() => setShowSwapDialog(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600"
                onClick={() => {
                  setSwapResult(null);
                  setSwapAmount('');
                }}
              >
                New Swap
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 