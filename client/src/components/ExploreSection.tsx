import React from 'react';
import { ArrowRight } from 'lucide-react';

const ExploreSection = () => {
    return (
        <section className="pt-32 pb-20 text-center">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Explore the Future of Finance
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Discover a new way to manage, invest, and grow your wealth with Plutus.
                Join thousands of users already transforming their financial future.
            </p>
            <button className="group px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors text-lg font-semibold inline-flex items-center">
                Start Exploring
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
        </section>
    );
}

export default ExploreSection;