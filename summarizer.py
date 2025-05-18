import os, json, logging
from textwrap import wrap
import backoff
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
log = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ─── Constants ───────────────────────────────────────────────
MAX_CHARS = 12_000   # chunk size

CHUNK_SUMMARY_PROMPT = """You are an expert summarizer.
Below is a part of a transcript of a masterclass. Summarize the key information in this chunk, focusing on:
1. Main concepts discussed
2. Any examples or demonstrations given
3. Practical takeaways or insights

Be concise but comprehensive. This is an intermediate summary that will later be consolidated.

Transcript:
"""

FINAL_SUMMARY_PROMPT = """You are an expert educational content curator.
Create a concise, well-structured summary of a masterclass with exactly these three sections:

1. SHORT DESCRIPTION (1 paragraph, ~3-5 sentences) - A concise overview of what the masterclass covers and its main focus
2. KEY EXAMPLES (4-6 bullet points) - The most insightful or illustrative examples demonstrated during the workshop
3. CONCLUSION (1 paragraph, ~3-4 sentences) - The core message and primary takeaways from the masterclass

Format your response as a clean JSON:
{
  "short_description": "...",
  "key_examples": ["...", "..."],
  "conclusion": "..."
}

Each section should be concise and focused. The entire summary should be comprehensive yet brief.

Here are the individual chunk summaries to consolidate:
"""

# ─── Helpers ─────────────────────────────────────────────────
def _chunk_text(text: str, max_chars: int = MAX_CHARS):
    return wrap(text, max_chars, break_long_words=False, replace_whitespace=False)


@backoff.on_exception(backoff.expo, Exception, max_tries=3)
def _summarize_chunk(chunk: str, idx: int) -> str:
    log.info("🔹 Summarizing chunk %d", idx + 1)
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes transcripts."},
            {"role": "user", "content": CHUNK_SUMMARY_PROMPT + chunk},
        ],
        temperature=0.3,
    )
    return res.choices[0].message.content.strip()


@backoff.on_exception(backoff.expo, Exception, max_tries=3)
def _consolidate(chunks: list[str]) -> dict:
    joined = "\n\n".join(chunks)
    prompt = FINAL_SUMMARY_PROMPT + joined
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert educational content curator."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    content = res.choices[0].message.content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        log.warning("Could not parse JSON; returning raw content")
        return {
            "short_description": "",
            "key_examples": [],
            "conclusion": "",
            "raw_content": content,
        }


# ─── Public API ──────────────────────────────────────────────
def summarize_text(text: str) -> dict:
    """Return the 3-section summary as a dict."""
    chunks = _chunk_text(text)
    chunk_summaries = [_summarize_chunk(chunk, i) for i, chunk in enumerate(chunks)]
    return _consolidate(chunk_summaries)