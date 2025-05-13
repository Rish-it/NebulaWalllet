'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

interface WalletContextType {
  account: string | null
  balance: string
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  walletType: 'ethereum' | 'solana' | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  setWalletType: (type: 'ethereum' | 'solana') => void
  isTestMode: boolean
  toggleTestMode: () => void
  addTestSol: (amount: string) => void
}

const defaultContext: WalletContextType = {
  account: null,
  balance: '0',
  chainId: null,
  isConnected: false,
  isConnecting: false,
  walletType: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  setWalletType: () => {},
  isTestMode: false,
  toggleTestMode: () => {},
  addTestSol: () => {}
}

const WalletContext = createContext<WalletContextType>(defaultContext)

export const useWallet = () => useContext(WalletContext)

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [walletType, setWalletType] = useState<'ethereum' | 'solana' | null>(null)
  const [isTestMode, setIsTestMode] = useState<boolean>(false)

  const hasWindow = typeof window !== 'undefined'
  const hasEthereum = hasWindow && (window as any).ethereum

  useEffect(() => {
    const storedWalletType = localStorage.getItem('walletType')
    if (storedWalletType === 'ethereum' || storedWalletType === 'solana') {
      setWalletType(storedWalletType)
    }
    
    // Check if test mode was enabled previously
    const testMode = localStorage.getItem('testMode') === 'true'
    setIsTestMode(testMode)
  }, [])

  const updateBalance = async (address: string) => {
    if (!address) return

    try {
      if (walletType === 'ethereum' && hasEthereum) {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const balance = await provider.getBalance(address)
        const etherBalance = ethers.utils.formatEther(balance)
        const formattedBalance = parseFloat(etherBalance).toFixed(4)
        setBalance(formattedBalance)
      } 
      else if (walletType === 'solana') {
        if (isTestMode) {
          // Use stored test balance in test mode
          const testBalance = localStorage.getItem('testSolBalance') || '0'
          setBalance(testBalance)
        } else {
          const connection = new Connection(clusterApiUrl('mainnet-beta'))
          const publicKey = new PublicKey(address)
          const balance = await connection.getBalance(publicKey)
          const solBalance = balance / 1000000000
          const formattedBalance = solBalance.toFixed(4)
          setBalance(formattedBalance)
        }
      }
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const connectWallet = async () => {
    if (walletType === 'ethereum') {
      if (!hasEthereum) {
        window.alert('Please install MetaMask or another Ethereum wallet extension!')
        return
      }

      setIsConnecting(true)

      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        
        if (accounts.length > 0) {
          const userAddress = accounts[0]
          const network = await provider.getNetwork()
          
          setAccount(userAddress)
          setChainId(Number(network.chainId))
          setIsConnected(true)
          
          await updateBalance(userAddress)
          
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('walletAddress', userAddress)
        }
      } catch (error) {
        console.error('Connection error:', error)
      } finally {
        setIsConnecting(false)
      }
    } 
    else if (walletType === 'solana') {
      setIsConnecting(true)
      
      try {
        const demoSolanaAddress = localStorage.getItem('solanaWalletAddress') || 
                                '8dv5SCnGYbmMR81v8UxqtjKLZ5TPZzxVzpHcdJK2YzEM'
        
        setAccount(demoSolanaAddress)
        setIsConnected(true)
        
        // If test mode is enabled, use the stored test balance
        if (isTestMode) {
          // Initialize test balance if not already set
          if (!localStorage.getItem('testSolBalance')) {
            localStorage.setItem('testSolBalance', '10.0000')
          }
          const testBalance = localStorage.getItem('testSolBalance') || '10.0000'
          setBalance(testBalance)
        } else {
          await updateBalance(demoSolanaAddress)
        }
        
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', demoSolanaAddress)
        localStorage.setItem('solanaWalletAddress', demoSolanaAddress)
      } catch (error) {
        console.error('Connection error:', error)
      } finally {
        setIsConnecting(false)
      }
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance('0')
    setChainId(null)
    setIsConnected(false)
    
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }

  const handleSetWalletType = (type: 'ethereum' | 'solana') => {
    setWalletType(type)
    localStorage.setItem('walletType', type)
    
    if (isConnected) {
      disconnectWallet()
    }
  }

  useEffect(() => {
    if (!hasEthereum || walletType !== 'ethereum') return

    const checkConnection = async () => {
      const wasConnected = localStorage.getItem('walletConnected') === 'true'
      
      if (wasConnected) {
        try {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum)
          const accounts = await provider.listAccounts()
          
          if (accounts.length > 0) {
            const userAddress = accounts[0]
            const network = await provider.getNetwork()
            
            setAccount(userAddress)
            setChainId(Number(network.chainId))
            setIsConnected(true)
            
            await updateBalance(userAddress)
          } else {
            disconnectWallet()
          }
        } catch (error) {
          console.error('Error checking existing connection:', error)
          disconnectWallet()
        }
      }
    }

    checkConnection()

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        updateBalance(accounts[0])
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16))
      if (account) {
        updateBalance(account)
      }
    }

    const handleDisconnect = (error: { code: number; message: string }) => {
      disconnectWallet()
    }

    const ethereum = (window as any).ethereum
    
    if (ethereum && ethereum.on) {
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('disconnect', handleDisconnect)
    }

    return () => {
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [account, hasEthereum, walletType])

  useEffect(() => {
    if (walletType !== 'solana') return
    
    const checkSolanaConnection = async () => {
      const wasConnected = localStorage.getItem('walletConnected') === 'true'
      const storedSolanaAddress = localStorage.getItem('solanaWalletAddress')
      
      if (wasConnected && storedSolanaAddress) {
        setAccount(storedSolanaAddress)
        setIsConnected(true)
        
        if (isTestMode) {
          // Use stored test balance
          const testBalance = localStorage.getItem('testSolBalance') || '0'
          setBalance(testBalance)
        } else {
          await updateBalance(storedSolanaAddress)
        }
      }
    }
    
    checkSolanaConnection()
  }, [walletType, isTestMode])

  useEffect(() => {
    if (!account || !isConnected) return

    updateBalance(account)

    const intervalId = setInterval(() => {
      updateBalance(account)
    }, 15000)

    return () => clearInterval(intervalId)
  }, [account, chainId, isConnected, walletType])

  const toggleTestMode = () => {
    const newTestMode = !isTestMode
    setIsTestMode(newTestMode)
    localStorage.setItem('testMode', newTestMode.toString())
    
    // If toggling to test mode, set a default balance
    if (newTestMode && walletType === 'solana') {
      if (!localStorage.getItem('testSolBalance')) {
        localStorage.setItem('testSolBalance', '10.0000')
      }
      const testBalance = localStorage.getItem('testSolBalance') || '10.0000'
      setBalance(testBalance)
    } else if (account) {
      // If disabling test mode, update with real balance
      updateBalance(account)
    }
  }

  const addTestSol = (amount: string) => {
    if (!isTestMode || walletType !== 'solana') return
    
    const currentBalance = parseFloat(balance || '0')
    const amountToAdd = parseFloat(amount)
    
    if (!isNaN(amountToAdd) && amountToAdd > 0) {
      const newBalance = (currentBalance + amountToAdd).toFixed(4)
      setBalance(newBalance)
      localStorage.setItem('testSolBalance', newBalance)
    }
  }

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
        addTestSol
      }}
    >
      {children}
    </WalletContext.Provider>
  )
} 