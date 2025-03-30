import React from 'react';
import { useState } from "react";
import { Buffer } from "buffer";
import process from "process";
import { ethers } from "ethers";
import { ChakraProvider, Box, Container, Heading, Flex } from '@chakra-ui/react';
import { useParams, useNavigate, BrowserRouter as Router } from 'react-router-dom';
import Vote from './components/Vote';
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
const projectId = '27810ecf8c4cb0e6dce26f1fbadf86ae'; // Your WalletConnect project ID

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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <ChakraProvider>
            <ToastContainer />
            <Router>
              <Box minH="100vh" w="100vw" bg="#1A1B1F">
                <Box 
                  as="header" 
                  py={4} 
                  px={6} 
                  borderBottom="1px" 
                  borderColor="whiteAlpha.100"
                  bg="#000000"
                >
                  <Flex 
                    justify="space-between" 
                    align="center" 
                    maxW="7xl" 
                    mx="auto"
                    px={4}
                  >
                    <Heading size="md" color="white">ZK Voting App</Heading>
                    <ConnectButton />
                  </Flex>
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
                    <Vote />
                  </Box>
                </Box>
              </Box>
            </Router>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
