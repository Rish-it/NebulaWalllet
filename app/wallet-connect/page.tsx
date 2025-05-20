"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function WalletConnectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'connecting' | 'success' | 'error'>('connecting');
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // In a real implementation, this would establish a connection with the main app
    // using the session ID and WebSocket or another real-time communication method
    const connectWallet = async () => {
      try {
        // Simulate connection process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // This would be an actual connection verification
        // For demo purposes, we'll just simulate success
        setStatus('success');
        
        // Redirect back to main app after successful connection
        setTimeout(() => {
          router.push('/?connected=mobile');
        }, 1500);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setStatus('error');
      }
    };

    if (sessionId) {
      connectWallet();
    } else {
      setStatus('error');
    }
  }, [sessionId, router]);

  return (
    <div className="bg-card p-8 rounded-xl shadow-lg max-w-md w-full text-center">
      {status === 'connecting' && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connecting Wallet</h1>
          <p className="text-muted-foreground mb-4">Establishing secure connection to your mobile wallet...</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Connected Successfully!</h1>
          <p className="text-muted-foreground mb-4">Redirecting back to app...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
          <p className="text-muted-foreground mb-4">Unable to establish connection to your wallet.</p>
          <Button onClick={() => router.push('/')} className="mt-2">
            Return to App
          </Button>
        </>
      )}
    </div>
  );
}

// Loading fallback to display while the component is suspended
function WalletConnectLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        <p className="text-muted-foreground mb-4">Preparing connection interface...</p>
      </div>
    </div>
  );
}

export default function WalletConnectPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<WalletConnectLoader />}>
        <WalletConnectContent />
      </Suspense>
    </div>
  );
} 