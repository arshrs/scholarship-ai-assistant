import pickle
import sys
import os
import re
from sklearn.metrics.pairwise import cosine_similarity

current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text)
    return text

vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
questions = pickle.load(open("questions.pkl", "rb"))
answers = pickle.load(open("answers.pkl", "rb"))

user_question = preprocess(sys.argv[1])

user_vector = vectorizer.transform([user_question])

similarity = cosine_similarity(user_vector, questions)

index = similarity.argmax()

print(answers[index])