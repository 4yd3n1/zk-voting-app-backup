import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, SimpleGrid, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaVoteYea, FaUserShield } from 'react-icons/fa';

const PathButton = ({ icon, title, description, to, colorScheme }) => (
  <Link to={to} style={{ width: '100%' }}>
    <Button
      w="full"
      h="auto"
      p={8}
      minH="280px"
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
      <VStack spacing={6} maxW="300px">
        <Icon as={icon} boxSize={12} />
        <Heading 
          as="h3" 
          size="lg" 
          textAlign="center"
        >
          {title}
        </Heading>
        <Text 
          fontSize="md"
          textAlign="center"
          whiteSpace="normal"
          maxW="250px"
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
      w="100%"
      minH="100vh"
      bg="#000000"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={16}
    >
      <Container maxW="container.lg">
        <VStack spacing={16}>
          <VStack spacing={4} textAlign="center">
            <Heading 
              size="2xl" 
              color="white" 
              letterSpacing="tight"
              fontWeight="bold"
            >
              Welcome to your private and secure identity
            </Heading>
            <Text 
              fontSize="xl" 
              color="whiteAlpha.800" 
              maxW="600px"
              lineHeight="1.6"
            >
              Secure, private, and transparent governance for everyone
            </Text>
          </VStack>

          <SimpleGrid 
            columns={{ base: 1, md: 2 }} 
            spacing={10} 
            w="100%" 
            maxW="1000px"
          >
            <PathButton
              icon={FaVoteYea}
              title="PARTICIPATE"
              description="Vote on proposals, join discussions, and engage with your community"
              to="/participate"
              colorScheme="blue"
            />

            <PathButton
              icon={FaUserShield}
              title="ACT"
              description="Create referendums, manage policies, and distribute benefits"
              to="/act"
              colorScheme="purple"
            />
          </SimpleGrid>

          <Text 
            color="whiteAlpha.800" 
            fontSize="md"
            textAlign="center"
            maxW="600px"
            p={4}
            borderRadius="lg"
            bg="whiteAlpha.100"
          >
            Verified through FranceConnect for secure and private participation
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage; 