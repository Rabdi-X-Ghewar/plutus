// provider.js
let web3Provider = null;
let providerResolve = null;
let userAddress = null;
let userAddressResolve = null;

// Create promises that resolve when the provider and address are set
const providerPromise = new Promise((resolve) => {
  providerResolve = resolve;
});

const userAddressPromise = new Promise((resolve) => {
  userAddressResolve = resolve;
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

export const setUserAddress = (address) => {
  if (!address) {
    throw new Error("Invalid address.");
  }
  userAddress = address;
  userAddressResolve(address); // Resolve the promise when the address is set
};

export const getUserAddress = async () => {
  if (userAddress) {
    return userAddress; // Return the address if already set
  }
  // Wait for the address to be set
  return userAddressPromise;
};
