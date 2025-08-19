import pandas as pd
import numpy as np
import warnings
import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

warnings.simplefilter("ignore", category=Warning)
pd.set_option('display.max_colwidth', None)

df = pd.read_excel('database/perfume_database.xlsx', usecols=['brand', 'perfume', 'notes'])

df = df[df['notes'].notna()]
df.reset_index(drop=True, inplace=True)

items_to_remove = ['[', ']', '"', '{', '}', 'middle: ', 'top: ', 'base: ', 'null']
def clean_notes(text):
    text = str(text).lower()
    for item in items_to_remove:
        text = text.replace(item, "")
    return text

df['notes'] = df['notes'].apply(clean_notes)


#load BERT Model

model = SentenceTransformer('all-MiniLM-L6-v2')

notes_list = df['notes'].tolist()
print("Encoding notes with BERT model...")
embeddings = model.encode(notes_list, show_progress_bar=True, convert_to_numpy=True)
print(f"Embeddings shape: {embeddings.shape}")

print("Calculating similarity matrix...")
similarity_matrix = cosine_similarity(embeddings)

max_values = 6  # number of top similar perfumes to keep
vect_index = []
vect_values = []

num_rows = similarity_matrix.shape[0]
for i in range(num_rows):
    if i % 5000 == 0 and i != 0:
        print(f"{i} perfumes processed")
    top_sim = np.argsort(similarity_matrix[i])[-max_values:][::-1]  # indices of top similarity
    vect_index.append(top_sim)
    vect_values.append(similarity_matrix[i, top_sim])

print("Top similarities extracted!")

with open('database/vect_index_bert.pickle', 'wb') as f:
    pickle.dump(vect_index, f)
with open('database/vect_values_bert.pickle', 'wb') as f:
    pickle.dump(vect_values, f)

print("Pickle files saved successfully!")

for idx, sim_idx in enumerate(vect_index[0]):
    print(f"{idx+1}: {df['perfume'][sim_idx]} (Similarity: {vect_values[0][idx]:.3f})")
