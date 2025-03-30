import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Input,
  useToast,
  Heading,
  HStack,
  Icon
} from '@chakra-ui/react';
import { useAccount, useWriteContract, useSimulateContract } from 'wagmi';
import { ethers } from 'ethers';
import { FaVoteYea } from 'react-icons/fa';

const Vote = () => {
  const { address, isConnected } = useAccount();
  const [vote, setVote] = useState(null);
  const [secret, setSecret] = useState("");
  const [commitment, setCommitment] = useState("");
  const [proof, setProof] = useState(null);
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const contractConfig = {
    address: "0xbed76e9c86aef963e90e978b89f8e2a0691935c2",
    abi: [
      {
        inputs: [
          { internalType: "uint256[2]", name: "_pA", type: "uint256[2]" },
          { internalType: "uint256[2][2]", name: "_pB", type: "uint256[2][2]" },
          { internalType: "uint256[2]", name: "_pC", type: "uint256[2]" },
          { internalType: "uint256[]", name: "_pubSignals", type: "uint256[]" }
        ],
        name: "verifyProof",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          { internalType: "uint256", name: "_vote", type: "uint256" },
          { internalType: "uint256", name: "_secret", type: "uint256" }
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    functionName: "vote",
    args: [BigInt(vote || 0), BigInt(secret || 0)],
  };

  const { data: simulateData } = useSimulateContract(contractConfig);
  const { writeContract, isError, error } = useWriteContract();

  const generateProof = async () => {
    if (vote === null || secret === "") {
      toast({
        title: "Error",
        description: "Please select a vote and enter a secret.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setVerified(null);

    try {
      const { groth16 } = await import("snarkjs");
      const circomlibjs = await import("circomlibjs");
      const poseidon = await circomlibjs.buildPoseidon();
      const F = poseidon.F;

      const hash = F.toString(poseidon([vote, BigInt(secret)]));
      setCommitment(hash);

      const input = {
        vote,
        secret: secret.toString(),
        hash,
      };

      const { proof, publicSignals } = await groth16.fullProve(
        input,
        "/vote.wasm",
        "/example.zkey"
      );

      setProof({ proof, publicSignals });

      const vKey = await fetch("/verification_key.json").then((res) => res.json());
      const isValid = await groth16.verify(vKey, publicSignals, proof);
      setVerified(isValid);
      
      if (isValid) {
        await writeContract(contractConfig);
        toast({
          title: "Success",
          description: "Vote submitted successfully with proof!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Proof verification failed!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Proof generation/verification failed:", err);
      toast({
        title: "Error",
        description: "Failed to generate proof. Check console for details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  if (!isConnected) {
    return (
      <VStack spacing={4} align="center">
        <Heading size="lg">Please connect your wallet to vote</Heading>
        <Text color="whiteAlpha.600">Connect your wallet using the button in the top right corner</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack spacing={3} justify="center" width="100%">
        <Icon as={FaVoteYea} boxSize={5} color="whiteAlpha.900" />
        <Heading size="md" color="whiteAlpha.900">Vote on Proposal</Heading>
      </HStack>

      <Text fontSize="md" color="cyan.400" fontWeight="medium">
        "Greening and pedestrianizing 500 streets in Paris"
      </Text>

      <HStack spacing={3} justify="center">
        <Button
          colorScheme="green"
          onClick={() => setVote(1)}
          size="md"
          variant={vote === 1 ? "solid" : "outline"}
          w="120px"
          h="40px"
        >
          FOR
        </Button>
        <Button
          colorScheme="red"
          onClick={() => setVote(0)}
          size="md"
          variant={vote === 0 ? "solid" : "outline"}
          w="120px"
          h="40px"
        >
          AGAINST
        </Button>
      </HStack>

      <Text fontSize="sm" color="whiteAlpha.600">
        This secret makes your vote anonymous. It will be used to create a
        hidden commitment that proves your vote without revealing it.
      </Text>

      <Input
        type="number"
        placeholder="Enter a secret"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        bg="transparent"
        border="1px solid"
        borderColor="whiteAlpha.200"
        _hover={{ borderColor: "whiteAlpha.300" }}
        _focus={{ borderColor: "blue.500", boxShadow: "none" }}
        size="md"
        h="40px"
        color="white"
        _placeholder={{ color: "whiteAlpha.400" }}
      />

      <Button
        colorScheme="blue"
        onClick={generateProof}
        isLoading={loading}
        size="md"
        h="40px"
      >
        Generate zk Proof
      </Button>

      {commitment && (
        <Box p={4} bg="whiteAlpha.50" borderRadius="md">
          <Text fontWeight="medium" mb={2} color="whiteAlpha.900">Commitment Hash:</Text>
          <Text fontSize="sm" wordBreak="break-all" color="whiteAlpha.800">{commitment}</Text>
        </Box>
      )}

      {proof && (
        <Text color="green.400" fontSize="sm">
          ✓ zk-SNARK Proof Generated
        </Text>
      )}

      {verified !== null && (
        <Text color={verified ? "green.400" : "red.400"} fontSize="sm">
          {verified ? "✓ Proof verified" : "✗ Invalid proof"}
        </Text>
      )}
    </VStack>
  );
};

export default Vote; 