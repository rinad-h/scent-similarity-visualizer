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
 
# Load perfume data
df = pd.read_excel(os.path.join(DB_DIR, 'perfume_database_cleaned.xlsx'))
 
with open(os.path.join(DB_DIR, 'vect_index_bert.pickle'), 'rb') as f:
    vect_index = pickle.load(f)
 
with open(os.path.join(DB_DIR, 'vect_values_bert.pickle'), 'rb') as f:
    vect_values = pickle.load(f)
 
model = SentenceTransformer('all-MiniLM-L6-v2')
 
# extract admin information from the CSV file stored in backend database
admin_df = pd.read_csv(os.path.join(DB_DIR, 'admin_info.csv'))
admin_df.columns = admin_df.columns.str.strip()  #remove whitespace 
 
#Admin login route
 
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    #get JSON data
    data = request.get_json()
 
    if not data:
        #if fields are empty, send error message to users
        return jsonify({"success": False, "error": "No data provided."}), 400
 
    #else get username and password
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
 
    if not username or not password:
        #absence of either username or password raises error message
        return jsonify({"success": False, "error": "Username and password are required."}), 400
 
    #validate username and get from admin login files
    user_name = admin_df[admin_df['Username'].str.strip() == username]
 
    #if username does not exist in file will cause an error
    if user_name.empty:
        return jsonify({"success": False, "error": "Username not found."}), 401
 
    #check password by getting password corresponding to the username 
    correct_pass = user_name.iloc[0]['Password'].strip()
    if password != correct_pass:
        return jsonify({"success": False, "error": "Incorrect password."}), 401
 
    #return success message if both username and pass exist
    return jsonify({"success": True}), 200
 
 
#perfume similarity route
 
@app.route('/similar_perfumes', methods=['POST'])
def similar_perfumes():
    #get JSON data
    data = request.json
    #get brand and perfume
    brand_input = data.get('brand', '').strip().lower()
    perfume_input = data.get('perfume', '').strip().lower()
    
    #check to see if the brand and perfume are in db
    match = df[(df['brand'].str.lower() == brand_input) &
               (df['perfume'].str.lower() == perfume_input)]
 
    if match.empty:
        return jsonify({"error": "Perfume not found"}), 404
 
    idx = match.index[0]
    top_indices = vect_index[idx]
    top_scores = vect_values[idx]
 
    #extract perfume information to return to user
    results = []
    for i, score in zip(top_indices, top_scores):
        results.append({
            "brand": str(df.at[i, 'brand']),
            "perfume": str(df.at[i, 'perfume']),
            "notes": str(df.at[i, 'notes']),
            "score": float(round(score, 3))
        })
 
    return jsonify({"similar_perfumes": results})
 
 
#autocomeplet route for similar search
 
@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    q = request.args.get('q', '').strip().lower()
    field = request.args.get('field', 'brand').strip().lower()
    brand = request.args.get('brand', '').strip().lower()
 
    #if brand and field nto present raise error
    if field not in ('brand', 'perfume'):
        return jsonify({'error': 'invalid field'}), 400
 
    if field == 'brand':
        values = df['brand'].dropna().unique()
        matches = [v for v in values if v.lower().startswith(q)]
        if not matches:
            return jsonify({'available': False, 'suggestions': []})
        return jsonify({'available': True, 'suggestions': sorted(matches)[:10]})
 
    if brand:
        subset = df[df['brand'].str.lower() == brand]
    else:
        subset = df
 
    values = subset['perfume'].dropna().unique()
    matches = [v for v in values if v.lower().startswith(q)]
    if not matches:
        return jsonify({'available': False, 'suggestions': []})
    return jsonify({'available': True, 'suggestions': sorted(matches)[:10]})
 
 
if __name__ == '__main__':
    app.run(debug=True)