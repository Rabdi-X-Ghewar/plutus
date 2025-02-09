// provider.js
let web3Provider = null;
let providerResolve = null;

// Create a promise that resolves when the provider is set
const providerPromise = new Promise((resolve) => {
  providerResolve = resolve;
});

export const setProvider = (provider) => {
  if (!provider) {
    throw new Error("Invalid provider.");
  }
  web3Provider = provider;
  providerResolve(provider); // Resolve the promise when the provider is set
};

export const getProvider = async () => {
  if (web3Provider) {
    return web3Provider; // Return the provider if already set
  }
  // Wait for the provider to be set
  return providerPromise;
};
