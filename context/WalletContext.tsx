"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { KeyManager } from "@/lib/keyManager";
import { SolanaService, NetworkType } from "@/lib/solanaService";
import { toast } from "sonner";

// Enhanced wallet context with security features and real network operations
interface WalletContextType {
  // Basic connection state
  account: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: "ethereum" | "solana" | null;
  
  // Core wallet actions
  connectWallet: (password?: string) => Promise<void>;
  disconnectWallet: () => void;
  setWalletType: (type: "ethereum" | "solana") => void;
  
  // Test mode functionality
  isTestMode: boolean;
  toggleTestMode: () => void;
  addTestSol: (amount: string) => void;
  
  // Solana-specific functionality
  solanaNetwork: NetworkType;
  setSolanaNetwork: (network: NetworkType, customEndpoint?: string) => void;
  sendSol: (recipient: string, amount: number, priorityFee?: number) => Promise<string>;
  requestAirdrop: (amount: number) => Promise<string>;
  
  // SPL Token functionality
  tokenBalances: Array<{
    mint: string;
    balance: number;
    decimals: number;
    address: string;
  }>;
  refreshTokenBalances: () => Promise<void>;
  sendToken: (recipientAddress: string, mintAddress: string, amount: number, decimals: number) => Promise<string>;
  
  // Security and session management
  isWalletLocked: boolean;
  lockWallet: () => void;
  unlockWallet: (password: string) => Promise<boolean>;
  isSessionActive: boolean;
}

