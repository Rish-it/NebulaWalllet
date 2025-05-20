"use client";

import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useRouter } from 'next/navigation';

/**
 * SolanaWalletConnector - A component that provides the Solana wallet adapter button
 */
const SolanaWalletConnector: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          const modalWrapper = document.querySelector('.wallet-adapter-modal-wrapper');
          if (modalWrapper && !modalWrapper.querySelector('.nebula-wallet-logo')) {
            // Create the logo element
            const logoContainer = document.createElement('div');
            logoContainer.className = 'nebula-wallet-logo';
            logoContainer.onclick = () => router.push('/');
            
            // Create the image
            const img = document.createElement('img');
            img.src = '/nebula.png';
            img.alt = 'Nebula';
            img.width = 32;
            img.height = 32;
            
            // Create the text
            const span = document.createElement('span');
            span.textContent = 'Nebula Wallet';
            
            // Append elements
            logoContainer.appendChild(img);
            logoContainer.appendChild(span);
            
            // Add to modal
            modalWrapper.insertAdjacentElement('afterbegin', logoContainer);
          }
        }
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [router]);

  return (
    <>
      <style jsx global>{`
        /* Basic button styling */
        .wallet-adapter-button {
          background-color: hsl(var(--primary)) !important;
          border-radius: 9999px !important;
          font-family: inherit !important;
        }
        .wallet-adapter-button:hover {
          background-color: hsl(var(--primary) / 0.9) !important;
        }
        .wallet-adapter-button-trigger {
          background-color: hsl(var(--primary)) !important;
        }
        
        /* AGGRESSIVE TITLE FIXING */
        /* Step 1: Hide all header content */
        .wallet-adapter-modal-container * {
          visibility: visible;
        }
        
        /* Step 2: Reset modal title and hide it */
        .wallet-adapter-modal-title,
        .wallet-adapter-modal-wrapper div:first-child > div > div,
        .wallet-adapter-modal-container p,
        .wallet-adapter-modal-container h1,
        .wallet-adapter-modal-header h1 {
          opacity: 0 !important;
          height: 0 !important;
          position: absolute !important;
          font-size: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          visibility: hidden !important;
        }
        
        /* Step 3: Add our own title to the header */
        .wallet-adapter-modal-header::before {
          content: "Pick Your Wallet" !important;
          display: block !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          margin: 1rem auto 1rem !important;
          padding: 0 !important;
          color: hsl(var(--foreground)) !important;
          position: relative !important;
          line-height: 1 !important;
          text-align: center !important;
        }
        
        /* Modal styling - enhanced for better appearance */
        .wallet-adapter-modal-wrapper {
          background-color: hsl(var(--background)) !important;
          border-radius: 1.25rem !important;
          font-family: inherit !important;
          min-width: 360px !important;
          max-width: 480px !important;
          width: 90vw !important;
          box-sizing: border-box !important;
          padding: 3rem 1.5rem 0.75rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        /* Hide More Options section completely */
        .wallet-adapter-modal-list-more {
          display: none !important;
        }
        
        /* Hide expanded wallet list that appears after clicking More Options */
        .wallet-adapter-modal-list-more ~ div {
          display: none !important;
        }
        
        /* Wallet list */
        .wallet-adapter-modal-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.5rem !important;
          width: 100% !important;
          margin: 2rem 0 0.25rem !important;
        }
        
        /* When no wallet is connected, condense the empty footer space */
        .wallet-adapter-modal-list:last-child {
          margin-bottom: 0 !important;
        }
        
        /* Handle spacing when wallet not found */
        .wallet-adapter-modal-middle {
          margin-bottom: 0 !important;
        }
        
        /* Make the modal content more compact */
        .wallet-adapter-modal-wrapper-no-logo {
          padding-bottom: 0.5rem !important;
        }
        
        /* Wallet list items - enhanced styling */
        .wallet-adapter-modal-list-item {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-radius: 0.75rem !important;
          padding: 0.875rem 1.125rem !important;
          border: 1px solid hsl(var(--border)) !important;
          transition: all 0.2s ease !important;
          background-color: hsl(var(--card)) !important;
          position: relative !important;
          width: 100% !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
        }
        
        .wallet-adapter-modal-list-item:hover {
          border-color: hsl(var(--primary)) !important;
          background-color: hsl(var(--accent)) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04) !important;
        }

        /* Wallet info wrapper */
        .wallet-adapter-modal-list-item div:first-child {
          display: flex !important;
          align-items: center !important; 
          overflow: hidden !important;
          flex: 1 !important;
        }
        
        /* Wallet icons */
        .wallet-adapter-modal-list-item-icon {
          width: 32px !important;
          height: 32px !important;
          border-radius: 8px !important;
          margin-right: 1rem !important;
          background: white !important;
        }
        
        /* Wallet names */
        .wallet-adapter-modal-list-item-name {
          font-weight: 500 !important;
          color: hsl(var(--foreground)) !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          margin-right: 8px !important;
          max-width: 160px !important;
        }
        
        /* Hide descriptions to reduce clutter */
        .wallet-adapter-modal-list-item-description {
          display: none !important;
        }
        
        /* "Detected" label */
        .wallet-adapter-modal-list-item > span:last-of-type:not(.wallet-adapter-modal-list-item-name) {
          font-size: 0.7rem !important;
          background-color: hsl(var(--primary) / 0.1) !important;
          color: hsl(var(--primary)) !important;
          padding: 0.1rem 0.5rem !important;
          border-radius: 1rem !important;
          white-space: nowrap !important;
          margin-left: 8px !important;
          flex-shrink: 0 !important;
        }
        
        /* Modal content - ensure proper padding */
        .wallet-adapter-modal-container {
          padding: 0 !important;
        }
        
        .wallet-adapter-modal-content {
          padding: 0 !important;
          margin-top: 0 !important;
        }
        
        /* Fix any remaining text that might say "Solana" */
        .wallet-adapter-modal *::before,
        .wallet-adapter-modal *::after {
          content: normal !important;
        }
        
        /* Our custom ::before for the header is the only exception */
        .wallet-adapter-modal-header::before {
          content: "Pick Your Wallet" !important;
        }

        /* Fix the close button styling to exactly match other cards */
        .wallet-adapter-modal-button-close {
          background-color: transparent !important;
          color: hsl(var(--foreground)) !important;
          width: 2rem !important;
          height: 2rem !important;
          padding: 0.375rem !important;
          border-radius: 9999px !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          position: absolute !important;
          top: 1.5rem !important;
          right: 1.5rem !important;
          cursor: pointer !important;
          opacity: 0.7 !important;
        }

        .wallet-adapter-modal-button-close:hover {
          background-color: hsl(var(--primary) / 0.15) !important;
          color: hsl(var(--primary)) !important;
          opacity: 1 !important;
        }

        /* Fix the close button icon */
        .wallet-adapter-modal-button-close svg {
          width: 1.125rem !important;
          height: 1.125rem !important;
          stroke-width: 2px !important;
        }
        
        /* Make Nebula Wallet clickable to home */
        .nebula-wallet-logo {
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          position: absolute !important;
          top: 1.5rem !important;
          left: 1.5rem !important;
        }
        
        .nebula-wallet-logo img {
          width: 32px !important;
          height: 32px !important;
          object-fit: contain !important;
        }
        
        .nebula-wallet-logo span {
          font-weight: 600 !important;
          color: hsl(var(--primary)) !important;
        }

        .nebula-wallet-logo:hover span {
          text-decoration: underline !important;
        }
        
        /* Add Nebula Wallet label and styling */
        .wallet-adapter-modal-wrapper::before {
          content: "" !important;
          position: absolute !important;
          top: 1rem !important;
          left: 1rem !important;
          width: auto !important;
        }
      `}</style>
      
      {/* Hidden Solana wallet button for programmatic access */}
      <div className="absolute z-50 opacity-0 pointer-events-none">
        <WalletMultiButton className="solana-wallet-button" />
      </div>
    </>
  );
};

export default SolanaWalletConnector; 