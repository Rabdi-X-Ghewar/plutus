const FloatingIcons = () => {
    const icons = [
        { src: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", alt: "Bitcoin" },
        { src: "https://cryptologos.cc/logos/ethereum-eth-logo.png", alt: "Ethereum" },
        { src: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", alt: "Binance" },
        { src: "https://cryptologos.cc/logos/solana-sol-logo.png", alt: "Solana" },
        { src: "https://cryptologos.cc/logos/cardano-ada-logo.png", alt: "Cardano" },
    ];

    return (
        <div className="w-full overflow-hidden py-20">
            <div className="animate-scroll flex space-x-20 whitespace-nowrap">
                {[...icons, ...icons].map((icon, index) => (
                    <div
                        key={`${icon.alt}-${index}`}
                        className="inline-flex items-center"
                    >
                        <img
                            src={icon.src}
                            alt={icon.alt}
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                ))}
                <div className="inline-flex items-center ml-20">
                    <span className="text-xl text-yellow-600 font-semibold">POWERS GRANTED BY</span>
                </div>
            </div>
        </div>
    );
}

export default FloatingIcons;