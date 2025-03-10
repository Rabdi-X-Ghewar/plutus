import { ArrowRight } from 'lucide-react';
// import FloatingIcons from './FloatingIcons';
import FeatureCarousel from './Carousel';
import { motion } from "framer-motion"
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import Login from './Login';
import Marquee from './ui/marquee';


const ExploreSection = () => {
    const words = [
        {
          text: "Do",
          className: "text-white text-3xl", // Increased font size
        },
        {
          text: "All",
          className: "text-white text-3xl",
        },
        {
          text: "DEFI",
          className: "text-white text-3xl",
        },
        {
          text: "Tooling",
          className: "text-white text-3xl",
        },
        {
          text: "with",
          className: "text-white text-3xl",
        },
        {
          text: "PLUTUS",
          className: "text-white text-4xl font-bold", 
        },
      ];
    return (
        <div className="relative isolate overflow-hidden bg-background min-h-screen">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg lg:flex-shrink-0">
                    <motion.h1
                        className="mt-10 text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.4 }}
                    >
                        <TypewriterEffectSmooth words={words} />
                    </motion.h1>
                    <motion.p
                        className="mt-8 text-lg text-center leading-8 text-muted-foreground backdrop-blur-sm bg-gray-900/30 p-6 rounded-xl border border-gray-800"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        Your One stop platform for all DEFI actions, Get AI recommendations on best APY, Stake with any asset, get rewarded in 
                        $EDU tokens, Use any onchain asset to do your onchain transactions.
                    </motion.p>
                    <motion.div
                        className="mt-12 flex items-center gap-x-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <button
                            onClick={Login}
                            className="px-8 py-4 text-white font-semibold rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25"
                        >
                            Login to Dashboard
                        </button>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold leading-6 text-foreground hover:text-emerald-400 transition-colors duration-300 flex items-center gap-2"
                        >
                            Learn more <ArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div>
                <motion.div
                    className="mx-auto mt-16 lg:mt-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-20"></div>
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/creative-SW6QDQbcVuwPgb6a2CYtYmRbsJa4k1.png"
                            alt="Luminari Dashboard"
                            width={600}
                            height={600}
                            className="relative w-[500px] rounded-2xl shadow-2xl ring-1 ring-gray-800/10 transform hover:scale-[1.02] transition-transform duration-300"
                        />
                    </div>
                </motion.div> 
            </div>
            <div className="relative mt-12">
                <FeatureCarousel />
            </div>
            <Marquee />
        </div>
    );
}

export default ExploreSection;
