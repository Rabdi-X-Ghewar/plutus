import React from "react";
import {
  Asset,
  Provider,
  AgentDetails,
  AgentListItem,
  EthereumMetrics,
} from "../../types/AgentInterfaces";

// Card Components

export const StakingAssetsCard: React.FC<{ assets: Asset[] }> = ({ assets }) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {assets.map((asset, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={asset.logo}
            alt={asset.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-asset-image.png"; // Add a fallback image
            }}
          />
          <h3 className="font-semibold text-lg">{asset.name}</h3>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">APR</span>
          <span className="text-green-600 font-semibold">
            {asset.rewardRate}%
          </span>
        </div>
      </div>
    ))}
  </div>
);

export const ProvidersCard: React.FC<{ providers: Provider[] }> = ({ providers }) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {providers.map((provider, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={provider.logo}
            alt={provider.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-provider-image.png";
            }}
          />
          <h3 className="font-semibold text-lg">{provider.name}</h3>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">AUM</span>
          <span className="text-blue-600 font-semibold">{provider.aum}</span>
        </div>
      </div>
    ))}
  </div>
);

export const AgentDetailsCard: React.FC<{ data: AgentDetails }> = ({ data }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-2xl font-bold mb-6">{data.agentName}</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Mindshare</p>
        <p className="text-lg font-semibold">{data.mindshare}%</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Market Cap</p>
        <p className="text-lg font-semibold">{data.marketCap}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Price</p>
        <p className="text-lg font-semibold">{data.price}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Holders</p>
        <p className="text-lg font-semibold">{data.holdersCount}</p>
      </div>
    </div>
  </div>
);

export const AgentsListCard: React.FC<{ agents: AgentListItem[] }> = ({
  agents,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {agents.map((agent, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
      >
        <h3 className="font-semibold text-lg mb-3">{agent.name}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mindshare</span>
            <span className="text-blue-600 font-semibold">
              {agent.mindshare}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Market Cap</span>
            <span className="text-blue-600 font-semibold">
              {agent.marketCap}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EthereumMetricsCard: React.FC<{ data: EthereumMetrics }> = ({
  data,
}) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-2xl font-bold mb-6">Ethereum Staking Metrics</h2>
    <div className="mb-8">
      <p className="text-gray-600 mb-2">Current APR</p>
      <p className="text-3xl font-bold text-green-600">{data.currentRate}%</p>
    </div>
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Historical Rates</h3>
      <div className="space-y-2">
        {data.historicalRates.map((rate, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <span className="text-gray-600">
              {new Date(rate.date).toLocaleDateString()}
            </span>
            <span className="font-medium">{rate.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error Card Component
export const ErrorCard: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-center gap-3 text-red-500 mb-4">
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="font-semibold text-lg">Error Loading Data</h3>
    </div>
    <p className="text-gray-600">{message}</p>
  </div>
);