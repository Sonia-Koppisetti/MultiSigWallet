require("dotenv").config();
const express = require("express");
const { Biconomy } = require("@biconomy/mexa");
const Web3 = require("web3");

// Load environment variables
const INFURA_URL = process.env.INFURA_URL;
const BICONOMY_API_KEY = process.env.BICONOMY_API_KEY;
const BUNDLER_CONTRACT_ADDRESS = process.env.BUNDLER_CONTRACT_ADDRESS;

// Initialize Web3 provider and Biconomy
const provider = new Web3.providers.HttpProvider(INFURA_URL);
const biconomy = new Biconomy(provider, { apiKey: BICONOMY_API_KEY, debug: true });
const web3 = new Web3(biconomy);

biconomy.onEvent(biconomy.READY, () => {
  console.log("Biconomy is ready!");
});

biconomy.onEvent(biconomy.ERROR, (error, message) => {
  console.error("Biconomy Error:", error, message);
});

const app = express();
app.use(express.json());

// In-memory queue to hold incoming meta-transactions
let metaTxQueue = [];

/**
 * Endpoint for users to submit their meta-transactions.
 * In a real application, users sign these off-chain.
 */
app.post("/submitMetaTx", (req, res) => {
  // Expected payload: { from, to, data, nonce }
  const { from, to, data, nonce } = req.body;
  metaTxQueue.push({ from, to, data, nonce });
  console.log("MetaTx added to queue:", { from, to, data, nonce });
  res.json({ message: "Meta transaction received" });
});

/**
 * Endpoint to bundle queued meta-transactions and send as one transaction.
 * This demo assumes a bundler contract with a function:
 * executeBundledTransactions(bytes aggregatedData, address[] aggregatedFroms)
 */
app.post("/bundleAndSend", async (req, res) => {
  if (metaTxQueue.length === 0) {
    return res.json({ message: "No meta transactions to bundle" });
  }

  // For simplicity, simulate bundling by concatenating the 'data' fields
  let aggregatedData = "0x";
  let aggregatedFroms = [];
  metaTxQueue.forEach(tx => {
    aggregatedData += tx.data.slice(2); // remove '0x' and concatenate
    aggregatedFroms.push(tx.from);
  });
  // Clear the queue
  metaTxQueue = [];

  // Bundler contract ABI (simplified version)
  const bundlerContractAbi = [
    {
      "inputs": [
        { "internalType": "bytes", "name": "aggregatedData", "type": "bytes" },
        { "internalType": "address[]", "name": "aggregatedFroms", "type": "address[]" }
      ],
      "name": "executeBundledTransactions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  const bundlerContract = new web3.eth.Contract(bundlerContractAbi, BUNDLER_CONTRACT_ADDRESS);

  // Using the first sender in the bundled list as the default signer
  const defaultSender = aggregatedFroms[0];

  const txParams = {
    from: defaultSender,
    to: BUNDLER_CONTRACT_ADDRESS,
    data: bundlerContract.methods.executeBundledTransactions(aggregatedData, aggregatedFroms).encodeABI(),
    gas: 500000, // Set an estimated gas limit
  };

  try {
    // Send the transaction using Biconomy (paymaster handles gas)
    let txReceipt = await web3.eth.sendTransaction(txParams);
    res.json({ message: "Bundled transaction sent", receipt: txReceipt });
  } catch (error) {
    console.error("Error sending bundled transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server listening on port 3000"));
