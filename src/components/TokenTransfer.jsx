import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Button,
  useToast,
  Heading,
  Spinner,
  Divider,
  IconButton,
  useClipboard,
} from '@chakra-ui/react';
import { 
  useAccount, 
  useBalance,
  useWriteContract,
} from 'wagmi';
import { parseEther } from 'viem';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';

const TokenTransfer = () => {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const toast = useToast();
  const { onCopy, hasCopied } = useClipboard(address || '');

  // Get account balance
  const { data: balance } = useBalance({
    address,
  });

  // Transaction hooks
  const {
    writeContract,
    isPending,
    isSuccess,
    error,
  } = useWriteContract();

  // Handle send transaction
  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: 'Error',
        description: 'Please enter recipient address and amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const hash = await writeContract({
        abi: [],
        address: recipient,
        functionName: 'transfer',
        args: [],
        value: parseEther(amount),
      });
      setTxHash(hash);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send transaction',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Show success message when transaction is confirmed
  React.useEffect(() => {
    if (isSuccess && txHash) {
      toast({
        title: 'Success',
        description: 'Transaction confirmed!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setAmount('');
      setRecipient('');
      setTxHash(null);
    }
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Transaction failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isSuccess, error, txHash, toast]);

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
          <Heading size="lg" color="white">Please connect your wallet</Heading>
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
      display="flex"
      justifyContent="center"
    >
      <Box
        w="100%"
        maxW="600px"
      >
        <VStack spacing={8} align="stretch">
          <Box p={6} borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200">
            <Heading size="md" color="white" mb={4}>Receive ETH</Heading>
            <Text color="whiteAlpha.800" mb={2}>Your Wallet Address</Text>
            <HStack>
              <Text color="white" fontSize="sm" flex="1" wordBreak="break-all">
                {address}
              </Text>
              <IconButton
                icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                onClick={onCopy}
                aria-label="Copy address"
                colorScheme={hasCopied ? "green" : "blue"}
                size="sm"
              />
            </HStack>
          </Box>

          <Divider borderColor="whiteAlpha.200" />

          <Heading size="md" color="white" textAlign="center">Send ETH</Heading>

          <Box>
            <Text mb={2} color="whiteAlpha.800">Your Balance</Text>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
            </Text>
          </Box>

          <Box>
            <Text mb={2} color="whiteAlpha.800">Recipient Address</Text>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
              bg="transparent"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              color="white"
              _placeholder={{ color: "whiteAlpha.400" }}
              size="lg"
              h="48px"
            />
          </Box>

          <Box>
            <Text mb={2} color="whiteAlpha.800">Amount (ETH)</Text>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              step="0.001"
              bg="transparent"
              border="1px solid"
              borderColor="whiteAlpha.200"
              _hover={{ borderColor: "whiteAlpha.300" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              color="white"
              _placeholder={{ color: "whiteAlpha.400" }}
              size="lg"
              h="48px"
            />
          </Box>

          <Button
            onClick={handleSend}
            isLoading={isPending}
            loadingText="Sending..."
            colorScheme="blue"
            size="lg"
            h="48px"
            isDisabled={!writeContract || !amount || !recipient}
          >
            Send ETH
          </Button>

          {isPending && (
            <HStack justify="center" spacing={2}>
              <Spinner size="sm" color="blue.500" />
              <Text color="whiteAlpha.800">Transaction in progress...</Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default TokenTransfer; 