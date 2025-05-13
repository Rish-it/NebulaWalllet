"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-purple-50 border-t border-purple-100 dark:from-gray-900 dark:to-gray-800 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-bold text-xl text-slate-800 mb-4 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Nebula Wallet</h3>
            </Link>
            <p className="text-slate-600 mb-6 dark:text-gray-300">Your secure gateway to the decentralized web and digital assets.</p>
            <div className="flex space-x-4">
              <Link href="https://github.com/rish-it" className="text-slate-500 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400" aria-label="GitHub">
                <Github size={20} />
              </Link>
              <Link href="https://x.com/irishit_sharma" className="text-slate-500 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 dark:text-gray-100">Products</h4>
            <ul className="space-y-3">
              <li><Link href="#wallet" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Wallet</Link></li>
              <li><Link href="#wallet" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Swaps</Link></li>
              <li><Link href="#wallet" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Buy Crypto</Link></li>
              <li><Link href="#market" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Portfolio</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 dark:text-gray-100">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#resources" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Learn</Link></li>
              <li><Link href="#features" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Features</Link></li>
              <li><Link href="https://ethereum.org/en/security/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Security</Link></li>
              <li><Link href="#resources" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">Community</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 dark:text-gray-100">Contact</h4>
            <div className="flex items-start space-x-3 mb-3">
              <Mail size={20} className="text-purple-600 mt-0.5 dark:text-purple-400" />
              <a href="mailto:rishitsharmar89@gmail.com" className="text-slate-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
                rishitsharmar89@gmail.com
              </a>
            </div>
            <p className="text-slate-600 mt-4 dark:text-gray-300">
              Designed and Developed by{" "}
              <a href="https://github.com/rish-it" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:text-purple-700 transition-colors dark:text-purple-400 dark:hover:text-purple-300">
                Rishit
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-purple-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm mb-4 md:mb-0 dark:text-gray-400">&copy; {currentYear} Nebula Wallet. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="#" className="text-sm text-slate-500 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400">Privacy Policy</Link>
              <Link href="#" className="text-sm text-slate-500 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400">Terms of Service</Link>
              <Link href="#" className="text-sm text-slate-500 hover:text-purple-600 transition-colors dark:text-gray-400 dark:hover:text-purple-400">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
