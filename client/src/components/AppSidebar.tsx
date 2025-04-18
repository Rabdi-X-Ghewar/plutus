import { Home, LayoutGrid, Ticket, Wine, Users, Fish, Waves, Trophy, UserCircle } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "./ui/sidebar"
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Link } from "react-router";

const sidebarItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/profile" },
    { icon: Ticket, label: "Wallet Watcher", href: "/watcher" },
    { icon: Wine, label: "Transactions", href: "/transactions" },
    { icon: Users, label: "Chat Bot", href: "/chat-bot" },
    { icon: Fish, label: "Saved Wallets", href: "/saved-wallets" },
    { icon: Waves, label: "Governance", href: "/governance" },
    { icon: Trophy, label: "Stake", href: "/stake" },
    { icon: Home, label: "Settings", href: "#" },
]

export function AppSidebar() {
    const { logout, user, linkWallet } = usePrivy();
    const { wallets } = useWallets()
    return (
        <Sidebar collapsible="icon" className="border-border bg-background fixed h-screen w-64 z-50">
            <SidebarHeader className="border-border px-2 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <span className="text-lg font-bold text-primary-foreground">P</span>
                                </div>
                                <span className="font-semibold text-xl text-foreground">Pluto</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton asChild tooltip={item.label}>
                                <Link to={item.href} className="text-muted-foreground hover:text-foreground">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <div className="mt-auto pb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton asChild tooltip="Profile">
                                    <button className="flex items-center text-muted-foreground hover:text-foreground">
                                        <UserCircle className="h-5 w-5" />
                                        <span>Profile</span>
                                    </button>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-fit px-4 py-2">
                                <DropdownMenuItem>
                                    <span className="font-semibold">{`${user?.email?.address}`}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <div className="flex flex-col space-y-1">
                                        <span className="font-semibold">Connected Wallets:</span>
                                        {wallets.length > 0 ? (
                                            wallets.map((wallet, index) => (
                                                <span key={index} className="text-sm text-muted-foreground">
                                                    {wallet.walletClientType} -
                                                    {wallet.address}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No wallets connected</span>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={linkWallet}>
                                    <Button variant="outline" className="w-full">Link Another Wallet</Button>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={logout}>
                                    <Button variant="destructive" className="w-full">Sign Out</Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
            <SidebarRail />
        </Sidebar>
    )
}