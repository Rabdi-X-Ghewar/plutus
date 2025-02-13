const fs = require("fs");
const { zkVerifySession, Library, CurveType, ZkVerifyEvents } = require("zkverifyjs");
const ethers = require("ethers");
const { hideBin } = require("yargs/helpers");
require("dotenv").config({ path: [".env", ".env.secrets"] });
const prompt = require("prompt-sync")();
const appRoot = require("app-root-path");

async function verify(proof, publicSignals) {
  const {
    ZKV_RPC_URL,
    ZKV_SEED_PHRASE,
    ETH_RPC_URL,
    ETH_SECRET_KEY,
    ETH_ZKVERIFY_CONTRACT_ADDRESS,
    ETH_APP_CONTRACT_ADDRESS,
  } = process.env;

  try {
    const evmAccount = ethers.computeAddress(ETH_SECRET_KEY);
    console.log("-------------- Public Signals ------------------");
    console.log(publicSignals);
    console.log("---------------- Proof ----------------");
    console.log(proof);

    const vk = JSON.parse(
      fs.readFileSync(`${appRoot}/circuit/setup/verification_key.json`)
    );

    const session = await zkVerifySession
      .start()
      .Testnet()
      .withAccount("wool shine document produce ritual basket tilt creek know tree spice project");

    // Perform proof verification
    const { events: verifyEvents, transactionResult } = await session.verify()
      .groth16(Library.snarkjs, CurveType.bn128)
      .waitForPublishedAttestation()
      .withRegisteredVk()
      .execute({
        proofData: {
          vk: '0x2693f2fae1b8c30839c99080ab55c96276e968aaad0669a9d6d1ff3488333ec7', // Use the verification key from constructor
          proof: proof,
          publicSignals: publicSignals,
        },
      });

    const result = await transactionResult;
    console.log('Verification result:', result);

    verifyEvents.on(ZkVerifyEvents.IncludedInBlock, ({ txHash }) => {
      console.log(`Transaction accepted in zkVerify, tx-hash: ${txHash}`);
    });

    verifyEvents.on(ZkVerifyEvents.Finalized, ({ blockHash }) => {
      console.log(`Transaction finalized in zkVerify, block-hash: ${blockHash}`);
    });

    verifyEvents.on("error", (error) => {
      console.error("An error occurred during the transaction:", error);
    });

    const { attestationId, leafDigest } = result;
    console.log("Attestation published on zkVerify");
    console.log(`\tattestationId: ${attestationId}`);
    console.log(`\tleafDigest: ${leafDigest}`);

    // Retrieve Merkle proof details


    // try {

    // } catch (error) {
    //   console.error('RPC failed:', error);
    // }


    //Interaction with SCs in EVM
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, null, {
      polling: true,
    });
    const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);

    const abiZkvContract = [
      "event AttestationPosted(uint256 indexed attestationId, bytes32 indexed root)",
    ];

    const abiAppContract = [
      "function proveVoteWasCast(uint256 attestationId, uint256 root, uint256 nullifier, bytes32[] calldata merklePath, uint256 leafCount, uint256 index, uint256 voteCommitment)",
      "event SuccessfulProofSubmission(address indexed from, uint256 voteCommitment)"
    ];

    const zkvContract = new ethers.Contract(ETH_ZKVERIFY_CONTRACT_ADDRESS, abiZkvContract, provider);
    const appContract = new ethers.Contract(ETH_APP_CONTRACT_ADDRESS, abiAppContract, wallet);

    const filterAttestationsById = zkvContract.filters.AttestationPosted(attestationId, null);

    // Return a promise that resolves when the EVM transaction is handled
    return new Promise(async (resolve, reject) => {

      zkvContract.once(filterAttestationsById, async (_id, _root) => {

        try {
          // After the attestation has been posted on the EVM, send a ⁠ proveVoteWasCast ⁠ tx
          // to the app contract, with all the necessary merkle proof details
          const proofDetails = await session.poe(attestationId, leafDigest);
          const { proof: merkleProof, numberOfLeaves, leafIndex } = proofDetails;
          const [root, nullifier, voteCommitment] = publicSignals;
          console.log(`\troot ${root}`);
          console.log(`\tnullifier ${nullifier}`);
          console.log(`\tvoteCommitment ${voteCommitment}`);

          console.log(`Merkle proof details`);
          console.log(`\tmerkleProof: ${merkleProof}`);
          console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
          console.log(`\tleafIndex: ${leafIndex}`);
          const txResponse = await appContract.proveVoteWasCast(
            attestationId,
            root,
            nullifier,
            merkleProof,
            numberOfLeaves,
            leafIndex,
            voteCommitment
          );
          const { hash } = await txResponse;
          console.log(`Tx sent to EVM, tx-hash ${hash}`);


          // Wait for transaction confirmation
          const receipt = await txResponse;
          console.log("Transaction confirmed:", receipt.status === 1 ? "Success" : "Failed");


          return receipt.status === 1;
          return true;
        } catch (txError) {
          console.error("Error in proveVoteWasCast:", txError);
          reject(txError);
        }
      });

    });
  } catch (error) {
    console.error("Error in verification process:", error);
    return false;
  }
}

module.exports = { verify };
