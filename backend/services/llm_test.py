import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

def test_gemini():
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        temperature=0.2,
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )

    response = llm.invoke("Say hello in JSON format.")
    print(response.content)


if __name__ == "__main__":
    test_gemini()
