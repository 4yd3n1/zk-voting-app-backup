import { ethers } from "ethers";
import { PROPOSAL_FACTORY_ABI } from "../utils/contracts.js";

async function decodeProposal() {
    // Transaction input data from Etherscan
    const txHash = "0x582017f496c381744924f15de4885775bdaae6e43e6d54ad96d94fcb9b458518";
    
    // Create interface for decoding
    const iface = new ethers.Interface(PROPOSAL_FACTORY_ABI);
    
    // Try multiple providers
    const providers = [
        "https://eth-sepolia.g.alchemy.com/v2/demo",
        "https://rpc.sepolia.org",
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    ];
    
    for (const providerUrl of providers) {
        try {
            console.log(`\nTrying provider: ${providerUrl}`);
            const provider = new ethers.JsonRpcProvider(providerUrl);
            
            // Get transaction
            console.log("Fetching transaction...");
            const tx = await provider.getTransaction(txHash);
            if (!tx) {
                console.log("Transaction not found");
                continue;
            }
            
            console.log("\nRaw Transaction Data:");
            console.log("--------------------");
            console.log("Data:", tx.data);
            
            // Try to decode the input data
            console.log("\nAttempting to decode input data...");
            const decodedData = iface.parseTransaction({ data: tx.data });
            
            console.log("\nDecoded Transaction Data:");
            console.log("------------------------");
            console.log("Function called:", decodedData.name);
            console.log("Arguments:", decodedData.args);
            
            // If we successfully got the data, break the loop
            break;
            
        } catch (error) {
            console.log(`Error with provider ${providerUrl}:`, error.message);
            if (error.message.includes("no matching function")) {
                console.log("This might not be a proposal creation transaction");
            }
            continue;
        }
    }
}

decodeProposal().catch(console.error); 