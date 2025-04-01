import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Stack,
  StackDivider,
  Badge,
  Spinner,
  Center,
  useToast,
  Code,
  HStack,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccount, useContractRead } from 'wagmi';
import { useChainId } from 'wagmi';
import { PROPOSAL_FACTORY_ADDRESS, PROPOSAL_FACTORY_ABI, PROPOSAL_ABI } from '../utils/contracts';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = 11155111;

const ProposalList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: proposalsFromContract, isError, isLoading, refetch, error } = useContractRead({
    address: PROPOSAL_FACTORY_ADDRESS,
    abi: PROPOSAL_FACTORY_ABI,
    functionName: 'getProposals',
    enabled: isConnected,
  });

  useEffect(() => {
    if (isConnected && chainId !== SEPOLIA_CHAIN_ID) {
      toast({
        title: 'Wrong Network',
        description: 'Please connect to the Sepolia testnet',
        status: 'warning',
        duration: null,
        isClosable: true,
      });
    }
  }, [isConnected, chainId, toast]);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      // Load proposals from localStorage
      const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
      
      // Load additional details for each proposal
      const provider = new ethers.BrowserProvider(window.ethereum);
      const proposalsWithDetails = await Promise.all(
        storedProposals.map(async (proposal) => {
          try {
            const contract = new ethers.Contract(proposal.address, PROPOSAL_ABI, provider);
            const voteInfo = await contract.getVoteInfo();
            
            return {
              ...proposal,
              voteInfo: {
                forVotes: Number(voteInfo.forVotes),
                againstVotes: Number(voteInfo.againstVotes),
                endTime: Number(voteInfo.endTime) * 1000,
                isFinalized: voteInfo.isFinalized,
              },
            };
          } catch (error) {
            console.error(`Error loading details for proposal ${proposal.address}:`, error);
            return proposal;
          }
        })
      );

      // Sort by timestamp, newest first
      proposalsWithDetails.sort((a, b) => b.timestamp - a.timestamp);
      setProposals(proposalsWithDetails);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Heading size="lg">Connect Your Wallet</Heading>
          <Text>Please connect your wallet to view proposals</Text>
        </VStack>
      </Center>
    );
  }

  if (chainId !== SEPOLIA_CHAIN_ID) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Heading size="lg" color="red.500">Wrong Network</Heading>
          <Text color="whiteAlpha.900">Please switch to the Sepolia testnet:</Text>
          <VStack align="start" spacing={2} bg="whiteAlpha.100" p={4} borderRadius="md">
            <Text>Network Name: Sepolia</Text>
            <Text>Chain ID: {SEPOLIA_CHAIN_ID}</Text>
            <Text>Currency Symbol: ETH</Text>
          </VStack>
        </VStack>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="whiteAlpha.900">Loading proposals...</Text>
          <Text color="whiteAlpha.600">Connected to: Sepolia</Text>
          <Text color="whiteAlpha.600">Contract: {PROPOSAL_FACTORY_ADDRESS}</Text>
        </VStack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Heading size="lg" color="red.500">Error Loading Proposals</Heading>
          <Text color="whiteAlpha.900">{error?.message || 'Unknown error occurred'}</Text>
          <Button colorScheme="blue" onClick={() => refetch()}>
            Retry
          </Button>
          <VStack spacing={2} align="start" bg="whiteAlpha.100" p={4} borderRadius="md" w="100%">
            <Text color="whiteAlpha.900">Debug Information:</Text>
            <Text color="whiteAlpha.800">Network: Sepolia</Text>
            <Text color="whiteAlpha.800">Chain ID: {chainId}</Text>
            <Text color="whiteAlpha.800">Connected Account: {address}</Text>
            <Text color="whiteAlpha.800">Contract Address: {PROPOSAL_FACTORY_ADDRESS}</Text>
          </VStack>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Stack direction={["column", "row"]} justify="space-between" align="center">
          <Heading size="xl" color="whiteAlpha.900">Active Proposals</Heading>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/create-proposal')}
            size="lg"
          >
            Create New Proposal
          </Button>
        </Stack>

        {proposals.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {proposals.map((proposal) => {
              const isVotingEnded = proposal.voteInfo && Date.now() > proposal.voteInfo.endTime;
              const totalVotes = proposal.voteInfo ? 
                (proposal.voteInfo.forVotes + proposal.voteInfo.againstVotes) : 0;

              return (
                <Card
                  key={proposal.address}
                  bg="whiteAlpha.100"
                  borderRadius="lg"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                >
                  <CardHeader>
                    <Stack spacing={2}>
                      <Heading size="lg" color="cyan.400">
                        <ChakraLink as={Link} to={`/proposal/${proposal.address}`}>
                          {proposal.title}
                        </ChakraLink>
                      </Heading>
                      <Text color="whiteAlpha.600">
                        Created {new Date(Number(proposal.timestamp) * 1000).toLocaleString()}
                      </Text>
                    </Stack>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <Text color="whiteAlpha.900">
                        Proposal Address: {proposal.address}
                      </Text>
                      <Text color="whiteAlpha.900">
                        Created by: {proposal.creator}
                      </Text>
                    </Stack>
                  </CardBody>
                  <CardFooter>
                    <Button
                      colorScheme="blue"
                      onClick={() => navigate(`/vote/${proposal.address}`)}
                    >
                      Vote on Proposal
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </VStack>
        ) : (
          <Center p={8}>
            <VStack spacing={4}>
              <Text color="whiteAlpha.900" fontSize="xl">
                No proposals found
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => navigate('/create-proposal')}
              >
                Create the First Proposal
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>
    </Box>
  );
};

export default ProposalList; 