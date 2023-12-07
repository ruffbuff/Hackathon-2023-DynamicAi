import React, { useState, useEffect, useCallback } from 'react';
import './Collection2.css';

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface NFT {
  name: string;
  image: { cachedUrl: string };
  attributes: Attribute[];
  tokenId: string;
}

interface NftHolders {
  [tokenId: string]: string;
}

function Collection2() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [nftHolders, setNftHolders] = useState<NftHolders>({});

  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  const fetchNftHolders = useCallback(async () => {
    const url = `https://polygon-mumbai.g.alchemy.com/nft/v2/${alchemyApiKey}/getOwnersForCollection?contractAddress=${contractAddress}&withTokenBalances=true`;
    const holderResponse = await fetch(url, {
      method: 'GET',
      headers: { 'accept': 'application/json' }
    });
    const holderData = await holderResponse.json();
    //console.log('data:', holderData);

    const holderMap: NftHolders = {};
    holderData.ownerAddresses.forEach((owner: any) => {
      owner.tokenBalances.forEach((balance: any) => {
        const tokenId = parseInt(balance.tokenId, 16).toString();
        holderMap[tokenId] = owner.ownerAddress;
      });
    });

    setNftHolders(holderMap);
  }, [alchemyApiKey, contractAddress]);

  const fetchNFTs = useCallback(async () => {
    const url = `https://polygon-mumbai.g.alchemy.com/nft/v3/${alchemyApiKey}/getNFTsForCollection?contractAddress=${contractAddress}&withMetadata=true`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const data = await response.json();
      console.log('data:', data);
      const fetchedNfts = data.nfts.map((nft: any) => ({
        name: nft.name,
        image: nft.image,
        attributes: nft.raw.metadata.attributes,
        tokenId: nft.tokenId
      }));
      setNfts(fetchedNfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }, [alchemyApiKey, contractAddress]);

  useEffect(() => {
    fetchNFTs().catch(console.error);
    fetchNftHolders().catch(console.error);
  }, [fetchNFTs, fetchNftHolders]);

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="collection2-container">
      {nfts.map((nft, index) => {
        const holderAddress = nftHolders[nft.tokenId];
        const shortenedHolderAddress = holderAddress ? shortenAddress(holderAddress) : 'Loading...';
  
        return (
          <div key={index} className="nft-card">
            <img src={nft.image.cachedUrl} alt={`NFT ${index}`} />
            <div className="nft-name">{nft.name}</div>
            <div className="nft-holder">Holder: {shortenedHolderAddress}</div>
            <div className="nft-attributes">
              {nft.attributes.map((attribute, attrIndex) => {
                let displayValue = attribute.value;
                if (attribute.trait_type === "Creator Wallet I" || attribute.trait_type === "Creator Wallet II") {
                  displayValue = shortenAddress(attribute.value.toString());
                }
                return (
                  <div key={attrIndex} className="nft-attribute">
                    <strong>{attribute.trait_type}:</strong> {displayValue}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Collection2;