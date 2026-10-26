import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

# Load local environment variables if a .env file exists
load_dotenv()

app = Flask(__name__)

# Allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Lazy-loaded Groq client to prevent startup/build failures when env vars are initialized
_groq_client = None


def get_client():
    global _groq_client
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    if _groq_client is None:
        _groq_client = Groq(api_key=api_key)
    return _groq_client


@app.route("/", methods=["GET"])
@app.route("/api", methods=["GET"])
@app.route("/api/", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "OneLine AI API",
        "message": "Backend is running successfully on Vercel."
    })


@app.route("/chat", methods=["POST"])
@app.route("/api/chat", methods=["POST"])
def chat():
    client = get_client()
    if not client:
        return jsonify({
            "error": "GROQ_API_KEY is missing. Please set the GROQ_API_KEY environment variable in your Vercel project settings."
        }), 500

    data = request.get_json(silent=True) or {}
    prompt = data.get("message", "").strip()

    if not prompt:
        return jsonify({"error": "Please enter a question."}), 400

    if len(prompt) > 4000:
        return jsonify({"error": "Your question is too long."}), 400

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": "Answer the user's question in exactly one concise sentence."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=200
        )

        reply = response.choices[0].message.content

        return jsonify({"reply": reply})

    except Exception:
        app.logger.exception("Groq API request failed")
        return jsonify({
            "error": "Sorry, I couldn't get an answer right now. Please try again."
        }), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
