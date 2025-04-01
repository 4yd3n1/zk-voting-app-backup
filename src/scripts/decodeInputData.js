import { ethers } from "ethers";
import { PROPOSAL_FACTORY_ABI, PROPOSAL_ABI } from "../utils/contracts.js";

function decodeInputData() {
    // Create interfaces for decoding
    const factoryIface = new ethers.Interface(PROPOSAL_FACTORY_ABI);
    const proposalIface = new ethers.Interface(PROPOSAL_ABI);
    
    console.log("\nAvailable Functions in PROPOSAL_FACTORY_ABI:");
    console.log("------------------------------------------");
    PROPOSAL_FACTORY_ABI.forEach(item => {
        if (item.type === "function") {
            const signature = factoryIface.getFunction(item.name).format();
            console.log(`\nFunction: ${item.name}`);
            console.log(`Signature: ${signature}`);
            console.log(`Function Selector: ${factoryIface.getFunction(item.name).selector}`);
        }
    });
    
    console.log("\nAvailable Functions in PROPOSAL_ABI:");
    console.log("-----------------------------------");
    PROPOSAL_ABI.forEach(item => {
        if (item.type === "function") {
            const signature = proposalIface.getFunction(item.name).format();
            console.log(`\nFunction: ${item.name}`);
            console.log(`Signature: ${signature}`);
            console.log(`Function Selector: ${proposalIface.getFunction(item.name).selector}`);
        }
    });
    
    // Example input data (you can replace this with the actual input data)
    const inputData = "0x2509f77c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000001a";
    
    console.log("\nInput Data to Decode:");
    console.log("--------------------");
    console.log(inputData);
    console.log("Function Selector:", inputData.slice(0, 10));
    
    try {
        // Try to decode with factory ABI
        console.log("\nAttempting to decode with PROPOSAL_FACTORY_ABI...");
        const factoryDecoded = factoryIface.parseTransaction({ data: inputData });
        console.log("Decoded Data (Factory):");
        console.log("Function called:", factoryDecoded.name);
        console.log("Arguments:", factoryDecoded.args);
    } catch (error) {
        console.log("Failed to decode with factory ABI:", error.message);
    }
    
    try {
        // Try to decode with proposal ABI
        console.log("\nAttempting to decode with PROPOSAL_ABI...");
        const proposalDecoded = proposalIface.parseTransaction({ data: inputData });
        console.log("Decoded Data (Proposal):");
        console.log("Function called:", proposalDecoded.name);
        console.log("Arguments:", proposalDecoded.args);
    } catch (error) {
        console.log("Failed to decode with proposal ABI:", error.message);
    }
}

decodeInputData(); 