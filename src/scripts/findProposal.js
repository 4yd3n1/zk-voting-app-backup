import { ethers } from "ethers";
import { PROPOSAL_FACTORY_ADDRESS, PROPOSAL_FACTORY_ABI } from "../utils/contracts.js";

async function findProposal() {
    // Using a public RPC endpoint
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    const factory = new ethers.Contract(PROPOSAL_FACTORY_ADDRESS, PROPOSAL_FACTORY_ABI, provider);
    
    try {
        // Get all proposals
        const proposals = await factory.getProposals();
        console.log("Found", proposals.length, "proposals");
        
        // Find the proposal from the specific transaction
        const proposalAddress = "0x582017f496c381744924f15de4885775bdaae6e43e6d54ad96d94fcb9b458518";
        const proposal = proposals.find(p => p.proposalAddress.toLowerCase() === proposalAddress.toLowerCase());
        
        if (proposal) {
            console.log("\nProposal Details:");
            console.log("----------------");
            console.log("Title:", proposal.title);
            console.log("Creator:", proposal.creator);
            console.log("Timestamp:", new Date(Number(proposal.timestamp) * 1000).toLocaleString());
            console.log("Address:", proposal.proposalAddress);
        } else {
            console.log("\nProposal not found with address:", proposalAddress);
            console.log("\nAvailable proposals:");
            proposals.forEach((p, i) => {
                console.log(`\n#${i + 1}:`);
                console.log("Address:", p.proposalAddress);
                console.log("Title:", p.title);
            });
        }
    } catch (error) {
        console.error("Error reading proposals:", error.message);
    }
}

findProposal().catch(console.error); 