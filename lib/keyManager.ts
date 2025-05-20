import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

/**
 * Key encryption and management utility for secure wallet operations
 */
export class KeyManager {
  /**
   * Generates a BIP39 mnemonic phrase
   * @param strength 128 bits for 12 words, 256 bits for 24 words
   * @returns The mnemonic phrase
   */
  static generateMnemonic(strength: 128 | 256 = 128): string {
    return generateMnemonic(strength);
  }

  /**
   * Validates if a mnemonic phrase is valid
   * @param mnemonic The mnemonic phrase to validate
   * @returns True if valid, false if invalid
   */
  static validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic);
  }

  /**
   * Derives a Solana keypair from a mnemonic phrase
   * @param mnemonic BIP39 mnemonic phrase
   * @param accountIndex The account index to derive
   * @returns Solana keypair
   */
  static deriveSolanaKeypair(mnemonic: string, accountIndex: number = 0): Keypair {
    const seedBuffer = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
    
    const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
    return Keypair.fromSecretKey(secretKey);
  }

  /**
   * Encrypts sensitive data using AES-GCM
   * @param data The data to encrypt
   * @param password The password to derive encryption key from
   * @returns Encrypted data as a string
   */
  static async encryptData(data: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 100000;
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);
    
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedData
    );
    
    const encryptedBuffer = new Uint8Array(
      salt.byteLength + iv.byteLength + encryptedContent.byteLength
    );
    encryptedBuffer.set(salt, 0);
    encryptedBuffer.set(iv, salt.byteLength);
    encryptedBuffer.set(
      new Uint8Array(encryptedContent), 
      salt.byteLength + iv.byteLength
    );
    
    // Use a safer way to convert to base64 that doesn't require spread operator with Uint8Array
    return btoa(Array.from(encryptedBuffer)
      .map(byte => String.fromCharCode(byte))
      .join(''));
  }

  /**
   * Decrypts data encrypted with encryptData
   * @param encryptedData Base64-encoded encrypted data
   * @param password The password used for encryption
   * @returns The decrypted data as a string
   */
  static async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      const encryptedBuffer = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      
      const salt = encryptedBuffer.slice(0, 16);
      const iv = encryptedBuffer.slice(16, 16 + 12);
      const encryptedContent = encryptedBuffer.slice(16 + 12);
      
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );
      
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encryptedContent
      );
      
      return new TextDecoder().decode(decryptedContent);
    } catch (error) {
      throw new Error("Decryption failed: Invalid password or corrupted data");
    }
  }

  /**
   * Securely stores a wallet in localStorage with encryption
   * @param mnemonic The wallet's mnemonic phrase
   * @param password The encryption password
   * @param name Optional wallet name
   */
  static async storeWallet(
    mnemonic: string, 
    password: string, 
    name: string = "Default Wallet"
  ): Promise<void> {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    const encryptedMnemonic = await this.encryptData(mnemonic, password);
    
    const keypair = this.deriveSolanaKeypair(mnemonic);
    const publicKey = keypair.publicKey.toBase58();
    
    const wallet = {
      id: crypto.randomUUID(),
      name,
      publicKey,
      encryptedMnemonic,
      createdAt: new Date().toISOString(),
    };
    
    const wallets = JSON.parse(localStorage.getItem("nebula_wallets") || "[]");
    wallets.push(wallet);
    localStorage.setItem("nebula_wallets", JSON.stringify(wallets));
  }

  /**
   * Retrieves and decrypts a wallet by public key
   * @param publicKey The wallet's public key
   * @param password The decryption password
   * @returns The decrypted mnemonic
   */
  static async getWalletMnemonic(publicKey: string, password: string): Promise<string> {
    const wallets = JSON.parse(localStorage.getItem("nebula_wallets") || "[]");
    const wallet = wallets.find((w: any) => w.publicKey === publicKey);
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    return await this.decryptData(wallet.encryptedMnemonic, password);
  }
} 