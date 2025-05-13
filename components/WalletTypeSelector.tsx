"use client";

import { useWallet } from "@/context/WalletContext";
import { Button } from "./ui/button";
import { FaEthereum } from "react-icons/fa";

const WalletTypeSelector = () => {
  const { walletType, setWalletType } = useWallet();

  return (
    <div className="flex flex-row gap-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-purple-100 dark:border-gray-700">
      <Button
        size="sm"
        variant={walletType === 'ethereum' ? 'default' : 'outline'}
        onClick={() => setWalletType('ethereum')}
        className={`rounded-full ${
          walletType === 'ethereum' 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'border-purple-200 text-slate-600 hover:bg-purple-50'
        }`}
      >
        <FaEthereum className="mr-1" />
        Ethereum
      </Button>
      <Button
        size="sm"
        variant={walletType === 'solana' ? 'default' : 'outline'}
        onClick={() => setWalletType('solana')}
        className={`rounded-full ${
          walletType === 'solana' 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'border-purple-200 text-slate-600 hover:bg-purple-50'
        }`}
      >
        <img 
          src="https://cdn-icons-png.flaticon.com/128/14446/14446238.png" 
          alt="Solana" 
          className="w-4 h-4 mr-1" 
        />
        Solana
      </Button>
    </div>
  );
};

export default WalletTypeSelector; 