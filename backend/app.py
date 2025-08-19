from flask import Flask, request, jsonify
import pandas as pd
import pickle
from sentence_transformers import SentenceTransformer
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, 'database')

# Load files
df = pd.read_excel(os.path.join(DB_DIR, 'perfume_database_cleaned.xlsx'))

with open(os.path.join(DB_DIR, 'vect_index_bert.pickle'), 'rb') as f:
    vect_index = pickle.load(f)

with open(os.path.join(DB_DIR, 'vect_values_bert.pickle'), 'rb') as f:
    vect_values = pickle.load(f)

model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/similar_perfumes', methods=['POST'])
def similar_perfumes():
    data = request.json
    brand_input = data.get('brand', '').strip().lower()
    perfume_input = data.get('perfume', '').strip().lower()

    match = df[(df['brand'].str.lower() == brand_input) &
               (df['perfume'].str.lower() == perfume_input)]
    
    if match.empty:
        return jsonify({"error": "Perfume not found"}), 404
    
    idx = match.index[0]
    top_indices = vect_index[idx]
    top_scores = vect_values[idx]

    results = []
    for i, score in zip(top_indices, top_scores):
        results.append({
    "brand": str(df.at[i, 'brand']),
    "perfume": str(df.at[i, 'perfume']),
    "notes": str(df.at[i, 'notes']),
    "score": float(round(score, 3))
})

    return jsonify({"similar_perfumes": results})

if __name__ == '__main__':
    app.run(debug=True)
