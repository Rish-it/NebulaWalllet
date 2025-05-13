"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";

interface ResourceCardProps {
  title: string;
  description: string;
  link: string;
  image?: string;
  video?: string;
}

const ResourceCard = ({ title, description, link, image, video }: ResourceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex flex-col rounded-3xl overflow-hidden border border-purple-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        {video ? (
          <video
            src={video}
            autoPlay={isHovered}
            loop
            muted
            playsInline
            className="absolute inset-0 object-cover w-full h-full"
            poster={image}
          />
        ) : image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-100 flex items-center justify-center dark:bg-gray-800">
            <span className="text-purple-600 font-bold dark:text-purple-400">{title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-grow bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <h3 className="text-xl font-bold text-slate-800 mb-2 dark:text-gray-100">{title}</h3>
        <p className="text-slate-600 flex-grow dark:text-gray-300">{description}</p>
        <Button 
          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full py-6 dark:bg-purple-500 dark:hover:bg-purple-600" 
          asChild
        >
          <a href={link} target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
        </Button>
      </div>
    </div>
  );
};

export default function ResourcesCards() {
  const resources = [
    {
      title: "What is Web3?",
      description: "Learn about the decentralized web and how it's different from the traditional internet.",
      link: "https://ethereum.org/en/web3/",
      image: "/web.png"
    },
    {
      title: "Blockchain Basics",
      description: "Understand how blockchain technology powers cryptocurrencies and decentralized applications.",
      link: "https://ethereum.org/en/developers/docs/intro-to-ethereum/",
      video: "/blockchain.mp4"
    },
    {
      title: "NFT World",
      description: "Discover how non-fungible tokens are revolutionizing digital ownership and creativity.",
      link: "https://ethereum.org/en/nft/",
      video: "/nft.mp4"
    },
    {
      title: "Decentralized Exchange",
      description: "Learn how to swap tokens without intermediaries using decentralized exchanges.",
      link: "https://ethereum.org/en/defi/",
      video: "/exchange.mp4",
      image: "/currency.png"
    }
  ];

  return (
    <div id="resources" className="py-16 bg-gradient-to-br from-white to-purple-50 rounded-3xl my-10 dark:from-gray-900 dark:to-gray-800">
      <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center dark:text-gray-100">Learn About Web3</h2>
      <p className="text-slate-600 mb-10 text-center max-w-2xl mx-auto dark:text-gray-300">Discover resources to help you navigate the decentralized web and make the most of your digital wallet.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {resources.map((resource, index) => (
          <ResourceCard key={index} {...resource} />
        ))}
      </div>
    </div>
  );
} 