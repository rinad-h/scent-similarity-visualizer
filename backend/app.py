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

PERFUME_XLSX = os.path.join(DB_DIR, 'perfume_database_cleaned.xlsx')

# Load perfume data (used by similarity feature)
df = pd.read_excel(PERFUME_XLSX)

with open(os.path.join(DB_DIR, 'vect_index_bert.pickle'), 'rb') as f:
    vect_index = pickle.load(f)

with open(os.path.join(DB_DIR, 'vect_values_bert.pickle'), 'rb') as f:
    vect_values = pickle.load(f)

model = SentenceTransformer('all-MiniLM-L6-v2')

# Load admin credentials
admin_df = pd.read_csv(os.path.join(DB_DIR, 'admin_info.csv'))
admin_df.columns = admin_df.columns.str.strip()


# ── Helpers ───────────────────────────────────────────────────────────────────

def read_perfume_xlsx():
    """Read the xlsx and return a list of dicts with an id field."""
    data = pd.read_excel(PERFUME_XLSX)
    perfumes = []
    for i, row in enumerate(data.itertuples(index=False), start=1):
        perfumes.append({
            'id': i,
            'brand':   str(row.brand).strip()   if pd.notna(row.brand)   else '',
            'perfume': str(row.perfume).strip()  if pd.notna(row.perfume) else '',
            'notes':   str(row.notes).strip()    if pd.notna(row.notes)   else '',
        })
    return perfumes

def write_perfume_xlsx(rows):
    """Write a list of dicts back to the xlsx file."""
    data = pd.DataFrame([
        {'brand': r['brand'], 'perfume': r['perfume'], 'notes': r['notes']}
        for r in rows
    ])
    data.to_excel(PERFUME_XLSX, index=False)


# ── Admin Login ───────────────────────────────────────────────────────────────

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "No data provided."}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password are required."}), 400

    user_row = admin_df[admin_df['Username'].str.strip() == username]

    if user_row.empty:
        return jsonify({"success": False, "error": "Username not found."}), 401

    correct_pass = user_row.iloc[0]['Password'].strip()
    if password != correct_pass:
        return jsonify({"success": False, "error": "Incorrect password."}), 401

    return jsonify({"success": True}), 200


# ── Perfume CRUD ──────────────────────────────────────────────────────────────

@app.route('/api/perfumes', methods=['GET'])
def get_perfumes():
    try:
        return jsonify(read_perfume_xlsx())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perfumes', methods=['POST'])
def add_perfume():
    data = request.get_json()
    brand   = data.get('brand', '').strip()
    perfume = data.get('perfume', '').strip()
    notes   = data.get('notes', '').strip()

    if not brand or not perfume:
        return jsonify({'error': 'Brand and perfume name required.'}), 400

    rows = read_perfume_xlsx()
    new_id = max((r['id'] for r in rows), default=0) + 1
    rows.append({'id': new_id, 'brand': brand, 'perfume': perfume, 'notes': notes})
    write_perfume_xlsx(rows)
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/perfumes/<int:perfume_id>', methods=['PUT'])
def edit_perfume(perfume_id):
    data = request.get_json()
    brand   = data.get('brand', '').strip()
    perfume = data.get('perfume', '').strip()
    notes   = data.get('notes', '').strip()

    if not brand or not perfume:
        return jsonify({'error': 'Brand and perfume name required.'}), 400

    rows = read_perfume_xlsx()
    idx = next((i for i, r in enumerate(rows) if r['id'] == perfume_id), None)
    if idx is None:
        return jsonify({'error': 'Perfume not found.'}), 404

    rows[idx] = {'id': perfume_id, 'brand': brand, 'perfume': perfume, 'notes': notes}
    write_perfume_xlsx(rows)
    return jsonify({'success': True})

@app.route('/api/perfumes/<int:perfume_id>', methods=['DELETE'])
def delete_perfume(perfume_id):
    rows = read_perfume_xlsx()
    new_rows = [r for r in rows if r['id'] != perfume_id]

    if len(new_rows) == len(rows):
        return jsonify({'error': 'Perfume not found.'}), 404

    write_perfume_xlsx(new_rows)
    return jsonify({'success': True})


# ── Similarity ────────────────────────────────────────────────────────────────

@app.route('/similar_perfumes', methods=['POST'])
def similar_perfumes():
    data = request.json
    brand_input   = data.get('brand', '').strip().lower()
    perfume_input = data.get('perfume', '').strip().lower()

    match = df[(df['brand'].str.lower() == brand_input) &
               (df['perfume'].str.lower() == perfume_input)]

    if match.empty:
        return jsonify({"error": "Perfume not found"}), 404

    idx = match.index[0]
    top_indices = vect_index[idx]
    top_scores  = vect_values[idx]

    results = []
    for i, score in zip(top_indices, top_scores):
        results.append({
            "brand":   str(df.at[i, 'brand']),
            "perfume": str(df.at[i, 'perfume']),
            "notes":   str(df.at[i, 'notes']),
            "score":   float(round(score, 3))
        })

    return jsonify({"similar_perfumes": results})


# ── Autocomplete ──────────────────────────────────────────────────────────────

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    q     = request.args.get('q', '').strip().lower()
    field = request.args.get('field', 'brand').strip().lower()
    brand = request.args.get('brand', '').strip().lower()

    if field not in ('brand', 'perfume'):
        return jsonify({'error': 'invalid field'}), 400

    if field == 'brand':
        values  = df['brand'].dropna().unique()
        matches = [v for v in values if v.lower().startswith(q)]
        if not matches:
            return jsonify({'available': False, 'suggestions': []})
        return jsonify({'available': True, 'suggestions': sorted(matches)[:10]})

    subset  = df[df['brand'].str.lower() == brand] if brand else df
    values  = subset['perfume'].dropna().unique()
    matches = [v for v in values if v.lower().startswith(q)]
    if not matches:
        return jsonify({'available': False, 'suggestions': []})
    return jsonify({'available': True, 'suggestions': sorted(matches)[:10]})


if __name__ == '__main__':
    app.run(debug=True)