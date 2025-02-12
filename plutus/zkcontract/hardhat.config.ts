import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config(); // Load environment variables from .env
import "@nomicfoundation/hardhat-verify";

const config: HardhatUserConfig = {
  solidity: "0.8.28",

  
  networks: {
    "edu-chain-testnet": {
      // Testnet configuration
      url: `https://open-campus-codex-sepolia.drpc.org`,
      accounts: [process.env.PRIVATE_KEY || ""],
  },
  
},
}

export default config;
