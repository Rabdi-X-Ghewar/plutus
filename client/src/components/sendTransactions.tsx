import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send, Wallet } from "lucide-react";
import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { toast } from "sonner";

interface SendTransactionsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: { email?: { address?: string } };
    wallets: any[];
    serverWallet?: { address: string; balance: number } | null;
    walletBalances: { address: string; clientType?: string; balance: number }[];
    sendServerTransaction: (userEmail: string, toAddress: string, amount: string) => Promise<string>;
}

export const SendTransactions: React.FC<SendTransactionsProps> = ({
    open,
    onOpenChange,
    user,
    wallets,
    serverWallet,
    walletBalances,
    sendServerTransaction
}) => {
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedWallet, setSelectedWallet] = useState<{ address: string; balance: number } | null>(null);

    const getWalletName = (clientType: string) => {
        switch (clientType.toLowerCase()) {
            case 'metamask': return "MetaMask";
            case 'coinbase_wallet': return "Coinbase";
            case 'privy': return "Privy Embedded";
            case 'phantom': return "Phantom";
            default: return clientType;
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const sendTransaction = async () => {
        if (!selectedWallet || !destinationAddress || !amount) {
            toast.error("Missing transaction details");
            return;
        }

        try {
            if (selectedWallet.address === serverWallet?.address) {
                if (!user?.email?.address) {
                    toast.error("User email address is undefined");
                    return;
                }
                const hash = await sendServerTransaction(user.email.address, destinationAddress, amount);
                if (hash) {
                    toast.success(`Successfully sent ${amount} ETH to ${truncateAddress(destinationAddress)}`);
                    onOpenChange(false);
                    resetForm();
                }
            } else {
                const wallet = wallets.find(w => w.address === selectedWallet.address);
                if (!wallet) {
                    toast.error("Source wallet not found in connected wallets");
                    return;
                }

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    toast.error("Ethereum provider not available");
                    return;
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: sepolia,
                    transport: custom(provider),
                });

                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: destinationAddress as `0x${string}`,
                    value: parseEther(amount),
                });

                toast.success(`Successfully sent ${amount} ETH to ${truncateAddress(destinationAddress)}`);
                onOpenChange(false);
                resetForm();
                return hash;
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Transaction failed");
        }
    };

    const resetForm = () => {
        setDestinationAddress('');
        setAmount('');
        setSelectedWallet(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Send Transaction</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Send ETH to another wallet address. Please verify all details before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="destination" className="text-sm font-medium">
                            Destination Address
                        </Label>
                        <Input
                            id="destination"
                            placeholder="0x..."
                            value={destinationAddress}
                            onChange={(e) => setDestinationAddress(e.target.value)}
                            className="font-mono"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">From</Label>
                        <select
                            className="w-full rounded-md border border-border/20 bg-input text-foreground p-2"
                            onChange={(e) => {
                                const address = e.target.value;
                                if (address === serverWallet?.address) {
                                    setSelectedWallet(serverWallet);
                                } else {
                                    setSelectedWallet(
                                        walletBalances.find(wallet => wallet.address === address) || null
                                    );
                                }
                            }}
                            value={selectedWallet?.address || ''}
                        >
                            <option value="">Select a wallet</option>
                            {serverWallet && (
                                <option value={serverWallet.address}>
                                    Server Wallet - ({serverWallet.balance.toFixed(4)} ETH)
                                </option>
                            )}
                            {walletBalances.map((wallet, index) => (
                                <option key={index} value={wallet.address}>
                                    {getWalletName(wallet.clientType || '')} -
                                    {truncateAddress(wallet.address)} (
                                    {wallet.balance.toFixed(4)} ETH)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-sm font-medium">
                            Amount (ETH)
                        </Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ETH
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onOpenChange(false);
                            resetForm();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={sendTransaction}
                        disabled={!selectedWallet || !amount || !destinationAddress}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};