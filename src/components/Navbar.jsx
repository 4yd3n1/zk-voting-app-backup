import React from 'react';
import { Box, Container, HStack, Heading, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Navbar() {
  return (
    <Box as="nav" bg="gray.800" py={2} position="sticky" top={0} zIndex={10}>
      <Container maxW="container.xl">
        <HStack justify="space-between" h="48px">
          <Heading as={RouterLink} to="/" size="md" color="white" cursor="pointer">
            ZK Voting
          </Heading>
          <HStack spacing={2}>
            <Button as={RouterLink} to="/proposals" variant="ghost" color="white" size="sm">
              Proposals
            </Button>
            <Button as={RouterLink} to="/participate" variant="ghost" color="white" size="sm">
              Participate
            </Button>
            <Button as={RouterLink} to="/transfer" variant="ghost" color="white" size="sm">
              Transfer
            </Button>
            <Button as={RouterLink} to="/act" variant="ghost" color="white" size="sm">
              Act
            </Button>
            <Button as={RouterLink} to="/create-proposal" colorScheme="blue" size="sm">
              Create Proposal
            </Button>
            <ConnectButton />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

export default Navbar; 