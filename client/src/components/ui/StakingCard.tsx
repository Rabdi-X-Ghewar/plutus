import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  LidoSDK,
  TransactionCallbackStage,
  SDKError,
} from "@lidofinance/lido-ethereum-sdk";
import { parseEther, formatEther } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface StakingCardProps {
  web3Provider: any; // from Privy
  account: string;
}

export const StakingCard: React.FC<StakingCardProps> = ({
  web3Provider,
  account,
}) => {
  console.log("web3Provider", web3Provider);
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const [stakingLimit, setStakingLimit] = useState<string>("0");

  // Fetch balance on component mount and when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!web3Provider || !account) return;

      try {
        const lidoSDK = new LidoSDK({
          rpcUrls: ["https://ethereum-holesky.publicnode.com"],
          chainId: 17000,
          web3Provider,
        });

        const balanceETH = await lidoSDK.core.balanceETH(
          account as `0x${string}`
        );
        setBalance(formatEther(balanceETH));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [web3Provider, account]);

  useEffect(() => {
    const fetchStakingLimit = async () => {
      if (!web3Provider) return;

      try {
        const lidoSDK = new LidoSDK({
          rpcUrls: ["https://ethereum-holesky.publicnode.com"],
          chainId: 17000,
          web3Provider,
        });
        const limit = await lidoSDK.stake.getStakeLimitInfo();
        setStakingLimit(formatEther(limit.currentStakeLimit));
      } catch (error) {
        console.error("Error fetching staking limit:", error);
      }
    };

    fetchStakingLimit();
  }, [web3Provider]);

  const estimateGas = async (type: "stake" | "withdraw") => {
    if (!amount || !web3Provider) return;

    try {
      const lidoSDK = new LidoSDK({
        rpcUrls: ["https://ethereum-holesky.publicnode.com"],
        chainId: 17000,
        web3Provider,
      });

      const value = parseEther(amount.toString());

      let estimate;
      if (type === "stake") {
        estimate = await lidoSDK.stake.stakeEthEstimateGas({
          value: value,
          account: account as `0x${string}`,
        });
      } else {
        estimate =
          await lidoSDK.withdraw.request.requestWithdrawalWithPermitEstimateGas(
            {
              amount: value,
              token: "stETH",
              account: account as `0x${string}`,
              permit: {
                deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
                v: 0,
                r: "0x0000000000000000000000000000000000000000000000000000000000000000",
                s: "0x0000000000000000000000000000000000000000000000000000000000000000",
                value: BigInt(value.toString()),
              },
            }
          );
      }

      setGasEstimate(formatEther(estimate));
    } catch (error) {
      console.error("Error estimating gas:", error);
    }
  };

  const handleCallback = ({
    stage,
    payload,
  }: {
    stage: TransactionCallbackStage;
    payload: unknown;
  }) => {
    switch (stage) {
      case TransactionCallbackStage.SIGN:
        setStatus("Please sign the transaction...");
        break;
      case TransactionCallbackStage.RECEIPT:
        setStatus("Transaction submitted. Waiting for confirmation...");
        setTxHash(payload as string);
        break;
      case TransactionCallbackStage.CONFIRMATION:
        setStatus("Transaction is being confirmed...");
        break;
      case TransactionCallbackStage.DONE:
        setStatus("Transaction successful! 🎉");
        break;
      case TransactionCallbackStage.ERROR:
        const error = payload as SDKError;
        setStatus(`Error: ${error.errorMessage}`);
        break;
      default:
        break;
    }
  };

  const handleStake = async () => {
    if (!amount || !web3Provider) return;

    setIsLoading(true);
    setStatus("Initializing stake...");

    try {
      // Log provider info for debugging
      console.log("Web3Provider:", web3Provider);

      const lidoSDK = new LidoSDK({
        rpcUrls: ["https://ethereum-holesky.publicnode.com"],
        chainId: 17000,
        web3Provider,
      });

      // Validate amount
      const amountWei = parseEther(amount);
      const limitWei = parseEther(stakingLimit);

      if (amountWei > limitWei) {
        setStatus(
          `Error: Amount exceeds daily staking limit of ${stakingLimit} ETH`
        );
        return;
      }

      // Log transaction details
      console.log("Staking amount:", amount, "ETH");
      console.log("Account:", account);

      const stakeTx = await lidoSDK.stake.stakeEth({
        value: amountWei,
        callback: handleCallback as any,
        account: account as `0x${string}`,
      });

      console.log("Stake transaction:", stakeTx);

      setStatus(
        `Stake completed! Received ${formatEther(
          stakeTx.result?.stethReceived || BigInt(0)
        )} stETH`
      );
    } catch (error) {
      console.error("Detailed stake error:", error);
      const sdkError = error as SDKError;
      setStatus(
        `Error: ${
          sdkError.errorMessage ||
          "Transaction failed. Please check if your wallet is properly connected and has sufficient funds."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !web3Provider) return;

    setIsWithdrawing(true);
    setStatus("Initializing withdrawal...");

    try {
      await estimateGas("withdraw");
      const lidoSDK = new LidoSDK({
        rpcUrls: ["https://ethereum-holesky.publicnode.com"],
        chainId: 17000,
        web3Provider,
      });

      const withdrawTx =
        await lidoSDK.withdraw.request.requestWithdrawalWithPermit({
          amount: parseEther(amount.toString()),
          token: "stETH",
          callback: handleCallback as any,
          account: account as `0x${string}`,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
        });

      setStatus(
        `Withdrawal request created! Request IDs: ${withdrawTx.result?.requests
          .map((r) => r.requestId)
          .join(", ")}`
      );
    } catch (error) {
      const sdkError = error as SDKError;
      setStatus(`Error: ${sdkError.errorMessage}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleEstimateGas = async (type: "stake" | "withdraw") => {
    if (!amount) {
      setStatus("Please enter an amount first");
      return;
    }

    setStatus(`Calculating ${type} gas estimate...`);
    await estimateGas(type);
    setStatus(
      `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } gas estimation complete: ${gasEstimate} ETH`
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Stake/Withdraw ETH with Lido</CardTitle>
        <CardDescription>
          Stake your ETH to earn staking rewards or withdraw your staked ETH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Amount (ETH)</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-sm text-gray-500">
                    Balance: {balance} ETH
                  </span>
                </TooltipTrigger>
                <TooltipContent>Your ETH Balance</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading || isWithdrawing}
            min="0"
            step="0.01"
          />
          <div className="text-sm text-gray-500">
            Daily Staking Limit: {stakingLimit} ETH
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => handleEstimateGas("stake")}
              variant="secondary"
              disabled={!amount}
              className="w-full mb-2"
            >
              Estimate Stake Gas
            </Button>
            <Button
              onClick={() => handleEstimateGas("withdraw")}
              variant="secondary"
              disabled={!amount}
              className="w-full"
            >
              Estimate Withdraw Gas
            </Button>
          </div>
          {gasEstimate && (
            <div className="text-sm text-gray-500">
              Estimated Gas: {gasEstimate} ETH
            </div>
          )}
          {status && (
            <div className="p-3 rounded-lg bg-gray-100">
              <p className="text-sm">{status}</p>
              {txHash && (
                <a
                  href={`https://holesky.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleStake}
          disabled={isLoading || isWithdrawing || !amount}
          className="flex-1"
        >
          {isLoading ? "Staking..." : "Stake ETH"}
        </Button>
        <Button
          onClick={handleWithdraw}
          disabled={isLoading || isWithdrawing || !amount}
          variant="outline"
          className="flex-1"
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw ETH"}
        </Button>
      </CardFooter>
    </Card>
  );
};
