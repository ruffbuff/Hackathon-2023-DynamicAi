// src/pages/Collection.tsx
import React, { useState, useEffect } from 'react';
import './Collection.css';

interface NFT {
  name: string;
  image: {
    cachedUrl: string;
  };
}

function Collection() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0xAA965E54E848ac02d7531Df3FCcf6751F7983920&withMetadata=true', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      const fetchedNfts = data.nfts.map((nft: any) => ({
        name: nft.name,
        image: nft.image
      }));
      setNfts(fetchedNfts);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <div className="collection-container">
      {nfts.map((nft, index) => (
        <div key={index} className="nft-card">
          <img src={nft.image.cachedUrl} alt={`NFT ${index}`} />
          <div className="nft-name">{nft.name}</div>
        </div>
      ))}
    </div>
  );
}

export default Collection;
