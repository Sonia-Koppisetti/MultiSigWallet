import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ethers } from "ethers"
import { SimpleAccountAPI } from "@account-abstraction/sdk"


const ABI = [
  "function submitTransaction(address _to, uint _value, address token) external",
  "function signTransaction(uint _txId) external",
  "function getSigners() view returns (address[])",
  "function getTransaction(uint _txId) view returns (address, uint, address,bool, uint)",
  "function getTransactionCount() view returns (uint)"
];
const MULTISIG_CONTRACT = "0x7F461876eE4a4FF210FBfBa74Cb1f4f0022A669A"
const MY_TOKEN = "0xfd0cF8668939c285ce2667aEfD97fd7c7907aF5a"
const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
function App() {
  const [signer, setSigner] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [signers, setSigners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newTx, setNewTx] = useState({ to: "", value: "", token:"" });
  const [loading, setLoading] = useState(false);


  useEffect(() =>{
    if(walletConnected){
      loadContractData();
      loadTransactions();
    }
  },[walletConnected])

  useEffect( () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged",async (accounts) => {
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            setSigner(await provider.getSigner());
            setConnectedAddress((await provider.getSigner()).address)
            setWalletConnected(true);
          } else {
              console.log("Disconnected");
          }
      });
  }
  }, [])

  async function connectWallet() {
    if(walletConnected){
      setSigner(null);
      setWalletConnected(false);
      setConnectedAddress(null);
    }
    else{
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setSigner(await provider.getSigner());
        setConnectedAddress((await provider.getSigner()).address)
        setWalletConnected(true);
      } else {
        alert("Please install MetaMask!");
      }
    }
      
  }

  async function loadContractData() {
    if (!signer) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(MULTISIG_CONTRACT, ABI, provider);
    console.log(contract.txCount, "fromcontract data");
  }

  async function loadTransactions() {
    if (!signer) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(MULTISIG_CONTRACT, ABI, provider);
    const txCount = await contract.getTransactionCount();
    const signers = await contract.getSigners();
    setSigners(signers);
    console.log("####signers",signers)
    let txs = [];
    for (let i = 0; i < txCount; i++) {
      console.log("Transactions", await contract.getTransaction(0));
      const [to, value,token, executed, signatureCount] = await contract.getTransaction(i);
      txs.push({ id: i, to, value: ethers.formatEther(value),token, executed, signatureCount });
    }

    console.log(txs);
    setTransactions(txs);
  }

  async function submitTransaction() {
    if (!signer) return;
    const contract = new ethers.Contract(MULTISIG_CONTRACT, ABI, signer);
    const valueInWei = ethers.parseEther(newTx.value);
    console.log("vauleInWei", valueInWei, newTx.to);
    try {
      const tx = await contract.submitTransaction(newTx.to, valueInWei, newTx.token);
      setLoading(true);
      console.log("Transaction submitted:", tx);
      await tx.wait(); // Wait for confirmation
      console.log("Transaction confirmed:", tx.hash);
      loadTransactions();
      setLoading(false);
    }
    catch(error){
      console.error("Transaction failed:", error);
      alert("Transaction Failed" + error);
    }
  }

  async function signTransaction(txId) {
    if (!signer) return;
    const contract = new ethers.Contract(MULTISIG_CONTRACT, ABI, signer);
    try{
      const tx = await contract.signTransaction(txId);
      await tx.wait();
      alert("Transaction Signed!");
      loadTransactions();
      setLoading(false);
    }catch(error){
      alert("Transaction Failed"+ error)
    }
    
  }

  async function createUserOp(to, value, data) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request MetaMask connection
    const signer = provider.getSigner(); // Get MetaMask signer

    // **1. Initialize Smart Account API**
    const accountAPI = new SimpleAccountAPI({
        provider,
        entryPointAddress,
        owner: signer,
    });

    const sender = await accountAPI.getAccountAddress(); // Smart Account address
    const nonce = await accountAPI.getNonce();

    // **2. Prepare UserOperation**
    // let userOp = {
    //     sender,
    //     nonce,
    //     initCode: "0x", // Leave empty if account already exists
    //     callData: await accountAPI.encodeExecute(to, value, data),
    //     callGasLimit: 100000,
    //     verificationGasLimit: 100000,
    //     preVerificationGas: 50000,
    //     maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
    //     maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"),
    //     paymasterAndData: "0x", // If using a paymaster, provide necessary data
    //     signature: "0x", // Will be signed later
    // };

    // // **3. Sign UserOperation Hash with MetaMask**
    // const userOpHash = await accountAPI.getUserOpHash(userOp);
    // userOp.signature = await signer.signMessage(ethers.utils.arrayify(userOpHash));

    // console.log("Signed UserOperation:", userOp);
    // return userOp;
}

  return (
    <div>
      {loading && <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(97, 95, 95, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 9999,
            color:"green"
        }}><div className="loading-spinner"></div>Loading...</div> }
      <div style={{
        flexDirection:"row",
        display:"flex",
        justifyContent: "space-between",
      }}>
        <div>Bankai LABS</div>
        <div style={{display:"flex", flexDirection:"row"}}>
          <button style={{marginRight: "10px"}}>{!connectedAddress ? "" : connectedAddress.toString().slice(0,9)+ "...."}</button>
          <button onClick={connectWallet}>{!walletConnected ? "Connect" : "DisConnect"}</button>
        </div>
      </div>

      <div>
        <div style={{alignSelf:"center", justifyContent:"center", display:"flex"}}>
          MultiSignature Wallet - {MULTISIG_CONTRACT}
        </div>
        <div style={{alignSelf:"center", justifyContent:"center", display:"flex"}}>
          Required Signers - {signers.length > 0 ? signers.length  : ""}
        </div>
        {
          signers.map((signer) => (
            <div style={{alignSelf:"center", justifyContent:"center", display:"flex"}}>
              {signer}
            </div>
          ))
        }
        
      </div>
      <div>
        <button onClick={createUserOp("0xf5715961C550FC497832063a98eA34673ad7C816", "0", "0x")}>Create UserOp</button>
      </div>

      <div>
          <h3 style={{display:"flex", alignSelf:"center", justifyContent:"center"}}>Submit a Transaction</h3>
          <div style={{display:"flex", alignSelf:"center", justifyContent:"center", flexDirection:"column", alignItems:"center"}}>
            <input
              type="text"
              placeholder="Recipient Address"
              value={newTx.to}
              onChange={(e) => setNewTx({ ...newTx, to: e.target.value })}
              style={{ width: "50%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              type="number"
              placeholder="Amount (ETH)"
              value={newTx.value}
              onChange={(e) => setNewTx({ ...newTx, value: e.target.value })}
              style={{ width: "50%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              type="text"
              placeholder="Token Address"
              value={newTx.token}
              onChange={(e) => setNewTx({ ...newTx, token: e.target.value })}
              style={{ width: "50%", marginBottom: "10px", padding: "8px" }}
            />
          </div>
          
          <button style={{display:"flex", alignSelf:"center", justifySelf:"center"}} onClick={submitTransaction}>Submit Transaction</button>

          <h3>Pending Transactions</h3>
          <ul>
            {transactions.slice(4).map((tx) => (
              <li key={tx.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid gray" }}>
                <p><strong>To:</strong> {tx.to}</p>
                <p><strong>Amount:</strong> {tx.value} {tx.token == "0x0000000000000000000000000000000000000000" ? "POL" : "TKN"}</p>
                <p><strong>Signatures:</strong> {tx.signatureCount}</p>
                <p><strong>Status:</strong> {tx.executed ? "Executed ✅" : "Pending ⏳"}</p>
                <p><strong>Required Signatures:</strong> {2}</p>
                {!tx.executed && <button onClick={() => 
                  {setLoading(true)
                  signTransaction(tx.id)}
                  }>Sign Transaction</button>}
              </li>
            ))}
          </ul>
        </div>
    </div>
  )
}

export default App
