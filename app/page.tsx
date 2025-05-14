import Navbar from "@/components/Navbar";
import WalletGenerator from "@/components/WalletGenerator";
import Iphone15Pro from "@/components/ui/iphone-15-pro";
import WalletHero from "@/components/WalletHero";
import WalletFeatures from "@/components/WalletFeatures";
import ResourcesCards from "@/components/ResourcesCards";
import CryptoStats from "@/components/CryptoStats";
import DeFiHub from "@/components/DeFiHub";
import AiTrading from "@/components/AiTrading";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-white min-h-screen dark:bg-gray-900">
      <Navbar />
      <main>
        <WalletHero />

        <div className="max-w-7xl mx-auto px-4">
          <div id="wallet" className="relative py-16 md:py-24">
            <div className="flex flex-col lg:flex-row items-start">
              <div className="w-full lg:w-1/2 mb-12 lg:mb-0 order-2 lg:order-1">
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold text-slate-800 mb-6 dark:text-gray-100">
                    Generate Your Web3 Wallet
                  </h2>
                  <p className="text-slate-600 mb-8 dark:text-gray-300">
                    Create a secure wallet in seconds to store your digital
                    assets and connect to decentralized applications. Take
                    control of your crypto journey.
                  </p>
                  <div className="bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden dark:bg-gray-900 dark:border-gray-700 px-4 py-4">
                    <WalletGenerator />
                  </div>
                </div>
              </div>

              <div className="relative w-full lg:w-1/2 h-[500px] flex items-center justify-center lg:justify-end order-1 lg:order-2 mb-10 lg:mb-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full opacity-30 blur-3xl dark:bg-purple-900 dark:opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full opacity-30 blur-3xl dark:bg-purple-900 dark:opacity-10"></div>
                <div className="hidden md:block">
                  <Iphone15Pro
                    className="scale-[0.7] lg:scale-[0.8] rotate-3 relative z-10"
                    videoSrc="/display.mp4"
                  />
                </div>
                <div className="md:hidden w-full px-5">
                  <div className="relative w-full h-64 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Mobile Preview
                      </h3>
                      <p className="text-white/80 text-sm">
                        Open on desktop to see the full wallet demo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <WalletFeatures />
          <CryptoStats />
          <DeFiHub />
          <AiTrading />
          <ResourcesCards />
        </div>
      </main>
      <Footer />
    </div>
  );
}
