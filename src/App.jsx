import React from 'react';
import { useState } from "react";
import { Buffer } from "buffer";
import process from "process";
import { ethers } from "ethers";
import { ChakraProvider, Box, Container, Heading, Flex, HStack, Button } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Vote from './components/Vote';
import CreateProposal from './components/CreateProposal';
import { createStandaloneToast } from '@chakra-ui/toast';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TokenTransfer from './components/TokenTransfer';
import LandingPage from './components/LandingPage';

const { ToastContainer } = createStandaloneToast();

// Inject polyfills
window.Buffer = Buffer;
window.process = process;

// Create a client for managing cache
const queryClient = new QueryClient();

// Configure chains & providers
const projectId = '27810ecf8c4cb0e6dce26f1fbadf86ae'; // Your WalletConnect project ID

const { wallets } = getDefaultWallets({
  appName: 'ZK Voting App',
  projectId,
  chains: [sepolia],
});

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

function AppLayout({ children }) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <Box minH="100vh" w="100vw" bg="#1A1B1F">
      {/* Header */}
      {!isLandingPage && (
        <Box 
          as="header" 
          py={3} 
          borderBottom="1px" 
          borderColor="whiteAlpha.200"
          bg="#000000"
          w="100%"
        >
          <Container maxW="container.xl">
            <HStack 
              justify="space-between" 
              w="100%"
              position="relative"
            >
              <HStack spacing={4}>
                <Link to="/">
                  <Button
                    bg="#2172e5"
                    color="white"
                    _hover={{ bg: "#1a5bc5" }}
                    borderRadius="xl"
                    boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                    size="md"
                    px={6}
                  >
                    Home
                  </Button>
                </Link>
                {location.pathname.startsWith('/participate') && (
                  <>
                    <Link to="/participate/vote">
                      <Button
                        bg="#2172e5"
                        color="white"
                        _hover={{ bg: "#1a5bc5" }}
                        borderRadius="xl"
                        boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                        size="md"
                        px={6}
                      >
                        Vote
                      </Button>
                    </Link>
                    <Link to="/participate/transfer">
                      <Button
                        bg="#2172e5"
                        color="white"
                        _hover={{ bg: "#1a5bc5" }}
                        borderRadius="xl"
                        boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                        size="md"
                        px={6}
                      >
                        Send/Receive ETH
                      </Button>
                    </Link>
                  </>
                )}
                {location.pathname.startsWith('/act') && (
                  <Link to="/act/create-proposal">
                    <Button
                      bg="#7B3FE4"
                      color="white"
                      _hover={{ bg: "#6232B4" }}
                      borderRadius="xl"
                      boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
                      size="md"
                      px={6}
                    >
                      Create Proposal
                    </Button>
                  </Link>
                )}
              </HStack>
              <Heading 
                size="md" 
                color="white" 
                position="absolute" 
                left="50%" 
                transform="translateX(-50%)"
                cursor="pointer"
                onClick={() => window.location.href = '/'}
              >
                HOMEPAGE
              </Heading>
              <Box>
                <ConnectButton />
              </Box>
            </HStack>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Box 
        as="main"
        minH={isLandingPage ? "100vh" : "calc(100vh - 72px)"}
        display="flex"
        alignItems={isLandingPage ? "center" : "flex-start"}
        justifyContent="center"
        pt={isLandingPage ? 0 : 16}
        px={4}
      >
        {!isLandingPage && (
          <Box 
            w="full"
            maxW="480px"
            bg="#000000"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            p={8}
          >
            {children}
          </Box>
        )}
        {isLandingPage && children}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[sepolia]}>
          <ChakraProvider>
            <Router>
              <AppLayout>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* Participate Routes */}
                  <Route path="/participate" element={<Navigate to="/participate/vote" />} />
                  <Route path="/participate/vote" element={<Vote />} />
                  <Route path="/participate/transfer" element={<TokenTransfer />} />
                  
                  {/* Act Routes */}
                  <Route path="/act" element={<Navigate to="/act/create-proposal" />} />
                  <Route path="/act/create-proposal" element={<CreateProposal />} />

                  {/* Legacy Routes Redirects */}
                  <Route path="/voting" element={<Navigate to="/participate/vote" />} />
                  <Route path="/transfer" element={<Navigate to="/participate/transfer" />} />
                  
                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AppLayout>
            </Router>
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
