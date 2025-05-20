"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { validateMnemonic } from "bip39";
import { Input } from "./ui/input";
import { useWallet } from "@/context/WalletContext";
import { KeyManager } from "@/lib/keyManager";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Trash,
  ShieldCheck,
  Lock
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";

interface Wallet {
  publicKey: string;
  privateKey?: string;
  mnemonic?: string;
  path: string;
  name: string;
}

const WalletGenerator = () => {
  const { walletType, setWalletType, connectWallet } = useWallet();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(
    Array(12).fill(" ")
  );
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [mnemonicInput, setMnemonicInput] = useState<string>("");
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [gridView, setGridView] = useState<boolean>(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [walletName, setWalletName] = useState<string>("My Solana Wallet");
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [mnemonicStrength, setMnemonicStrength] = useState<128 | 256>(128); // 128 for 12 words, 256 for 24 words
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Load wallets from secure storage
  useEffect(() => {
    loadWallets();
  }, []);

  // Sync with WalletContext wallet type
  useEffect(() => {
    // No need to set path types anymore as we're focusing on Solana
  }, [walletType]);

  const loadWallets = () => {
    try {
      // Get wallets from localStorage (just public keys and metadata)
      const storedWallets = localStorage.getItem("nebula_wallets");
      
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets);
        
        // Map to our wallet interface (without sensitive data)
        const secureWallets = parsedWallets.map((wallet: any) => ({
          publicKey: wallet.publicKey,
          name: wallet.name || "My Wallet",
          path: `m/44'/501'/0'/0'`, // Solana path
        }));
        
        setWallets(secureWallets);
        setVisiblePrivateKeys(secureWallets.map(() => false));
      }
    } catch (error) {
      console.error("Failed to load wallets:", error);
      toast.error("Failed to load wallets");
    }
  };

  const handleDeleteWallet = (publicKey: string) => {
    try {
      // Get current wallets
      const storedWallets = JSON.parse(localStorage.getItem("nebula_wallets") || "[]");
      
      // Filter out the wallet to delete
      const updatedWallets = storedWallets.filter((wallet: any) => wallet.publicKey !== publicKey);
      
      // Save back
      localStorage.setItem("nebula_wallets", JSON.stringify(updatedWallets));
      
      // Update state
      loadWallets();
      
      toast.success("Wallet deleted successfully!");
    } catch (error) {
      console.error("Error deleting wallet:", error);
      toast.error("Failed to delete wallet");
    }
  };

  const handleClearWallets = () => {
    try {
      localStorage.removeItem("nebula_wallets");
      setWallets([]);
      setVisiblePrivateKeys([]);
      toast.success("All wallets cleared.");
    } catch (error) {
      console.error("Error clearing wallets:", error);
      toast.error("Failed to clear wallets");
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const checkPasswordStrength = (password: string): number => {
    // Password strength rules (score 0-100)
    let score = 0;
    
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    if (password.length >= 16) score += 10;
    
    return score;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswordInput(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const createWallet = async () => {
    setIsCreatingWallet(true);
    
    try {
      // Validate password
      if (passwordInput !== confirmPasswordInput) {
        toast.error("Passwords do not match");
        setIsCreatingWallet(false);
        return;
      }
      
      if (passwordInput.length < 8) {
        toast.error("Password must be at least 8 characters");
        setIsCreatingWallet(false);
        return;
      }
      
      // Generate or use provided mnemonic
      let mnemonic: string;
      
      if (isImporting) {
        if (!mnemonicInput.trim()) {
          toast.error("Please enter a recovery phrase");
          setIsCreatingWallet(false);
          return;
        }
        
        if (!validateMnemonic(mnemonicInput.trim())) {
          toast.error("Invalid recovery phrase");
          setIsCreatingWallet(false);
          return;
        }
        
        mnemonic = mnemonicInput.trim();
      } else {
        // Generate new mnemonic with selected strength
        mnemonic = KeyManager.generateMnemonic(mnemonicStrength);
      }
      
      // Show mnemonic to user
      setMnemonicWords(mnemonic.split(" "));
      setShowMnemonic(true);
      
      // Store wallet securely
      await KeyManager.storeWallet(mnemonic, passwordInput, walletName);
      
      // Reload wallet list
      loadWallets();
      
      toast.success("Wallet created successfully!");
      setShowPasswordDialog(false);
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet");
    } finally {
      setIsCreatingWallet(false);
      setPasswordInput("");
      setConfirmPasswordInput("");
    }
  };

  const handleConnectWallet = async (publicKey: string) => {
    try {
      // Prompt for password before connecting
      const password = prompt("Enter your wallet password to unlock");
      if (!password) return;
      
      // Connect the selected wallet
      await connectWallet(password);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="notion-card">
        <h2 className="notion-heading text-xl mb-3">Wallet Generator</h2>
        <p className="notion-text mb-4">
          Create or import your Solana wallet securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={() => {
              setIsImporting(false);
              setWalletName("My Solana Wallet");
              setMnemonicInput("");
              setShowPasswordDialog(true);
            }}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Create New Wallet
          </Button>
          
          <Button
            onClick={() => {
              setIsImporting(true);
              setWalletName("Imported Wallet");
              setShowPasswordDialog(true);
            }}
            variant="outline"
            className="border-primary/20 hover:border-primary/30"
          >
            Import Existing Wallet
          </Button>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="notion-card">
            <DialogHeader>
              <DialogTitle>
                {isImporting ? "Import Wallet" : "Create New Wallet"}
              </DialogTitle>
              <DialogDescription className="notion-text text-sm">
                {isImporting
                  ? "Enter your 12 or 24-word recovery phrase and set a password to secure your wallet."
                  : "Set a strong password to protect your wallet. This password will be used to encrypt your private key."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 my-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm">Wallet Name</label>
                <Input
                  type="text"
                  placeholder="My Solana Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              {isImporting && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm">Recovery Phrase</label>
                  <Input
                    type="password"
                    placeholder="Enter your 12 or 24 word recovery phrase with spaces"
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
              
              {!isImporting && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm">Recovery Phrase Length</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={mnemonicStrength === 128 ? "default" : "outline"}
                      onClick={() => setMnemonicStrength(128)}
                      className="w-full text-sm"
                      size="sm"
                    >
                      12 Words
                    </Button>
                    <Button
                      type="button"
                      variant={mnemonicStrength === 256 ? "default" : "outline"}
                      onClick={() => setMnemonicStrength(256)}
                      className="w-full text-sm"
                      size="sm"
                    >
                      24 Words
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="text-sm">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={handlePasswordChange}
                  className="text-sm"
                />
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength < 40 && "Weak password"}
                  {passwordStrength >= 40 && passwordStrength < 70 && "Moderate password"}
                  {passwordStrength >= 70 && "Strong password"}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <Button
                onClick={createWallet}
                disabled={isCreatingWallet}
                className="mt-2 bg-primary hover:bg-primary/90"
              >
                {isCreatingWallet ? "Processing..." : isImporting ? "Import Wallet" : "Create Wallet"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mnemonicWords.length > 0 && mnemonicWords[0] !== " " && (
        <div className="notion-card">
          <div
            className="flex w-full justify-between items-center mb-2 cursor-pointer"
            onClick={() => setShowMnemonic(!showMnemonic)}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary h-4 w-4" />
              <h2 className="notion-heading text-lg">
                Recovery Phrase
              </h2>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowMnemonic(!showMnemonic);
              }}
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
            >
              {showMnemonic ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>

          {showMnemonic && (
            <div className="mt-3">
              <div className="bg-amber-100/10 p-3 rounded-md text-amber-700 text-xs mb-4 border border-amber-200/20">
                <strong>WARNING:</strong> Never share your recovery phrase. 
                Anyone with this phrase can access your funds.
                Write it down and keep it offline.
              </div>
              
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4"
                onClick={() => copyToClipboard(mnemonicWords.join(" "))}
              >
                {mnemonicWords.map((word, index) => (
                  <div
                    key={index}
                    className="text-sm bg-secondary hover:bg-secondary/70 transition-all duration-200 rounded-md p-2 cursor-pointer"
                  >
                    <span className="text-muted-foreground mr-1 text-xs">{index + 1}.</span> {word}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer" 
                   onClick={() => copyToClipboard(mnemonicWords.join(" "))}>
                <Copy className="size-3" /> Click to copy full phrase
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display wallet pairs */}
      {wallets.length > 0 && (
        <div className="notion-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="notion-heading text-lg flex items-center">
              Your Wallets 
              <span className="text-muted-foreground text-sm ml-2">({wallets.length})</span>
            </h2>
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setGridView(!gridView)}
                variant="ghost"
                size="sm"
                className="p-1 h-7 w-7"
              >
                {gridView ? <List className="size-4" /> : <Grid2X2 className="size-4" />}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-7 w-7 text-red-500 hover:text-red-600">
                    <Trash className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="notion-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all wallets?</AlertDialogTitle>
                    <AlertDialogDescription className="notion-text text-sm">
                      This will delete all your wallet information from this browser.
                      Make sure you have backed up your recovery phrases first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearWallets} className="bg-red-500 text-sm">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className={`grid gap-4 ${gridView ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            {wallets.map((wallet, index) => (
              <div
                key={index}
                className="border border-border rounded-md overflow-hidden bg-card/50"
              >
                <div className="bg-secondary/40 px-4 py-2 flex justify-between items-center">
                  <div className="font-medium text-sm">
                    {wallet.name || "My Wallet"}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConnectWallet(wallet.publicKey)}
                      className="h-7 text-xs"
                    >
                      <Lock className="size-3 mr-1" /> Connect
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600">
                          <Trash className="size-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="notion-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete wallet?</AlertDialogTitle>
                          <AlertDialogDescription className="notion-text text-sm">
                            This will remove the wallet from your browser. 
                            Make sure you have the recovery phrase backed up.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteWallet(wallet.publicKey)} className="bg-red-500 text-sm">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Public Key</div>
                  <div
                    className="font-mono text-sm truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => copyToClipboard(wallet.publicKey)}
                  >
                    {wallet.publicKey}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletGenerator;
