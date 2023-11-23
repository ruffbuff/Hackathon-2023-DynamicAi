// src/pages/Collection.tsx
import React, { useState, useEffect } from 'react';
import './Collection.css';

interface NFT {
  image: {
    cachedUrl: string;
  };
}

function Collection() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0x278d618fF458Ec8896155f8DFc3166703A41F289&withMetadata=true', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      const fetchedNfts = data.nfts.map((nft: any) => ({
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
        </div>
      ))}
    </div>
  );
}

export default Collection;
