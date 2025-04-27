from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference import EmbeddingsClient
import google.generativeai as genai

from typing import Union, List
from openai import OpenAI, AzureOpenAI
import numpy as np


from aws_utils import get_secret

DEFAULT_OAI_MODEL = 'gpt-4.1'

class gai_client:
    """OpenAI Connector."""

    def openai_text(self,
                    prompt: str,
                    model: str = DEFAULT_OAI_MODEL,
                    temperature: float = 0.1,
                    max_tokens: int = 4095,
                    sysmsg: str = None,
                    to_json: bool = False,
                    json_schema: dict = None) -> str:
        

        # 1. Validate model
        allowed_models = ["gpt-4o", "gpt-4o-mini", "o4-mini", "gpt-4.1", "gpt-4.1-mini"]
        if model not in allowed_models:
            raise ValueError(
                "Invalid model. Only 'gpt-4o', 'gpt-4o-mini', 'o3-mini', and 'gpt-4.1' are supported."
            )
        


        # 2. Build the message list
        messages = []
        if sysmsg:
            messages.append({"role": "system", "content": sysmsg})
        messages.append({"role": "user", "content": prompt})

        # 3. Determine response format
        response_format = None
        if to_json:
            response_format = json_schema if json_schema else {"type": "json_object"}

        # 4. o3-mini: Legacy AzureOpenAI client
        if model == "o4-mini":
            # 6.1 Grab the same o3 key
            secret = get_secret('vibeset/azure_ai_foundry')
            api_key = secret.get('api_key_o3')

            # 6.2 Point to your o4-mini deployment
            endpoint = (
                "https://kevin-m86fxp36-eastus2.cognitiveservices.azure.com/"
                "openai/deployments/o4-mini"
            )

            from azure.ai.inference import ChatCompletionsClient
            from azure.core.credentials import AzureKeyCredential

            client = ChatCompletionsClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(api_key),
                api_version="2025-01-01-preview"
            )
            
            completion = client.complete(
                messages=messages,
                #max_completion_tokens=max_completion_tokens, 
                temperature=1.0,
                top_p=1.0,
                model="o4-mini",
                response_format=response_format
            )
            return completion.choices[0].message.content

        # 5. gpt-4.1: Inference SDK on same server as o3-mini
        elif model == "gpt-4.1":
            secret = get_secret('vibeset/azure_ai_foundry')
            api_key = secret.get('api_key_o3')
            endpoint = (
                "https://kevin-m86fxp36-eastus2.cognitiveservices.azure.com/"
                "openai/deployments/gpt-4.1"
            )
            from azure.ai.inference import ChatCompletionsClient
            from azure.core.credentials import AzureKeyCredential

            # Use the latest GA api_version for Azure OpenAI inference ("2024-06-01").
            client = ChatCompletionsClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(api_key),
                api_version="2025-02-01-preview"
            )
            completion = client.complete(
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=1.0,
                model=model,
                response_format=response_format
            )
            return completion.choices[0].message.content
        elif model == "gpt-4.1-mini":
            secret = get_secret('vibeset/azure_ai_foundry')
            api_key = secret.get('api_key_o3')
            endpoint = (
                "https://kevin-m86fxp36-eastus2.cognitiveservices.azure.com/"
                "openai/deployments/gpt-4.1-mini"
            )

            from azure.ai.inference import ChatCompletionsClient
            from azure.core.credentials import AzureKeyCredential

            client = ChatCompletionsClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(api_key),
                api_version="2025-02-01-preview"
            )

            completion = client.complete(
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=1.0,
                model=model,
                response_format=response_format
            )
            return completion.choices[0].message.content
        # 6. gpt-4o / gpt-4o-mini: Existing ChatCompletionsClient branch
        else:
            secret = get_secret('vibeset/azure_ai_foundry')
            key = secret.get('api_key')
            endpoint = (
                f"https://vibesetbackend9912493372.cognitiveservices.azure.com"
                f"/openai/deployments/{model}"
            )
            from azure.ai.inference import ChatCompletionsClient
            from azure.core.credentials import AzureKeyCredential

            client = ChatCompletionsClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(key),
                api_version='2025-02-01-preview'
            )
            if to_json and not json_schema:
                response_format = "json_object"

            completion = client.complete(
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=1.0,
                model=model,
                response_format=response_format
            )
            return completion.choices[0].message.content
        
    def text(self,
            prompt: str,
            model: str = "mercury-coder-small",
            temperature: float = 0.1,
            max_tokens: int = 30000,
            sysmsg: str = None,
            to_json: bool = False,
            json_schema: dict = None) -> str:
        """
        Generate text using Mercury LLM.
        
        Args:
            prompt: The prompt to send to the model
            model: The Mercury model to use (default: mercury-coder-small)
            temperature: Controls randomness in the output (0-1)
            max_tokens: Maximum tokens in the generated response
            sysmsg: Optional system message to guide the model's behavior
            to_json: Boolean flag to indicate if the response should be in JSON format
            json_schema: Optional schema for structured JSON outputs
            
        Returns:
            The generated text from the model
        """
        from openai import OpenAI
        
        # Get API key from secrets (you'll need to add this to your secrets)
        try:
            api_key = get_secret('vibeset/mercury')['api_key']
        except:
            # Fallback in case the specific Mercury secret isn't set up yet
            api_key = "[YOUR_API_KEY]"
        
        # Initialize the client with the InceptionLabs base URL
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.inceptionlabs.ai/v1"
        )
        
        # Build the message list
        messages = []
        if sysmsg:
            messages.append({"role": "system", "content": sysmsg})
        messages.append({"role": "user", "content": prompt})
        
        # Configure response format for JSON if requested
        response_format = None
        if to_json:
            # For simple JSON responses
            if json_schema is None:
                response_format = {"type": "json_object"}
            # For structured JSON with a schema
            else:
                response_format = {
                    "type": "json_schema",
                    "schema": json_schema
                }
        
        # Make the API call
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format
        )
        
        # Return the generated text
        return response.choices[0].message.content
        
    @staticmethod
    def get_embedding(
        text: Union[str, List[str]],
        model: str = "text-embedding-3-small",
    ) -> np.ndarray:
        """
        Generate embeddings for a single string or a list of strings.
        Returns:
            • np.ndarray shape (dim,)  if input was str
            • np.ndarray shape (N, dim) if input was list[str]
        """
        # ── 1. Normalize input ─────────────────────────────────────────────
        is_single = isinstance(text, str)
        inputs = [text] if is_single else text

        # ── 2. Shared key from secret manager ──────────────────────────────
        key = get_secret("vibeset/azure_ai_foundry")["api_key_o3"]

        try:
            # ── 3. Cohere path ─────────────────────────────────────────────
            if model == "Cohere-embed-v3-multilingual":
                client = EmbeddingsClient(
                    endpoint="https://kevin-m86fxp36-eastus2.services.ai.azure.com/models",
                    credential=AzureKeyCredential(key)
                )
                resp = client.embed(input=inputs, model=model)
                embeddings = [item.embedding for item in resp.data]

            # ── 4. Azure‑OpenAI path ───────────────────────────────────────
            else:
                oa_client = AzureOpenAI(
                    api_version="2025-02-01-preview",
                    azure_endpoint="https://vibesetbackend9912493372.cognitiveservices.azure.com/",
                    api_key=key,
                )
                resp = oa_client.embeddings.create(input=inputs, model=model)
                embeddings = [item.embedding for item in resp.data]

            arr = np.asarray(embeddings, dtype=np.float32)
            return arr[0] if is_single else arr

        except Exception as e:
            print(f"❌  Embedding error: {e}")
            return np.empty((0,), dtype=np.float32)
  

if __name__ == "__main__":
    # Quick smoke-test for the Cohere model
    test_text = "大家好"
    print(f"Requesting embedding for: {test_text!r} using Cohere…")
    
    gai = gai_client()
    embedding = gai.get_embedding(
        text=test_text,
        model="Cohere-embed-v3-multilingual"
    )
    
    if embedding.size:
        print(f"✅ Success! Received embedding of length {embedding.shape[-1]}")
        # Optionally inspect a few values:
        print("Sample values:", embedding[:5], "...", embedding[-5:])
    else:
        print("❌ No embedding returned. Check your endpoint/key/model name.")