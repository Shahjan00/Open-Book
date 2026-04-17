import os
import json

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


OPENAI_MODEL = os.getenv("OPENAI_MODEL", "openai/gpt-oss-20b:free")


def generate_book_insights(title, description):
    if OpenAI is None:
        return {
            "summary": "",
            "genre": "",
        }

    client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)
    prompt = f"""
Return only valid JSON with these keys:
summary, genre

Book title: {title}

Description:
{description}

Rules:
- summary should be 2 short sentences.
- genre should be 1 likely genre.
""".strip()

    response = client.responses.create(
        model=OPENAI_MODEL,
        instructions="You generate concise book insights as valid JSON.",
        input=prompt,
    )

    try:
        data = json.loads(response.output_text)
    except json.JSONDecodeError:
        return {
            "summary": response.output_text,
            "genre": "Unknown",
        }
    
    print(data.get("summary", ""),data.get("genre", ""))

    return {
        "summary": data.get("summary", ""),
        "genre": data.get("genre", ""),
    }
