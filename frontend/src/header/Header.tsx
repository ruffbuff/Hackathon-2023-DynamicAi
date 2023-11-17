import React from 'react';
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
        <Box className="image-box">
          <Image src="path_to_image.jpg" alt="Description" boxSize="150px"/>
        </Box>
        <Box className="info-box">
          <Heading as="h2" size="xl">Header</Heading>
          <Text fontSize="md">Info here.</Text>
        </Box>
        <Box className="additional-info-box">
          <Text fontSize="sm">More info here.</Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default Header;
