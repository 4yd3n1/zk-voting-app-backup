import { ethers } from "ethers";
import { PROPOSAL_ABI } from "../utils/contracts.js";

async function readProposalData() {
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    const proposalAddress = "0x582017f496c381744924f15de4885775bdaae6e43e6d54ad96d94fcb9b458518";
    const contract = new ethers.Contract(proposalAddress, PROPOSAL_ABI, provider);
    
    try {
        // Get the vote info
        const voteInfo = await contract.getVoteInfo();
        console.log("\nProposal Details:");
        console.log("----------------");
        console.log("For Votes:", voteInfo.forVotes.toString());
        console.log("Against Votes:", voteInfo.againstVotes.toString());
        console.log("End Time:", new Date(Number(voteInfo.endTime) * 1000).toLocaleString());
        console.log("Is Finalized:", voteInfo.isFinalized);
        
        // Get the proposal data from localStorage
        const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
        const proposal = proposals.find(p => p.address.toLowerCase() === proposalAddress.toLowerCase());
        
        if (proposal) {
            console.log("\nProposal Metadata:");
            console.log("-----------------");
            console.log("Title:", proposal.title);
            console.log("Description:", proposal.description);
            console.log("Creator:", proposal.creator);
            console.log("Created At:", new Date(Number(proposal.timestamp) * 1000).toLocaleString());
        } else {
            console.log("\nProposal metadata not found in localStorage");
        }
    } catch (error) {
        console.error("Error reading proposal data:", error.message);
    }
}

readProposalData().catch(console.error); 