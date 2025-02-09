import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
// import { Separator } from "../components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  StakingAssetsCard,
  ProvidersCard,
  AgentDetailsCard,
  AgentsListCard,
  EthereumMetricsCard,
  ErrorCard,
} from "../components/ui/AgentCards";
import { Message } from "../types/AgentInterfaces";
import { StakingCard } from "../components/ui/StakingCard";
import { LidoSDKCore } from "@lidofinance/lido-ethereum-sdk";

const PLUTUS_ASCII = `
██████╗ ██╗     ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║   ██║   ██║   ██║╚════██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝
`;

const AgentDetails: React.FC = () => {
  const { authenticated, user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { wallets } = useWallets();
  const chainId = 17000;
  const embeddedWallet =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    const setProvider = async () => {
      if (embeddedWallet) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/set-provider",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                provider: LidoSDKCore.createWeb3Provider(
                  chainId,
                  window.ethereum
                ),
                address: user?.wallet?.address,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to set provider");
          }

          console.log("Provider set successfully");
        } catch (error) {
          console.error("Error setting provider:", error);
        }
      }
    };

    setProvider();
  }, [embeddedWallet]);
  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket("ws://localhost:3000");


    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("data", data);

      switch (data.type) {
        case "message":
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: data.content,
              timestamp: new Date(data.timestamp),
            },
          ]);
          break;

        case "tools":
          try {
            // Parse the tool response content
            const toolData = JSON.parse(data.content);
            console.log("Parsed tool data:", toolData);

            if (toolData.error) {
              console.error("Tool error:", toolData.message);
              return;
            }

            // Handle different tool responses
            if (toolData.type === "assets") {
              setCurrentCard({
                type: "assets",
                items: toolData.items.map((asset: any) => ({
                  name: asset.name,
                  rewardRate: asset.rewardRate,
                  logo: asset.logo,
                  type: "asset",
                })),
              });
            } else if (toolData.ok.currentPage >= 1) {
              setCurrentCard({
                type: "agents_list",
                items: toolData.ok.data.map((agent: any) => ({
                  name: agent.agentName,
                  mindshare: agent.mindshare.toFixed(2),
                  marketCap: agent.mindshareDeltaPercent.toFixed(2),
                  type: "agent_card",
                })),
              });
            } else if (toolData.ok.agentName !== "") {
              // Single agent response
              setCurrentCard({
                type: "agent_details",
                agentName: toolData.ok.agentName,
                mindshare: toolData.ok.mindshare,
                marketCap: toolData.ok.marketCap,
                price: toolData.ok.price,
                holdersCount: toolData.ok.holdersCount,
              });
            }
          } catch (error) {
            console.error("Error parsing tool response:", error);
          }
          break;

        case "error":
          console.error("Server error:", data.content);
          break;
      }
    };
    return () => ws.current?.close();
  }, []);

  const handleSendMessage = () => {
    if (!input.trim() || !ws.current) return;

    setIsLoading(true);
    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: input,
        timestamp: new Date(),
      },
    ]);

    // Send message through WebSocket
    ws.current.send(
      JSON.stringify({
        content: input,
      })
    );

    setInput("");
    setIsLoading(false);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderCard = () => {
    if (!currentCard) return null;

    try {
      switch (currentCard.type) {
        case "assets":
          return <StakingAssetsCard assets={currentCard.items} />;

        case "providers":
          return <ProvidersCard providers={currentCard.items} />;

        case "agent_details":
          return <AgentDetailsCard data={currentCard} />;

        case "agents_list":
          return <AgentsListCard agents={currentCard.items} />;

        case "metrics":
          return <EthereumMetricsCard data={currentCard} />;

        default:
          return <ErrorCard message="Unknown card type" />;
      }
    } catch (error) {
      return (
        <ErrorCard
          message={error instanceof Error ? error.message : "An error occurred"}
        />
      );
    }
  };

  const renderMessage = (msg: Message) => {
    if (msg.type === "user") {
      return (
        <div className="font-mono text-white/90">
          <span className="text-[#50fa7b]">user@plutus</span>
          <span className="text-white/70">:~$</span>
          <span className="ml-2">{msg.content}</span>
        </div>
      );
    } else {
      return (
        <div className="font-mono">
          <span className="text-[#bd93f9]">plutus@ai</span>
          <span className="text-white/70">:~$</span>
          <div className="mt-1 text-white/90 pl-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="whitespace-pre-wrap"
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex w-full h-screen bg-black">
      {/* Chat Interface */}
      <div className="w-[570px] border-r border-white/20 bg-black flex flex-col h-full shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        <div className="flex flex-col">
          <pre
            className="text-[#50fa7b] p-4 text-xs font-mono whitespace-pre select-none"
            style={{ textShadow: "0 0 5px rgba(80, 250, 123, 0.5)" }}
          >
            {PLUTUS_ASCII}
          </pre>

          <div className="text-white/70 px-4 pb-2 text-sm font-mono border-b border-white/20">
            Usage: Type your message to interact with the AI Assistant
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 font-mono">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div key={index} className="terminal-line">
                {renderMessage(msg)}
                <span className="text-xs text-white/30 mt-1 block">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-white/20 bg-black p-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#50fa7b]">user@plutus</span>
            <span className="text-white/70">:~$</span>
            <Input
              placeholder=""
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none focus:ring-0 font-mono"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isLoading}
              className="bg-transparent hover:bg-white/10 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Explore and Cards */}
      <div className="flex-1 flex flex-col gap-6 p-6 bg-black">
        <div className="flex-1 overflow-y-auto">
          <div
            className="text-xl font-semibold text-white mb-4"
            style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
          >
            Explore
          </div>
          <div className="space-y-4">
            {renderCard()}

            {/* Staking Card moved inside explore section */}
            {authenticated && embeddedWallet && (
              <div className="border border-white/20 rounded-lg bg-black shadow-[0_0_10px_rgba(255,255,255,0.3)] p-4 mt-6">
                <div className="text-lg font-semibold text-white mb-4">
                  Staking
                </div>
                <StakingCard
                  web3Provider={LidoSDKCore.createWeb3Provider(
                    chainId,
                    window.ethereum
                  )}
                  account={user?.wallet?.address || ""}

                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;
