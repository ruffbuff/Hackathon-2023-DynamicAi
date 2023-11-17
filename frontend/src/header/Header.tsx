// frontend/src/header/Header.tsx
import { Box, Button, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { contracts } from '../sol/contracts';
import './Header.css';

const contractABI = contracts.weatherContract.abi;
const contractAddress = contracts.weatherContract.address;

interface HeaderProps {
  walletConnected: boolean;
}

function Header({ walletConnected }: HeaderProps) {
  const [canMint, setCanMint] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setCanMint(walletConnected);
  }, [walletConnected]);

  const mintNFT = async () => {
    if (contractAddress && canMint) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      try {
        const tx = await contract.mint();
        await tx.wait();
        toast({
          title: 'NFT minted successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error minting NFT:', error);
    
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
    
        toast({
          title: 'Error minting NFT',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box className="header-container">
      {!walletConnected ? (
        <Box>
          <p>Connect your wallet</p>
        </Box>
      ) : (
        <Button colorScheme="teal" onClick={mintNFT}>
          Mint Free NFT
        </Button>
      )}
    </Box>
  );
}

export default Header;
