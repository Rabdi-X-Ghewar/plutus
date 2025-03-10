import { AppSidebar } from "./AppSidebar";
import { MainNav } from "./MainNav";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

const NavSidebar = () => {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <header className="border-b bg-white z-10 fixed w-full h-16">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger className="lg:hidden" />
                            <div className="flex items-center gap-2 mr-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <span className="text-lg font-bold text-primary-foreground">P</span>
                                </div>
                                <span className="font-semibold text-xl">PLUTUS</span>
                            </div>
                            <MainNav />
                        </div>
                    </header>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default NavSidebar;
