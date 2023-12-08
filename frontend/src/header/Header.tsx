// frontend/src/header/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, Flex, Select, Input, useToast, Text, Image, CircularProgress, Button } from '@chakra-ui/react';
import { ethers, BigNumber } from 'ethers';
import { contracts } from '../sol/contracts';
import { useConnectionStatus, useAddress } from "@thirdweb-dev/react";
import './Header.css';

function Header() {
  const connectionStatus = useConnectionStatus();
  const address = useAddress();
  const toast = useToast();
  const [animal, setAnimal] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [style, setStyle] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [showMintBox, setShowMintBox] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const contractABI = contracts.weatherContract.abi;
  const websocketProviderRef = useRef<ethers.providers.WebSocketProvider | null>(null);

  useEffect(() => {
    if (connectionStatus === "connected" && address) {
      const websocketUrl = process.env.REACT_APP_ALCHEMY_WSS_URL;
      if (!websocketUrl) {
        throw new Error('REACT_APP_ALCHEMY_WSS_URL is not defined in .env file');
      }

      websocketProviderRef.current = new ethers.providers.WebSocketProvider(websocketUrl);
      const contract = new ethers.Contract(contracts.weatherContract.address, contractABI, websocketProviderRef.current);

      const handleURIBatchAdded = (
        tokenId: BigNumber, 
        uris: string[], 
        burnInSeconds: BigNumber, 
        imageURL: string
      ) => {
        console.log("Received imageURL:", imageURL);
      
        if (typeof imageURL === 'string') {
          const separatedUris = imageURL.split(",").filter(uri => uri.trim() !== '');
          setImageUris(separatedUris);
          setShowMintBox(false);
          setIsLoading(false);
        }
      };      

      contract.on("URIBatchAdded", (tokenId, uris, burnInSeconds, imageURL) => handleURIBatchAdded(tokenId, uris, burnInSeconds, imageURL));

      return () => {
        if (websocketProviderRef.current && websocketProviderRef.current._websocket) {
          websocketProviderRef.current._websocket.close();
        }
      };
    }
  }, [connectionStatus, address]);

  const mintNFT = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
      setShowMintBox(true);
      if (error instanceof Error) {
        toast({
          title: "Minting Failed",
          description: `Error occurred: ${error.message}`,
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

  const renderMintBox = () => (
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
      <button onClick={mintNFT} className="mint-btn">Mint DynamicAi</button>
    </Box>
  );

  const renderImages = () => (
    <VStack spacing={4} align="stretch" className="content-box" width="full" maxWidth="md">
      <Flex wrap="wrap" justifyContent="center" width="full">
        {imageUris.map((uri, index) => (
          <Image key={index} src={uri} alt={`NFT ${index + 1}`} width="320px" height="auto" borderRadius="10px" padding="4px" margin="4px" />
        ))}
      </Flex>
      <Button className="return-btn" onClick={() => setShowMintBox(true)}>Return to Minting</Button>
    </VStack>
  );

  return (
    <Flex className="header-container" justifyContent="center" alignItems="center" height="100vh">
      {isLoading ? (
        <CircularProgress isIndeterminate color="#FFA500" justifyContent="center" alignContent="center" mt="4" size="100px" />
      ) : showMintBox ? renderMintBox() : renderImages()}
    </Flex>
  );
}

export default Header;