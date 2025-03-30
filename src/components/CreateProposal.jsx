import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Textarea,
  Button,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const CreateProposal = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md" color="white" mb={2}>Create New Proposal</Heading>
      
      <Box>
        <Text mb={2} color="whiteAlpha.800">Proposal Title</Text>
        <Input
          placeholder="Enter proposal title"
          bg="transparent"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ borderColor: "whiteAlpha.300" }}
          _focus={{ borderColor: "blue.500", boxShadow: "none" }}
          color="white"
          _placeholder={{ color: "whiteAlpha.400" }}
          size="md"
        />
      </Box>

      <Box>
        <Text mb={2} color="whiteAlpha.800">Proposal Description</Text>
        <Textarea
          placeholder="Enter proposal description"
          bg="transparent"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ borderColor: "whiteAlpha.300" }}
          _focus={{ borderColor: "blue.500", boxShadow: "none" }}
          color="white"
          _placeholder={{ color: "whiteAlpha.400" }}
          size="md"
          minH="200px"
        />
      </Box>

      <Button
        colorScheme="blue"
        size="md"
        h="40px"
      >
        Submit Proposal
      </Button>
    </VStack>
  );
};

export default CreateProposal; 