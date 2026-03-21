# Scent Similarity Visualizer

This project allows users to explore perfume similarities using semantic embeddings. The system consists of a **React frontend** and a **Flask backend** that processes fragrance descriptions and computes similarity using a sentence embedding model.

---

## Requirements

Before running the project, ensure you have the following installed:

- Python 3.8+
- Node.js and npm
- pip (Python package manager)

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Create the `.env` file and add a Gemini API key. (see `env.example`)

## Running the Backend

Start the Flask server with:

```bash
py app.py
```
