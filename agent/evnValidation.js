// envValidation.js
function validateEnvironment() {
  const missingVars = [];
  const requiredVars = [
    "OPENROUTER_API_KEY",
    "CDP_API_KEY_NAME",
    "CDP_API_KEY_PRIVATE_KEY",
    "STAKING_REWARDS_API_KEY",
  ];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set:");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
  if (!process.env.NETWORK_ID) {
    console.warn(
      "Warning: NETWORK_ID not set, defaulting to base-sepolia testnet"
    );
  }
}

export default validateEnvironment;
