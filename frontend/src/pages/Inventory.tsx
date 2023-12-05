// src/pages/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contracts } from '../sol/contracts';
import { useAddress } from "@thirdweb-dev/react";
import './Inventory.css';
import { Image, Box, Text } from '@chakra-ui/react';

interface NFT {
  tokenId: string;
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  image: {
    cachedUrl: string;
  };
}

function Inventory() {
  const address = useAddress();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [imageClicked, setImageClicked] = useState(false);
  const [nextUpdateTime, setNextUpdateTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [uriIndex, setUriIndex] = useState(0);

  useEffect(() => {
    if (address) {
      const fetchNFTs = async () => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        const url = `https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForOwner?owner=${address}&contractAddresses[]=0x3DE661c7cDc964be6E584710d5627446f4770142&withMetadata=true&pageSize=100`;
  
        try {
          const response = await fetch(url, options);
          const data = await response.json();
          console.log(data);
          const fetchedNfts = data.ownedNfts.map((nft: any) => ({
            tokenId: nft.tokenId,
            name: nft.name,
            description: nft.description,
            attributes: nft.raw.metadata.attributes,
            image: {
              cachedUrl: nft.image.cachedUrl,
            },
          }));
          setNfts(fetchedNfts);
        } catch (error) {
          console.error('Error fetching NFT data:', error);
        }
      };
  
      fetchNFTs();
    }
  }, [address]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getNextUpdateTime = async (tokenId: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contracts.weatherContract.address, contracts.weatherContract.abi, provider);

    try {
      const timestamp = await contract.nextUpdateTime(tokenId);
      return timestamp.toNumber();
    } catch (error) {
      console.error('Error fetching next update time:', error);
    }
  };

  const handleNftClick = async (nft: NFT) => {
    setSelectedNft(nft);
    setImageClicked(true);

    const timestamp = await getNextUpdateTime(nft.tokenId);
    setNextUpdateTime(timestamp);
  };

  const convertTimestampToTime = (timestamp: number) => {
    const timeLeft = timestamp - currentTime;

    if (timeLeft <= 0) {
      return "Time's up!";
    }

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return `${hours}h ${minutes}m ${seconds}s Until change`;
  };

  const formatVrfValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.map(v => {
        const num = parseFloat(v);
        if (!isNaN(num)) {
          return num.toExponential(2);
        }
        return v;
      }).join(', ');
    }
    return value.toString();
  };  

  const getUriBatch = async (tokenId: string, index: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contracts.weatherContract.address, contracts.weatherContract.abi, provider);
  
    try {
      const uri = await contract.uriBatches(tokenId, index);
      const response = await fetch(uri);
      const metadata = await response.json();
  
      if (selectedNft) {
        setSelectedNft({
          ...selectedNft,
          image: { cachedUrl: metadata.image },
          name: metadata.name,
          tokenId: selectedNft.tokenId,
          description: selectedNft.description,
          attributes: selectedNft.attributes
        });
      }
    } catch (error) {
      console.error('Error fetching URI:', error);
    }
  };  

  const handlePrevUri = () => {
    if (!selectedNft) return;
    const newIndex = uriIndex === 0 ? 3 : uriIndex - 1;
    setUriIndex(newIndex);
    getUriBatch(selectedNft.tokenId, newIndex);
  };

  const handleNextUri = () => {
    if (!selectedNft) return;
    const newIndex = uriIndex === 3 ? 0 : uriIndex + 1;
    setUriIndex(newIndex);
    getUriBatch(selectedNft.tokenId, newIndex);
  };

  return (
    <Box className="main-container">
      <Box className="image-and-text-container" style={selectedNft ? {} : { justifyContent: 'center' }}>
        {selectedNft ? (
          <>
            <Box className="image-box">
              <Image
                borderRadius="10px"
                src={selectedNft.image.cachedUrl}
                alt={selectedNft.name}
                className={imageClicked ? "larger-image" : "thumbnail-image"}
              />
            </Box>
            <Box className="uri-buttons">
              <button onClick={handlePrevUri}>&lt;</button>
              <button onClick={handleNextUri}>&gt;</button>
            </Box>
            <Box className="timer-box">
              <Text mt="10px">
                {nextUpdateTime ? convertTimestampToTime(nextUpdateTime) : "Loading..."}
              </Text>
            </Box>
            <Box className="text-box">
              <Text fontSize="2xl">Name: {selectedNft.name}</Text>
              <Text>Description: {selectedNft.description}</Text>
              <Text>Token ID: {selectedNft.tokenId}</Text>
              <Text>Time of Day: {selectedNft.attributes.find(attr => attr.trait_type === "Time_of_day")?.value}</Text>
              <Text>Animal: {selectedNft.attributes.find(attr => attr.trait_type === "Animal")?.value}</Text>
              <Text>Name: {selectedNft.attributes.find(attr => attr.trait_type === "Name")?.value}</Text>
              <Text>Country: {selectedNft.attributes.find(attr => attr.trait_type === "Country")?.value}</Text>
              <Text>Style: {selectedNft.attributes.find(attr => attr.trait_type === "Style")?.value}</Text>
              <Text>VRF Random: {formatVrfValue(selectedNft.attributes.find(attr => attr.trait_type === "VRF Random")?.value)}</Text>
            </Box>
          </>
        ) : (
          <Text className="select-nft-prompt">Select an NFT to view details</Text>
        )}
      </Box>

      <Box className="nft-gallery-container">
        <Box className="nft-gallery">
          {nfts.map((nft, index) => (
            <Box key={index} onClick={() => handleNftClick(nft)} className="nft-slot">
              <Image
                borderRadius="10px"
                src={nft.image.cachedUrl}
                alt={`NFT ${index}`}
                className="thumbnail-image"
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Inventory;