import logging
import os
from typing import Dict, Any
from dotenv import load_dotenv, set_key
from openai import OpenAI
from src.connections.base_connection import BaseConnection, Action, ActionParameter

logger = logging.getLogger("connections.openrouter_connection")

class OpenRouterConnectionError(Exception):
    """Base exception for OpenRouter connection errors"""
    pass

class OpenRouterConfigurationError(OpenRouterConnectionError):
    """Raised when there are configuration/credential issues"""
    pass

class OpenRouterAPIError(OpenRouterConnectionError):
    """Raised when OpenRouter API requests fail"""
    pass

class OpenRouterConnection(BaseConnection):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self._client = None

    @property
    def is_llm_provider(self) -> bool:
        return True

    def validate_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate OpenRouter configuration from JSON"""
        required_fields = ["model"]
        missing_fields = [field for field in required_fields if field not in config]
        
        if missing_fields:
            raise ValueError(f"Missing required configuration fields: {', '.join(missing_fields)}")
            
        if not isinstance(config["model"], str):
            raise ValueError("model must be a string")
            
        return config

    def register_actions(self) -> None:
        """Register available OpenRouter actions"""
        self.actions = {
            "generate-text": Action(
                name="generate-text",
                parameters=[
                    ActionParameter("prompt", True, str, "The input prompt for text generation"),
                    ActionParameter("system_prompt", True, str, "System prompt to guide the model"),
                    ActionParameter("model", False, str, "Model to use for generation")
                ],
                description="Generate text using OpenRouter models"
            ),
            "list-models": Action(
                name="list-models",
                parameters=[],
                description="List all available OpenRouter models"
            )
        }

    def _get_client(self) -> OpenAI:
        """Get or create OpenRouter client"""
        if not self._client:
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                raise OpenRouterConfigurationError("OpenRouter API key not found in environment")
            
            self._client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
        return self._client

    def configure(self) -> bool:
        """Sets up OpenRouter API authentication"""
        logger.info("\n🤖 OPENROUTER API SETUP")

        if self.is_configured():
            logger.info("\nOpenRouter API is already configured.")
            response = input("Do you want to reconfigure? (y/n): ")
            if response.lower() != 'y':
                return True

        logger.info("\n📝 To get your OpenRouter API credentials:")
        logger.info("1. Go to https://openrouter.ai/keys")
        logger.info("2. Create a free account if you don't have one")
        logger.info("3. Generate a new API key")
        
        api_key = input("\nEnter your OpenRouter API key: ")

        try:
            if not os.path.exists('.env'):
                with open('.env', 'w') as f:
                    f.write('')

            set_key('.env', 'OPENROUTER_API_KEY', api_key)
            
            # Validate the API key by trying to list models
            client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            client.models.list()

            logger.info("\n✅ OpenRouter API configuration successfully saved!")
            logger.info("Your API key has been stored in the .env file.")
            return True

        except Exception as e:
            logger.error(f"Configuration failed: {e}")
            return False

    def is_configured(self, verbose = False) -> bool:
        """Check if OpenRouter API key is configured and valid"""
        try:
            load_dotenv()
            api_key = os.getenv('OPENROUTER_API_KEY')
            if not api_key:
                return False

            client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            client.models.list()
            return True
            
        except Exception as e:
            if verbose:
                logger.debug(f"Configuration check failed: {e}")
            return False

    def generate_text(self, prompt: str, system_prompt: str, model: str = None, **kwargs) -> str:
        """Generate text using OpenRouter models"""
        try:
            client = self._get_client()
            
            # Use configured model if none provided
            if not model:
                model = self.config["model"]

            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )

            return completion.choices[0].message.content
            
        except Exception as e:
            raise OpenRouterAPIError(f"Text generation failed: {e}")

    def list_models(self, **kwargs) -> None:
        """List all available OpenRouter models"""
        try:
            client = self._get_client()
            response = client.models.list().data
            
            logger.info("\nAVAILABLE MODELS:")
            for i, model in enumerate(response):
                logger.info(f"{i+1}. {model.id}")
                    
        except Exception as e:
            raise OpenRouterAPIError(f"Listing models failed: {e}")
    
    def perform_action(self, action_name: str, kwargs) -> Any:
        """Execute an OpenRouter action with validation"""
        if action_name not in self.actions:
            raise KeyError(f"Unknown action: {action_name}")

        action = self.actions[action_name]
        errors = action.validate_params(kwargs)
        if errors:
            raise ValueError(f"Invalid parameters: {', '.join(errors)}")

        # Call the appropriate method based on action name
        method_name = action_name.replace('-', '_')
        method = getattr(self, method_name)
        return method(**kwargs)