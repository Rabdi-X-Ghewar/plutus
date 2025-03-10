from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field
from typing import Optional, List, Dict, Any
import logging
import asyncio
import signal
import threading
from pathlib import Path
from src.cli import ZerePyCLI
import os, json
from dotenv import set_key
# import atexit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server/app")
AGENT_FOLDER = "C:/Users/gouta/Documents/Projects/Plutus-ZerePy/plutus/ZerePy/agents"
# os.makedirs(AGENT_FOLDER, exist_ok=True)

class AgentConfig(BaseModel):
    name: str = Field(..., description="Unique name of the agent")
    bio: list[str]
    traits: list[str]
    examples: list[str]
    example_accounts: list[str]
    loop_delay: int
    config: list[dict[str, Any]]
    tasks: list[dict[str, Any]]
    use_time_based_weights: bool
    time_based_multipliers: dict[str, float]

class ActionRequest(BaseModel):
    """Request model for agent actions"""
    connection: str
    action: str
    params: Optional[List[str]] = []

class ConfigureRequest(BaseModel):
    """Request model for configuring connections"""
    connection: str
    params: Optional[Dict[str, Any]] = {}

class ServerState:
    """Simple state management for the server"""
    def __init__(self):
        self.cli = ZerePyCLI()
        self.agent_running = False
        self.agent_task = None
        self._stop_event = threading.Event()

    def _run_agent_loop(self):
        """Run agent loop in a separate thread"""
        try:
            log_once = False
            while not self._stop_event.is_set():
                if self.cli.agent:
                    try:
                        if not log_once:
                            logger.info("Loop logic not implemented")
                            log_once = True

                    except Exception as e:
                        logger.error(f"Error in agent action: {e}")
                        if self._stop_event.wait(timeout=30):
                            break
        except Exception as e:
            logger.error(f"Error in agent loop thread: {e}")
        finally:
            self.agent_running = False
            logger.info("Agent loop stopped")

    async def start_agent_loop(self):
        """Start the agent loop in background thread"""
        if not self.cli.agent:
            raise ValueError("No agent loaded")
        
        if self.agent_running:
            raise ValueError("Agent already running")

        self.agent_running = True
        self._stop_event.clear()
        self.agent_task = threading.Thread(target=self._run_agent_loop)
        self.agent_task.start()

    async def stop_agent_loop(self):
        """Stop the agent loop"""
        if self.agent_running:
            self._stop_event.set()
            if self.agent_task:
                self.agent_task.join(timeout=5)
            self.agent_running = False
# Auto-deletion mechanism 
# def auto_delete_old_agents(threshold_seconds: int = 7 * 24 * 60 * 60):
    # """
    # Automatically delete agent files older than the threshold.
    # Default threshold is 1 week (7 days).
    # """
    # now = time.time()
    # for filename in os.listdir(AGENT_FOLDER):
        # file_path = os.path.join(AGENT_FOLDER, filename)
        # if os.path.isfile(file_path):
            # file_age = now - os.path.getmtime(file_path)
            # if file_age > threshold_seconds:
                # try:
                    # os.remove(file_path)
                    # print(f"Auto-deleted agent file: {filename}")
                # except Exception as e:
                    # print(f"Error deleting {filename}: {e}")
