import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import validateEnvironment from "./evnValidation.js";
import { setProvider,setUserAddress } from "./tools/web3Provider.js";
import { startWsServer } from "../agent/wsServer.js";
import { PrivyClient } from "@privy-io/server-auth";
dotenv.config();
validateEnvironment();
const privy = new PrivyClient(
  "cm6uk1bgj00j9xopyi445cylg",
  "48NnSHFKxnU2voPq4w2KkgoUYLq1iKED8CuLurTr9byPGXk6fFnnKT4ZPo6uKxmHUp34wbziSMpcrdWmJVjmMeAc"
);

const app = express();
app.use(cors());
// Add this debug endpoint
const server = http.createServer(app);
// Start WebSocket server
startWsServer(server);


app.post("/api/set-provider", express.json(), async (req, res) => {
  const { provider,address } = req.body;

  if (!provider) {
    return res.status(400).json({ error: "Provider is required." });
  }

  try {
    setProvider(provider);
    setUserAddress(address);
    
    res.status(200).json({
      success: true,
      message: "Web3 provider set successfully.",
    });
  } catch (error) {
    console.error("Error setting provider:", error);
    res.status(500).json({ error: "Failed to set provider." });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
