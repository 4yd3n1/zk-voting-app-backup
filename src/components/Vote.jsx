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
  Icon,
  Container
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
      <Box 
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4} align="center">
          <Heading size="lg" color="white">Please connect your wallet to vote</Heading>
          <Text color="whiteAlpha.800">Connect your wallet using the button in the top right corner</Text>
        </VStack>
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
        maxW="1200px"
        w="100%"
        mx="auto"
        h="100%"
      >
        <VStack spacing={12} align="center" w="100%">
          <VStack spacing={6} align="center" w="100%">
            <HStack spacing={3} justify="center">
              <Icon as={FaVoteYea} boxSize={8} color="whiteAlpha.900" />
              <Heading size="lg" color="white">Vote on Proposal</Heading>
            </HStack>

            <Text 
              fontSize="xl" 
              color="cyan.400" 
              fontWeight="medium"
              textAlign="center"
            >
              "Greening and pedestrianizing 500 streets in Paris"
            </Text>
          </VStack>

          <VStack spacing={8} align="center" w="100%">
            <HStack spacing={6} justify="center">
              <Button
                colorScheme="green"
                onClick={() => setVote(1)}
                size="lg"
                variant={vote === 1 ? "solid" : "outline"}
                w="160px"
                h="48px"
              >
                FOR
              </Button>
              <Button
                colorScheme="red"
                onClick={() => setVote(0)}
                size="lg"
                variant={vote === 0 ? "solid" : "outline"}
                w="160px"
                h="48px"
              >
                AGAINST
              </Button>
            </HStack>

            <Box w="100%" maxW="600px">
              <Text 
                fontSize="sm" 
                color="whiteAlpha.600"
                textAlign="center"
                mb={4}
              >
                This secret makes your vote anonymous. It will be used to create a hidden commitment that proves your vote without revealing it.
              </Text>

              <Input
                type="number"
                placeholder="Enter a secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: "whiteAlpha.300" }}
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                size="lg"
                h="48px"
                mb={4}
              />

              <Button
                colorScheme="blue"
                onClick={generateProof}
                isLoading={loading}
                size="lg"
                w="100%"
                h="48px"
              >
                Generate zk Proof
              </Button>
            </Box>

            {commitment && (
              <Box 
                p={6}
                bg="whiteAlpha.50" 
                borderRadius="md" 
                w="100%"
                maxW="600px"
              >
                <Text fontWeight="medium" mb={2} color="whiteAlpha.900">
                  Commitment Hash:
                </Text>
                <Text 
                  fontSize="sm" 
                  wordBreak="break-all" 
                  color="whiteAlpha.800"
                >
                  {commitment}
                </Text>
              </Box>
            )}

            {proof && (
              <Text color="green.400" fontSize="md">
                ✓ zk-SNARK Proof Generated
              </Text>
            )}

            {verified !== null && (
              <Text color={verified ? "green.400" : "red.400"} fontSize="md">
                {verified ? "✓ Proof verified" : "✗ Invalid proof"}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default Vote; 