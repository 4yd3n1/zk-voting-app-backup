import React from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import Vote from './Vote';

const VotingHome = () => {
  return (
    <Box w="100%" maxW="600px" mx="auto">
      <VStack spacing={8} align="center">
        <Box textAlign="center">
          <Heading color="white" mb={4}>ZK Voting App</Heading>
          <Text color="whiteAlpha.800">Secure and private voting using zero-knowledge proofs</Text>
        </Box>
        <Vote />
      </VStack>
    </Box>
  );
};

export default VotingHome; 