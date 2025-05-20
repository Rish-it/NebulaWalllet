"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { ArrowRight, Clock, AlertCircle, Check, X, ArrowUpRight, Loader2 } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface Transaction {
  signature: string;
  timestamp: string;
  status: string;
  fee: number;
  data: any;
}

const SendTransaction = () => {
  const {
    account,
    balance,
    isConnected,
    walletType,
    isWalletLocked,
    unlockWallet,
    sendSol,
    sendToken,
    solanaNetwork,
    setSolanaNetwork,
    tokenBalances,
    refreshTokenBalances,
    requestAirdrop,
    isTestMode
  } = useWallet();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [selectedTokenDecimals, setSelectedTokenDecimals] = useState<number>(9); // SOL decimals by default
  const [priorityFee, setPriorityFee] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isAirdropping, setIsAirdropping] = useState<boolean>(false);

  // Load transaction history when account changes
  useEffect(() => {
    if (isConnected && account && walletType === "solana" && !isTestMode) {
      fetchTransactionHistory();
      refreshTokenBalances();
    }
  }, [account, isConnected, walletType, solanaNetwork]);

  const fetchTransactionHistory = async () => {
    if (!account || walletType !== "solana" || isTestMode) return;
    
    setIsLoadingHistory(true);
    
    try {
      // This would normally fetch from a service
      // For demo purposes, we're using an empty array or a mock
      if (isTestMode) {
        setTransactionHistory([]);
      } else {
        // Fetch actual transaction history using Solana RPC
        // This would be implemented in the SolanaService
        // Example:
        // const history = await solanaService.getTransactionHistory(account);
        // setTransactionHistory(history);
        
        // For now, use empty array
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!isConnected || !account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (isWalletLocked && !isTestMode) {
      setShowPasswordDialog(true);
      return;
    }
    
    // Validate inputs
    if (!recipient) {
      toast.error("Please enter a recipient address");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    // Validate balance
    const currentBalance = parseFloat(balance);
    if (selectedToken === "" && amountValue > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSending(true);
    
    try {
      let signature: string;
      
      if (selectedToken === "") {
        // Send SOL
        signature = await sendSol(recipient, amountValue, priorityFee > 0 ? priorityFee : undefined);
      } else {
        // Send Token
        const token = tokenBalances.find(t => t.mint === selectedToken);
        if (!token || token.balance < amountValue) {
          toast.error("Insufficient token balance");
          setIsSending(false);
          return;
        }
        
        signature = await sendToken(recipient, selectedToken, amountValue, selectedTokenDecimals);
      }
      
      if (signature) {
        // Clear the form
        setRecipient("");
        setAmount("");
        
        // Refresh transaction history
        fetchTransactionHistory();
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Transaction failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleUnlockWallet = async () => {
    if (!passwordInput) {
      toast.error("Please enter your password");
      return;
    }
    
    const success = await unlockWallet(passwordInput);
    
    if (success) {
      setShowPasswordDialog(false);
      setPasswordInput("");
      handleSendTransaction();
    } else {
      toast.error("Invalid password");
    }
  };

  const handleNetworkChange = (network: string) => {
    if (network === 'mainnet-beta' || network === 'testnet' || network === 'devnet') {
      setSolanaNetwork(network);
      fetchTransactionHistory();
    }
  };

  const handleRequestAirdrop = async () => {
    if (!isConnected || !account || walletType !== "solana") {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (solanaNetwork === 'mainnet-beta') {
      toast.error("Airdrops are only available on devnet and testnet");
      return;
    }
    
    setIsAirdropping(true);
    
    try {
      const signature = await requestAirdrop(1); // Request 1 SOL
      
      if (signature) {
        toast.success("Airdrop successful!", {
          description: "1 SOL has been added to your wallet."
        });
      }
    } catch (error) {
      console.error("Airdrop error:", error);
      toast.error("Airdrop failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsAirdropping(false);
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string): string => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString();
  };

  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
    
    if (value === "") {
      setSelectedTokenDecimals(9); // SOL decimals
    } else {
      const token = tokenBalances.find(t => t.mint === value);
      if (token) {
        setSelectedTokenDecimals(token.decimals);
      }
    }
  };

  // Choose which tokens to show in the select box
  const getTokenOptions = () => {
    const options = [
      <option key="sol" value="">SOL ({parseFloat(balance).toFixed(4)})</option>
    ];
    
    tokenBalances.forEach(token => {
      options.push(
        <option key={token.mint} value={token.mint}>
          {token.mint.slice(0, 5)}... ({token.balance})
        </option>
      );
    });
    
    return options;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="w-full mb-6 bg-secondary/50">
          <TabsTrigger value="send" className="flex-1">Send</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <div className="notion-card">
            <div className="mb-6">
              <h2 className="notion-heading text-xl mb-1">Send {selectedToken === "" ? "SOL" : "Tokens"}</h2>
              <p className="notion-text text-sm">
                Send {selectedToken === "" ? "SOL" : "tokens"} to another wallet address.
              </p>
              
              {!isTestMode && solanaNetwork !== 'mainnet-beta' && (
                <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
                  <Button
                    onClick={handleRequestAirdrop}
                    disabled={isAirdropping}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {isAirdropping ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Requesting...
                      </>
                    ) : (
                      <>Request Airdrop (1 SOL)</>
                    )}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="network" className="text-xs text-muted-foreground">Network:</Label>
                    <select
                      id="network"
                      className="text-xs px-2 py-1 bg-secondary rounded-md border-none"
                      value={solanaNetwork}
                      onChange={(e) => handleNetworkChange(e.target.value)}
                    >
                      <option value="devnet">Devnet</option>
                      <option value="testnet">Testnet</option>
                      <option value="mainnet-beta">Mainnet</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm">Token</Label>
                <select
                  id="token"
                  className="w-full p-2 bg-background border border-border rounded-md text-sm"
                  value={selectedToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                >
                  {getTokenOptions()}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="amount" className="text-sm">Amount</Label>
                  {selectedToken === "" && (
                    <button 
                      onClick={() => setAmount(balance)}
                      className="text-xs text-primary hover:underline"
                    >
                      Max: {parseFloat(balance).toFixed(4)} SOL
                    </button>
                  )}
                </div>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.000001"
                  placeholder={`Enter amount in ${selectedToken === "" ? "SOL" : "tokens"}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <Button
                type="button"
                variant="link"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs p-0 text-muted-foreground"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>
              
              {showAdvanced && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="priorityFee" className="text-sm">Priority Fee (micro-lamports)</Label>
                  <Input
                    id="priorityFee"
                    type="number"
                    min="0"
                    placeholder="0 (Optional)"
                    value={priorityFee.toString()}
                    onChange={(e) => setPriorityFee(parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority fees can result in faster transaction processing.
                  </p>
                </div>
              )}
              
              <div className="pt-4">
                <Button
                  onClick={handleSendTransaction}
                  disabled={isSending || !isConnected}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send {selectedToken === "" ? "SOL" : "Tokens"} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="notion-card">
            <div className="mb-4">
              <h2 className="notion-heading text-xl mb-1">Transaction History</h2>
              <p className="notion-text text-sm">
                Recent transactions on {solanaNetwork} network.
              </p>
            </div>
            
            <div className="mt-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-border border-dashed rounded-md">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((tx, index) => (
                    <div
                      key={tx.signature}
                      className="border border-border rounded-md p-3 hover:border-primary/30 transition-all text-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">{formatAddress(tx.signature)}</p>
                          <p className="text-sm mt-1">{formatDate(tx.timestamp)}</p>
                        </div>
                        <div className="flex items-center">
                          {tx.status === "confirmed" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="ml-2 text-xs capitalize">{tx.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Fee: {tx.fee} SOL
                      </div>
                      <div className="mt-2 flex justify-end">
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${solanaNetwork}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center text-primary hover:underline"
                        >
                          View on Explorer <ArrowUpRight className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactionHistory}
                disabled={isLoadingHistory}
                className="text-xs"
              >
                {isLoadingHistory ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="notion-card">
          <DialogHeader>
            <DialogTitle>Unlock Wallet</DialogTitle>
            <DialogDescription className="text-sm notion-text">
              Enter your wallet password to proceed with the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your wallet password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} size="sm" className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleUnlockWallet} size="sm" className="text-xs bg-primary hover:bg-primary/90">
              Unlock and Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendTransaction; 