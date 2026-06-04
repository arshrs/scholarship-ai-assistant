import json
import pickle
import re
from sklearn.feature_extraction.text import TfidfVectorizer

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text)
    return text

# load data
with open("database.json", "r") as f:
    data = json.load(f)

questions = [preprocess(item["question"]) for item in data]
answers = [item["answer"] for item in data]

vectorizer = TfidfVectorizer(ngram_range=(1,2))
X = vectorizer.fit_transform(questions)

pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
pickle.dump(X, open("questions.pkl", "wb"))
pickle.dump(answers, open("answers.pkl", "wb"))

print("Scholarship model trained successfully")