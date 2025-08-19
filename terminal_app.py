#perfume_terminal_app.py

import pickle
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# 1.Load Cleaned Data & Precomputed Similarities
df = pd.read_excel('database/perfume_database_cleaned.xlsx')

with open('database/vect_index_bert.pickle', 'rb') as f:
    vect_index = pickle.load(f)

with open('database/vect_values_bert.pickle', 'rb') as f:
    vect_values = pickle.load(f)

# 2.Load BERT Model (for new perfumes)
model = SentenceTransformer('all-MiniLM-L6-v2')

# 3.Main Loop
print("=== Perfume Similarity Terminal App ===")
print("Type 'exit' at any time to quit.\n")

while True:
    brand_input = input("Enter Brand: ").strip()
    if brand_input.lower() == 'exit':
        break
    perfume_input = input("Enter Perfume Name: ").strip()
    if perfume_input.lower() == 'exit':
        break
    
    #Find perfume in dataset
    match = df[(df['brand'].str.lower() == brand_input.lower()) &
               (df['perfume'].str.lower() == perfume_input.lower())]
    
    if match.empty:
        print("Perfume not found in database. Try again.\n")
        continue
    
    idx = match.index[0]
    top_indices = vect_index[idx]
    top_scores = vect_values[idx]
    
    print(f"\nTop 5 perfumes similar to '{perfume_input}' by {brand_input}:")
    for rank, (i, score) in enumerate(zip(top_indices, top_scores), start=1):
        print(f"{rank}. {df.at[i, 'perfume']} by {df.at[i, 'brand']} "
              f"(Similarity: {score:.3f})")
        print(f"   Notes: {df.at[i, 'notes']}\n")
    
    print("-" * 50)
