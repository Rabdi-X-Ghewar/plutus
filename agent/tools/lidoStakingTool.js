import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ethers } from "ethers";
import { LidoSDK, LidoSDKCore } from "@lidofinance/lido-ethereum-sdk";
import { createPublicClient, createWalletClient, custom, http, parseEther } from "viem";
import { holesky } from "viem/chains";
import { getProvider } from "./web3Provider.js";


const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http("https://holesky.drpc.org"),
});

// Initialize the LidoSDK with the RPC and wallet client.
// Adjust chainId as needed; here it is set to 17000 which might correspond to your test network.
const lidoSDK = new LidoSDK({
  chainId: 17000,
  rpcProvider, // Public provider for reading data
  // walletProvider:getProvider(), // Wallet provider for sending transactions
});


class LidoStakingTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "LidoStakingTool",
      description: `A tool for interacting with Lido Ethereum Staking. Available operations:
        - stakeETH: Stake ETH and receive stETH.
        - getBalances: Fetch ETH, stETH, and wstETH balances.
        - withdrawStETH: Request withdrawal of stETH.
        - wrapETH: Convert ETH to wstETH.
        - unwrapETH: Convert wstETH back to ETH.`,
      schema: z.object({
        operation: z.enum([
          "stakeETH",
          "getBalances",
          "withdrawStETH",
          "wrapETH",
          "unwrapETH",
        ]),
        params: z.object({
          address: z.string(), // Required user address
          amount: z.number().optional(),
        }),
      }),
    });
  }

  async _call(args) {
    try {
      const { operation, params } = args;
      const { address, amount } = params;

      switch (operation) {
        case "stakeETH":
          if (!amount) throw new Error("Amount is required for staking");
          return await this.stakeETH(amount, address);

        case "getBalances":
          return await this.getBalances(address);

        case "withdrawStETH":
          if (!amount) throw new Error("Amount is required for withdrawal");
          return await this.withdrawStETH(amount, address);

        case "wrapETH":
          if (!amount) throw new Error("Amount is required for wrapping");
          return await this.wrapETH(amount, address);

        case "unwrapETH":
          if (!amount) throw new Error("Amount is required for unwrapping");
          return await this.unwrapETH(amount, address);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error(
        `LidoStakingTool error for operation ${args.operation}:`,
        error
      );
      return { error: true, message: error.message, operation: args.operation };
    }
  }

  async stakeETH(amount, userAddress) {
    const value = parseEther(amount.toString());
    // Contracts
    const addressStETH = await lidoSDK.stake.contractAddressStETH();
    const contractStETH = await lidoSDK.stake.getContractStETH();
    const stakeTx = await lidoSDK.stake.stakeEth({
      value,
      referralAddress: userAddress,
    });
    return {
      addressStETH: addressStETH,
      transaction: stakeTx,
      contractStETH: contractStETH,
    };
  }

  async getBalances(userAddress) {
    if (!userAddress || typeof userAddress !== "string") {
      throw new Error("Invalid user address provided.");
    }
    console.log("Fetching balances for address:", userAddress);
    // Ensure the user address is a valid Ethereum address.
    // const formattedAddress = ethers.utils.getAddress(userAddress);
    try {
      // Fetch ETH balance using RPC provider
      const ethBalance = await lidoSDK.core.balanceETH(userAddress);
      // Get stETH and wstETH contracts via the SDK

      return {
        ethBalance: ethBalance.toString(),
      };
    } catch (error) {
      console.error("Error fetching balances:", error);
      throw new Error("Failed to fetch balances. Please try again.");
    }
  }

  async withdrawStETH(amount, userAddress) {
    const amountInWei = parseEther(amount.toString());
    const addressWithdrawalQueue =
      await lidoSDK.withdraw.contract.contractAddressWithdrawalQueue();
    const contractWithdrawalQueue =
      await lidoSDK.withdraw.contract.getContractWithdrawalQueue();
    const requestTx = await lidoSDK.withdraw.requestWithdrawalWithPermit({
      amount: amountInWei,
      token: "stETH",
      userAddress, // Ensure we pass userAddress correctly
    });
    return {
      addressWithdrawalQueue: addressWithdrawalQueue,
      transaction: requestTx,
      contractWithdrawalQueue: contractWithdrawalQueue,
    };
  }

  async wrapETH(amount, userAddress) {
    const value = ethers.utils.parseEther(amount.toString());
    const wrapTx = await lidoSDK.wrap.wrapEth({
      value,
      account: userAddress,
    });
    return { transaction: wrapTx };
  }

  async unwrapETH(amount, userAddress) {
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const unwrapTx = await lidoSDK.wrap.unwrapEth({
      amount: amountInWei,
      account: userAddress,
    });
    return { transaction: unwrapTx };
  }
}

const lidoStakingTool = new LidoStakingTool();
export default lidoStakingTool;

