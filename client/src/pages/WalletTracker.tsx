import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Loader2, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
}

const WalletTracker = () => {
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [receivedTransactions, setReceivedTransactions] = useState<Transaction[]>([]);
    const [sentTransactions, setSentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ethPrice, setEthPrice] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
    const [currentPageReceived, setCurrentPageReceived] = useState<number>(1);
    const [currentPageSent, setCurrentPageSent] = useState<number>(1);
    const PAGE_SIZE = 5; // Number of transactions per page
    const API_KEY = "9BVI76HUXR3GAFJ1SXBMIN9TXVS1A1Q28H"; // Replace with your Etherscan API key

    // Fetch the current ETH price in USD using CoinGecko API
    const fetchEthPrice = async () => {
        try {
            const response = await axios.get(
                "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            );
            setEthPrice(response.data.ethereum.usd);
        } catch (err) {
            console.error("Error fetching ETH price:", err);
        }
    };

    useEffect(() => {
        fetchEthPrice(); // Fetch ETH price on component mount
    }, []);

    // Fetch transactions for the wallet address
    const fetchWalletTransactions = async (
        address: string,
        page: number,
        type: "received" | "sent"
    ) => {
        setLoading(true);
        setError(null);

        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${PAGE_SIZE}&sort=desc&apikey=${API_KEY}`;

        try {
            const response = await axios.get(url);

            if (response.data.status === "1") {
                const transactions = response.data.result;

                if (type === "received") {
                    setReceivedTransactions((prevTransactions) => [...prevTransactions, ...transactions]);
                } else {
                    setSentTransactions((prevTransactions) => [...prevTransactions, ...transactions]);
                }
            } else {
                setError(response.data.message || "Failed to fetch transactions.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress.trim()) {
            setError("Please enter a valid wallet address.");
            return;
        }

        // Reset states when submitting a new wallet address
        setReceivedTransactions([]);
        setSentTransactions([]);
        setCurrentPageReceived(1);
        setCurrentPageSent(1);

        // Fetch initial transactions for both tabs
        fetchWalletTransactions(walletAddress, 1, "received");
        fetchWalletTransactions(walletAddress, 1, "sent");
    };

    // Function to format timestamp into local date, time, and timezone
    const formatDate = (timestamp: string): string => {
        const date = new Date(parseInt(timestamp, 10) * 1000); // Convert Unix timestamp to milliseconds
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        };
        return new Intl.DateTimeFormat(undefined, options).format(date);
    };

    // Truncate wallet addresses for better readability
    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Infinite scroll logic
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.scrollHeight - 10 &&
                !loading
            ) {
                if (activeTab === "received") {
                    setCurrentPageReceived((prevPage) => prevPage + 1);
                } else if (activeTab === "sent") {
                    setCurrentPageSent((prevPage) => prevPage + 1);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, activeTab]);

    // Fetch more transactions when the page changes
    useEffect(() => {
        if (currentPageReceived > 1 && walletAddress.trim()) {
            fetchWalletTransactions(walletAddress, currentPageReceived, "received");
        }
    }, [currentPageReceived]);

    useEffect(() => {
        if (currentPageSent > 1 && walletAddress.trim()) {
            fetchWalletTransactions(walletAddress, currentPageSent, "sent");
        }
    }, [currentPageSent]);

    // Transaction card component
    const TransactionCard = ({ tx, type }: { tx: Transaction; type: "received" | "sent" }) => {
        const ethValue = parseFloat(tx.value) / 1e18;
        const usdValue = ethPrice ? (ethValue * ethPrice).toFixed(2) : "N/A";
        const formattedDate = formatDate(tx.timeStamp);

        return (
            <Card className="p-4 bg-white shadow-sm rounded-lg">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {type === "received" ? (
                            <ArrowDownLeft className="text-green-500" />
                        ) : (
                            <ArrowUpRight className="text-red-500" />
                        )}
                        <Badge variant={type === "received" ? "default" : "destructive"}>
                            {type === "received" ? "Received" : "Sent"}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                        {type === "received" ? "From" : "To"}:{" "}
                        <span className="text-gray-900">{truncateAddress(type === "received" ? tx.from : tx.to)}</span>
                    </p>
                    <p className="text-sm text-gray-500">Date & Time: {formattedDate}</p>
                    <p className="text-sm text-gray-600">
                        Value: <span className="font-bold text-indigo-600">{ethValue.toFixed(4)} ETH (${usdValue})</span>
                    </p>
                    <p className="text-sm text-gray-500">Block: {tx.blockNumber}</p>
                    <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center space-x-1"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>View on Etherscan</span>
                    </a>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
            <Card className="w-full max-w-2xl shadow-lg border-none rounded-xl overflow-hidden">
                <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
                    <CardTitle className="text-center text-2xl font-bold">Ethereum Wallet Tracker</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                                Enter Wallet Address
                            </label>
                            <Input
                                id="walletAddress"
                                placeholder="e.g., 0xC2d2D05F30Be4f649Dcd9Db6f2D045bE4A3D9ebF"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="h-12"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fetching Transactions...
                                </>
                            ) : (
                                "Track Wallet"
                            )}
                        </Button>
                    </form>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {ethPrice && (
                        <p className="text-sm text-gray-600">
                            Current ETH Price: <span className="font-bold">${ethPrice.toFixed(2)}</span>
                        </p>
                    )}

                    {(receivedTransactions.length > 0 || sentTransactions.length > 0) && (
                        <Tabs defaultValue="received" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger
                                    value="received"
                                    onClick={() => setActiveTab("received")}
                                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                                >
                                    Received
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sent"
                                    onClick={() => setActiveTab("sent")}
                                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                                >
                                    Sent
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="received">
                                <ScrollArea className="h-[400px] scroll-area">
                                    <div className="space-y-4">
                                        {receivedTransactions.map((tx, index) => (
                                            <TransactionCard key={index} tx={tx} type="received" />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="sent">
                                <ScrollArea className="h-[400px] scroll-area">
                                    <div className="space-y-4">
                                        {sentTransactions.map((tx, index) => (
                                            <TransactionCard key={index} tx={tx} type="sent" />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* Loading indicator for infinite scroll */}
                    {loading && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletTracker;