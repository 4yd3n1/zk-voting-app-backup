import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Textarea,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { PROPOSAL_FACTORY_ADDRESS, PROPOSAL_FACTORY_ABI } from '../utils/contracts';
import { useAccount } from 'wagmi';

const CreateProposal = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { address } = useAccount();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!formData.title || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create factory contract instance
      const factory = new ethers.Contract(
        PROPOSAL_FACTORY_ADDRESS,
        PROPOSAL_FACTORY_ABI,
        signer
      );

      toast({
        title: 'Creating Proposal',
        description: 'Please wait while your proposal is being created...',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      // Create proposal through factory
      const tx = await factory.createProposal(formData.title, formData.description);
      const receipt = await tx.wait();

      // Get the proposal address from the event
      const event = receipt.events.find(e => e.event === "ProposalCreated");
      const proposalAddress = event.args.proposalAddress;

      toast({
        title: 'Success!',
        description: `Proposal created at ${proposalAddress}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Store the proposal address in localStorage
      const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
      proposals.push({
        address: proposalAddress,
        title: formData.title,
        description: formData.description,
        creator: address,
        timestamp: Date.now(),
      });
      localStorage.setItem('proposals', JSON.stringify(proposals));

      // Navigate to the proposal page
      navigate(`/proposal/${proposalAddress}`);
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create proposal',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      w="100%"
      h="100%"
      p={8}
    >
      <Box
        maxW="1200px"
        w="100%"
        mx="auto"
        h="100%"
      >
        <VStack spacing={8} align="stretch" as="form" onSubmit={handleSubmit}>
          <Heading size="lg" color="white" textAlign="center">Create New Proposal</Heading>
          
          <Box>
            <Text mb={3} color="whiteAlpha.800" fontSize="lg">Proposal Title</Text>
            <Input
              placeholder="Enter proposal title"
              bg="transparent"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              color="white"
              _placeholder={{ color: "whiteAlpha.400" }}
              size="lg"
              h="48px"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isSubmitting}
            />
          </Box>

          <Box>
            <Text mb={3} color="whiteAlpha.800" fontSize="lg">Proposal Description</Text>
            <Textarea
              placeholder="Enter proposal description"
              bg="transparent"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              color="white"
              _placeholder={{ color: "whiteAlpha.400" }}
              size="lg"
              minH="300px"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </Box>

          <Button
            colorScheme="blue"
            size="lg"
            h="48px"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Creating Proposal..."
          >
            Submit Proposal
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateProposal; 