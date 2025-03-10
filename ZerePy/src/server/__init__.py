import uvicorn

def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the ZerePy server"""
    uvicorn.run(
        "src.server.app:create_app",
        host=host,
        port=port,
        reload=True,
        factory=True
    )
