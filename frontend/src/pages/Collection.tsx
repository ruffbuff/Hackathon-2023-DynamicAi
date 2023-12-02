// src/pages/Collection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contracts } from '../sol/contracts';
import './Collection.css';

interface NFT {
  name: string;
  image: { cachedUrl: string };
  burnTime: number;
  holder: string;
}

function Collection() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [hoveredNftIndex, setHoveredNftIndex] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState('');

  const calculateRemainingTime = (burnTime: number) => {
    const now = Date.now() / 1000;
    const timeLeft = burnTime - now;

    if (timeLeft <= 0) {
      return 'Burn time passed';
    }

    const days = Math.floor(timeLeft / (3600 * 24));
    const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = Math.floor(timeLeft % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const fetchBurnTimes = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contracts.weatherContract.address, contracts.weatherContract.abi, provider);
      const [, , burnTimes] = await contract.getAllTokenBurnTimes();
      return burnTimes.map((time: ethers.BigNumber) => time.toNumber());
    } catch (error) {
      console.error('Error fetching burn times:', error);
      return [];
    }
  };

  const fetchNFTs = useCallback(async () => {
    try {
      const burnTimes = await fetchBurnTimes();

      if (burnTimes.length === 0) {
        return;
      }

      const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0xF894116408b1929794233C4B9EF866b6420bB851&withMetadata=true', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      const fetchedNfts = data.nfts.map((nft: any, index: number) => ({
        name: nft.name,
        image: nft.image,
        burnTime: burnTimes[index],
        holder: nft.owner
      }))
      .filter((nft: NFT) => nft.holder && nft.holder !== '0x0000000000000000000000000000000000000000' && nft.holder.toLowerCase() !== 'dead');

      setNfts(fetchedNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }, []);  

  useEffect(() => {
    fetchNFTs().catch(console.error);
  }, [fetchNFTs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hoveredNftIndex !== null) {
      setRemainingTime(calculateRemainingTime(nfts[hoveredNftIndex].burnTime));
      interval = setInterval(() => {
        setRemainingTime(calculateRemainingTime(nfts[hoveredNftIndex].burnTime));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hoveredNftIndex, nfts]);

  return (
    <div className="collection-container">
      {nfts.map((nft, index) => (
        <div 
          key={index} 
          className="nft-card"
          onMouseEnter={() => setHoveredNftIndex(index)}
          onMouseLeave={() => setHoveredNftIndex(null)}
        >
          <img src={nft.image.cachedUrl} alt={`NFT ${index}`} />
          <div className="nft-name">{nft.name}</div>
          {hoveredNftIndex === index && 
            <div className="timer">
              {remainingTime}
            </div>
          }
        </div>
      ))}
    </div>
  );
}

export default Collection;