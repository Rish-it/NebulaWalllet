import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { SolanaWalletProvider } from "@/context/SolanaWalletProvider";
import { EthereumWalletProvider } from "@/context/EthereumWalletProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/themeprovider";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import SolanaWalletConnector from "@/components/SolanaWalletConnector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NebulaWallet",
  description: "A secure wallet for managing digital assets across multiple blockchains",
  icons: {
    icon: [
      { url: "/nebula.png", sizes: "192x192", type: "image/png" },
      { url: "/nebula.png", sizes: "64x64", type: "image/png" },
      { url: "/nebula.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/nebula.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/nebula.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/nebula.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <EthereumWalletProvider>
            <SolanaWalletProvider>
              <WalletProvider>
                <AnimatedPageWrapper>{children}</AnimatedPageWrapper>
                <SolanaWalletConnector />
                <Toaster position="top-right" />
              </WalletProvider>
            </SolanaWalletProvider>
          </EthereumWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
