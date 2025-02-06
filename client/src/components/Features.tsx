import { Wallet, Globe, Zap, ArrowRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Wallet className="w-12 h-12 text-yellow-500" />,
      title: "Plutus Wallet",
      description: "Use our secure wallet inside any app with seamless integration",
      action: "Explore Plutus Wallet",
    },
    {
      icon: <Globe className="w-12 h-12 text-yellow-500" />,
      title: "Browser Extension",
      description: "Connect Plutus Wallet to any dApps in your browser",
      action: "Install Extension",
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: "Plutus Bridge",
      description: "Bridge assets between blockchains seamlessly",
      action: "Explore Bridge",
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-cream to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your digital assets in one place
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:shadow-lg transition-all duration-300 inline-flex items-center group/btn">
                  {feature.action}
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;