import React, { useState, useEffect } from 'react';
import './Collection2.css';

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface NFT {
  name: string;
  image: { cachedUrl: string };
  attributes: Attribute[];
}

function Collection2() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  const fetchNFTs = async () => {
    try {
      const response = await fetch('https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForCollection?contractAddress=0x0fc0fAC7857c85908F74909B0eF84Bd08Def1f9B&withMetadata=true', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      // console.log('data:', data);
      const fetchedNfts = data.nfts.map((nft: any) => ({
        name: nft.name,
        image: nft.image,
        attributes: nft.raw.metadata.attributes
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
          <div className="nft-attributes">
            {nft.attributes.map((attribute, attrIndex) => (
              <div key={attrIndex} className="nft-attribute">
                <strong>{attribute.trait_type}:</strong> {attribute.value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Collection2;