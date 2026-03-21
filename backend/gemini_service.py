import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file")

genai.configure(api_key=GEMINI_API_KEY)

def generate_fragrance_recommendation(preferences, perfume_database):
    """
    generate AI fragrance recommendations using Google Gemini API
    
    args:
        preferences: dict with keys: scentProfile, priceRange, gender, occasion
        perfume_database: pandas DataFrame with perfume data
    
    returns:
        dict with recommendation details
    """
    
    filtered_perfumes = filter_perfumes_by_preference(perfume_database, preferences)
    
    prompt = create_recommendation_prompt(preferences, filtered_perfumes)
    
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content(prompt)
    
    return {
        "recommendation_text": response.text,
        "filtered_perfumes": filtered_perfumes[:5].to_dict('records') if len(filtered_perfumes) > 0 else [],
    }


def filter_perfumes_by_preference(df, preferences):
    
    filtered_df = df.copy()
    
    scent_profile = preferences.get('scentProfile', '').lower()
    if scent_profile and 'notes' in df.columns:
        filtered_df = filtered_df[
            filtered_df['notes'].str.lower().str.contains(scent_profile, na=False)
        ]
    
    gender = preferences.get('gender', '').lower()
    if gender and 'gender' in df.columns:
        filtered_df = filtered_df[
            (filtered_df['gender'].str.lower() == gender) | 
            (filtered_df['gender'].str.lower() == 'unisex')
        ]
    
    price_range = preferences.get('priceRange', '')
    if price_range and 'price' in df.columns:
        filtered_df = filter_by_price_range(filtered_df, price_range)
    
    return filtered_df


def filter_by_price_range(df, price_range):
    
    try:
        if price_range == "0-50":
            return df[(df['price'] >= 0) & (df['price'] <= 50)]
        elif price_range == "50-100":
            return df[(df['price'] > 50) & (df['price'] <= 100)]
        elif price_range == "100-150":
            return df[(df['price'] > 100) & (df['price'] <= 150)]
        elif price_range == "150-250":
            return df[(df['price'] > 150) & (df['price'] <= 250)]
        elif price_range == "250+":
            return df[df['price'] > 250]
    except Exception as e:
        print(f"Error filtering by price: {e}")
    
    return df


def create_recommendation_prompt(preferences, perfume_data):
    """
    create a detailed prompt for Gemini API
    
    args:
        preferences: dict with user preferences
        perfume_data: pandas DataFrame with filtered perfumes
    
    returns:
        formatted prompt string
    """
    
    scent = preferences.get('scentProfile', 'any scent profile').title()
    price = preferences.get('priceRange', 'any price range')
    gender = preferences.get('gender', 'unisex').title()
    occasion = preferences.get('occasion', 'daily wear')
    
    perfume_list = ""
    if len(perfume_data) > 0:
        perfume_list = "\n\nTop matching fragrances from our database:\n"
        for idx, row in perfume_data.head(5).iterrows():
            perfume_list += f"- {row.get('brand', 'Unknown Brand')} - {row.get('perfume', 'Unknown')}: {row.get('notes', 'No notes available')}\n"
    
    prompt = f"""You are an expert fragrance consultant. Based on the following user preferences, provide a personalized fragrance recommendation.

User Preferences:
- Scent Profile Preference: {scent}
- Price Range: ${price}
- Gender Category: {gender}
- Occasion/Mood: {occasion.title()}
{perfume_list}

Please provide:
1. A list of fragrance notes from Top, Middle, and Base categories that match the user's scent profile preference
2. A scent story that describes the top recommended fragrance
3. A personalized recommendation explaining why these fragrances match their preferences

Keep your response friendly, informative, and concise (about 150-200 words)."""
    
    return prompt
