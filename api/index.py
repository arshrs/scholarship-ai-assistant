# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import pickle
import os
import re
import json
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data and models
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_file(filename, is_pickle=False, is_json=False):
    filepath = os.path.join(CURRENT_DIR, filename)
    if os.path.exists(filepath):
        if is_pickle:
            with open(filepath, "rb") as f:
                return pickle.load(f)
        elif is_json:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
    return None

vectorizer = load_file("vectorizer.pkl", is_pickle=True)
questions = load_file("questions.pkl", is_pickle=True)
answers = load_file("answers.pkl", is_pickle=True)
scholarships = load_file("scholarships.json", is_json=True)

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text)
    return text

class QuestionRequest(BaseModel):
    question: str

class RecommendRequest(BaseModel):
    field: str
    gender: str
    income: int
    level: str

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": vectorizer is not None,
        "questions_loaded": questions is not None,
        "answers_loaded": answers is not None,
        "scholarships_count": len(scholarships) if scholarships else 0
    }

@app.post("/api/chat")
def chat(req: QuestionRequest):
    if not vectorizer or questions is None or not answers:
        raise HTTPException(status_code=500, detail="Q&A model not loaded. Please train the model first.")
    
    user_question = preprocess(req.question)
    if not user_question.strip():
        return {
            "answer": "Please ask a question about scholarships (e.g., 'What is NSP scholarship eligibility?').",
            "similarity": 0.0
        }
        
    user_vector = vectorizer.transform([user_question])
    similarity = cosine_similarity(user_vector, questions)
    index = similarity.argmax()
    
    max_sim = similarity[0][index]
    # If the similarity is too low, we provide a generic helpful message
    if max_sim < 0.15:
        return {
            "answer": "I couldn't find a direct answer to that in my database. Feel free to ask about specific scholarships (like NSP, Pragati, or Tata), eligibility criteria, documents needed, or try rephrasing your question.",
            "similarity": float(max_sim)
        }
        
    return {
        "answer": answers[index],
        "similarity": float(max_sim)
    }

@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    if not scholarships:
        raise HTTPException(status_code=500, detail="Scholarship database not found.")
    
    field = req.field.lower().strip()
    gender = req.gender.lower().strip()
    income = req.income
    level = req.level.lower().strip()
    
    recommendations = []
    for s in scholarships:
        # Match field of study
        s_field = s["field"].lower()
        field_match = s_field == "any" or s_field in field or field in s_field
        
        # Match gender
        s_gender = s["gender"].lower()
        gender_match = s_gender == "any" or s_gender == gender
        
        # Match income (user's income must be <= scholarship income limit)
        income_match = income <= s["income_limit"]
        
        # Match education level
        s_level = s["level"].lower()
        level_match = s_level == "any" or s_level == level
        
        if field_match and gender_match and income_match and level_match:
            recommendations.append(s)
            
    return {"recommendations": recommendations}

@app.get("/api/scholarships")
def get_scholarships():
    if not scholarships:
        raise HTTPException(status_code=500, detail="Scholarship database not found.")
    return {"scholarships": scholarships}
