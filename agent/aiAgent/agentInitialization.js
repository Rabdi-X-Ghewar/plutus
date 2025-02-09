// // agentInitialization.js
import fs from "fs";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { ChatOpenAI } from "@langchain/openai";
// // import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import stakingRewardsTool from "../tools/stakingRewardsTool.js";
import cookieAPITool from "../tools/cookieAPITool.js";
import lidoStakingTool from "../tools/lidoStakingTool.js";


const WALLET_DATA_FILE = "wallet_data.txt";

async function initializeAgent() {
  // Initialize Hugging Face model (choose one approach)

const llm = new ChatOpenAI({
  model: "openai/gpt-4o-mini",
  apiKey: process.env.OPENROUTER_API_KEY, // you can input your API key in plaintext, but this is not recommended
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

  let walletDataStr = null;
  if (fs.existsSync(WALLET_DATA_FILE)) {
    try {
      walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
    } catch (error) {
      console.error("Error reading wallet data:", error);
    }
  }

  const config = {
    apiKeyName: process.env.CDP_API_KEY_NAME,
    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
    cdpWalletData: walletDataStr || undefined,
    networkId: process.env.NETWORK_ID || "base-sepolia",
  };

  const walletProvider = await CdpWalletProvider.configureWithWallet(config);

  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      cdpApiActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
      cdpWalletActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    ],
  });

  // Retrieve default tools from AgentKit
  const defaultTools = await getLangChainTools(agentkit);
  const tools = [...defaultTools, stakingRewardsTool, cookieAPITool, lidoStakingTool];

  // Set up memory and agent config
  const memory = new MemorySaver();
  const agentConfig = {
    configurable: { thread_id: "Staking and Agent Assistant" },
  };

  // Create agent with modified prompt for JSON formatting
  const agent = createReactAgent({
    llm,
    tools: tools,
    checkpointSaver: memory,
    verbose: true,
    messageModifier: `
      You are a helpful agent that can interact with multiple APIs and blockchain networks. You have access to three main systems:

    1. COOKIE DAO API OPERATIONS:
       When using the Cookie DAO API tool, use these operations:
       - getAgentByTwitter: Requires username parameter
       - getAgentByContract: Requires address parameter
       - getAgentsList: Optional parameters: interval (_7Days default), page (1 default), pageSize (10 default)
       - searchTweets: Requires query, from, and to date parameters

    2. STAKING REWARDS API OPERATIONS:
       When using the StakingRewards API tool, use these operations:
       - getTopAssets: Get top assets with their reward rates
       - getAaveMetrics: Get ETH-specific staking metrics
       - getProviders: List top staking providers
       - getCosmosProviders: Get Cosmos-specific providers
       - getLiquidStakingOptions: Get Ethereum 2.0 liquid staking options
       - getValidatorMetrics: Get detailed validator metrics
       - getAllMetrics: Get all available metrics

       For staking data, always start with getTopAssets (step1) before moving to more specific queries.
       When analyzing specific networks like Ethereum or Cosmos, use the corresponding specialized operations.

    3. ONCHAIN INTERACTIONS:
       For blockchain operations:
       - Check wallet details before first onchain action
       - Request funds from faucet if on base-sepolia network
       - Provide wallet details if funds needed on other networks
       - Handle 5XX errors by asking user to retry later

    IMPORTANT GUIDELINES:
    - Always verify required parameters before making API calls
    - For Cookie API, respect pagination and date range requirements
    - For Staking Rewards, follow the step-by-step approach (step1-step7)
    - Handle errors gracefully and provide clear error messages
    - If a requested action isn't possible with available tools, direct users to docs.cdp.coinbase.com

    Be concise and helpful in responses. Only describe available operations if explicitly asked.

    Question: {input}
    
    Thought: Let me think about this step by step...
    {agent_scratchpad}`,
    handleParsingErrors: true,
  });

  // Save wallet data
  const exportedWallet = await walletProvider.exportWallet();
  fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));


  return { agent, config: agentConfig };
}

export default initializeAgent;
