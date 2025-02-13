const fs = require("fs");
const { zkVerifySession, Library, CurveType } = require("zkverifyjs");
require('dotenv').config({ path: ['.env', '.env.secrets'] })
const appRoot = require("app-root-path");

async function run() {
    // Load verification key from file
    const vk = JSON.parse(fs.readFileSync(`${appRoot}/circuit/setup/verification_key.json`));

    // Establish a session with zkVerify
    const session = await zkVerifySession.start()
        .Custom("wss://testnet-rpc.zkverify.io")
        .withAccount("wool shine document produce ritual basket tilt creek know tree spice project");

    // Send verification key to zkVerify for registration
    const { transactionResult } = await session.registerVerificationKey()
        .groth16(Library.snarkjs, CurveType.bn128)
        .execute(vk);
    const { statementHash } = await transactionResult;
    console.log(`vk hash: ${statementHash}`)
}

run()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });