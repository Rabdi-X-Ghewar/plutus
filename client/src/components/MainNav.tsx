import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { WalletIcon } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "./ui/button"
import { useCreateWallet } from '@privy-io/react-auth';
import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

// const items = [
//     { title: "All", href: "#" },
//     { title: "Theatre", href: "#" },
//     { title: "Bars", href: "#" },
//     { title: "Clubs", href: "#" },
//     { title: "Fishing", href: "#" },
//     { title: "Sea & Beach", href: "#" },
//     { title: "Sports", href: "#" },
// ]

export function MainNav() {
    const { linkWallet } = usePrivy();
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet();

    const sign = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        const provider = await wallet?.getEthereumProvider();
        const address = wallet?.address;
        const message = 'This is the message I am signing';
        const signature = await provider?.request({
            method: 'personal_sign',
            params: [message, address],
        });
        console.log(signature);
    }

    const transaction = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        await wallet?.switchChain(sepolia.id);

        const provider = await wallet?.getEthereumProvider();
        if (!provider) {
            console.error('Ethereum provider is undefined');
            return;
        }
        const walletClient = createWalletClient({
            account: wallet?.address as Hex,
            chain: sepolia,
            transport: custom(provider),
        });
        const [address] = await walletClient.getAddresses()

        const hash = await walletClient.sendTransaction({
            account: address,
            to: '0x1029BBd9B780f449EBD6C74A615Fe0c04B61679c',
            value: parseEther('0.0001')
        })

        console.log(hash);
    }



    return (
        <nav className="flex justify-between w-full px-2 ">
            <div className="flex items-center space-x-6">
                {/* {items.map((item) => (
                    <Link
                        key={item.title}
                        to={item.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            item.title === "All" ? "text-primary" : "text-muted-foreground",
                        )}
                    >
                        {item.title}
                    </Link>
                ))} */}

            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2">
                        <WalletIcon />
                        <span>Wallets</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit px-4 py-2">
                    <DropdownMenuItem>
                        <div className="flex flex-col space-y-1">
                            <span className="font-semibold">Connected Wallets:</span>
                            {wallets.length > 0 ? (
                                wallets.map((wallet, index) => (
                                    <span key={index} className="text-sm text-gray-600">
                                        {wallet.walletClientType} -
                                        {wallet.address}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-600">No wallets connected</span>
                            )}
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={linkWallet}>
                        <Button variant="outline" className="w-full">Link Another Wallet</Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={createWallet}>
                        <Button variant="outline" className="w-full">Create Wallet</Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {

                        sign();
                    }}>
                        <Button>
                            Sign
                        </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                        transaction();
                    }}>
                        <Button>
                            Send
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}

