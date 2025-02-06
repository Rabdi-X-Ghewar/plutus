import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { Wallet2, CreditCard, Coins } from "lucide-react";
import { fetchWallet } from "../apiClient";

type WalletBalance = {
    address: string;
    clientType: string;
    balance: number;
};

const getWalletIcon = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s"
                alt="MetaMask"
                className="w-8 h-8" />;
        case 'coinbase_wallet':
            return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 512 512" id="coinbase" className="w-8 h-8">
                <g clipPath="url(#clip0_84_15704)">
                    <rect width="512" height="512" fill="#0052FF" rx="60"></rect>
                    <path fill="#0052FF" d="M255.5 40C375.068 40 472 136.932 472 256.5C472 376.068 375.068 473 255.5 473C135.932 473 39 376.068 39 256.5C39 136.932 135.932 40 255.5 40Z"></path>
                    <path fill="#fff" d="M255.593 331.733C213.515 331.733 179.513 297.638 179.513 255.653C179.513 213.668 213.608 179.573 255.593 179.573C293.258 179.573 324.535 206.999 330.547 242.973H407.19C400.71 164.826 335.337 103.398 255.5 103.398C171.436 103.398 103.245 171.589 103.245 255.653C103.245 339.717 171.436 407.907 255.5 407.907C335.337 407.907 400.71 346.48 407.19 268.333H330.453C324.441 304.307 293.258 331.733 255.593 331.733Z"></path>
                </g>
                <defs>
                    <clipPath id="clip0_84_15704">
                        <rect width="512" height="512" fill="#fff"></rect>
                    </clipPath>
                </defs>
            </svg>;
        case 'privy':
            return <Wallet2 className="w-8 h-8 text-purple-600" />;
        default:
            return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
};

const getWalletName = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return "MetaMask";
        case 'coinbase_wallet':
            return "Coinbase"
        case 'privy':
            return "Privy Embedded";
        case 'phantom':
            return "Phantom";
    }
}

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Profile = () => {
    const { wallets } = useWallets();
    const {user} = usePrivy();
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [stakingProtocols, setStakingProtocols] = useState<string[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);


    useEffect(() => {
        const fetchWalletData = async () => {
            if (wallets.length > 0) {
                try {
                    const balances = await Promise.all(
                        wallets.map(async (wallet) => {
                            const balance = await getWalletBalance(wallet.address);
                            return {
                                address: wallet.address,
                                clientType: wallet.walletClientType,
                                balance: balance ? parseFloat(balance) : 0
                            };
                        })
                    );
                    setWalletBalances(balances);
                } catch (error) {
                    console.error("Error fetching wallet balances:", error);
                }
            }
        };

        const fetchServerWalletData = async () => {
            try {
                const wallet = await fetchWallet(user?.email?.address!);
                const serverWalletAddress = wallet.wallet.address; // Replace with actual server wallet address
                const balance = await getWalletBalance(serverWalletAddress);
                setServerWallet({
                    address: serverWalletAddress,
                    balance: balance ? parseFloat(balance) : 0,
                });
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        fetchServerWalletData();

        fetchWalletData();
    }, [wallets]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Wallet Dashboard</h1>
                <p className="text-gray-600">Manage and monitor your connected wallets</p>
            </div>
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Server Wallet</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Wallet2 className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">{truncateAddress(serverWallet?.address || "N/A")}</p>
                            <p className="text-sm">Balance: {serverWallet?.balance.toFixed(4) || "0.0000"} ETH</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {walletBalances.length > 0 ? (
                    walletBalances.map((wallet, index) => (
                        <div key={index}
                            className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getWalletIcon(wallet.clientType)}
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 capitalize">
                                            {getWalletName(wallet.clientType)} Wallet
                                        </h3>
                                        <p className="text-sm text-gray-500 font-mono">
                                            {truncateAddress(wallet.address)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-4">
                                <Coins className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Balance</p>
                                    <p className="font-semibold text-lg">
                                        {wallet.balance.toFixed(4)} ETH
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Wallet2 className="w-12 h-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Wallets Connected</h3>
                        <p className="text-gray-500">Connect a wallet to get started</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Profile;