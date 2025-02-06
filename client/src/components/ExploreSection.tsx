import React from 'react';
import { ArrowRight, TrendingUp, Shield, Coins } from 'lucide-react';
import FloatingIcons from './FloatingIcons';

const ExploreSection = () => {
    return (
        <section className="pt-32 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                    <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent leading-tight">
                        Explore the Future<br />of Finance
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
                        Discover a new way to manage, invest, and grow your wealth with Plutus.
                        Join thousands of users already transforming their financial future.
                    </p>
                    <button className="group px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:shadow-lg transition-all duration-300 text-lg font-semibold inline-flex items-center">
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
                    <div key={index} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="bg-yellow-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ExploreSection;