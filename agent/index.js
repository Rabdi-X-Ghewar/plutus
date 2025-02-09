import dotenv from "dotenv";
import express from "express";
import http from "http";
import validateEnvironment from "./evnValidation.js";
import { setProvider } from "./tools/web3Provider.js";
import { startWsServer } from "../agent/wsServer.js";
import { PrivyClient } from "@privy-io/server-auth";
dotenv.config();
validateEnvironment();
const privy = new PrivyClient(
  "cm6uk1bgj00j9xopyi445cylg",
  "48NnSHFKxnU2voPq4w2KkgoUYLq1iKED8CuLurTr9byPGXk6fFnnKT4ZPo6uKxmHUp34wbziSMpcrdWmJVjmMeAc"
);

const app = express();
// Add this debug endpoint
const server = http.createServer(app);
// Start WebSocket server
startWsServer(server);
// API endpoint to receive wallet address
app.post("/api/set-wallet-address", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }

  try {
    // Use Privy to retrieve the user by wallet address
    const user = await privy.getUserByWalletAddress(walletAddress);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Retrieve the Web3 provider for the wallet
    const provider = user.wallet.getEthereumProvider();
    setProvider(provider);
    // Optionally, store the provider or use it with the Lido SDK
    console.log("Web3 Provider Retrieved:", provider);

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Web3 provider retrieved successfully.",
    });
  } catch (error) {
    console.error("Error processing wallet ID:", error);
    res.status(500).json({ error: "Failed to process wallet ID." });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});