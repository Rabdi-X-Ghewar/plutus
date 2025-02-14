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
* **Policy Engine**: Define and enforce transaction rules via API calls to `https://api.privy.io/v1/policies`. The policies are created with [this](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/services/policyService.ts) logic and assigned to server wallets on their [creation](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/server/services/walletService.ts#L49).

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

### 7. **Stake Kit API**

* We use Stake Kit API to allow users to stake their funds in variuos protocols over ethereum network. The staking mechanism is implemented in [this](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx) page.
* First we use [https://api.stakek.it/v1/yields?network=${network}](https://api.stakek.it/v1/yields?network=${network}) endpoint, to fetch all the yeilds available in the selected network and [filter](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L163) those to display teilds with minimum amount less than 1
* After that we calculate the [balance](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L172) of the connected wallet using [https://api.stakek.it/v1/tokens/balances](https://api.stakek.it/v1/tokens/balances) endpint and the users [staked amount](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L205) using [https://api.stakek.it/v1/${selectedYield.id}/balances](https://api.stakek.it/v1/${selectedYield.id}/balances) endpoint.
* After that user selects theri desired action(enter or exit) and that a transaction session is creatin from the [https://api.stakek.it/v1/actions/${action}](https://api.stakek.it/v1/actions/${action}). Bases on that Stake or unstake operation will be started.
* Then the user creates and [unsigned transaction](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L324), using [https://api.stakek.it/v1/transactions/${tx.id}](https://api.stakek.it/v1/transactions/${tx.id}) endpoint. And then it is [signed and broadcasted](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L372) with the help of the wallet provider and viem.
* This signed transaction is now [submitted](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L375) through the [https://api.stakek.it/v1/transactions/${tx.id}/submit_hash](https://api.stakek.it/v1/transactions/${tx.id}/submit_hash) endpoint. And then its [status is checked](https://github.com/Rabdi-X-Ghewar/plutus/blob/main/client/src/pages/StakeTokens.tsx#L233) using the [https://api.stakek.it/v1/transactions/${txId}/status](https://api.stakek.it/v1/transactions/${txId}/status) endpoint until it is CONFIRMED or fails 30 times.

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




