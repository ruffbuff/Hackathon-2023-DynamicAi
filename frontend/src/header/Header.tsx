// frontend/src/header/Header.tsx
import React, { useState } from 'react';
import { Box, VStack, Flex, Select, Input, useToast, Text, Image, CircularProgress } from '@chakra-ui/react';
import { ethers, Contract } from 'ethers';
import { contracts } from '../sol/contracts';
import { useConnectionStatus } from "@thirdweb-dev/react";
import './Header.css';

function Header() {
  const connectionStatus = useConnectionStatus();
  const toast = useToast();
  const [animal, setAnimal] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [style, setStyle] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const contractABI = contracts.weatherContract.abi;

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  function listenForURIBatchAdded(contract: Contract) {
    contract.on("URIBatchAdded", async (tokenId, uris, burnInSeconds) => {
      console.log(`Event Caught - Token ID: ${tokenId}, URIs: ${uris}, Burn Time: ${burnInSeconds}`);
      setIsLoading(true);
  
      try {
        const images = await Promise.all(uris.map(async (uri: string) => {
          const response = await fetch(uri);
          const metadata = await response.json();
          return metadata.image;
        }));
  
        setImageUris(images);
      } catch (error) {
        console.error('Ошибка при извлечении изображений из IPFS:', error);
      }
  
      setIsLoading(false);
    });
  }

  const mintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contracts.weatherContract.address, contractABI, signer);
  
      const transaction = await contract.mint(animal, name, country, style);
      await transaction.wait();
      setIsLoading(true);
      listenForURIBatchAdded(contract);

      toast({
        title: "NFT Minted",
        description: "Your NFT has been minted successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Minting Failed",
          description: `Error occurred: ${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Minting Failed",
          description: "An unknown error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  if (connectionStatus === "disconnected") {
    return (
      <Flex
        className="header-container"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#FFA500">
          <Text textColor="white">Open sidebar and Connect Wallet</Text>
        </Box>
      </Flex>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <Flex className="header-container" justifyContent="center" alignItems="center" height="100vh">
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#FFA500">
          <p>Connecting to wallet...</p>
        </Box>
      </Flex>
    );
  }

  if (connectionStatus === "unknown") {
    return (
      <Flex className="header-container" justifyContent="center" alignItems="center" height="100vh">
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#FFA500">
          <p>Loading wallet status...</p>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      className="header-container"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      {isLoading ? (
        <CircularProgress
          isIndeterminate
          color="#FFA500"
          justifyContent="center"
          alignContent="center"
          mt="4"
        />
      ) : showForm ? (
        <Box className="info-box" p={6} boxShadow="xl" textColor="#FFA500" rounded="lg" bg="#5e5e5e">
            <Select placeholder="Select Animal" textColor="#FFA500" className="select-input" value={animal} onChange={(e) => setAnimal(e.target.value)}>
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Horse">Horse</option>
              <option value="Fox">Fox</option>
              <option value="Turtle">Turtle</option>
              <option value="Dragon">Dragon</option>
            </Select>
            <Select placeholder="Select Country" textColor="#FFA500" className="select-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="Estonia">Estonia</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Poland">Poland</option>
              <option value="SaudiArabia">Saudi Arabia</option>
              <option value="Japan">Japan</option>
            </Select>
            <Select placeholder="Select Style" textColor="#FFA500" className="select-input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="Cartoon">Cartoon</option>
              <option value="Nature">Nature</option>
              <option value="Surreal">Surreal</option>
              <option value="Pokemon">Pokemon</option>
              <option value="Minecraft">Minecraft</option>
              <option value="Retro">Retro</option>
              <option value="Cyberpunk">Cyberpunk</option>
            </Select>
            <Input
              className="input-input"
              textColor="#FFA500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              mb={3}
            />
          <button onClick={mintNFT} className="mint-btn">
            Free mint
          </button>
          <button onClick={toggleForm} className="mint-btn">
            View Images
          </button>
        </Box>
      ) : (
        <VStack
          spacing={4}
          align="stretch"
          className="content-box"
          width="full"
          maxWidth="md"
        >
          <Flex
            wrap="wrap"
            justifyContent="center"
            width="full"
          >
            {imageUris.map((uri, index) => (
              <Image key={index} src={uri} alt={`Dynamic NFT Image ${index + 1}`} boxSize="200px" m="2" />
            ))}
          </Flex>
          <Flex justifyContent="center">
            <button onClick={toggleForm} className="mint-btn">
              Mint Another
            </button>
          </Flex>
        </VStack>
      )}
    </Flex>
  );
}

export default Header;