# 
# scheduler = BackgroundScheduler()
# Schedule the job to run every hour.
# scheduler.add_job(auto_delete_old_agents, 'interval', hours=1)
# scheduler.start()
class ZerePyServer:
    def __init__(self):
        self.app = FastAPI(title="ZerePy Server")
        self.app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Replace with specific origins in production for better security.
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

        self.state = ServerState()
        self.setup_routes()

    def setup_routes(self):
        @self.app.get("/")
        async def root():
            """Server status endpoint"""
            return {
                "status": "running",
                "agent": self.state.cli.agent.name if self.state.cli.agent else None,
                "agent_running": self.state.agent_running
            }
        
        @self.app.post("/agents/create")
        async def create_agent(agent_config: AgentConfig):
            # Use the name from the JSON to create the file name.
            file_name = f"{agent_config.name}.json"
            agent_path = os.path.join(AGENT_FOLDER, file_name)
            if os.path.exists(agent_path):
                raise HTTPException(status_code=400, detail="Agent already exists")
            try:
                with open(agent_path, "w") as f:
                    json.dump(agent_config.model_dump(), f, indent=2)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error saving agent: {str(e)}")
            return {"message": "Agent created successfully", "agent": agent_config.dict()}
        
        @self.app.delete("/agents/{agent_name}")
        async def delete_agent(agent_name: str):
            file_name = f"{agent_name}.json"
            agent_path = os.path.join(AGENT_FOLDER, file_name)
            if not os.path.exists(agent_path):
                raise HTTPException(status_code=404, detail="Agent not found")
            try:
                os.remove(agent_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error deleting agent: {str(e)}")
            return {"message": "Agent deleted successfully", "agent": agent_name}

        @self.app.get("/agents")
        async def list_agents():
            """List available agents"""
            try:
                agents = []
                agents_dir = Path("agents")
                if agents_dir.exists():
                    for agent_file in agents_dir.glob("*.json"):
                        if agent_file.stem != "general":
                            agents.append(agent_file.stem)
                return {"agents": agents}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/agents/{name}/load")
        async def load_agent(name: str):
            """Load a specific agent"""
            try:
                self.state.cli._load_agent_from_file(name)
                return {
                    "status": "success",
                    "agent": name
                }
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.get("/connections")
        async def list_connections():
            """List all available connections"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                connections = {}
                for name, conn in self.state.cli.agent.connection_manager.connections.items():
                    connections[name] = {
                        "configured": conn.is_configured(),
                        "is_llm_provider": conn.is_llm_provider
                    }
                return {"connections": connections}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/agent/action")
        async def agent_action(action_request: ActionRequest):
            """Execute a single agent action"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                result = await asyncio.to_thread(
                    self.state.cli.agent.perform_action,
                    connection=action_request.connection,
                    action=action_request.action,
                    params=action_request.params
                )
                return {"status": "success", "result": result}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.post("/agent/start")
        async def start_agent():
            """Start the agent loop"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                await self.state.start_agent_loop()
                return {"status": "success", "message": "Agent loop started"}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.post("/agent/stop")
        async def stop_agent():
            """Stop the agent loop"""
            try:
                await self.state.stop_agent_loop()
                return {"status": "success", "message": "Agent loop stopped"}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/connections/{name}/configure")
        async def configure_connection(name: str, config: ConfigureRequest):
            """Save multiple environment variables from JSON payload to .env using python-dotenv's set_key."""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                connection = self.state.cli.agent.connection_manager.connections.get(name)
                if not connection:
                    raise HTTPException(status_code=404, detail=f"Connection {name} not found")
                
                # Loop through each key-value pair and update the .env file.
                for key, value in config.params.items():
                    # Using QuoteMode.ALWAYS ensures the value is enclosed in quotes.
                    set_key(".env", key, value, quote_mode="always")
                
                return {
                    "status": "success",
                    "message": f"Credentials for connection {name} saved to .env"
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
            
        @self.app.get("/connections/{connection_name}/actions")
        async def list_actions(connection_name: str):
            """
            List all available actions for a specific connection.
            This mimics the CLI command:
              list_actions {connection_name}
            and returns a JSON response for use in your front-end dropdown.
            """
            try:
                # Retrieve the connection object using the provided name
                connection = self.state.cli.agent.connection_manager.connections[connection_name]
        
                # Check if the connection is configured
                configured = connection.is_configured()
                if configured:
                    logger.info(
                        f"\n✅ {connection_name} is configured. You can use any of its actions."
                    )
                else:
                    logger.info(
                        f"\n❌ {connection_name} is not configured. You must configure a connection to use its actions."
                    )
        
                # Build the actions list
                actions = []
                for action_name, action in connection.actions.items():
                    action_info = {
                        "name": action_name,
                        "description": action.description,
                        "parameters": [
                            {
                                "name": param.name,
                                "required": param.required,
                                "description": param.description,
                            }
                            for param in action.parameters
                        ],
                    }
                    actions.append(action_info)
        
                return {
                    "connection": connection_name,
                    "configured": configured,
                    "actions": actions,
                }
        
            except KeyError:
                logger.error(
                    "\nUnknown connection. Try 'list-connections' to see all supported connections."
                )
                raise HTTPException(
                    status_code=400,
                    detail="Unknown connection. Try 'list-connections' to see all supported connections.",
                )
            except Exception as e:
                logger.error(f"\nAn error occurred: {e}")
                raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

        @self.app.get("/connections/{name}/status")
        async def connection_status(name: str):
            """Get configuration status of a connection"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
                
            try:
                connection = self.state.cli.agent.connection_manager.connections.get(name)
                if not connection:
                    raise HTTPException(status_code=404, detail=f"Connection {name} not found")
                    
                return {
                    "name": name,
                    "configured": connection.is_configured(verbose=True),
                    "is_llm_provider": connection.is_llm_provider
                }
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.websocket("/chat")
        async def chat_websocket(websocket: WebSocket):
            if not self.state.cli.agent:
                 await websocket.close(code=4000, reason="No agent loaded")
                 return
            
            # Ensure the agent has its LLM provider set up
            if not self.state.cli.agent.is_llm_set:
                 self.state.cli.agent._setup_llm_provider()
            
            try:
                 await websocket.accept()
                 
                 while True:
                     message = await websocket.receive_text()
                     
                     if message.lower() == 'exit':
                         break
                     
                     # Run the synchronous prompt_llm call in a separate thread
                     response = await asyncio.to_thread(self.state.cli.agent.prompt_llm, message)
                     
                     await websocket.send_text(response)
                     
            except Exception as e:
                 logger.error(f"Chat error: {e}")
                 # Optionally, send an error message back to the client
                 await websocket.send_text(f"Error: {e}")
            finally:
                 await websocket.close()

# To ensure the scheduler shuts down gracefully when the app stops:

# atexit.register(lambda: scheduler.shutdown())
def create_app():
    server = ZerePyServer()
    return server.app