const defaultContext: WalletContextType = {
  account: null,
  balance: "0",
  chainId: null,
  isConnected: false,
  isConnecting: false,
  walletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  setWalletType: () => {},
  isTestMode: false,
  toggleTestMode: () => {},
  addTestSol: () => {},
  solanaNetwork: "devnet",
  setSolanaNetwork: () => {},
  sendSol: async () => "",
  requestAirdrop: async () => "",
  tokenBalances: [],
  refreshTokenBalances: async () => {},
  sendToken: async () => "",
  isWalletLocked: true,
  lockWallet: () => {},
  unlockWallet: async () => false,
  isSessionActive: false,
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export const WalletProvider = ({ children }: WalletProviderProps) => {
  // Basic wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<"ethereum" | "solana" | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  
  // Solana-specific state
  const [solanaNetwork, setSolanaNetwork] = useState<NetworkType>("devnet");
  const [customRpcUrl, setCustomRpcUrl] = useState<string | undefined>();
  const [solanaService, setSolanaService] = useState<SolanaService>(
    new SolanaService("devnet")
  );
  const [tokenBalances, setTokenBalances] = useState<Array<{
    mint: string;
    balance: number;
    decimals: number;
    address: string;
  }>>([]);
  
  // Security and session state
  const [currentKeypair, setCurrentKeypair] = useState<Keypair | null>(null);
  const [isWalletLocked, setIsWalletLocked] = useState<boolean>(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const hasWindow = typeof window !== "undefined";
  const hasEthereum = hasWindow && (window as any).ethereum;

  // Initialize wallet state from localStorage
  useEffect(() => {
    const storedWalletType = localStorage.getItem("walletType");
    if (storedWalletType === "ethereum" || storedWalletType === "solana") {
      setWalletType(storedWalletType);
    }
    
    // Check if test mode was enabled previously
    const testMode = localStorage.getItem("testMode") === "true";
    setIsTestMode(testMode);
    
    // Initialize network settings
    const storedNetwork = localStorage.getItem("solanaNetwork") as NetworkType | null;
    if (storedNetwork) {
      setSolanaNetwork(storedNetwork);
      const storedCustomEndpoint = localStorage.getItem("solanaCustomEndpoint");
      if (storedCustomEndpoint) {
        setCustomRpcUrl(storedCustomEndpoint);
        updateSolanaService(storedNetwork, storedCustomEndpoint);
      } else {
        updateSolanaService(storedNetwork);
      }
    }
  }, []);

  // Update Solana service when network changes
  const updateSolanaService = (network: NetworkType, customEndpoint?: string) => {
    const newService = new SolanaService(network, customEndpoint);
    setSolanaService(newService);
    
    // Save settings
    localStorage.setItem("solanaNetwork", network);
    if (customEndpoint) {
      localStorage.setItem("solanaCustomEndpoint", customEndpoint);
    } else {
      localStorage.removeItem("solanaCustomEndpoint");
    }
    
    // Refresh balance if connected
    if (isConnected && account && walletType === "solana" && !isTestMode) {
      updateBalance(account);
    }
  };

  // Refresh token balances for connected Solana account
  const refreshTokenBalances = async () => {
    if (!isConnected || !account || walletType !== "solana" || isTestMode) {
      return;
    }
    
    try {
      const tokens = await solanaService.getTokenBalances(account);
      setTokenBalances(tokens);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  // Update user activity and reset session timer
  const updateActivity = () => {
    setLastActivity(Date.now());
    
    // Reset session timer
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    // Set new timer
    if (!isWalletLocked && isConnected) {
      const timer = setTimeout(() => {
        lockWallet();
        toast.warning("Session timed out due to inactivity");
      }, SESSION_TIMEOUT);
      
      setSessionTimer(timer);
      setIsSessionActive(true);
    }
  };

  // Listen for user activity
  useEffect(() => {
    if (hasWindow && !isWalletLocked && isConnected) {
      const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
      
      const handleActivity = () => {
        updateActivity();
      };
      
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
      
      // Initial timer
      updateActivity();
      
      return () => {
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
        
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [isWalletLocked, isConnected, hasWindow]);

  // Lock wallet when component unmounts
  useEffect(() => {
    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  // Update account balance
  const updateBalance = async (address: string) => {
    if (!address) return;

    try {
      if (walletType === "ethereum" && hasEthereum) {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        const balance = await provider.getBalance(address);
        const etherBalance = ethers.utils.formatEther(balance);
        const formattedBalance = parseFloat(etherBalance).toFixed(4);
        setBalance(formattedBalance);
      } else if (walletType === "solana") {
        if (isTestMode) {
          // Use stored test balance in test mode
          const testBalance = localStorage.getItem("testSolBalance") || "0";
          setBalance(testBalance);
        } else {
          const solBalance = await solanaService.getBalance(address);
          const formattedBalance = solBalance.toFixed(4);
          setBalance(formattedBalance);
        }
      }
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Connect wallet
  const connectWallet = async (password?: string) => {
    if (!walletType) return;

    setIsConnecting(true);

    try {
      if (walletType === "ethereum") {
        if (!hasEthereum) {
          toast.error("Ethereum wallet not available!");
          setIsConnecting(false);
          return;
        }

        try {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          
          if (accounts.length > 0) {
            const userAddress = accounts[0];
            const network = await provider.getNetwork();
            
            setAccount(userAddress);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            await updateBalance(userAddress);
            
            localStorage.setItem("walletConnected", "true");
            localStorage.setItem("walletAddress", userAddress);
            
            setIsWalletLocked(false);
            setIsSessionActive(true);
            updateActivity();
          }
        } catch (error) {
          console.error("Connection error:", error);
          toast.error("Failed to connect wallet");
        }
      } else if (walletType === "solana") {
        try {
          if (isTestMode) {
            // In test mode, use a demo address
            const demoSolanaAddress =
              localStorage.getItem("solanaWalletAddress") ||
              "8dv5SCnGYbmMR81v8UxqtjKLZ5TPZzxVzpHcdJK2YzEM";
            
            setAccount(demoSolanaAddress);
            setIsConnected(true);
            
            // Initialize test balance if not already set
            if (!localStorage.getItem("testSolBalance")) {
              localStorage.setItem("testSolBalance", "10.0000");
            }
            
            const testBalance = localStorage.getItem("testSolBalance") || "10.0000";
            setBalance(testBalance);
            
            localStorage.setItem("walletConnected", "true");
            localStorage.setItem("walletAddress", demoSolanaAddress);
            localStorage.setItem("solanaWalletAddress", demoSolanaAddress);
            
            setIsWalletLocked(false);
            setIsSessionActive(true);
            updateActivity();
          } else {
            // In real mode, check for stored wallet or create a new one
            const wallets = JSON.parse(localStorage.getItem("nebula_wallets") || "[]");
            
            if (wallets.length > 0) {
              // If we have stored wallets, prompt for password
              if (!password) {
                toast.error("Password required to unlock wallet");
                setIsConnecting(false);
                return;
              }
              
              try {
                // Get first wallet in list
                const wallet = wallets[0];
                const mnemonic = await KeyManager.getWalletMnemonic(wallet.publicKey, password);
                
                // Derive keypair
                const keypair = KeyManager.deriveSolanaKeypair(mnemonic);
                
                setAccount(keypair.publicKey.toBase58());
                setCurrentKeypair(keypair);
                setIsConnected(true);
                setIsWalletLocked(false);
                
                // Get balance
                await updateBalance(keypair.publicKey.toBase58());
                await refreshTokenBalances();
                
                // Save connection state
                localStorage.setItem("walletConnected", "true");
                localStorage.setItem("walletAddress", keypair.publicKey.toBase58());
                
                // Set session active
                setIsSessionActive(true);
                updateActivity();
                
                toast.success("Wallet unlocked!");
              } catch (error) {
                console.error("Wallet unlock error:", error);
                toast.error("Invalid password or corrupted wallet data");
              }
            } else {
              // No stored wallets, redirect to wallet creation
              toast.info("No wallet found. Please create or import a wallet first.");
              setIsConnecting(false);
              return;
            }
          }
        } catch (error) {
          console.error("Connection error:", error);
          toast.error("Failed to connect wallet");
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setChainId(null);
    setIsConnected(false);
    setCurrentKeypair(null);
    setTokenBalances([]);
    
    // Clear session
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    
    setIsWalletLocked(true);
    setIsSessionActive(false);
    
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    
    toast.info("Wallet disconnected");
  };

  // Set wallet type
  const handleSetWalletType = (type: "ethereum" | "solana") => {
    setWalletType(type);
    localStorage.setItem("walletType", type);
    
    if (isConnected) {
      disconnectWallet();
    }
  };

  // Lock wallet
  const lockWallet = () => {
    setIsWalletLocked(true);
    setIsSessionActive(false);
    setCurrentKeypair(null);
    
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  // Unlock wallet
  const unlockWallet = async (password: string): Promise<boolean> => {
    if (!account || walletType !== "solana" || isTestMode) {
      return false;
    }
    
    try {
      const wallets = JSON.parse(localStorage.getItem("nebula_wallets") || "[]");
      const wallet = wallets.find((w: any) => w.publicKey === account);
      
      if (!wallet) {
        toast.error("Wallet not found");
        return false;
      }
      
      const mnemonic = await KeyManager.getWalletMnemonic(wallet.publicKey, password);
      const keypair = KeyManager.deriveSolanaKeypair(mnemonic);
      
      setCurrentKeypair(keypair);
      setIsWalletLocked(false);
      setIsSessionActive(true);
      updateActivity();
      
      toast.success("Wallet unlocked");
      return true;
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Invalid password");
      return false;
    }
  };

  // Send SOL to another address
  const sendSol = async (recipient: string, amount: number, priorityFee?: number): Promise<string> => {
    if (!isConnected || !account || walletType !== "solana" || isTestMode) {
      toast.error("Cannot send transaction: wallet not connected or in test mode");
      return "";
    }
    
    if (isWalletLocked || !currentKeypair) {
      toast.error("Wallet is locked. Please unlock first.");
      return "";
    }
    
    try {
      // Verify the recipient address is valid
      const isValid = await solanaService.accountExists(recipient);
      if (!isValid) {
        toast.warning("Transaction will create a new account", {
          description: "The recipient address doesn't exist yet. This transaction will create a new account."
        });
      }
      
      // Check if balance is sufficient
      const currentBalance = parseFloat(balance);
      if (currentBalance < amount) {
        toast.error("Insufficient balance");
        return "";
      }
      
      // Send transaction
      const signature = await solanaService.sendTransaction({
        fromKeypair: currentKeypair,
        toAddress: recipient,
        amount,
        priorityFee
      });
      
      // Update balance
      await updateBalance(account);
      
      toast.success("Transaction successful!", {
        description: `${amount} SOL sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`
      });
      
      return signature;
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Transaction failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return "";
    }
  };

  // Request SOL airdrop (devnet/testnet only)
  const requestAirdrop = async (amount: number): Promise<string> => {
    if (!isConnected || !account || walletType !== "solana") {
      toast.error("Cannot request airdrop: wallet not connected");
      return "";
    }
    
    try {
      const signature = await solanaService.requestAirdrop(account, amount);
      await updateBalance(account);
      
      toast.success("Airdrop received!");
      return signature;
    } catch (error) {
      console.error("Airdrop error:", error);
      toast.error("Airdrop failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return "";
    }
  };

  // Send SPL token to another address
  const sendToken = async (
    recipientAddress: string,
    mintAddress: string,
    amount: number,
    decimals: number
  ): Promise<string> => {
    if (!isConnected || !account || walletType !== "solana" || isTestMode) {
      toast.error("Cannot send tokens: wallet not connected or in test mode");
      return "";
    }
    
    if (isWalletLocked || !currentKeypair) {
      toast.error("Wallet is locked. Please unlock first.");
      return "";
    }
    
    try {
      // Get token account to check balance
      const tokenInfo = tokenBalances.find(t => t.mint === mintAddress);
      if (!tokenInfo || tokenInfo.balance < amount) {
        toast.error("Insufficient token balance");
        return "";
      }
      
      // Send token transaction
      const signature = await solanaService.sendToken({
        fromKeypair: currentKeypair,
        toAddress: recipientAddress,
        tokenMintAddress: mintAddress,
        amount,
        decimals
      });
      
      // Refresh token balances
      await refreshTokenBalances();
      
      toast.success("Token transfer successful!");
      return signature;
    } catch (error) {
      console.error("Token transfer error:", error);
      toast.error("Token transfer failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return "";
    }
  };
  
  // Handle Ethereum account change
  useEffect(() => {
    if (!hasEthereum || walletType !== "ethereum") return;

    const checkConnection = async () => {
      // Don't automatically connect wallet on page refresh
      const wasConnected = false; // Changed from localStorage.getItem("walletConnected") === "true";
      
      if (wasConnected) {
        try {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const userAddress = accounts[0];
            const network = await provider.getNetwork();
            
            setAccount(userAddress);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            await updateBalance(userAddress);
            
            // Set session active
            setIsWalletLocked(false);
            setIsSessionActive(true);
            updateActivity();
          }
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(Number(chainIdHex));
      window.location.reload();
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log("Wallet disconnect event:", error);
      disconnectWallet();
    };

    if (hasEthereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
      (window as any).ethereum.on("disconnect", handleDisconnect);
    }

    return () => {
      if (hasEthereum) {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
        (window as any).ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [walletType, hasEthereum]);

  // Handle Solana reconnection
  useEffect(() => {
    if (!walletType || walletType !== "solana") return;

    const checkSolanaConnection = async () => {
      // Don't automatically connect wallet on page refresh
      // This is what's causing the automatic redirect
      const wasConnected = false; // Changed from localStorage.getItem("walletConnected") === "true";
      
      if (wasConnected) {
        const savedAddress = localStorage.getItem("walletAddress");
        
        if (savedAddress) {
          setAccount(savedAddress);
          setIsConnected(true);
          
          if (isTestMode) {
            const testBalance =
              localStorage.getItem("testSolBalance") || "10.0000";
            setBalance(testBalance);
          } else {
            await updateBalance(savedAddress);
            // Don't auto-unlock - require password
            setIsWalletLocked(true);
          }
        }
      }
    };

    checkSolanaConnection();

    return () => {
      // Cleanup
    };
  }, [walletType, isTestMode]);

  // Toggle test mode
  const toggleTestMode = () => {
    const newTestMode = !isTestMode;
    setIsTestMode(newTestMode);
    localStorage.setItem("testMode", newTestMode.toString());
    
    // Reset wallet connection when toggling test mode
    disconnectWallet();
    
    // Initialize test SOL balance if enabling test mode
    if (newTestMode && !localStorage.getItem("testSolBalance")) {
      localStorage.setItem("testSolBalance", "10.0000");
    }
  };

  // Add test SOL
  const addTestSol = (amount: string) => {
    if (!isTestMode) return;
    
    const currentBalance = parseFloat(localStorage.getItem("testSolBalance") || "0");
    const addAmount = parseFloat(amount);
    
    if (isNaN(addAmount)) return;
    
    const newBalance = currentBalance + addAmount;
    localStorage.setItem("testSolBalance", newBalance.toFixed(4));
    setBalance(newBalance.toFixed(4));
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        isConnected,
        isConnecting,
        walletType,
        connectWallet,
        disconnectWallet,
        setWalletType: handleSetWalletType,
        isTestMode,
        toggleTestMode,
        addTestSol,
        solanaNetwork,
        setSolanaNetwork: updateSolanaService,
        sendSol,
        requestAirdrop,
        tokenBalances,
        refreshTokenBalances,
        sendToken,
        isWalletLocked,
        lockWallet,
        unlockWallet,
        isSessionActive,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
