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

const AgentDetails: React.FC = () => {
  const { login, authenticated, user } = usePrivy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { wallets } = useWallets();
  const embeddedWallet =
    wallets.find((wallet) => wallet.walletClientType === "privy") || wallets[0];
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            } else if (toolData.ok.currentPage === 1) {
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
  return (
    <div className="flex w-full h-screen bg-gray-50">
      {authenticated ? (
        <div>{user?.wallet?.address}</div>
      ) : (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg m-4"
          onClick={login}
        >
          Connect Wallet
        </button>
      )}

      {/* Chat Interface */}
      <div className="w-[570px] border-r bg-white flex flex-col h-full">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-lg font-semibold">
            AI Assistant
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-3xl p-3 ${
                  msg.type === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                } max-w-[80%]`}
              >
                {msg.type === "ai" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t bg-white p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">{renderCard()}</div>
      {authenticated && embeddedWallet ? (
        <StakingCard
          web3Provider={LidoSDKCore.createWeb3Provider(17000, window.ethereum)}
          account={user?.wallet?.address || ""}
        />

      ) : (
        <ErrorCard message="Please connect your wallet to stake" />
      )}
    </div>
  );
};

export default AgentDetails;
