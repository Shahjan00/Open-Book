import os

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

from .embedding import get_embedding
from .vector_store import query_embedding


OPENAI_MODEL = os.getenv("OPENAI_MODEL", "openai/gpt-oss-20b:free")


def _ask_openai(question, context_chunks):
    if OpenAI is None:
        raise ValueError("Install the OpenAI SDK first: pip install openai")

    client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)
    numbered_context = "\n\n".join(
        f"[Source {index}] {chunk}"
        for index, chunk in enumerate(context_chunks, start=1)
    )

    prompt = f"""
Use only the context below to answer the user's question.
If the context does not contain the answer, say that the indexed book data does not have enough information.
Cite the source chunks you used with labels like [Source 1].

Context:
{numbered_context}

Question:
{question}
""".strip()

    response = client.responses.create(
        model=OPENAI_MODEL,
        instructions="You are a concise book question-answering assistant.",
        input=prompt,
    )

    return response.output_text or "OpenAI returned an empty answer."


def run_rag(question):
    if not question:
        raise ValueError("Question is required.")

    q_embedding = get_embedding(question)
    context_chunks = query_embedding(q_embedding)

    if not context_chunks:
        return "No relevant book chunks were found. Add or process books first."

    return _ask_openai(question, context_chunks)
