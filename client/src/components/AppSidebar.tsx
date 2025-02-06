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

const sidebarItems = [
    { icon: LayoutGrid, label: "Browse", href: "#" },
    { icon: Ticket, label: "Tickets", href: "#" },
    { icon: Wine, label: "Experiences", href: "#" },
    { icon: Users, label: "Groups", href: "#" },
    { icon: Fish, label: "Activities", href: "#" },
    { icon: Waves, label: "Beach", href: "#" },
    { icon: Trophy, label: "Sports", href: "#" },
    { icon: Home, label: "Stays", href: "#" },
]

export function AppSidebar() {
    const { logout, user, linkWallet } = usePrivy();
    const { wallets } = useWallets()
    return (
        <Sidebar collapsible="icon" className="border-r z-50 fixed h-screen w-64 bg-white ">
            <SidebarHeader className="border-b px-2 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <a href="#" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <span className="text-lg font-bold text-primary-foreground">P</span>
                                </div>
                                <span className="font-semibold text-xl">Plutus</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton asChild tooltip={item.label}>
                                <a href={item.href}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </a>
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
                                    <button className="flex items-center">
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
                                <DropdownMenuItem onClick={logout}>
                                    <Button variant="destructive" className="w-full">Sign Out</Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>            <SidebarRail />
        </Sidebar>
    )
}

