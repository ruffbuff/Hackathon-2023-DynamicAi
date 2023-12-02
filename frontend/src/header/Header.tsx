// frontend/src/header/Header.tsx
import React, { useState } from 'react';
import { Box, VStack, Flex, Select, Input, useToast, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
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

  const contractABI = contracts.weatherContract.abi;

  const mintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contracts.weatherContract.address, contractABI, signer);
  
      const transaction = await contract.mint(animal, name, country, style);
      await transaction.wait();
  
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
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#BF40BF">
          <Text textColor="white">Open sidebar and Connect Wallet</Text>
        </Box>
      </Flex>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <Flex className="header-container" justifyContent="center" alignItems="center" height="100vh">
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="gray.50">
          <p>Connecting to wallet...</p>
        </Box>
      </Flex>
    );
  }

  if (connectionStatus === "unknown") {
    return (
      <Flex className="header-container" justifyContent="center" alignItems="center" height="100vh">
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#4b2c6e">
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
      <VStack
        spacing={4}
        align="stretch"
        className="content-box"
        width="full"
        maxWidth="md"
        m="auto"
      >
        <Box className="info-box" p={6} boxShadow="xl" rounded="lg" bg="#4b2c6e">
            <Select placeholder="Select Animal" className="select-input" value={animal} onChange={(e) => setAnimal(e.target.value)}>
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Horse">Horse</option>
              <option value="Fox">Fox</option>
              <option value="Turtle">Turtle</option>
            </Select>
            <Select placeholder="Select Country" className="select-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="Estonia">Estonia</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Poland">Poland</option>
              <option value="SaudiArabia">Saudi Arabia</option>
              <option value="Japan">Japan</option>
            </Select>
            <Select placeholder="Select Style" className="select-input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="Cartoon">Cartoon</option>
              <option value="Free">Free</option>
              <option value="Minecraft">Minecraft</option>
              <option value="Retro">Retro</option>
              <option value="Cyberpunk">Cyberpunk</option>
            </Select>
            <Input
              className="input-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              mb={3}
            />
            <button onClick={mintNFT} className="mint-btn">
              Free mint
            </button>
          </Box>
        </VStack>
      </Flex>
    );
}

export default Header;
