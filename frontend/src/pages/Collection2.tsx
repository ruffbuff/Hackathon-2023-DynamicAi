// src/pages/Collection2.tsx
import React, { useState, useEffect } from 'react';
import './Collection2.css';

interface NFT {
  name: string;
  image: { cachedUrl: string };
}

function Collection2() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  const fetchNFTs = async () => {
    try {
      const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0xe78cBb05077B6Fd6e9c68352Ac496507eCC31F7C&withMetadata=true', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      const fetchedNfts = data.nfts.map((nft: any) => ({
        name: nft.name,
        image: nft.image
      }));
      setNfts(fetchedNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  useEffect(() => {
    fetchNFTs().catch(console.error);
  }, []);

  return (
    <div className="collection2-container">
      {nfts.map((nft, index) => (
        <div key={index} className="nft-card">
          <img src={nft.image.cachedUrl} alt={`NFT ${index}`} />
          <div className="nft-name">{nft.name}</div>
        </div>
      ))}
    </div>
  );
}

export default Collection2;
