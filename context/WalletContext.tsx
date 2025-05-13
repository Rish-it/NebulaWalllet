'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  balance: string
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const defaultContext: WalletContextType = {
  account: null,
  balance: '0',
  chainId: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {}
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

  const hasWindow = typeof window !== 'undefined'
  const hasEthereum = hasWindow && (window as any).ethereum

  const updateBalance = async (address: string) => {
    if (!hasEthereum || !address) return

    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const balance = await provider.getBalance(address)
      const etherBalance = ethers.utils.formatEther(balance)
      const formattedBalance = parseFloat(etherBalance).toFixed(4)
      setBalance(formattedBalance)
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const connectWallet = async () => {
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

  const disconnectWallet = () => {
    setAccount(null)
    setBalance('0')
    setChainId(null)
    setIsConnected(false)
    
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }

  useEffect(() => {
    if (!hasEthereum) return

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
  }, [account, hasEthereum])

  useEffect(() => {
    if (!account || !isConnected) return

    updateBalance(account)

    const intervalId = setInterval(() => {
      updateBalance(account)
    }, 15000)

    return () => clearInterval(intervalId)
  }, [account, chainId, isConnected])

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
} 