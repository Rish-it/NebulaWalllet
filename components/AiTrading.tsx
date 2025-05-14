'use client'

import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { ArrowRight, ArrowDownUp, Loader2, Zap, Bot, BarChart4, Sparkles, Play, CheckCircle2 } from 'lucide-react'

export default function AiTrading() {
  const { isConnected, account, balance, walletType } = useWallet()
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [processingTrade, setProcessingTrade] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video playback
  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }

  // Handle video error
  const handleVideoError = () => {
    setVideoError(true)
  }

  // Simulated trade execution
  const executeTradeDemo = () => {
    setProcessingTrade(true)
    setDemoStep(1)
    
    // Simulate API call delay
    setTimeout(() => {
      setDemoStep(2)
      
      // Simulate AI analysis
      setTimeout(() => {
        setDemoStep(3)
        setIsTyping(true)
        
        // Simulate typing suggestion
        const suggestion = "Based on current market conditions, I recommend swapping ETH for SOL with a 70/30 split. SOL is showing bullish momentum while BTC may consolidate."
        let displayedText = ''
        let index = 0
        
        const typingInterval = setInterval(() => {
          if (index < suggestion.length) {
            displayedText += suggestion[index]
            setAiSuggestion(displayedText)
            index++
          } else {
            clearInterval(typingInterval)
            setIsTyping(false)
            
            // Move to confirmation step
            setTimeout(() => {
              setDemoStep(4)
              
              // Final execution step
              setTimeout(() => {
                setDemoStep(5)
                setProcessingTrade(false)
              }, 2000)
            }, 1500)
          }
        }, 30)
      }, 1500)
    }, 1500)
  }

  // Reset demo
  const resetDemo = () => {
    setDemoStep(0)
    setAiSuggestion('')
    setUserInput('')
  }

  // Handle waitlist submission
  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      console.log('Waitlist email submitted:', email)
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setEmail('')
      }, 3000)
    }, 1000)
  }

  return (
    <section id="ai-trading" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text leading-tight mb-4">
            AI-Powered Trading <span className="text-sm bg-yellow-500 text-black px-2 py-1 rounded-full align-top">Coming Soon</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Experience the future of crypto trading with our AI assistant. Simply describe your trade in natural language and let our AI handle the complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md dark:bg-gray-800 border dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Bot className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="text-xl font-semibold">Natural Language Trading</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Trade cryptocurrencies using simple instructions:
              </p>
              <div className="space-y-3 text-sm">
                <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
                  "Swap 0.5 ETH to SOL at market price"
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
                  "Set a limit order to buy BTC at $40,000"
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
                  "Find the best yield for my USDC"
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md dark:bg-gray-800 border dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="text-xl font-semibold">AI Market Intelligence</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Our AI analyzes market conditions to suggest optimal trading strategies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li>Sentiment analysis from social media</li>
                <li>Technical indicator monitoring</li>
                <li>Historical pattern recognition</li>
                <li>On-chain activity analysis</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-blue-500">
                <h3 className="text-white font-semibold">Nebula AI Trading Assistant</h3>
                <span className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full">Beta</span>
              </div>
              
              <div className="h-96 overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
                {!showDemo ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    {videoError ? (
                      <div className="w-[320px] h-[240px] mb-6 bg-purple-600 rounded-lg shadow-md flex items-center justify-center">
                        <span className="text-white text-lg font-medium">AI Trading Visualization</span>
                      </div>
                    ) : (
                      <div className="relative mb-6 rounded-lg overflow-hidden shadow-md">
                        <video 
                          ref={videoRef}
                          width="320" 
                          height="240"
                          className="rounded-lg object-cover w-full h-full"
                          onError={handleVideoError}
                          loop
                          muted
                          playsInline
                        >
                          <source src="/mcp.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        {!isPlaying && (
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                            onClick={toggleVideoPlayback}
                          >
                            <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                              <Play className="w-6 h-6 text-purple-600 ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <h4 className="text-xl font-semibold mb-2">Experience AI Trading Demo</h4>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      See how natural language trading works with our interactive demo
                    </p>
                    <button 
                      onClick={() => setShowDemo(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                      Start Demo <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <div className="flex items-start">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                          <Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-300">
                            Hello! I'm your Nebula AI trading assistant. I can help you trade cryptocurrencies, analyze market trends, and optimize your portfolio. What would you like to do today?
                          </p>
                        </div>
                      </div>
                    </div>

                    {demoStep >= 1 && (
                      <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm ml-12">
                        <p className="text-slate-700 dark:text-slate-200">
                          I want to trade some of my {walletType === 'ethereum' ? 'ETH' : 'SOL'} based on current market conditions. What do you recommend?
                        </p>
                      </div>
                    )}

                    {demoStep >= 2 && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="flex items-start">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-300 mb-3">
                              I'll analyze the current market for you. One moment please...
                            </p>
                            {demoStep === 2 && (
                              <div className="flex items-center text-sm text-purple-600 dark:text-purple-300">
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Analyzing market data...
                              </div>
                            )}
                            {demoStep >= 3 && (
                              <div className="px-3 py-2 bg-purple-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center mb-1">
                                  <BarChart4 className="w-4 h-4 text-purple-600 dark:text-purple-300 mr-1" />
                                  <span className="text-sm font-medium text-purple-600 dark:text-purple-300">Market Analysis</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">
                                  {aiSuggestion}
                                  {isTyping && <span className="inline-flex ml-1 w-1 h-4 bg-purple-600 dark:bg-purple-300 animate-pulse rounded-full"></span>}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {demoStep >= 4 && (
                      <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm ml-12">
                        <p className="text-slate-700 dark:text-slate-200">
                          That sounds good. Let's proceed with the trade as you suggested.
                        </p>
                      </div>
                    )}

                    {demoStep >= 5 && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="flex items-start">
                          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-300 mb-3">
                              I've executed the swap! Here's a summary of your transaction:
                            </p>
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-green-700 dark:text-green-300 font-medium">Transaction Complete</span>
                                <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Success</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                    <span className="font-medium text-xs">ETH</span>
                                  </div>
                                  <span>0.7 ETH</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                                    <span className="font-medium text-xs">SOL</span>
                                  </div>
                                  <span>24.5 SOL</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Transaction hash: 0x7d21...f8a3
                              </div>
                            </div>
                            <button 
                              onClick={resetDemo}
                              className="mt-4 text-purple-600 dark:text-purple-300 text-sm hover:underline flex items-center"
                            >
                              <ArrowDownUp className="w-4 h-4 mr-1" /> Try another trade
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t dark:border-gray-700">
                {!showDemo ? (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Start the demo to see how AI trading works
                  </div>
                ) : (
                  <div className="flex">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={demoStep === 0 ? "Type your trading request..." : ""}
                      disabled={demoStep !== 0}
                      className="flex-1 py-2 px-4 rounded-l-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      onClick={demoStep === 0 ? executeTradeDemo : undefined}
                      disabled={processingTrade || (demoStep === 0 && !userInput)}
                      className={`py-2 px-4 flex items-center rounded-r-lg ${
                        processingTrade || (demoStep === 0 && !userInput)
                          ? 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } transition-colors`}
                    >
                      {processingTrade ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {demoStep === 0 ? "Send" : demoStep === 5 ? "Done" : "Next"}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-purple-100 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 md:p-8">
          <div className="mb-6 md:mb-0 md:mr-6">
            <h3 className="text-2xl font-bold mb-2">Looking for more powerful trading tools?</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Join our waitlist to be the first to access our AI trading features when they launch.
            </p>
          </div>
          {isSubmitted ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Thank you for joining!</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
} 