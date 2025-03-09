import { ArrowRight, TrendingUp, Shield, Coins } from 'lucide-react';
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
          text: "Things",
          className: "text-white text-3xl",
        },
        {
          text: "DEFI",
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
                <div className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:gap-x-10 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg lg:flex-shrink-0">
          <motion.h1
            className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            <TypewriterEffectSmooth words={words} />
          </motion.h1>
          <motion.p
            className="mt-6 text-lg text-center leading-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Your One stop platform for all DEFI actions, Get AI recommentations on best APY, Stake with any asset, get rewarded in 
            $EDU tokens, Use any onchain asset to do your onchain transactions.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center gap-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button
  onClick={Login}
  className="px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/50 transition duration-300"
>
  Login to Dashboard
</button>
            <a
              href="https://www.flowersandsaints.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold leading-6 text-foreground"
            >
              Learn more <span aria-hidden="true">→</span>
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
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/creative-SW6QDQbcVuwPgb6a2CYtYmRbsJa4k1.png"
              alt="Flowers & Saints design concept"
              width={600}
              height={600}
              className="w-[500px] rounded-2xl shadow-xl ring-1 ring-gray-900/10"
            />
          </div>
        </motion.div> 
    </div>
                    <div className="relative">
                        <FeatureCarousel />
                    </div>

                <div className="grid grid-cols-1 bg-background md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
                    {[
                        {
                            icon: <TrendingUp className="w-6 h-6" />,
                            title: "Smart Trading",
                            description: "Manage Assets over multiple wallets on a single dashboard"
                        },
                        {
                            icon: <Shield className="w-6 h-6" />,
                            title: "Secure Storage",
                            description: "Use privy server wallet for instantaneous transfers through inbuilt policies"
                        },
                        {
                            icon: <Coins className="w-6 h-6" />,
                            title: "Multi-Chain Support",
                            description: "Stake on mindshare metrics using PLUTUS AI"
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/70 backdrop-blur-lg p-6 rounded-3xl border border-gray-700 shadow-md hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 ease-in-out overflow-hidden"
                        >
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50"></div>

                            {/* Icon and Title Container */}
                            <div className="relative z-10 flex items-center space-x-4 mb-4">
                                {/* Icon */}
                                <div className="bg-emerald-400/10 w-12 h-12 rounded-full flex items-center justify-center text-emerald-400 shadow-sm">
                                    {item.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-100 tracking-tight">
                                    {item.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="relative z-10 text-gray-400 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
                < Marquee />
            </div>
    );
}

export default ExploreSection;