export interface Message {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface Asset {
  name: string;
  rewardRate: string;
  logo: string;
  type: "asset";
}

export interface Provider {
  name: string;
  aum: string;
  logo: string;
  type: "provider";
}

export interface AgentDetails {
  agentName: string;
  mindshare: number;
  marketCap: string;
  price: string;
  holdersCount: number;
  type: "agent_details";
}

export interface AgentListItem {
  name: string;
  mindshare: number;
  marketCap: string;
  type: "agent_card";
}

export interface EthereumMetrics {
  currentRate: string;
  historicalRates: Array<{
    rate: string;
    date: string;
  }>;
  type: "metrics";
}

export interface LiquidStakingOption {
  provider: string;
  logo: string;
  isVerified: boolean;
  rewardRate: string;
  commission: string;
  stakingShare: string;
  type: "liquid_staking_option";
}

export interface Validator {
  address: string;
  rewardRate: string;
  commission: string;
  totalStaked: string;
}

export interface ValidatorMetrics {
  asset: string;
  rewardRate: string;
  validators: Validator[];
  type: "validator_metrics";
}
