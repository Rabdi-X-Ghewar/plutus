import { Wallet } from 'lucide-react';
import Login from './Login';

const Navbar = () => {
    return (
        <nav className="bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50 border-b border-gray-100 h-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center group cursor-pointer">
                        <div className="transform group-hover:rotate-12 transition-transform">
                            <Wallet className="h-8 w-8 text-yellow-500" />
                        </div>
                        <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                            Plutus
                        </span>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Login />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;