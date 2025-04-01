import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useContractRead, usePublicClient } from 'wagmi';
import { PROPOSAL_FACTORY_ABI, PROPOSAL_FACTORY_ADDRESS, PROPOSAL_ABI } from '../utils/contracts';

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Proposals() {
  const navigate = useNavigate();
  const toast = useToast();
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Read proposals from the factory contract
  const { data: proposalList, error: proposalsError } = useContractRead({
    address: PROPOSAL_FACTORY_ADDRESS,
    abi: PROPOSAL_FACTORY_ABI,
    functionName: 'getProposals',
  });

  useEffect(() => {
    const loadProposals = async () => {
      if (!proposalList) return;

      try {
        // Process proposals sequentially with delay to avoid rate limits
        const proposalDetails = [];
        for (const proposal of proposalList) {
          try {
            // Add delay between requests
            await delay(100);

            // First check if the proposal contract exists and is initialized
            const code = await publicClient.getBytecode({
              address: proposal.proposalAddress,
            });

            if (!code || code === '0x') {
              console.warn('Proposal contract not found at:', proposal.proposalAddress);
              continue;
            }

            // Try to get voting info with error handling
            let votingInfo = null;
            try {
              // First get the total number of voters
              const totalVoters = await publicClient.readContract({
                address: proposal.proposalAddress,
                abi: PROPOSAL_ABI,
                functionName: 'totalVoters',
              });

              console.log('Total voters for proposal:', proposal.proposalAddress, totalVoters);

              // Only check voting info if position is within bounds
              const position = 0; // Start with first voter
              if (position < Number(totalVoters)) {
                const hasVoted = await publicClient.readContract({
                  address: proposal.proposalAddress,
                  abi: PROPOSAL_ABI,
                  functionName: 'getVoteInfo',
                  args: [position],
                });

                votingInfo = {
                  hasVoted,
                  position,
                  totalVoters: Number(totalVoters)
                };
              } else {
                console.warn('Position out of bounds:', position, 'Total voters:', totalVoters);
                votingInfo = null;
              }
            } catch (voteError) {
              console.warn('Error reading voting info:', voteError.message);
              // If we get a position out of bounds error, we'll use default values
              votingInfo = null;
            }

            // If we couldn't get voting info, use default values
            if (!votingInfo) {
              proposalDetails.push({
                address: proposal.proposalAddress,
                title: proposal.title,
                description: proposal.description || 'No description available',
                creator: proposal.creator,
                timestamp: Number(proposal.timestamp),
                votingInfo: {
                  hasVoted: false,
                  position: 0,
                  totalVoters: 0
                }
              });
              continue;
            }

            proposalDetails.push({
              address: proposal.proposalAddress,
              title: proposal.title,
              description: proposal.description || 'No description available',
              creator: proposal.creator,
              timestamp: Number(proposal.timestamp),
              votingInfo: {
                hasVoted: votingInfo.hasVoted,
                position: votingInfo.position,
                totalVoters: votingInfo.totalVoters
              }
            });
          } catch (error) {
            console.error('Error processing proposal:', proposal.proposalAddress, error);
            // Return proposal with default values if there's an error
            proposalDetails.push({
              address: proposal.proposalAddress,
              title: proposal.title,
              description: proposal.description || 'No description available',
              creator: proposal.creator,
              timestamp: Number(proposal.timestamp),
              votingInfo: {
                hasVoted: false,
                position: 0,
                totalVoters: 0
              }
            });
          }
        }

        // Sort proposals by timestamp (newest first)
        proposalDetails.sort((a, b) => b.timestamp - a.timestamp);
        setProposals(proposalDetails);
      } catch (error) {
        console.error('Error loading proposal details:', error);
        toast({
          title: 'Error loading proposals',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [proposalList, publicClient, toast]);

  if (isLoading) {
    return (
      <Box 
        w="100%" 
        h="100%"
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (proposalsError) {
    return (
      <Box 
        w="100%"
        h="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text color="red.500">Error loading proposals: {proposalsError.message}</Text>
      </Box>
    );
  }

  return (
    <Box
      w="100%"
      h="100%"
      p={8}
    >
      <Box
        maxW="1800px"
        w="100%"
        mx="auto"
        h="100%"
      >
        <HStack justify="space-between" mb={8}>
          <Heading size="lg" color="white">Proposals</Heading>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/create-proposal')}
          >
            Create New Proposal
          </Button>
        </HStack>

        {proposals.length === 0 ? (
          <Card w="100%">
            <CardBody textAlign="center" py={10}>
              <Text>No proposals found. Create one to get started!</Text>
            </CardBody>
          </Card>
        ) : (
          <Grid 
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"
            }}
            gap={8}
            w="100%"
          >
            {proposals.map((proposal) => (
              <Card
                key={proposal.address}
                cursor="pointer"
                onClick={() => navigate(`/proposal/${proposal.address}`)}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardHeader>
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{proposal.title}</Heading>
                    <HStack>
                      <Badge colorScheme="blue">
                        Created {new Date(proposal.timestamp * 1000).toLocaleDateString()}
                      </Badge>
                      <Badge colorScheme="green">
                        {proposal.votingInfo.hasVoted ? 'Voted' : 'Not Voted'} ({proposal.votingInfo.totalVoters} total voters)
                      </Badge>
                    </HStack>
                  </VStack>
                </CardHeader>
                <CardBody>
                  <Text noOfLines={3}>{proposal.description}</Text>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Proposals; 