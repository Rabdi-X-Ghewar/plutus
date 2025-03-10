# Plutus - Advanced DeFi tooling on Sonic

Plutus is a sophisticated DeFi tooling platform that integrates ZerePy's agent framework powered by sonic transactions with Twitter, DeBridge, Goad SDK.

## Core Features

### 1. Enhanced ZerePy Integration
- **Custom Agent Framework**: Built on a modified version of ZerePy with extended capabilities
- **OpenRouter Connection**: Added support for advanced AI models through OpenRouter API
- **Server-Side Chat**: Implemented real-time chat functionality for agent interactions
- **Agent Management**:
  - Create and delete agents through API endpoints
  - Configure system parameters dynamically
  - List and execute agent actions
  - Real-time WebSocket communication

### 2. GOAT SDK Integration
- **Blockchain Interactions**: Leveraging GOAT SDK for multi-chain support
- **Plugin System**: Modular architecture supporting various blockchain protocols
- **Supported Networks**:
  - Ethereum
  - Solana
  - DeBridge cross-chain operations

### 3. Advanced Plugins
- **CoinGecko Integration**:
  - Real-time price data
  - Market analytics
  - API Key: "API-KEY"

- **ERC20 Plugin**:
  - Token management
  - Supported tokens:
    - PEPE
    - USDC
  - Automated transactions

### 4. Agent Capabilities
Based on the Shadow Agent configuration:
- **Personality Traits**:
  - Analytical
  - Professional
  - Precise
  - Tech-savvy

- **Network Operations**:
  - DeBridge cross-chain transactions
  - ERC20 token management
  - Market data analysis

## Technical Architecture

### Agent System
```json
{
  "name": "Shadow",
  "config": [
    {
      "name": "goat",
      "plugins": [
        {
          "name": "debridge",
          "args": {
            "options": "DebridgePluginOptions"
          }
        },
        {
          "name": "coingecko",
          "args": {
            "api_key": "CG-Qzfh7nAU9WVfNANEfzHsYMSJ"
          }
        },
        {
          "name": "erc20",
          "args": {
            "tokens": ["PEPE", "USDC"]
          }
        }
      ]
    }
  ]
}

I'll help you enhance the README with detailed command information and plugin explanations.

```markdown:c:\Users\gouta\Documents\Projects\Plutus-ZerePy\plutus\README.md
# Plutus - Advanced DeFi Management Platform

[Previous content remains unchanged until Technical Architecture]

## DeBridge Integration

### Core Functionalities

1. **Cross-Chain Asset Transfers**
   - Transfer assets between chains (ETH, SOL, USDC)
   - Supported networks: Ethereum, Solana, BSC
   - Commands:
   ```bash
   poetry run python main.py --action bridge --from-chain eth --to-chain sol --amount 1.0 --token USDC
   ```

2. **Cross-Chain Messaging**
   - Send authenticated messages across chains
   - Execute smart contract actions
   - Commands:
   ```bash
   poetry run python main.py --action message --target-chain bsc --contract 0x... --data "..."
   ```

3. **Cross-Chain Swaps**
   - Direct token swaps between chains
   - Lightspeed transfers
   ```bash
   poetry run python main.py --action swap --from-token ETH --to-token SOL --amount 0.1
   ```

4. **Liquidity Operations**
   - Aggregate liquidity across chains
   - DBR token staking
   ```bash
   poetry run python main.py --action liquidity --pool-id xyz --stake-amount 100
   ```

### GOAT SDK Commands

1. **Setup and Configuration**
```bash
poetry add goat-sdk
poetry add goat-sdk-plugin-erc20
poetry add goat-sdk-plugin-coingecko
poetry add goat-sdk-plugin-debridge
```

2. **Plugin Initialization**
```bash
poetry run python main.py --init-plugins
poetry run python main.py --configure-goat --rpc-url YOUR_RPC_URL
```

## Server Setup

### Development Server
```bash
# Start the server with default settings
poetry run python main.py --server

# Custom configuration
poetry run python main.py --server --host 0.0.0.0 --port 8000
```

### Production Deployment
```bash
# Install production dependencies
poetry install --no-dev

# Start with production settings
poetry run python main.py --server --host 0.0.0.0 --port 8000 --prod
```

### Poetry Commands

1. **Environment Setup**
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Initialize project
poetry init

# Install dependencies
poetry install

# Add new dependency
poetry add package_name

# Update dependencies
poetry update
```

2. **Development**
```bash
# Activate virtual environment
poetry shell

# Run tests
poetry run pytest

# Format code
poetry run black .
```

## Plugin Architecture

### DeBridge Plugin Configuration
```json
{
  "name": "debridge",
  "args": {
    "options": {
      "supportedChains": ["eth", "sol", "bsc"],
      "lightspeedEnabled": true,
      "messagingEnabled": true,
      "liquidityPools": ["usdc", "eth", "sol"]
    }
  }
}
```

### GOAT Plugin Setup
```json
{
  "name": "goat",
  "plugins": [
    "debridge",
    "coingecko",
    "erc20"
  ],
  "config": {
    "rpcUrl": "YOUR_RPC_URL",
    "chainId": 1
  }
}
```

Contributions to ZerePy Open Source
We are proud to have contributed to the official ZerePy GitHub repository by creating a custom plugin that extends its functionality. Our plugin integrates OpenRouter functions , enabling users to leverage free, open-source large language models (LLMs) for advanced AI-driven operations 1.

Key Features of the Plugin
OpenRouter Integration :
Allows seamless access to free and open-source LLMs, reducing dependency on proprietary models.
Cost Efficiency :
Enables users to perform AI-driven tasks without incurring additional costs for premium models.
Customizability :
Supports dynamic configuration of LLM parameters, ensuring flexibility for various use cases.
Enhanced Agent Capabilities :
Empowers ZerePy agents with expanded AI functionalities, such as natural language processing and real-time decision-making.

How It Works
The plugin connects to OpenRouter , a framework that aggregates multiple open-source LLMs, and integrates them into the ZerePy agent system. This allows users to:

Perform advanced text analysis and generation.
Automate complex workflows using AI-powered insights.
Scale operations without relying on paid APIs.
Contribution Details
Repository : Plutus Github
Plugin Name : openrouter-plugin
Purpose : To enhance ZerePy's AI capabilities by integrating free, open-source LLMs and create custom plugins.



