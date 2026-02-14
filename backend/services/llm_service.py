import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


class LLMService:

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            google_api_key=os.getenv("GEMINI_API_KEY"),
        )

    def generate(self, prompt: str) -> str:
        response = self.llm.invoke(prompt)
        return response.content
