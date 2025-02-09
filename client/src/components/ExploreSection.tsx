
import { ArrowRight, TrendingUp, Shield, Coins } from 'lucide-react';
import FloatingIcons from './FloatingIcons';

const ExploreSection = () => {
    return (
        <section className="pt-32 pb-20 bg-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                    <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
                        Explore the Future<br />of Finance with COOKIE DAO
                    </h1>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                        Discover a new way to manage, invest, and grow your wealth with Pluto.
                        Join thousands of users already transforming their financial future.
                    </p>
                    <button className="group px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-900 rounded-full hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 text-lg font-semibold inline-flex items-center">
                        Start Exploring
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="relative">
                    <FloatingIcons />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
                {[
                    {
                        icon: <TrendingUp className="w-6 h-6" />,
                        title: "Smart Trading",
                        description: "Advanced trading tools with real-time analytics"
                    },
                    {
                        icon: <Shield className="w-6 h-6" />,
                        title: "Secure Storage",
                        description: "Military-grade encryption for your assets"
                    },
                    {
                        icon: <Coins className="w-6 h-6" />,
                        title: "Multi-Chain Support",
                        description: "Support for all major blockchain networks"
                    }
                ].map((item, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
                        <div className="bg-emerald-400/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-100">{item.title}</h3>
                        <p className="text-gray-400">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ExploreSection;