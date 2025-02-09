# Plutus - DeFi Protocol

Plutus is a next-generation decentralized finance (DeFi) protocol designed to empower users with advanced wallet management, tracking, and AI-driven investment decision-making capabilities. The platform integrates cutting-edge technologies to provide a seamless experience for managing wallets, staking assets, and leveraging AI agents to assess market trends and optimize investment strategies.


## Features

### 1. **Wallet Manager**

* Manage multiple wallets effortlessly.
* Track wallet balances, transactions, and activity in real-time.
* Secure authentication via email using **Privy**.

### 2. **AI Agent for Investment Decisions**

* Analyze market sentiment and mind share through Twitter impressions and metrics.
* Evaluate market cap data to make informed investment decisions.
* Provide personalized staking recommendations powered by **OpenRouter API** and **Hyperbolic API**.

### 3. **Staking**

* Stake assets directly through the dApp using **Coinbase Agent Kit**.
* Fetch reward rates from **Staking_Rewards_API**.
* Monitor staking performance and rewards in real-time.

### 4. **Chatbot Integration**

* Interactive chatbot powered by **OpenRouter API** for staking recommendations and wallet insights.
* Access on-chain data via **Hyperbolic API** for accurate and up-to-date information.


## Technology Stack

### 1. **Privy**

* **Email Authentication**: Secure login using `@privy/react-auth` library. You can find the login logic in [this file](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/components/Login.tsx)
* **Wallet Connection**: Link wallets seamlessly using the `linkWallet` function from the `usePrivy` hook. It has been implemented in the [Navbar](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/components/MainNav.tsx).
* **Server Wallet Creation**: Create server-side wallets using the Privy TypeScript SDK (`@privy/server-auth`). A [user interface](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/Profile.tsx) is provided for server wallets through dedicated [server wallet routes](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/routes/serverWalletRoutes.ts), enabling users to seamlessly access and utilize the [full functionality](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/services/walletService.ts) of server wallets.
* **Transaction Management**: Users can send transactions securely through server wallets.
* **Policy Engine**: Define and enforce transaction rules via API calls to `https://api.privy.io/v1/policies`. The policy engine are created with [this](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/services/policyService.ts) logic and assigned to server wallets on their [creation](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/services/walletService.ts#L49).

### 2. **Coinbase Agent Kit**

* **Lido Staking**: Enable staking through the Coinbase Agent Kit.
* **Automated Transactions**: Execute automated transactions via Coinbase Wallet.
* **Balance Fetching**: Retrieve wallet balances using the Coinbase Agent Kit.

### 3. **Cookie API**

* Fetch Twitter data through Twitter agents to analyze social media trends and sentiment.

### 4. **Staking_Rewards_API**

* Retrieve reward rates for various staking protocols to help users maximize their returns.

### 5. **OpenRouter API**

* Power the chatbot with OpenAI-like capabilities for intelligent staking recommendations and wallet insights.

### 6. **Hyperbolic API**

* Access on-chain data powered by Eigen Layer for accurate and reliable blockchain analytics.


## Getting Started

### Prerequisites

* Node.js (v16 or higher)
* Yarn or npm
* API keys for:
  * Privy
  * Coinbase Agent Kit
  * Cookie API
  * Staking_Rewards_API
  * OpenRouter API
  * Hyperbolic API

### Installation

* Clone the repository:

  ```bash
  git clone https://github.com/your-repo/plutus.git
  cd plutus
  ```
* Install dependencies:

  ```bash
  npm install or yarn install
  ```
* Start the development server:

  ```bash
  npm run dev or yarn dev
  ```

## Usage

### Wallet Management

* Use the **Privy** integration to authenticate and connect your wallet.
* Track wallet activity and balances in real-time.

### Staking

* Navigate to the staking section to stake assets.
* View reward rates fetched from **Staking_Rewards_API** .

### AI-Powered Insights

* Interact with the chatbot to receive personalized staking recommendations.
* Leverage AI analysis of Twitter impressions and market cap data for investment decisions.


## Contact

For questions or support, please reach out to us at:

* Email: __daiwikmahesh@gmail.com__
* Twitter: __[@](https://twitter.com/PlutusProtocol)daiwik_mh__

  \
* Email: devbulchandani876@gmail.com
* Twitter: @DB9808

  \
   \n 


