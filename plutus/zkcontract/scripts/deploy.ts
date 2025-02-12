require("dotenv").config(); // Load environment variables from .env
const hre = require("hardhat");

async function main() {

  const zkvContractAddress = process.env.ZKV_CONTRACT_ADDRESS;
  const vkHash = process.env.VK_HASH;
  


  const zkVoteFactory = await hre.ethers.getContractFactory("zkVote");
  const deployedContract = await zkVoteFactory.deploy(zkvContractAddress, vkHash);

  console.log(`Counter contract deployed to ${deployedContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});