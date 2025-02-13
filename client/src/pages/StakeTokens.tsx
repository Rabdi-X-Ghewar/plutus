import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { createWalletClient, custom, parseEther, type Hex } from 'viem';
import { mainnet, sepolia, holesky } from 'viem/chains';
import { toast } from 'sonner';

// Chain configurations
const CHAIN_CONFIGS = {
    'ethereum': mainnet,
    'ethereum-sepolia': sepolia,
    'ethereum-holesky': holesky,
};

interface YieldOpportunity {
    id: string;
    apy: number;
    token: {
        address?: string;
        symbol: string;
    };
    metadata: {
        name: string;
        cooldownPeriod?: { days: number };
        warmupPeriod?: { days: number };
        withdrawPeriod?: { days: number };
    };
    status: {
        enter: boolean;
        exit: boolean;
    };
    args: {
        enter: {
            addresses: {
                address: {
                    required: boolean;
                    network: string;
                };
            };
            args: {
                amount: {
                    required: boolean;
                    minimum: number;
                };
            };
        };
    };
}

const STAKEKIT_API_KEY = "33bea379-2557-4368-9d3d-09e0b47d6a68";
const BASE_URL = "https://api.stakek.it";

const StakingPage = () => {
    const { user, authenticated } = usePrivy();
    const { wallets } = useWallets();
    const wallet = wallets[1];

    const [network, setNetwork] = useState("ethereum-holesky");
    const [yields, setYields] = useState<YieldOpportunity[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedYield, setSelectedYield] = useState<YieldOpportunity | null>(null);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [userBalance, setUserBalance] = useState("0");

    const networks = [
        { id: "ethereum-holesky", name: "Ethereum Holesky" },
        { id: "ethereum", name: "Ethereum" },
        { id: "ethereum-sepolia", name: "Ethereum Sepolia" }
    ];

    const fetchYields = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/v1/yields?network=${network}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
            });
            const data = await response.json();
            const filteredYields = filterYields(data.data);
            setYields(filteredYields);
        } catch (error) {
            setError("Failed to fetch yield opportunities");
        } finally {
            setLoading(false);
        }
    };

    const filterYields = (allYields: YieldOpportunity[]) => {
        return allYields
            .filter((y) => {
                const hasZeroMinimum = y.args?.enter?.args?.amount?.minimum < 1;
                return y.status.enter && y.status.exit && hasZeroMinimum;
            })
            .sort((a, b) => b.apy - a.apy);
    };

    const fetchUserBalance = async () => {
        if (!authenticated || !user?.wallet?.address) return;

        try {
            const tokenAddress = selectedYield?.token?.address ?? "native";
            const payload = [{
                network,
                address: user.wallet.address,
                ...(tokenAddress !== "native" && { tokenAddress })
            }];

            const response = await fetch(`${BASE_URL}/v1/tokens/balances`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
                body: JSON.stringify({ addresses: payload })
            });
            const data = await response.json();
            setUserBalance(data[0]?.amount || "0");
        } catch (error) {
            setError("Failed to fetch balance");
        }
    };

    const handleStake = async () => {
        if (!authenticated || !selectedYield || !wallet) return;

        try {
            setLoading(true);
            setError("");

            // Create staking session
            const session = await fetch(`${BASE_URL}/v1/actions/enter`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
                body: JSON.stringify({
                    integrationId: selectedYield.id,
                    addresses: { address: user?.wallet?.address },
                    args: { amount }
                })
            });

            const { transactions } = await session.json();
            // Process each transaction
            for (const tx of transactions) {
                const status = await fetch(`${BASE_URL}/v1/transactions/${tx.id}/status`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": STAKEKIT_API_KEY,
                    },
                })

                const st = await status.json();
                if (!st) {
                    console.log("Earn Agent => no TX status => break");
                    break;
                }
                if (st.status === "SKIPPED") continue;

                // Get unsigned transaction
                const unsignedTxResponse = await fetch(`${BASE_URL}/v1/transactions/${tx.id}`, {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": STAKEKIT_API_KEY,
                    }
                });
                const unsignedTx = await unsignedTxResponse.json();
                const txData = JSON.parse(unsignedTx.unsignedTransaction);
                await wallet.switchChain(holesky.id);
                // Get provider and create wallet client
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    throw new Error("Ethereum provider is undefined");
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: CHAIN_CONFIGS[network as keyof typeof CHAIN_CONFIGS],
                    transport: custom(provider),
                });

                // Send transaction
                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: txData.to as `0x${string}`,
                    value: BigInt(txData.value || "0"), // Changed this line - using BigInt directly instead of parseEther
                    data: txData.data,
                    gas: txData.gas ? BigInt(txData.gas) : undefined,
                    gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
                });

                // Submit transaction hash
                await fetch(`${BASE_URL}/v1/transactions/${tx.id}/submit`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": STAKEKIT_API_KEY,
                    },
                    body: JSON.stringify({ signedTransaction: hash })
                });

                // Monitor transaction status
                while (true) {
                    const statusResponse = await fetch(`${BASE_URL}/v1/transactions/${tx.id}/status`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-API-KEY": STAKEKIT_API_KEY,
                        },
                    });
                    const status = await statusResponse.json();

                    if (st.status === "CONFIRMED") {
                        toast.success("Transaction confirmed");
                        break;
                    } else if (status.status === "FAILED") {
                        throw new Error("Transaction failed");
                    }
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            setAmount("");
            fetchUserBalance();
        } catch (error) {
            toast.error("Staking failed. Please try again.");
            setError("Staking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authenticated) {
            fetchYields();
        }
    }, [network, authenticated]);

    useEffect(() => {
        if (selectedYield) {
            fetchUserBalance();
        }
    }, [selectedYield]);

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p className="text-center">Please connect your wallet to continue</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Stake Your Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Network</label>
                            <Select value={network} onValueChange={setNetwork}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {networks.map((net) => (
                                        <SelectItem key={net.id} value={net.id}>
                                            {net.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Yield Opportunity</label>
                                    <Select
                                        value={selectedYield?.id || ""}
                                        onValueChange={(value) => setSelectedYield(yields.find(y => y.id === value) || null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a yield opportunity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yields.map((y) => (
                                                <SelectItem key={y.id} value={y.id}>
                                                    {y.metadata.name} - APY: {(y.apy * 100).toFixed(2)}%
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedYield && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p>Available Balance: {userBalance} {selectedYield.token.symbol}</p>
                                            <p>Minimum Stake: {selectedYield.args.enter.args.amount.minimum}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Amount to Stake</label>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="Enter amount to stake"
                                                min={selectedYield.args.enter.args.amount.minimum}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleStake}
                                            disabled={loading || !amount || parseFloat(amount) <= 0}
                                            className="w-full"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Stake
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StakingPage;