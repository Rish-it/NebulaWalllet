"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, RotateCw } from "lucide-react";

interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  priceInUsdc?: number;
  priceInUsdt?: number;
  change: number;
  volume: string;
  marketCap: string;
  image?: string;
}

type PriceDisplay = "usd" | "usdc" | "usdt";

export default function CryptoStats() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([
    {
      name: "Ethereum",
      symbol: "ETH",
      price: 1852.73,
      change: +2.34,
      volume: "17.8B",
      marketCap: "223.4B",
    },
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: 28456.12,
      change: +1.21,
      volume: "23.6B",
      marketCap: "554.9B",
    },
    {
      name: "Solana",
      symbol: "SOL",
      price: 142.67,
      change: +3.51,
      volume: "6.9B",
      marketCap: "58.3B",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      price: 1.00,
      change: +0.01,
      volume: "5.2B",
      marketCap: "31.6B",
    },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);
  const [priceDisplay, setPriceDisplay] = useState<PriceDisplay>("usd");

  const popularCryptoIds = [
    "bitcoin",
    "ethereum",
    "solana",
    "dogecoin",
    "cardano",
    "polkadot"
  ];

  // Suppress hydration warnings by using the useEffect trick
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchCryptoData() {
      try {
        setLoading(true);
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${popularCryptoIds.join(",")}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        
        const stablecoinResponse = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=usd-coin,tether&order=market_cap_desc&sparkline=false"
        );
        
        if (!stablecoinResponse.ok) {
          throw new Error(`Failed to fetch stablecoin data: ${stablecoinResponse.status}`);
        }
        
        const stablecoinData = await stablecoinResponse.json();
        const usdcPrice = stablecoinData.find((coin: any) => coin.id === "usd-coin")?.current_price || 1;
        const usdtPrice = stablecoinData.find((coin: any) => coin.id === "tether")?.current_price || 1;

        const formattedData: CryptoData[] = data.map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          priceInUsdc: coin.current_price / usdcPrice,
          priceInUsdt: coin.current_price / usdtPrice,
          change: coin.price_change_percentage_24h,
          volume: formatNumber(coin.total_volume),
          marketCap: formatNumber(coin.market_cap),
          image: coin.image
        }));
        
        setCryptoData(formattedData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
        setError("Failed to load real-time data. Using cached data.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCryptoData();
    
    const intervalId = setInterval(fetchCryptoData, 120000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  function formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  const cyclePriceDisplay = () => {
    setPriceDisplay(current => {
      if (current === "usd") return "usdc";
      if (current === "usdc") return "usdt";
      return "usd";
    });
  };

  const getCurrentPrice = (crypto: CryptoData) => {
    if (priceDisplay === "usdc") return crypto.priceInUsdc || crypto.price;
    if (priceDisplay === "usdt") return crypto.priceInUsdt || crypto.price;
    return crypto.price;
  };

  const getPriceSymbol = () => {
    if (priceDisplay === "usdc") return "USDC";
    if (priceDisplay === "usdt") return "USDT";
    return "$";
  };

  return (
    <div id="market" className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3 dark:text-gray-100">Market Overview</h2>
        <p className="text-slate-600 max-w-2xl mx-auto dark:text-gray-300">Stay updated with the latest cryptocurrency prices and trends</p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-700">
        <div className="flex justify-end px-6 pt-5">
          <button 
            onClick={cyclePriceDisplay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
          >
            <RotateCw size={12} className="mr-1" />
            {priceDisplay === "usd" ? "USD" : priceDisplay === "usdc" ? "USDC" : "USDT"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100 dark:divide-gray-800">
            <thead className="bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
              <tr>
                <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-400">
                  Asset
                </th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-400">
                  Price ({priceDisplay.toUpperCase()})
                </th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-400">
                  24h Change
                </th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-400">
                  24h Volume
                </th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-gray-400">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-100 dark:bg-gray-900 dark:divide-gray-800">
              {cryptoData.map((crypto, index) => (
                <tr key={index} className="hover:bg-purple-50 transition-colors duration-150 dark:hover:bg-gray-800">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      {crypto.image ? (
                        <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full mr-3" />
                      ) : (
                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center mr-3 dark:bg-gray-800">
                          <span className="font-bold text-purple-600 text-sm dark:text-purple-400">{crypto.symbol.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-gray-100">{crypto.name}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{crypto.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium text-slate-900 dark:text-gray-100">
                    {getPriceSymbol()} {getCurrentPrice(crypto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${crypto.change >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                      {crypto.change >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                      {Math.abs(crypto.change).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm text-slate-700 dark:text-gray-300">
                    ${crypto.volume}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm text-slate-700 dark:text-gray-300">
                    ${crypto.marketCap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-4 px-6 bg-gradient-to-r from-purple-50 to-white border-t border-purple-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-800">
          <p className="text-xs text-slate-500 text-center dark:text-gray-400">
            {loading ? (
              <span>Loading latest data from CoinGecko API...</span>
            ) : error ? (
              <span>Live data updated every 2 minutes. {error} Last updated: {isClient ? lastUpdated : '—'}</span>
            ) : (
              <span>
                <strong>Supported by CoinGecko</strong> <span className="text-gray-600 text-xs"> Last updated: {isClient ? lastUpdated : '—'}</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
} 