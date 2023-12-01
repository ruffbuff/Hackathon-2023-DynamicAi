// src/pages/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { useAddress } from "@thirdweb-dev/react";
import './Inventory.css';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Image,
    Box,
    Text
  } from '@chakra-ui/react';

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

  useEffect(() => {
    if (address) {
      const fetchNFTs = async () => {
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        const url = `https://polygon-mumbai.g.alchemy.com/nft/v3/DquPqd0BkVZtmd5HQkefL0hbs_SLMLfX/getNFTsForOwner?owner=${address}&contractAddresses[]=0x6788dF648847fFD0dB5f76FdB35DC244559486E2&withMetadata=true&pageSize=100`;
  
        try {
          const response = await fetch(url, options);
          const data = await response.json();
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

  const handleNftClick = (nft: NFT) => {
    setSelectedNft(nft);
    setImageClicked(true);
  };

  return (
    <Box className="main-container">
      <Box className="image-and-text-container">
        {selectedNft ? (
          <>
            <Box className="image-box">
              <Image
                src={selectedNft.image.cachedUrl}
                alt={selectedNft.name}
                className={imageClicked ? "larger-image" : "thumbnail-image"}
              />
            </Box>
            <Box className="text-box">
              <Text fontSize="2xl">{selectedNft.name}</Text>
              <Text>{selectedNft.description}</Text>
              {selectedNft.attributes.find(attr => attr.trait_type === "Deadline") && (
                <Text color="red.500">
                  Deadline: {selectedNft.attributes.find(attr => attr.trait_type === "Deadline")?.value}
                </Text>
              )}
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Attribute</Th>
                    <Th>Value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedNft.attributes.filter(attr => attr.trait_type !== "Deadline").map((attr, index) => (
                    <Tr key={index}>
                      <Td>{attr.trait_type}</Td>
                      <Td>{attr.value}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        ) : (
          <Text>Select an NFT to view details</Text>
        )}
      </Box>

      <Box className="nft-gallery-container">
        <Box className="nft-gallery">
          {nfts.map((nft, index) => (
            <Box key={index} onClick={() => handleNftClick(nft)} cursor="pointer" className="nft-slot">
              <Image
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