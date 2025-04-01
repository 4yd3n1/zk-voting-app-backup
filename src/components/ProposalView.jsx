import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  HStack,
  Progress,
  Badge,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { PROPOSAL_ABI } from "../utils/contracts";
import { useAccount } from "wagmi";

const ProposalView = () => {
  const { address } = useParams();
  const { address: userAddress } = useAccount();
  const toast = useToast();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadProposalDetails();
  }, [address]);

  const loadProposalDetails = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const proposalContract = new ethers.Contract(address, PROPOSAL_ABI, provider);
      
      const [title, description, startTime, endTime, totalVotes, yesVotes, noVotes, finalized] = await Promise.all([
        proposalContract.title(),
        proposalContract.description(),
        proposalContract.startTime(),
        proposalContract.endTime(),
        proposalContract.totalVotes(),
        proposalContract.yesVotes(),
        proposalContract.noVotes(),
        proposalContract.finalized()
      ]);

      setProposal({
        title,
        description,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        totalVotes: totalVotes.toString(),
        yesVotes: yesVotes.toString(),
        noVotes: noVotes.toString(),
        finalized
      });
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast({
        title: "Error",
        description: "Failed to load proposal details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!userAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setVoting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const proposalContract = new ethers.Contract(address, PROPOSAL_ABI, signer);

      // TODO: Implement ZK proof generation and verification
      const proof = {
        proof: "0x...", // Placeholder for ZK proof
        publicSignals: ["0x..."] // Placeholder for public signals
      };

      const tx = await proposalContract.vote(vote, proof);
      await tx.wait();

      toast({
        title: "Success!",
        description: `Vote ${vote ? "Yes" : "No"} recorded successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      loadProposalDetails(); // Reload proposal details
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vote",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setVoting(false);
    }
  };

  const handleFinalize = async () => {
    if (!userAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const proposalContract = new ethers.Contract(address, PROPOSAL_ABI, signer);

      const tx = await proposalContract.finalize();
      await tx.wait();

      toast({
        title: "Success!",
        description: "Proposal finalized successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      loadProposalDetails(); // Reload proposal details
    } catch (error) {
      console.error("Error finalizing proposal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to finalize proposal",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text color="white">Loading proposal details...</Text>
      </Box>
    );
  }

  if (!proposal) {
    return (
      <Box p={6}>
        <Text color="white">Proposal not found</Text>
      </Box>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= parseInt(proposal.startTime) && now <= parseInt(proposal.endTime);
  const totalVotesNum = parseInt(proposal.totalVotes);
  const yesVotesNum = parseInt(proposal.yesVotes);
  const noVotesNum = parseInt(proposal.noVotes);
  const yesPercentage = totalVotesNum > 0 ? (yesVotesNum / totalVotesNum) * 100 : 0;
  const noPercentage = totalVotesNum > 0 ? (noVotesNum / totalVotesNum) * 100 : 0;

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="white">{proposal.title}</Heading>
      
      <Text color="whiteAlpha.800">{proposal.description}</Text>

      <HStack spacing={4}>
        <Badge colorScheme={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Ended"}
        </Badge>
        <Badge colorScheme={proposal.finalized ? "purple" : "yellow"}>
          {proposal.finalized ? "Finalized" : "In Progress"}
        </Badge>
      </HStack>

      <Box>
        <Text color="whiteAlpha.800" mb={2}>Voting Results</Text>
        <VStack spacing={2} align="stretch">
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text color="white">Yes ({yesVotesNum})</Text>
              <Text color="white">{yesPercentage.toFixed(1)}%</Text>
            </HStack>
            <Progress value={yesPercentage} colorScheme="green" size="sm" />
          </Box>
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text color="white">No ({noVotesNum})</Text>
              <Text color="white">{noPercentage.toFixed(1)}%</Text>
            </HStack>
            <Progress value={noPercentage} colorScheme="red" size="sm" />
          </Box>
        </VStack>
      </Box>

      {isActive && !proposal.finalized && (
        <HStack spacing={4}>
          <Button
            colorScheme="green"
            onClick={() => handleVote(true)}
            isLoading={voting}
            loadingText="Voting..."
          >
            Vote Yes
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleVote(false)}
            isLoading={voting}
            loadingText="Voting..."
          >
            Vote No
          </Button>
        </HStack>
      )}

      {!proposal.finalized && now > parseInt(proposal.endTime) && (
        <Button
          colorScheme="purple"
          onClick={handleFinalize}
        >
          Finalize Proposal
        </Button>
      )}
    </VStack>
  );
};

export default ProposalView;



