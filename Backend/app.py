from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import re

app = Flask(__name__)
CORS(app)

print("======================================")
print(" Smart Study Notes Generator")
print(" Starting AI engine...")
print("======================================")

print("Loading AI summarization model...")

# Pre-trained Hugging Face summarization model
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

print("AI model loaded successfully!")


# --------------------------------------
# Split text into sentences
# --------------------------------------

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


# --------------------------------------
# Generate key points
# --------------------------------------

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


# --------------------------------------
# Home / API status
# --------------------------------------

@app.route("/")
def home():

    return jsonify({
        "status": "online",
        "message": "Smart Study Notes Generator API is running."
    })


# --------------------------------------
# Generate Study Notes
# --------------------------------------

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


        # Count original words
        original_word_count = len(text.split())


        # Minimum text requirement
        if original_word_count < 20:

            return jsonify({
                "error": "Please enter at least 20 words for a meaningful summary."
            }), 400


        print(
            f"Generating notes for {original_word_count} words..."
        )


        # ----------------------------------
        # AI SUMMARY
        # ----------------------------------

        result = summarizer(
            text,
            max_length=min(
                120,
                max(40, original_word_count // 2)
            ),
            min_length=min(
                40,
                max(15, original_word_count // 4)
            ),
            do_sample=False
        )


        summary = result[0]["summary_text"]


        # ----------------------------------
        # KEY POINTS
        # ----------------------------------

        key_points = generate_key_points(text)


        # ----------------------------------
        # SUMMARY WORD COUNT
        # ----------------------------------

        summary_word_count = len(
            summary.split()
        )


        # ----------------------------------
        # TEXT REDUCTION
        # ----------------------------------

        reduction_percentage = (
            (original_word_count - summary_word_count)
            / original_word_count
        ) * 100


        # ----------------------------------
        # SEND RESULT TO FRONTEND
        # ----------------------------------

        return jsonify({

            "success": True,

            "summary": summary,

            "key_points": key_points,

            "original_word_count":
                original_word_count,

            "summary_word_count":
                summary_word_count,

            "reduction_percentage":
                round(
                    max(0, reduction_percentage),
                    2
                )

        })


    except Exception as error:

        print("ERROR:", error)

        return jsonify({

            "error":
                "Something went wrong while generating the notes."

        }), 500


# --------------------------------------
# START SERVER
# --------------------------------------

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