from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient
import os
import re

app = Flask(__name__)
CORS(app)

print("======================================")
print(" Smart Study Notes Generator")
print(" Starting API...")
print("======================================")

HF_TOKEN = os.environ.get("HF_TOKEN")

if not HF_TOKEN:
    print("WARNING: HF_TOKEN is not configured!")
else:
    print("Hugging Face token detected.")

client = InferenceClient(
    api_key=HF_TOKEN,
    provider="hf-inference"
)

MODEL = "facebook/bart-large-cnn"


def split_into_sentences(text):
    sentences = re.split(
        r'(?<=[.!?])\s+',
        text.strip()
    )

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def generate_key_points(text, maximum_points=5):
    sentences = split_into_sentences(text)

    if len(sentences) <= maximum_points:
        return sentences

    points = []

    for sentence in sentences:
        if len(sentence.split()) >= 6:
            points.append(sentence)

        if len(points) == maximum_points:
            break

    return points


@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "message": "Smart Study Notes Generator API is running."
    })


@app.route("/api/generate", methods=["POST"])
def generate_notes():

    try:

        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({
                "error": "No text was provided."
            }), 400

        text = data["text"].strip()

        if not text:
            return jsonify({
                "error": "Please enter some study material."
            }), 400

        original_word_count = len(text.split())

        if original_word_count < 20:
            return jsonify({
                "error": "Please enter at least 20 words for a meaningful summary."
            }), 400

        print(
            f"Generating notes for {original_word_count} words..."
        )

        result = client.summarization(
            text,
            model=MODEL
        )

        summary = result.summary_text

        key_points = generate_key_points(text)

        summary_word_count = len(summary.split())

        reduction_percentage = (
            (original_word_count - summary_word_count)
            / original_word_count
        ) * 100

        return jsonify({
            "success": True,
            "summary": summary,
            "key_points": key_points,
            "original_word_count": original_word_count,
            "summary_word_count": summary_word_count,
            "reduction_percentage": round(
                max(0, reduction_percentage),
                2
            )
        })

    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":

    print("")
    print("======================================")
    print(" Server starting...")
    print(" http://127.0.0.1:5000")
    print("======================================")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )