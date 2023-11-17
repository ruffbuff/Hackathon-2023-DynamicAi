// frontend/src/header/Header.tsx
import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react';

function Header() {

  return (
    <Box className="header-container">
      <VStack spacing={4} align="stretch" className="content-box">
        <Box className="info-box">
          <Heading as="h2" size="xl">Header</Heading>
        </Box>
      </VStack>
    </Box>
  );
}

export default Header;