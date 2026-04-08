import os

try:
    from groq import Groq
except ImportError:
    Groq = None


def get_health_advisory(aqi: float, category: str) -> str:
    """
    Generate a health advisory using Groq LLM.
    If the API key is missing or the request fails,
    a fallback advisory is returned instead of crashing the server.
    """

    api_key = os.getenv("GROQ_API_KEY")

    # If key not found, return simple advisory
    if not api_key or Groq is None:
        return f"Air quality is {category}. Limit outdoor activity and take precautions."

    try:
        client = Groq(api_key=api_key, timeout=5.0, max_retries=0)

        prompt = f"""
        The Air Quality Index (AQI) is {aqi}, categorized as '{category}'.
        Provide a short health advisory for residents.
        Mention precautions for children, elderly people, and outdoor activities.
        Limit response to 2 sentences.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an environmental health expert."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message.content

    except Exception:
        return f"Air quality is {category}. Reduce outdoor exposure and consider wearing a mask."
