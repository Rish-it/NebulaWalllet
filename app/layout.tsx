import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/themeprovider";
import { WalletProvider } from "@/context/WalletContext";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nebula - Your Gateway to Web3",
  description: "A secure wallet for managing digital assets, connecting to decentralized applications, and exploring the blockchain ecosystem.",
  icons: [
    {
      rel: "icon",
      type: "image/x-icon",
      url: "/favicon-light.ico",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/png",
      url: "/favicon-dark.ico",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <Toaster />
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
