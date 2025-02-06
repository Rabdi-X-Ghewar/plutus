import { useEffect, useState } from 'react';

const FloatingIcons = () => {
    const [rotation, setRotation] = useState(0);
    const icons = [
        { src: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", alt: "Bitcoin" },
        { src: "https://cryptologos.cc/logos/ethereum-eth-logo.png", alt: "Ethereum" },
        { src: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", alt: "Binance" },
        { src: "https://cryptologos.cc/logos/solana-sol-logo.png", alt: "Solana" },
        { src: "https://cryptologos.cc/logos/cardano-ada-logo.png", alt: "Cardano" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-[500px] w-full flex items-center justify-center">
            <div className="absolute text-center z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    POWERS GRANTED BY
                </span>
            </div>
            {icons.map((icon, index) => {
                const angle = (index * (360 / icons.length) + rotation) * (Math.PI / 180);
                const radius = 180; // Increased radius for wider animation
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <div
                        key={icon.alt}
                        className="absolute transition-all duration-300 ease-linear"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                        }}
                    >
                        <div className="bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                            <img
                                src={icon.src}
                                alt={icon.alt}
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default FloatingIcons;