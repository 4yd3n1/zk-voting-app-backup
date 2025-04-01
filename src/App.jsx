import React from 'react';
import { Buffer } from "buffer";
import process from "process";
import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createStandaloneToast } from '@chakra-ui/toast';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Proposals from './pages/Proposals';
import CreateProposal from './components/CreateProposal';
import LandingPage from './components/LandingPage';
import VotingHome from './components/VotingHome';
import Vote from './components/Vote';
import TokenTransfer from './components/TokenTransfer';
import ProposalView from './components/ProposalView';
import ProposalList from './components/ProposalList';
import theme from './theme';

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

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider chains={[sepolia]}>
              <Box 
                minH="100vh"
                w="100vw"
                bg="#000000"
                display="flex" 
                flexDirection="column"
                overflow="hidden"
              >
                <Navbar />
                <Box 
                  flex="1"
                  w="100%"
                  display="flex"
                >
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/proposals" element={<Proposals />} />
                    <Route path="/proposals/:id" element={<ProposalView />} />
                    <Route path="/create-proposal" element={<CreateProposal />} />
                    <Route path="/participate" element={<VotingHome />} />
                    <Route path="/vote/:id" element={<Vote />} />
                    <Route path="/transfer" element={<TokenTransfer />} />
                    <Route path="/act" element={<ProposalList />} />
                    <Route path="/act/create-proposal" element={<Navigate to="/create-proposal" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>
              </Box>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </Router>
      <ToastContainer />
    </ChakraProvider>
  );
}

export default App;
