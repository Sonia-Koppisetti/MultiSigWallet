 
import { createSmartAccountClient, createBicoPaymasterClient, toBiconomyTokenPaymasterContext, toNexusAccount } from "@biconomy/abstractjs";
import { baseSepolia } from "viem/chains"; 
import { http, parseEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
 

const account = privateKeyToAccount("0xa38079e6582d10a45d881de68f3944424fd7e1bd1fa43847077616b81805a18b");
 
const bundlerUrl = "https://bundler.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44";
const paymasterUrl = "https://paymaster.biconomy.io/api/v2/84532/TykMcrP4h.7bfe7ce2-e7ab-4ad0-9915-6f8b291a99b3";
const baseSepoliaUSDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const recipientAddress = "0x513c2ff203619F0e8576f316c9e654C014d88d05";
 
async function biconomyUSDC(){
    const paymasterContext = toBiconomyTokenPaymasterContext({
        feeTokenAddress: baseSepoliaUSDC
    })
    
    const nexusClient = createSmartAccountClient({
        account: await toNexusAccount({
            signer: account,
            chain: baseSepolia,
            transport: http(),
        }),
        transport: http(bundlerUrl),
        paymaster: createBicoPaymasterClient({paymasterUrl}),
        paymasterContext
    }); 
    
    const userOpHash = await nexusClient.sendTokenPaymasterUserOp({
        calls: [
            {
                to: recipientAddress,
                value:0n,
                data: "0x"
            }
        ],
        feeTokenAddress: baseSepoliaUSDC
    })
    
    const receipt = await nexusClient.waitForUserOperationReceipt({ hash: userOpHash })
    console.log("receipt", receipt)

}
// biconomyUSDC()

async function sponsorGasWithPayMaster(){
    const nexusClient = createSmartAccountClient({
        account: await toNexusAccount({
            signer: account,
            chain: baseSepolia,
            transport: http(),
        }),
        transport: http(bundlerUrl),
        paymaster: createBicoPaymasterClient({paymasterUrl}),
    }); 
    
     
    const hash = await nexusClient.sendUserOperation({ calls:  
        [
            {
                to : '0xf5715961C550FC497832063a98eA34673ad7C816',
                value: 0n,
                data: "0x"
            },
            {
                to : '0xf5715961C550FC497832063a98eA34673ad7C816',
                value: 0n,
                data: "0x"
            }
        ]
        
    },
    ); 
    console.log("Transaction hash: ", hash) 
    const receipt = await nexusClient.waitForUserOperationReceipt({ hash });

    console.log("receipt", receipt)
}

sponsorGasWithPayMaster()