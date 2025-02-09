import React from "react";
import {
  Asset,
  Provider,
  AgentDetails,
  AgentListItem,
  EthereumMetrics,
} from "../../types/AgentInterfaces";

// Card Components

export const StakingAssetsCard: React.FC<{ assets: Asset[] }> = ({
  assets,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {assets.map((asset, idx) => (
      <div
        key={idx}
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={asset.logo}
            alt={asset.name}
            className="w-12 h-12 rounded-full border border-[#50fa7b]/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-asset-image.png";
            }}
          />
          <h3 className="font-mono text-[#50fa7b] text-lg">{asset.name}</h3>
        </div>
        <div className="flex justify-between items-center font-mono">
          <span className="text-white/70">APR</span>
          <span className="text-[#50fa7b]">{asset.rewardRate}%</span>
        </div>
      </div>
    ))}
  </div>
);

export const ProvidersCard: React.FC<{ providers: Provider[] }> = ({
  providers,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {providers.map((provider, idx) => (
      <div
        key={idx}
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={provider.logo}
            alt={provider.name}
            className="w-12 h-12 rounded-full border border-[#50fa7b]/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-provider-image.png";
            }}
          />
          <h3 className="font-mono text-[#50fa7b] text-lg">{provider.name}</h3>
        </div>
        <div className="flex justify-between items-center font-mono">
          <span className="text-white/70">AUM</span>
          <span className="text-[#50fa7b]">{provider.aum}</span>
        </div>
      </div>
    ))}
  </div>
);

export const AgentDetailsCard: React.FC<{ data: AgentDetails }> = ({
  data,
}) => (
  <div className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-6">
    <h2 className="text-2xl font-mono text-[#50fa7b] mb-6">{data.agentName}</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg">
        <p className="text-sm text-white/70 font-mono">Mindshare</p>
        <p className="text-lg text-[#50fa7b] font-mono">{data.mindshare}%</p>
      </div>
      <div className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg">
        <p className="text-sm text-white/70 font-mono">Market Cap</p>
        <p className="text-lg text-[#50fa7b] font-mono">{data.marketCap}</p>
      </div>
      <div className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg">
        <p className="text-sm text-white/70 font-mono">Price</p>
        <p className="text-lg text-[#50fa7b] font-mono">{data.price}</p>
      </div>
      <div className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg">
        <p className="text-sm text-white/70 font-mono">Holders</p>
        <p className="text-lg text-[#50fa7b] font-mono">{data.holdersCount}</p>
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
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <h3 className="font-mono text-[#50fa7b] text-lg mb-3">{agent.name}</h3>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Mindshare</span>
            <span className="text-[#50fa7b]">{agent.mindshare}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Market Cap</span>
            <span className="text-[#50fa7b]">{agent.marketCap}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EthereumMetricsCard: React.FC<{ data: EthereumMetrics }> = ({
  data,
}) => (
  <div className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-6">
    <h2 className="text-2xl font-mono text-[#50fa7b] mb-6">
      Ethereum Staking Metrics
    </h2>
    <div className="mb-8">
      <p className="text-white/70 mb-2 font-mono">Current APR</p>
      <p className="text-3xl font-mono text-[#50fa7b]">{data.currentRate}%</p>
    </div>
    <div className="space-y-4">
      <h3 className="font-mono text-[#50fa7b] text-lg">Historical Rates</h3>
      <div className="space-y-2">
        {data.historicalRates.map((rate, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 hover:bg-[#50fa7b]/5 rounded font-mono"
          >
            <span className="text-white/70">
              {new Date(rate.date).toLocaleDateString()}
            </span>
            <span className="text-[#50fa7b]">{rate.rate}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error Card Component
export const ErrorCard: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-black border border-red-500/30 shadow-[0_0_10px_rgba(255,0,0,0.2)] rounded-xl p-6">
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
      <h3 className="font-mono text-lg">Error Loading Data</h3>
    </div>
    <p className="text-white/70 font-mono">{message}</p>
  </div>
);

export const LiquidStakingOptionsCard: React.FC<{ options: any[] }> = ({
  options,
}) => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {options.map((option, idx) => (
      <div
        key={idx}
        className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-4 hover:shadow-[0_0_15px_rgba(80,250,123,0.3)] transition-shadow"
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={option.logo}
            alt={option.provider}
            className="w-12 h-12 rounded-full border border-[#50fa7b]/30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fallback-provider-image.png";
            }}
          />
          <div>
            <h3 className="font-mono text-[#50fa7b] text-lg">
              {option.provider}
            </h3>
            {option.isVerified && (
              <span className="text-xs text-white/50">Verified Provider</span>
            )}
          </div>
        </div>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Reward Rate</span>
            <span className="text-[#50fa7b]">{option.rewardRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Commission</span>
            <span className="text-[#50fa7b]">{option.commission}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Staking Share</span>
            <span className="text-[#50fa7b]">{option.stakingShare}%</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ValidatorMetricsCard: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-black border border-[#50fa7b]/30 shadow-[0_0_10px_rgba(80,250,123,0.2)] rounded-xl p-6">
    <h2 className="text-2xl font-mono text-[#50fa7b] mb-6">
      {data.asset} Validator Metrics
    </h2>
    <div className="mb-4">
      <p className="text-white/70 mb-2 font-mono">Network Reward Rate</p>
      <p className="text-3xl font-mono text-[#50fa7b]">{data.rewardRate}%</p>
    </div>
    <div className="space-y-4">
      <h3 className="font-mono text-[#50fa7b] text-lg">Validators</h3>
      <div className="space-y-4">
        {data.validators.map((validator: any, idx: number) => (
          <div
            key={idx}
            className="p-4 bg-black border border-[#50fa7b]/30 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/70 font-mono">Address</p>
                <p className="text-sm text-[#50fa7b] font-mono truncate">
                  {validator.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Reward Rate</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.rewardRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Commission</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.commission}%
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 font-mono">Total Staked</p>
                <p className="text-[#50fa7b] font-mono">
                  {validator.totalStaked}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
