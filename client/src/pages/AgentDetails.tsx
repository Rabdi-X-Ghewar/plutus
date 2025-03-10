import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  Send,
  Server,
  Play,
  Square,
  Settings,
  List,
  FileText,
  Link,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Message } from "../types/AgentInterfaces";

// --- ZerePyClient Implementation ---
const BASE_URL = "http://localhost:8000";

const makeRequest = async (
  method: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${BASE_URL}/${endpoint.replace(/^\/+/, "")}`;
  try {
    const response = await fetch(url, {
      method,
      ...options,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

const ZerePyClient = {
  getStatus: () => makeRequest("GET", "/"),
  listAgents: async (): Promise<string[]> => {
    const data = await makeRequest("GET", "/agents");
    return data.agents || [];
  },
  loadAgent: (agentName: string) =>
    makeRequest("POST", `/agents/${agentName}/load`),
  listConnections: () => makeRequest("GET", "/connections"),
  performAction: (
    connection: string,
    action: string,
    params: string[] = []
  ) => {
    const payload = { connection, action, params };
    return makeRequest("POST", "/agent/action", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  startAgent: () => makeRequest("POST", "/agent/start"),
  stopAgent: () => makeRequest("POST", "/agent/stop"),
};
// --- End ZerePyClient Implementation ---

const PLUTUS_ASCII = `
██████╗ ██╗     ██╗   ██╗████████╗██╗   ██╗███████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██║   ██║██╔════╝
██████╔╝██║     ██║   ██║   ██║   ██║   ██║███████╗
██╔═══╝ ██║     ██║   ██║   ██║███████║╚════██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝███████║
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝
`;

const AgentDetails: React.FC = () => {
  // State for chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // State for available agents and connections
  const [agents, setAgents] = useState<string[]>([]);
  const [connections, setConnections] = useState<Record<string, any>>({});
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
 
  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [actionParams, setActionParams] = useState<{
    connection: string;
    action: string;
    params: string[];
  }>({ connection: "", action: "", params: [] });
  const [configParams, setConfigParams] = useState<{
    connection: string;
    params: Record<string, any>;
  }>({ connection: "", params: {} });
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedConnection, setSelectedConnection] = useState<string>("");
  const [availableActions, setAvailableActions] = useState<any[]>([]);
 const [createAgentJson, setCreateAgentJson] = useState<string>("");
 const [deleteAgentName, setDeleteAgentName] = useState<string>("");

  // Initialize WebSocket connection and fetch agents on mount
  useEffect(() => {
    // Auto-close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Fetch agents on mount using our client
    fetchAgents();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update connections when agent changes
  useEffect(() => {
    if (currentAgent) {
      fetchConnections();
    }
  }, [currentAgent]);

  // WebSocket connection setup when agent is loaded
  useEffect(() => {
    if (currentAgent && !ws.current) {
      setupWebSocket();
    }
  }, [currentAgent]);

  const setupWebSocket = () => {
    const websocketUrl = `ws://localhost:8000/chat`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      addSystemMessage("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const response = event.data;
      addAgentMessage(response);
      setIsLoading(false);
    };

    ws.current.onclose = () => {
      addSystemMessage("WebSocket disconnected");
      ws.current = null;
    };

    ws.current.onerror = (error) => {
      addSystemMessage(`WebSocket error: ${error.message}`);
      setIsLoading(false);
    };
  };

  // --- API calls using ZerePyClient ---
  const fetchAgents = async () => {
    try {
      const fetchedAgents = await ZerePyClient.listAgents();
      setAgents(fetchedAgents);
      addSystemMessage("Available agents loaded");
    } catch (error: any) {
      addSystemMessage(`Error loading agents: ${error.message}`);
    }
  };

  const fetchActionsForConnection = async () => {
    if (!actionParams.connection) {
      addSystemMessage("Please select a connection to list actions.");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/connections/${actionParams.connection}/actions`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      setAvailableActions(data.actions || []);
      addSystemMessage("Actions loaded.");
    } catch (error: any) {
      addSystemMessage(`Error fetching actions: ${error.message}`);
    }
  };

  const loadAgent = async (name: string) => {
    setIsLoading(true);
    try {
      await ZerePyClient.loadAgent(name);
      setCurrentAgent(name);
      addSystemMessage(`Agent '${name}' loaded successfully`);
      setIsLoading(false);
    } catch (error: any) {
      addSystemMessage(`Error loading agent: ${error.message}`);
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const connectionsData = await ZerePyClient.listConnections();
      setConnections(connectionsData.connections || {});
      addSystemMessage("Connections loaded");
    } catch (error: any) {
      addSystemMessage(`Error loading connections: ${error.message}`);
    }
  };

  const performAction = async () => {
    if (!actionParams.connection || !actionParams.action) {
      addSystemMessage("Connection and action are required");
      return;
    }

    setIsLoading(true);
    try {
      const data = await ZerePyClient.performAction(
        actionParams.connection,
        actionParams.action,
        actionParams.params
      );
      addSystemMessage(`Action result: ${JSON.stringify(data.result)}`);
      setIsLoading(false);
    } catch (error: any) {
      addSystemMessage(`Error performing action: ${error.message}`);
      setIsLoading(false);
    }
  };

  const configureConnection = async () => {
    if (!selectedConnection) {
      addSystemMessage("Please select a connection");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/connections/${selectedConnection}/configure`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            connection: selectedConnection,
            params: configParams.params,
          }),
        }
      );
      const data = await response.json();
      addSystemMessage(data.message);
      setIsLoading(false);
    } catch (error: any) {
      addSystemMessage(`Error configuring connection: ${error.message}`);
      setIsLoading(false);
    }
  };

  const getConnectionStatus = async (conn: string) => {
    try {
      const response = await fetch(`${BASE_URL}/connections/${conn}/status`);
      const data = await response.json();
      addSystemMessage(`Connection status: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addSystemMessage(`Error getting connection status: ${error.message}`);
    }
  };

  const startAgent = async () => {
    setIsLoading(true);
    try {
      const data = await ZerePyClient.startAgent();
      setAgentRunning(true);
      addSystemMessage(data.message);
      setIsLoading(false);
    } catch (error: any) {
      addSystemMessage(`Error starting agent: ${error.message}`);
      setIsLoading(false);
    }
  };

  const stopAgent = async () => {
    setIsLoading(true);
    try {
      const data = await ZerePyClient.stopAgent();
      setAgentRunning(false);
      addSystemMessage(data.message);
      setIsLoading(false);
    } catch (error: any) {
      addSystemMessage(`Error stopping agent: ${error.message}`);
      setIsLoading(false);
    }
  };
  const handleCreateAgent = async () => {
    try {
      const parsed = JSON.parse(createAgentJson);
      const response = await fetch(`${BASE_URL}/agents/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      await response.json();
      addSystemMessage("Agent created successfully.");
    } catch (error: any) {
      addSystemMessage(`Error: ${error.message}`);
    }
  };
  const handleDeleteAgent = async () => {
    try {
      const response = await fetch(`${BASE_URL}/agents/${deleteAgentName}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || response.statusText);
      }
      const data = await response.json();
      addSystemMessage(data.message);
    } catch (error: any) {
      addSystemMessage(`Error: ${error.message}`);
    }
  };
  // --- End API calls using ZerePyClient ---
  // Chat handling
  const handleSendMessage = () => {
    if (!input.trim() || !ws.current) {
      addSystemMessage("Please enter a message or connect WebSocket");
      return;
    }
    setIsLoading(true);
    addUserMessage(input);
    ws.current.send(input);
    setInput("");
  };

  // Helper functions for messages
  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", content, timestamp: new Date() },
    ]);
  };

  const addAgentMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { type: "agent", content, timestamp: new Date() },
    ]);
  };

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { type: "system", content, timestamp: new Date() },
    ]);
  };

  const formatTimestamp = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Render messages with ReactMarkdown applied to content
  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case "user":
        return (
          <div className="font-mono text-white">
            <span className="text-[#50fa7b]">user@plutus</span>
            <span className="text-white/70">:~$</span>
            <div className="ml-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="whitespace-pre-wrap"
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      case "agent":
        return (
          <div className="font-mono">
            <span className="text-[#bd93f9]">plutus@ai</span>
            <span className="text-white/70">:~$</span>
            <div className="mt-1 text-white pl-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="whitespace-pre-wrap"
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      case "system":
        return (
          <div className="font-mono">
            <span className="text-[#ff5555]">system</span>
            <span className="text-white/70">:~$</span>
            <div className="ml-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="whitespace-pre-wrap"
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StyledButton: React.FC<{
    icon: JSX.Element;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }> = ({ icon, label, onClick, disabled = false, className = "" }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-transparent text-white border border-white rounded-full shadow-lg transform hover:bg-green-400 hover:text-black transition-all duration-200 flex items-center gap-2 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  // UI elements for explore section – updated dropdown style to match buttons
  const renderButtonWithDropdown = (
    icon: JSX.Element,
    label: string,
    dropdownId: string,
    dropdownContent: JSX.Element
  ) => {
    return (
      <div className="dropdown mb-4 relative">
        <StyledButton
          icon={icon}
          label={label}
          onClick={() =>
            setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)
          }
          className="w-full"
        />
        {activeDropdown === dropdownId && (
          <div className="dropdown-content bg-transparent border border-white p-4 rounded-3xl shadow-lg w-full z-10 mt-1 text-white">
            {dropdownContent}
          </div>
        )}
      </div>
    );
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

        <ScrollArea className="flex-1 p-4 font-mono bg-black">
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
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleSendMessage()
              }
              disabled={isLoading || !currentAgent}
              className="flex-1 bg-transparent border-[#444] text-white placeholder:text-white/50 focus:outline-none focus:ring-0 font-mono"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={isLoading || !currentAgent}
              className="bg-[#50fa7b] hover:bg-[#3fce63] text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Explore and Controls */}
      <div className="flex-1 flex flex-col gap-6 p-6 bg-black">
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <div
              className="text-xl font-semibold text-white"
              style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
            >
              Explore
            </div>
          </div>

          {/* Load Agent */}
          {renderButtonWithDropdown(
            <FileText className="h-5 w-5" />,
            "Create Agent",
            "create-agent",
            <>
              <label className="block text-sm font-medium text-white mb-2">
                Agent JSON
              </label>
              <textarea
                className="w-full p-2 bg-transparent border border-white rounded-2xl text-white mb-2"
                rows={10}
                placeholder='{"name": "StarterAgent", "bio": [...], ... }'
                value={createAgentJson}
                onChange={(e) => setCreateAgentJson(e.target.value)}
              />
              <StyledButton
                icon={<FileText className="h-4 w-4" />}
                label="Create Agent"
                onClick={() => {
                  handleCreateAgent();
                  setActiveDropdown(null);
                }}
                className="w-full"
              />
            </>
          )}

          {renderButtonWithDropdown(
            <FileText className="h-5 w-5" />,
            "Delete Agent",
            "delete-agent",
            <>
              <label className="block text-sm font-medium text-white mb-2">
                Agent Name
              </label>
              <Input
                className="w-full p-2 bg-transparent border border-white rounded-2xl text-white"
                placeholder="Enter agent name"
                value={deleteAgentName}
                onChange={(e) => setDeleteAgentName(e.target.value)}
              />
              <StyledButton
                icon={<FileText className="h-4 w-4" />}
                label="Delete Agent"
                onClick={() => {
                  handleDeleteAgent();
                  setActiveDropdown(null);
                }}
                className="w-full mt-2"
              />
            </>
          )}

          {renderButtonWithDropdown(
            <FileText className="h-5 w-5" />,
            "Load Agent",
            "load-agent",
            <>
              <label className="block text-sm font-medium text-white mb-2">
                Select Agent
              </label>
              {agents && agents.length > 0 ? (
                agents.map((agent) => (
                  <StyledButton
                    key={agent}
                    icon={<FileText className="h-4 w-4" />}
                    label={agent}
                    onClick={() => {
                      loadAgent(agent);
                      setActiveDropdown(null);
                    }}
                    className="w-full mb-2"
                  />
                ))
              ) : (
                <p className="text-white">No agents available</p>
              )}
            </>
          )}

          {/* Configure Connection */}
          {renderButtonWithDropdown(
            <Settings className="h-5 w-5" />,
            "Configure Connection",
            "configure-connection",
            <>
              <label className="block text-sm font-medium text-white mb-2">
                Select Connection
              </label>
              <select
                className="w-full p-2 bg-transparent border border-white rounded-2xl mb-4 text-white"
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
              >
                <option value=" " className="text-black bg-transparent">
                  Select a connection
                </option>
                {Object.keys(connections).map((conn) => (
                  <option
                    key={conn}
                    value={conn}
                    className="text-black bg-transparent"
                  >
                    {conn}
                  </option>
                ))}
              </select>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Parameters (JSON)
                </label>
                <textarea
                  className="w-full p-2 bg-transparent border border-white rounded h-24 text-white"
                  placeholder='{"API_KEY": "your-key","OTHER_KEY":"value"}'
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value || "{}");
                      setConfigParams({
                        connection: selectedConnection,
                        params: params,
                      });
                    } catch (error) {
                      // Invalid JSON; error handling can be added if needed.
                    }
                  }}
                />
              </div>
              <StyledButton
                icon={<Settings className="h-4 w-4" />}
                label="Configure"
                onClick={() => {
                  configureConnection();
                  setActiveDropdown(null);
                }}
                disabled={!selectedConnection}
                className="w-full"
              />
            </>
          )}

          {/* Connection Status */}
          {renderButtonWithDropdown(
            <Link className="h-5 w-5" />,
            "Connection Status",
            "connection-status",
            <>
              <label className="block text-sm font-medium text-white mb-2">
                Select Connection
              </label>
              <select
                className="w-full p-2 bg-transparent border border-white rounded-2xl mb-4 text-white"
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
              >
                <option value="" className="text-black">
                  Select a connection
                </option>
                {Object.keys(connections).map((conn) => (
                  <option key={conn} value={conn} className="text-black">
                    {conn}
                  </option>
                ))}
              </select>
              <StyledButton
                icon={<Link className="h-4 w-4" />}
                label="Get Status"
                onClick={() => {
                  getConnectionStatus(selectedConnection);
                  setActiveDropdown(null);
                }}
                disabled={!selectedConnection}
                className="w-full"
              />
            </>
          )}

          {/* Agent Action */}
          {renderButtonWithDropdown(
            <Server className="h-5 w-5" />,
            "Agent Action",
            "agent-action",
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Connection
                </label>
                <select
                  className="w-full p-2 bg-transparent border border-white rounded-2xl text-white"
                  value={actionParams.connection}
                  onChange={(e) =>
                    setActionParams({
                      ...actionParams,
                      connection: e.target.value,
                    })
                  }
                >
                  <option value="" className="text-black">
                    Select a connection
                  </option>
                  {Object.keys(connections).map((conn) => (
                    <option key={conn} value={conn} className="text-black">
                      {conn}
                    </option>
                  ))}
                </select>
                <StyledButton
                  icon={<List className="h-4 w-4" />}
                  label="List Actions"
                  onClick={fetchActionsForConnection}
                  disabled={!actionParams.connection}
                  className="w-full mt-2"
                />
              </div>
              {availableActions.length > 0 && (
                <div className="mb-4 p-2 border border-white rounded">
                  <p className="font-bold">Available Actions:</p>
                  {availableActions.map((action, index) => (
                    <div key={index} className="mb-2">
                      <p className="font-semibold">{action.name}</p>
                      <p>{action.description}</p>
                      {action.parameters && action.parameters.length > 0 && (
                        <ul className="ml-4 list-disc">
                          {action.parameters.map((param: any, idx: number) => (
                            <li key={idx}>
                              {param.name} (
                              {param.required ? "required" : "optional"}):{" "}
                              {param.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Action
                </label>
                <Input
                  className="w-full p-2 bg-transparent border border-white rounded-2xl text-white"
                  placeholder="Action name"
                  value={actionParams.action}
                  onChange={(e) =>
                    setActionParams({ ...actionParams, action: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Parameters (comma separated)
                </label>
                <Input
                  className="w-full p-2 bg-transparent border border-white rounded-2xl text-white"
                  placeholder="param1, param2, param3"
                  onChange={(e) =>
                    setActionParams({
                      ...actionParams,
                      params: e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <StyledButton
                icon={<Server className="h-4 w-4" />}
                label="Execute Action"
                onClick={() => {
                  performAction();
                  setActiveDropdown(null);
                }}
                disabled={!actionParams.connection || !actionParams.action}
                className="w-full"
              />
            </>
          )}

          {/* Agent Control */}
          <div className="flex gap-2 mt-4">
            <StyledButton
              icon={<Play className="h-5 w-5" />}
              label="Start Agent"
              onClick={startAgent}
              disabled={!currentAgent || agentRunning || isLoading}
              className="flex-1"
            />
            <StyledButton
              icon={<Square className="h-5 w-5" />}
              label="Stop Agent"
              onClick={stopAgent}
              disabled={!currentAgent || !agentRunning || isLoading}
              className="flex-1"
            />
          </div>

          {/* Connection List */}
          {Object.keys(connections).length > 0 && (
            <div className="mt-6 p-4 border border-white rounded-2xl bg-black">
              <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-white">
                <List className="h-4 w-4" /> Available Connections
              </h3>
              <ul className="divide-y divide-[#444]">
                {Object.entries(connections).map(([name, details]) => (
                  <li key={name} className="py-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{name}</span>
                      <span
                        className={
                          details.configured
                            ? "text-[#50fa7b]"
                            : "text-[#ff5555]"
                        }
                      >
                        {details.configured ? "Configured" : "Not Configured"}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      {details.is_llm_provider
                        ? "LLM Provider"
                        : "Regular Connection"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Agent Status */}
          {currentAgent && (
            <div className="mt-4 p-4 border border-white rounded-2xl bg-black">
              <h3 className="font-medium text-white">Agent Status</h3>
              <div className="mt-2 text-white">
                <div>
                  <span className="font-medium">Current Agent:</span>{" "}
                  {currentAgent}
                </div>
                <div>
                  <span className="font-medium">Running:</span>{" "}
                  <span
                    className={
                      agentRunning ? "text-[#50fa7b]" : "text-[#ff5555]"
                    }
                  >
                    {agentRunning ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;
