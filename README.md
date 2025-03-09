MultiSig Wallet with Biconomy Paymaster & Bundled Transactions

A decentralized MultiSig Wallet that leverages Biconomy Paymaster to enable gasless transactions and transaction bundling for a seamless user experience.

Features

MultiSig Wallet: Secure multi-signature transaction approvals.
Biconomy Paymaster: Sponsor gas fees for a gasless transaction experience.
Bundled Transactions: Efficient transaction processing via Biconomy.
Smart Contracts: Secure and optimized contract implementation.
Frontend (React + ethers.js): Interactive UI for transaction management.
Backend (Node.js + Express.js): Handles transaction bundling & Paymaster requests.

Project Structure

multiSig-wallet/
│── backend/             # Express.js API for bundling transactions & Paymaster integration
│── frontend/            # React-based UI for interacting with the MultiSig Wallet
│── contracts/           # Solidity smart contracts for MultiSig Wallet and Paymaster logic
│── README.md            # Project documentation
│── .env                 # Environment variables for API keys, contract addresses, etc.

Smart Contract Setup

1️⃣ Install Dependencies
cd contracts
npm install
2️⃣ Compile & Deploy Smart Contracts

npx hardhat compile
npx hardhat run scripts/deploy.js --network <your-network>
Note: Update contract addresses in the frontend & backend .env file after deployment.

Backend Setup
1️⃣ Install Dependencies
cd backend
npm install
2️⃣ Start Backend Server

npm run dev
The backend handles transaction bundling and integrates with Biconomy Paymaster.

Frontend Setup
1️⃣ Install Dependencies

cd frontend
npm install
2️⃣ Start React App

npm start
The frontend allows users to create transactions, sign transactions, and send them through Biconomy.

API Endpoints

/bundleTransactions	- Bundles transactions and sends them via Biconomy
/signTransaction - Signs a transaction using MultiSig logic
