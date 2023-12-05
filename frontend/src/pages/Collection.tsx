import React, { useState, useEffect } from 'react';
import { ethers, BigNumber } from 'ethers';
import { contracts } from '../sol/contracts';
import './Collection.css';

interface NFT {
  tokenId: string;
  name: string;
  image: { cachedUrl: string };
  burnTime: number;
  remainingTime: string;
}

const calculateRemainingTime = (burnTime: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = burnTime - now;

  if (timeLeft <= 0) {
    return 'Burn time passed';
  }

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const updateRemainingTime = (nfts: NFT[]): NFT[] => {
  return nfts.map(nft => ({
    ...nft,
    remainingTime: calculateRemainingTime(nft.burnTime)
  }));
};

function Collection() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contracts.weatherContract.address, contracts.weatherContract.abi, provider);
        const [, tokenIds, burnTimes] = await contract.getAllTokenBurnTimes();

        const tokenBurnTimesMap = new Map<string, number>();
        tokenIds.forEach((tokenId: BigNumber, index: number) => {
          tokenBurnTimesMap.set(tokenId.toString(), burnTimes[index].toNumber());
        });

        const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0x3DE661c7cDc964be6E584710d5627446f4770142&withMetadata=true', {
          method: 'GET',
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();

        const initialNfts = data.nfts
          .filter((nft: any) => tokenBurnTimesMap.has(nft.tokenId))
          .map((nft: any) => ({
            tokenId: nft.tokenId,
            name: nft.name,
            image: nft.image,
            burnTime: tokenBurnTimesMap.get(nft.tokenId)
          }));

        setNfts(updateRemainingTime(initialNfts));
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchNFTs();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNfts(currentNfts => updateRemainingTime(currentNfts));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="collection-container">
      {nfts.map((nft, index) => (
        <div key={index} className="nft-card">
          <img src={nft.image.cachedUrl} alt={`NFT ${nft.name}`} />
          <div className="nft-name">{nft.name}</div>
          <div className="nft-timer">
            {nft.burnTime ? calculateRemainingTime(nft.burnTime) : 'No burn time set'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Collection;