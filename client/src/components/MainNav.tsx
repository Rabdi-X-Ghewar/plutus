import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { WalletIcon } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "./ui/button"

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
    const {linkWallet } = usePrivy();
    const { wallets } = useWallets()
    return (
        <nav className="flex justify-between w-full px-2">
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
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}

