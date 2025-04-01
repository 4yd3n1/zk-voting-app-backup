import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, SimpleGrid, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaVoteYea, FaUserShield } from 'react-icons/fa';

const PathButton = ({ icon, title, description, to, colorScheme }) => (
  <Link to={to} style={{ width: '100%' }}>
    <Button
      w="full"
      h="auto"
      p={6}
      minH="180px"
      bg={colorScheme === 'blue' ? '#2172e5' : '#7B3FE4'}
      color="white"
      _hover={{ 
        bg: colorScheme === 'blue' ? '#1a5bc5' : '#6232B4',
        transform: 'translateY(-2px)',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)'
      }}
      borderRadius="xl"
      boxShadow="0px 4px 12px rgba(0, 0, 0, 0.2)"
      transition="all 0.2s"
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={8} />
        <Heading 
          as="h3" 
          size="md" 
          textAlign="center"
        >
          {title}
        </Heading>
        <Text 
          fontSize="sm"
          textAlign="center"
          whiteSpace="normal"
          maxW="200px"
        >
          {description}
        </Text>
      </VStack>
    </Button>
  </Link>
);

const LandingPage = () => {
  return (
    <Box 
      w="100vw"
      h="calc(100vh - 52px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#000000"
    >
      <VStack 
        spacing={12} 
        w="100%" 
        maxW="container.lg"
        px={4}
      >
        <VStack spacing={4} textAlign="center">
          <Heading 
            size="2xl" 
            color="white" 
            letterSpacing="tight"
            fontWeight="bold"
            textAlign="center"
          >
            Welcome to your private and secure identity
          </Heading>
          <Text 
            fontSize="xl" 
            color="whiteAlpha.800" 
            maxW="600px"
            textAlign="center"
          >
            Secure, private, and transparent governance for everyone
          </Text>
        </VStack>

        <SimpleGrid 
          columns={{ base: 1, md: 2 }} 
          spacing={8} 
          w="100%" 
          maxW="800px"
          mx="auto"
        >
          <PathButton
            icon={FaVoteYea}
            title="PARTICIPATE"
            description="Vote on proposals and engage with your community"
            to="/participate"
            colorScheme="blue"
          />

          <PathButton
            icon={FaUserShield}
            title="ACT"
            description="Create referendums and manage policies"
            to="/act"
            colorScheme="purple"
          />
        </SimpleGrid>

        <Text 
          color="whiteAlpha.800" 
          fontSize="sm"
          textAlign="center"
          maxW="400px"
          p={3}
          borderRadius="lg"
          bg="whiteAlpha.100"
        >
          Verified through FranceConnect for secure and private participation
        </Text>
      </VStack>
    </Box>
  );
};

export default LandingPage; 