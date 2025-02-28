import React, { useState, useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Loader2, Percent, Wallet, BarChart3 } from 'lucide-react';
import { createWalletClient, custom, type Hex } from 'viem';
import { mainnet, sepolia, holesky } from 'viem/chains';
import { toast } from 'sonner';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Chain configurations
const CHAIN_CONFIGS = {
    'ethereum': mainnet,
    'ethereum-sepolia': sepolia,
    'ethereum-holesky': holesky,
} as const;

interface YieldOpportunity {
    id: string;
    apy: number;
    token: {
        address?: string;
        symbol: string;
        network: string;
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
                additionalAddresses?: any;
            };
            args: {
                amount: {
                    required: boolean;
                    minimum: number;
                };
                validatorAddress?: any;
                validatorAddresses?: any;
            };
        };
        exit?: {
            addresses: {
                address: {
                    required: boolean;
                    network: string;
                };
                additionalAddresses?: any;
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

interface StakedBalance {
    integrationId: string;
    amount: string;
    type: string;
    validatorAddress?: string;
}

interface Network {
    id: string;
    name: string;
}

const STAKEKIT_API_KEY = "33bea379-2557-4368-9d3d-09e0b47d6a68";
const BASE_URL = "https://api.stakek.it";

const NETWORKS: Network[] = [
    { id: "ethereum-holesky", name: "Ethereum Holesky" },
    { id: "ethereum", name: "Ethereum" },
    { id: "ethereum-sepolia", name: "Ethereum Sepolia" }
];

type ActionType = 'enter' | 'exit';

const StakingPage: React.FC = () => {
    const { authenticated } = usePrivy();
    const { wallets } = useWallets();
    const wallet = wallets.find(
        (wallet) => wallet.walletClientType === 'metamask'
    );

    const [network, setNetwork] = useState("ethereum-holesky");
    const [yields, setYields] = useState<YieldOpportunity[]>([]);
    const [loading, setLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [selectedYield, setSelectedYield] = useState<YieldOpportunity | null>(null);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [userBalance, setUserBalance] = useState("0");
    const [stakedBalance, setStakedBalance] = useState<StakedBalance[]>([]);
    const [exitAmount, setExitAmount] = useState("");
    const [action, setAction] = useState<ActionType>('enter');

    // Derived state
    const totalStakedAmount = useMemo(() => {
        return stakedBalance
            .filter(balance => ["preparing", "staked"].includes(balance.type))
            .reduce((sum, balance) => {
                return sum + parseFloat(balance.amount);
            }, 0)
            .toFixed(18); // Use higher precision to match ETH decimals
    }, [stakedBalance]);

    const estimatedAnnualReward = useMemo(() => {
        if (!selectedYield || parseFloat(totalStakedAmount) <= 0) return 0;
        return parseFloat(totalStakedAmount) * selectedYield.apy;
    }, [totalStakedAmount, selectedYield]);

    // const isValidNetworkType = (network: string): network is keyof typeof CHAIN_CONFIGS => {
    //     return network in CHAIN_CONFIGS;
    // };

    const fetchYields = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${BASE_URL}/v1/yields?network=${network}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            // const filteredYields = filterYields(data.data);
            setYields(data.data);
        } catch (err) {
            setError(`Failed to fetch yield opportunities: ${err instanceof Error ? err.message : 'Unknown error'}`);
            toast.error("Couldn't load yield opportunities. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // const filterYields = (allYields: YieldOpportunity[]) => {
    //     return allYields
    //         .filter((y) => {
    //             const hasZeroMinimum = y.args?.enter?.args?.amount?.minimum < 1;
    //             return y.status.enter && y.status.exit && hasZeroMinimum;
    //         })
    //         .sort((a, b) => b.apy - a.apy);
    // };

    const fetchUserBalance = async () => {
        if (!authenticated || !wallet?.address || !selectedYield) return;

        try {
            setError("");
            const tokenAddress = selectedYield?.token?.address ?? "native";
            const payload = [{
                network,
                address: wallet.address,
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

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            setUserBalance(data[0]?.amount || "0");
        } catch (err) {
            setError(`Failed to fetch balance: ${err instanceof Error ? err.message : 'Unknown error'}`);
            toast.error("Couldn't retrieve your balance.");
        }
    };

    const fetchStakedBalance = async () => {
        if (!authenticated || !wallet?.address || !selectedYield) return;

        try {
            setError("");
            const response = await fetch(`${BASE_URL}/v1/yields/${selectedYield.id}/balances`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
                body: JSON.stringify({
                    addresses: { address: wallet.address }
                })
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            setStakedBalance(data);
        } catch (err) {
            setError(`Failed to fetch staked balance: ${err instanceof Error ? err.message : 'Unknown error'}`);
            toast.error("Couldn't retrieve your staked balance.");
        }
    };

    const monitorTransaction = async (txId: string, hash: string): Promise<boolean> => {
        let retries = 0;
        const maxRetries = 30; // 1 minute (2s intervals)

        while (retries < maxRetries) {
            try {
                const statusResponse = await fetch(`${BASE_URL}/v1/transactions/${txId}/status`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": STAKEKIT_API_KEY,
                    },
                });

                if (!statusResponse.ok) {
                    throw new Error(`API returned status ${statusResponse.status}`);
                }

                const status = await statusResponse.json();

                if (status.status === "CONFIRMED") {
                    toast.success(
                        <div className="flex flex-col">
                            <span>Transaction confirmed</span>
                            <a
                                href={status.url || `https://etherscan.io/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                            >
                                View transaction
                            </a>
                        </div>
                    );
                    return true;
                } else if (status.status === "FAILED") {
                    throw new Error("Transaction failed");
                }
            } catch (err) {
                console.error("Error checking transaction status:", err);
            }

            retries++;
            await new Promise(r => setTimeout(r, 2000));
        }

        toast.warning("Transaction is taking longer than expected but may still complete.");
        return false;
    };

    const handleAction = async () => {
        if (!authenticated || !selectedYield || !wallet?.address) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            setTransactionLoading(true);
            setError("");

            // Create staking session
            const session = await fetch(`${BASE_URL}/v1/actions/${action}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": STAKEKIT_API_KEY,
                },
                body: JSON.stringify({
                    integrationId: selectedYield.id,
                    addresses: { address: wallet.address },
                    args: { amount: action === 'enter' ? amount : exitAmount }
                })
            });

            if (!session.ok) {
                throw new Error(`Failed to create session: ${session.status}`);
            }

            const sessionData = await session.json();
            if (!sessionData.transactions) {
                throw new Error("No transactions returned from API");
            }

            // Process each transaction
            for (const tx of sessionData.transactions) {
                if (tx.status === "SKIPPED") continue;

                // Fetch unsigned transaction
                let unsignedTx;
                for (let i = 0; i < 3; i++) {
                    try {
                        const unsignedTxResponse = await fetch(`${BASE_URL}/v1/transactions/${tx.id}`, {
                            method: 'PATCH',
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": STAKEKIT_API_KEY,
                            }
                        });

                        if (!unsignedTxResponse.ok) {
                            throw new Error(`API returned status ${unsignedTxResponse.status}`);
                        }

                        unsignedTx = await unsignedTxResponse.json();
                        break;
                    } catch (err) {
                        console.log(`Attempt ${i + 1} => retrying...`);
                        await new Promise((r) => setTimeout(r, 1000));
                    }
                }

                if (!unsignedTx) {
                    throw new Error("Failed to get unsigned transaction after multiple attempts");
                }

                const txData = JSON.parse(unsignedTx.unsignedTransaction);

                // Switch chain if needed
                if (unsignedTx.network === 'ethereum-holesky') {
                    await wallet.switchChain(holesky.id);
                } else if (unsignedTx.network === 'ethereum-sepolia') {
                    await wallet.switchChain(sepolia.id);
                } else if (unsignedTx.network === 'ethereum') {
                    await wallet.switchChain(mainnet.id);
                }

                // Get provider and create wallet client
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    throw new Error("Ethereum provider is undefined");
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: CHAIN_CONFIGS[unsignedTx.network as keyof typeof CHAIN_CONFIGS],
                    transport: custom(provider),
                });

                // Send transaction
                const hash = await walletClient.sendTransaction(txData);

                // Submit transaction hash
                await fetch(`${BASE_URL}/v1/transactions/${tx.id}/submit_hash`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": STAKEKIT_API_KEY,
                    },
                    body: JSON.stringify({ hash })
                });

                await monitorTransaction(tx.id, hash);
            }

            setAmount("");
            setExitAmount("");
            fetchUserBalance();
            fetchStakedBalance();
            toast.success(`${action === 'enter' ? 'Staking' : 'Unstaking'} operation completed successfully!`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Please try again";
            toast.error(`Operation failed: ${errorMessage}`);
            setError(`${action === 'enter' ? 'Staking' : 'Unstaking'} failed: ${errorMessage}`);
        } finally {
            setTransactionLoading(false);
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
            fetchStakedBalance();
        }
    }, [selectedYield]);

    // Reset fields when changing action
    useEffect(() => {
        if (action === 'enter') {
            setExitAmount("");
        } else {
            setAmount("");
        }
    }, [action]);

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-md bg-card">
                    <CardContent className="p-6">
                        <p className="text-center text-card-foreground">Please connect your wallet to continue</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Staking Dashboard</h1>
                    <p className="text-muted-foreground">Earn rewards by staking your assets</p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                    <div className="space-y-6">
                        <Card className="h-fit bg-card">
                            <CardHeader>
                                <CardTitle className="text-card-foreground">Network</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={network}
                                    onValueChange={(value) => {
                                        setNetwork(value);
                                        setSelectedYield(null);
                                        setAmount("");
                                        setExitAmount("");
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-secondary text-secondary-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NETWORKS.map((net) => (
                                            <SelectItem key={net.id} value={net.id}>
                                                {net.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {selectedYield && parseFloat(totalStakedAmount) > 0 && (
                            <Card className="bg-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                                        <BarChart3 className="h-5 w-5" />
                                        Your Staked Position
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Staked</span>
                                            <span className="font-medium text-card-foreground">
                                                {parseFloat(totalStakedAmount).toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 4
                                                })} {selectedYield.token.symbol}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Current APY</span>
                                            <span className="font-medium text-primary">{(selectedYield.apy * 100).toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Est. Annual Reward</span>
                                            <span className="font-medium text-primary">
                                                {estimatedAnnualReward.toLocaleString(undefined, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 4
                                                })} {selectedYield.token.symbol}
                                            </span>
                                        </div>
                                    </div>
                                    <Separator className="bg-border" />
                                    <div>
                                        <Button
                                            variant="outline"
                                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            onClick={() => {
                                                setAction('exit');
                                                setTimeout(() => {
                                                    document.getElementById('unstake-tab')?.click();
                                                }, 0);
                                            }}
                                        >
                                            <ArrowDownCircle className="h-4 w-4 mr-2" />
                                            Manage Staked Position
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <Card className="bg-card">
                                <CardContent className="flex items-center justify-center min-h-[300px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-card">
                                <CardHeader>
                                    <CardTitle className="text-card-foreground">Yield Opportunities</CardTitle>
                                    <CardDescription>Select an opportunity to start staking</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {yields.length > 0 ? (
                                        <Select
                                            value={selectedYield?.id || ""}
                                            onValueChange={(value) => {
                                                setSelectedYield(yields.find(y => y.id === value) || null);
                                                setAmount("");
                                                setExitAmount("");
                                            }}
                                        >
                                            <SelectTrigger className="bg-secondary text-secondary-foreground">
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
                                    ) : (
                                        <p className="text-center text-muted-foreground">
                                            No yield opportunities available for this network.
                                        </p>
                                    )}

                                    {selectedYield && (
                                        <div className="space-y-6 mt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                                                    <Wallet className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium text-secondary-foreground">Available Balance</p>
                                                        <p className="text-2xl font-bold text-secondary-foreground">
                                                            {parseFloat(userBalance).toLocaleString(undefined, {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 4
                                                            })} {selectedYield.token.symbol}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                                                    <Percent className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium text-secondary-foreground">Current APY</p>
                                                        <p className="text-2xl font-bold text-primary">{(selectedYield.apy * 100).toFixed(2)}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="bg-border" />

                                            <div className="space-y-2">
                                                <h3 className="font-medium text-card-foreground">Staking Information</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="p-3 bg-secondary rounded-lg">
                                                        <p className="text-sm text-muted-foreground">Minimum Stake</p>
                                                        <p className="font-medium text-secondary-foreground">
                                                            {selectedYield.args.enter.args.amount.minimum} {selectedYield.token.symbol}
                                                        </p>
                                                    </div>
                                                    {selectedYield.metadata.cooldownPeriod && (
                                                        <div className="p-3 bg-secondary rounded-lg">
                                                            <p className="text-sm text-muted-foreground">Cooldown Period</p>
                                                            <p className="font-medium text-secondary-foreground">
                                                                {selectedYield.metadata.cooldownPeriod.days} days
                                                            </p>
                                                        </div>
                                                    )}
                                                    {selectedYield.metadata.withdrawPeriod && (
                                                        <div className="p-3 bg-secondary rounded-lg">
                                                            <p className="text-sm text-muted-foreground">Withdraw Period</p>
                                                            <p className="font-medium text-secondary-foreground">
                                                                {selectedYield.metadata.withdrawPeriod.days} days
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Tabs
                                                value={action}
                                                onValueChange={(v) => setAction(v as ActionType)}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 bg-secondary">
                                                    <TabsTrigger value="enter" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                        Stake
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        id="unstake-tab"
                                                        value="exit"
                                                        disabled={parseFloat(totalStakedAmount) <= 0}
                                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                    >
                                                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                                                        Unstake
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="enter" className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label htmlFor="stake-amount" className="text-sm text-card-foreground font-medium">
                                                            Amount to Stake
                                                        </label>
                                                        <Input
                                                            id="stake-amount"
                                                            type="number"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            placeholder={`Minimum ${selectedYield.args.enter.args.amount.minimum}`}
                                                            min={selectedYield.args.enter.args.amount.minimum}
                                                            step="any"
                                                            className="bg-secondary text-secondary-foreground"
                                                        />
                                                        {userBalance !== "0" && (
                                                            <div className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAmount(userBalance)}
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    Max
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={handleAction}
                                                        disabled={
                                                            transactionLoading ||
                                                            !amount ||
                                                            parseFloat(amount) <= 0 ||
                                                            parseFloat(amount) < selectedYield.args.enter.args.amount.minimum ||
                                                            parseFloat(amount) > parseFloat(userBalance)
                                                        }
                                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                                        size="lg"
                                                    >
                                                        {transactionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                        Stake {amount ? parseFloat(amount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 4
                                                        }) : '0'} {selectedYield.token.symbol}
                                                    </Button>
                                                </TabsContent>
                                                <TabsContent value="exit" className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label htmlFor="unstake-amount" className="text-sm text-card-foreground font-medium">
                                                            Amount to Unstake
                                                        </label>
                                                        <Input
                                                            id="unstake-amount"
                                                            type="number"
                                                            value={exitAmount}
                                                            onChange={(e) => setExitAmount(e.target.value)}
                                                            placeholder={`Maximum ${totalStakedAmount}`}
                                                            min={selectedYield?.args.exit?.args?.amount?.minimum || 0}
                                                            max={totalStakedAmount}
                                                            step="any"
                                                            className="bg-secondary text-secondary-foreground"
                                                        />
                                                        {totalStakedAmount !== "0" && (
                                                            <div className="text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExitAmount(totalStakedAmount)}
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    Max
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={handleAction}
                                                        disabled={
                                                            transactionLoading ||
                                                            !exitAmount ||
                                                            parseFloat(exitAmount) <= 0 ||
                                                            parseFloat(exitAmount) > parseFloat(totalStakedAmount)
                                                        }
                                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                                        size="lg"
                                                    >
                                                        {transactionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                        Unstake {exitAmount ? parseFloat(exitAmount).toLocaleString(undefined, {
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 4
                                                        }) : '0'} {selectedYield.token.symbol}
                                                    </Button>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StakingPage;