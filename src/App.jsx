import React from 'react';
import { useState } from "react";
import { Buffer } from "buffer";
import process from "process";
import { ethers } from "ethers";
import { ChakraProvider, Box, Container, Heading, Flex, HStack, Button } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Vote from './components/Vote';
import CreateProposal from './components/CreateProposal';
import { createStandaloneToast } from '@chakra-ui/toast';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { ToastContainer } = createStandaloneToast();

// Inject polyfills
window.Buffer = Buffer;
window.process = process;

// Configure chains & providers
const chains = [mainnet, sepolia];
const projectId = '27810ecf8c4cb0e6dce26f1fbadf86ae';

const { wallets } = getDefaultWallets({
  appName: 'ZK Voting App',
  projectId,
  chains,
});

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Separate layout component to use navigation hooks
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box minH="100vh" w="100vw" bg="#1A1B1F">
      <Box 
        as="header" 
        py={3} 
        borderBottom="1px" 
        borderColor="whiteAlpha.200"
        bg="#000000"
        w="100%"
      >
        <HStack 
          justify="space-between" 
          w="100%"
          px={8}
          position="relative"
        >
          <Box>
            <Button
              onClick={() => navigate('/create-proposal')}
              bg="#2172e5"
              color="white"
              _hover={{ bg: "#1a5bc5" }}
              borderRadius="xl"
              boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
              size="md"
              px={6}
            >
              Create New Proposal
            </Button>
          </Box>
          <Heading 
            size="md" 
            color="white" 
            position="absolute" 
            left="50%" 
            transform="translateX(-50%)"
            cursor="pointer"
            onClick={() => navigate('/')}
          >
            ZK Voting App
          </Heading>
          <Box>
            <ConnectButton />
          </Box>
        </HStack>
      </Box>
      <Box 
        as="main"
        minH="calc(100vh - 72px)"
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        pt={16}
        px={4}
      >
        <Box 
          w="full"
          maxW="480px"
          bg="#000000"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          p={8}
        >
          <Routes>
            <Route path="/" element={<Vote />} />
            <Route path="/create-proposal" element={<CreateProposal />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider chains={chains} theme={darkTheme()}>
            <ChakraProvider>
              <ToastContainer />
              <AppLayout />
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
