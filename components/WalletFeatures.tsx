"use client";

import { ArrowRightLeft, CreditCard, DollarSign, Lightbulb, Lock, ShieldCheck, Construction, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  inDev?: boolean;
  link?: string;
}

const FeatureCard = ({ title, description, icon, comingSoon, inDev, link }: FeatureCardProps) => {
  const cardContent = (
    <div className={`flex flex-col p-8 rounded-3xl border ${comingSoon ? 'border-purple-200' : inDev ? 'border-amber-200' : 'border-purple-300'} bg-gradient-to-b from-white to-purple-50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full dark:from-gray-900 dark:to-gray-800 dark:border-gray-700`}>
      {comingSoon && (
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100 rounded-full flex items-end justify-start p-3 dark:bg-gray-800">
          <div className="flex items-center gap-1 text-xs font-medium text-purple-600 rotate-45 ml-3 dark:text-purple-400">
            <Construction size={14} />
            <span>Coming Soon</span>
          </div>
        </div>
      )}
      
      {inDev && (
        <div className="absolute right-3 top-3">
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full dark:bg-amber-900 dark:text-amber-300">
            <Construction size={12} />
            <span>In Development</span>
          </div>
        </div>
      )}
      
      <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 dark:bg-gray-800">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3 dark:text-gray-100">{title}</h3>
      <p className="text-slate-600 mb-4 dark:text-gray-300">{description}</p>
      
      {link && !comingSoon && !inDev ? (
        <Button 
          className="mt-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center gap-2 dark:bg-purple-500 dark:hover:bg-purple-600"
          asChild
        >
          <Link href={link}>
            Explore
            <ExternalLink size={16} />
          </Link>
        </Button>
      ) : comingSoon ? (
        <div className="mt-auto pt-2 border-t border-purple-100 flex items-center justify-between dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-purple-300 animate-pulse dark:bg-purple-400"></div>
            <span className="text-sm text-purple-600 dark:text-purple-400">In Development</span>
          </div>
          <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 h-8 rounded-full dark:text-purple-400 dark:hover:bg-gray-800">
            <Construction size={16} />
          </Button>
        </div>
      ) : inDev ? (
        <div className="mt-auto pt-2 border-t border-amber-100 flex items-center justify-between dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-300 animate-pulse dark:bg-amber-400"></div>
            <span className="text-sm text-amber-700 dark:text-amber-400">Testing Phase</span>
          </div>
          <Button 
            variant="ghost" 
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-2 h-8 rounded-full dark:text-amber-400 dark:hover:bg-gray-800"
            asChild
          >
            <Link href={link || "#"}>
              <ExternalLink size={16} />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-auto pt-3">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full dark:bg-purple-500 dark:hover:bg-purple-600">
            Get Started
          </Button>
        </div>
      )}
    </div>
  );

  if (link && !comingSoon && !inDev) {
    return (
      <Link href={link} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default function WalletFeatures() {
  const features = [
    {
      title: "Buy Crypto",
      description: "Purchase cryptocurrency directly with your bank account or credit card.",
      icon: <DollarSign className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      link: "#wallet",
      inDev: true,
    },
    {
      title: "Swap Tokens",
      description: "Exchange one cryptocurrency for another with competitive rates.",
      icon: <ArrowRightLeft className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      link: "#wallet",
      inDev: true,
    },
    {
      title: "Card Payments",
      description: "Spend your crypto for everyday purchases with our integrated card.",
      icon: <CreditCard className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      comingSoon: true,
    },
    {
      title: "Self-Custody",
      description: "Full control of your private keys and digital assets at all times.",
      icon: <Lock className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      link: "#wallet",
    },
    {
      title: "Security First",
      description: "Industry-leading security protocols to keep your assets safe in Web3.",
      icon: <ShieldCheck className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      link: "https://ethereum.org/en/security/",
    },
    {
      title: "Learn & Earn",
      description: "Expand your knowledge and earn rewards through educational content.",
      icon: <Lightbulb className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
      link: "#resources",
    },
  ];

  return (
    <div id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-3 dark:text-gray-100">Everything You Need in a Wallet</h2>
        <p className="text-slate-600 max-w-2xl mx-auto dark:text-gray-300">
          A complete set of tools to manage your digital assets with confidence and ease.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
} 