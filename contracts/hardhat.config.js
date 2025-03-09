require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

const { vars } = require("hardhat/config");

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

const DEPLOYER_PRIVATE_KEY = vars.get("DEPLOYER_PRIVATE_KEY");

const POLYSCAN_API_KEY = vars.get("POLYSCAN_API_KEY");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    polygonAmoy : {
      url:`https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts:[DEPLOYER_PRIVATE_KEY]
    },
    baseSepolia:{
      url:`https://base-sepolia.g.alchemy.com/v2/Jt0NiFk__WQEo9a9ePdpfm22wCOhuBif`,
      accounts:[DEPLOYER_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygonAmoy: POLYSCAN_API_KEY
    }
  }
};
