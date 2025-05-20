import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  clusterApiUrl,
  SendTransactionError,
  Cluster,
  TransactionSignature,
  TransactionInstruction,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import * as splToken from '@solana/spl-token';

export type NetworkType = 'mainnet-beta' | 'testnet' | 'devnet';

export interface SendTransactionParams {
  fromKeypair: Keypair;
  toAddress: string;
  amount: number; // In SOL
  priorityFee?: number; // In microLamports
}

export interface SendTokenParams {
  fromKeypair: Keypair;
  toAddress: string;
  tokenMintAddress: string;
  amount: number;
  decimals: number;
}

export class SolanaService {
  private connection: Connection;
  private network: NetworkType;
  private endpoint: string;

  constructor(network: NetworkType = 'devnet', customEndpoint?: string) {
    this.network = network;
    this.endpoint = customEndpoint || clusterApiUrl(network);
    this.connection = new Connection(this.endpoint, 'confirmed');
  }

  /**
   * Change the network connection
   */
  public setNetwork(network: NetworkType, customEndpoint?: string): void {
    this.network = network;
    this.endpoint = customEndpoint || clusterApiUrl(network);
    this.connection = new Connection(this.endpoint, 'confirmed');
  }

  /**
   * Get the SOL balance for an address
   */
  public async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get all token balances for an address
   */
  public async getTokenBalances(address: string) {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: splToken.TOKEN_PROGRAM_ID }
      );

      return tokenAccounts.value.map(account => {
        const parsedAccountInfo = account.account.data.parsed.info;
        const mintAddress = parsedAccountInfo.mint;
        const tokenBalance = parsedAccountInfo.tokenAmount.uiAmount;
        const decimals = parsedAccountInfo.tokenAmount.decimals;

        return {
          mint: mintAddress,
          balance: tokenBalance,
          decimals,
          address: account.pubkey.toBase58()
        };
      });
    } catch (error) {
      console.error('Error getting token balances:', error);
      throw error;
    }
  }

  /**
   * Send SOL from one account to another
   */
  public async sendTransaction(params: SendTransactionParams): Promise<TransactionSignature> {
    const { fromKeypair, toAddress, amount, priorityFee } = params;
    
    try {
      // Convert amount from SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // Create transaction instructions
      const instructions: TransactionInstruction[] = [
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports
        })
      ];
      
      // Add priority fee if specified
      if (priorityFee) {
        instructions.unshift(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: priorityFee
          })
        );
      }
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      
      // Create transaction
      const transaction = new Transaction({
        feePayer: fromKeypair.publicKey,
        blockhash,
        lastValidBlockHeight
      }).add(...instructions);
      
      // Sign and send
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );
      
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Send tokens from one account to another
   */
  public async sendToken(params: SendTokenParams): Promise<TransactionSignature> {
    const { fromKeypair, toAddress, tokenMintAddress, amount, decimals } = params;
    
    try {
      const mint = new PublicKey(tokenMintAddress);
      const toPublicKey = new PublicKey(toAddress);
      
      // Find associated token accounts
      const fromTokenAccount = await splToken.getAssociatedTokenAddress(
        mint,
        fromKeypair.publicKey
      );
      
      const toTokenAccount = await splToken.getAssociatedTokenAddress(
        mint,
        toPublicKey
      );
      
      // Check if destination token account exists
      const toTokenAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
      
      const instructions: TransactionInstruction[] = [];
      
      // Create destination token account if it doesn't exist
      if (!toTokenAccountInfo) {
        instructions.push(
          splToken.createAssociatedTokenAccountInstruction(
            fromKeypair.publicKey,
            toTokenAccount,
            toPublicKey,
            mint
          )
        );
      }
      
      // Calculate token amount with decimals
      const tokenAmount = amount * Math.pow(10, decimals);
      
      // Add transfer instruction
      instructions.push(
        splToken.createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromKeypair.publicKey,
          BigInt(Math.floor(tokenAmount))
        )
      );
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      
      // Create transaction
      const transaction = new Transaction({
        feePayer: fromKeypair.publicKey,
        blockhash,
        lastValidBlockHeight
      }).add(...instructions);
      
      // Sign and send
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );
      
      return signature;
    } catch (error) {
      console.error('Error sending tokens:', error);
      throw error;
    }
  }

  /**
   * Request an airdrop of SOL (devnet and testnet only)
   */
  public async requestAirdrop(address: string, amount: number = 1): Promise<string> {
    if (this.network === 'mainnet-beta') {
      throw new Error('Airdrops are not available on mainnet');
    }

    try {
      const publicKey = new PublicKey(address);
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for an address
   */
  public async getTransactionHistory(address: string, limit: number = 20) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getParsedTransaction(sig.signature);
          return {
            signature: sig.signature,
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : '',
            status: sig.confirmationStatus,
            fee: tx?.meta?.fee ? tx.meta.fee / LAMPORTS_PER_SOL : 0,
            data: tx
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Simulate a transaction before sending it
   */
  public async simulateTransaction(transaction: Transaction, signers: Keypair[]): Promise<boolean> {
    try {
      // Sign the transaction
      transaction.sign(...signers);

      // Simulate the transaction
      const simulation = await this.connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        console.error('Transaction simulation failed:', simulation.value.err);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error simulating transaction:', error);
      return false;
    }
  }

  /**
   * Get the current network fee estimate
   */
  public async getEstimatedFee(instructions: TransactionInstruction[]): Promise<number> {
    try {
      // Create a dummy keypair for fee estimation
      const keypair = Keypair.generate();
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      
      // Create message
      const message = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash,
        instructions
      }).compileToV0Message();
      
      // Get fee
      const fee = await this.connection.getFeeForMessage(message);
      
      return (fee.value ?? 5000) / LAMPORTS_PER_SOL; // Default to 5000 lamports if null
    } catch (error) {
      console.error('Error estimating fee:', error);
      return 0.000005; // Default estimate
    }
  }

  /**
   * Check if an account exists
   */
  public async accountExists(address: string): Promise<boolean> {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create and sign a message for authentication
   */
  public signMessage(message: string, keypair: Keypair): Uint8Array {
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached(messageBytes, keypair.secretKey);
  }
} 