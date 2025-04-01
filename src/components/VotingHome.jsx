import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import Vote from './Vote';

const VotingHome = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading color="white" mb={4}>ZK Voting App</Heading>
          <Text color="whiteAlpha.800">Secure and private voting using zero-knowledge proofs</Text>
        </Box>
        <Vote />
      </VStack>
    </Container>
  );
};

export default VotingHome; 