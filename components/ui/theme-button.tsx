"use client";

import * as React from "react";
import { Moon, Sun, Stars } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === "dark" || 
    (theme === "system" && typeof window !== "undefined" && 
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 hover:shadow-md transition-shadow duration-200"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDarkMode ? (
              <motion.div
                key="dark-icon"
                initial={{ y: 20, opacity: 0, rotate: -30 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  {/* Moon with gradient */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-900 via-purple-800 to-indigo-700 opacity-80" />
                  <Moon className="h-5 w-5 text-indigo-100 relative z-10" />
                  
                  {/* Stars around the moon */}
                  <motion.div
                    className="absolute -top-1 -left-2 w-1.5 h-1.5 bg-yellow-200 rounded-full"
                    animate={{
                      opacity: [0.2, 0.9, 0.2],
                      scale: [0.8, 1.2, 0.8],
                      rotate: [0, 45, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-yellow-200 rounded-full"
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.8, 1.3, 0.8],
                      rotate: [0, -45, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="absolute top-0 right-0 w-1 h-1 bg-yellow-200 rounded-full"
                    animate={{
                      opacity: [0.2, 0.9, 0.2],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  />
                  
                  {/* Moon glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-full blur-sm bg-purple-600/30"
                    animate={{
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="light-icon"
                initial={{ y: -20, opacity: 0, rotate: 30 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: -30 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  {/* Sun with gradient */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300" />
                  <Sun className="h-5 w-5 text-amber-50 relative z-10 drop-shadow-sm" />
                  
                  {/* Sun rays */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-400/30"
                    animate={{ 
                      scale: [1, 1.6, 1], 
                      opacity: [0.3, 0, 0.3],
                      rotate: [0, 90, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Second layer of rays with offset timing */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-400/20"
                    animate={{ 
                      scale: [1.2, 1.8, 1.2], 
                      opacity: [0.2, 0, 0.2],
                      rotate: [45, 135, 45]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  
                  {/* Sun glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-full blur-sm bg-amber-400/40"
                    animate={{
                      opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer group">
          <motion.div
            className="mr-2 flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="h-4 w-4 text-amber-500 group-hover:text-amber-600" />
          </motion.div>
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer group">
          <motion.div
            className="mr-2 flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Moon className="h-4 w-4 text-purple-500 group-hover:text-purple-600" />
          </motion.div>
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer group">
          <motion.div
            className="mr-2 flex items-center justify-center"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300 flex">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V10C20 11.1046 19.1046 12 18 12H6C4.89543 12 4 11.1046 4 10V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 16C14 16 15 17 16 17C17 17 18 16 18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 16C6 16 7 17 8 17C9 17 10 16 10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </motion.div>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
