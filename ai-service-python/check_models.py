import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

print("Checking for GOOGLE_API_KEY...")
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY environment variable not set or .env file not found.")
else:
    print("API Key found. Configuring...")
    genai.configure(api_key=api_key)

    print("\n--- Available Models ---")
    for m in genai.list_models():
        # Check if the model supports the method we need for chat/quiz generation
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model Name: {m.name}")
            print(f"  Supported Methods: {m.supported_generation_methods}\n")
    print("------------------------")