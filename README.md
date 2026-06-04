# 🎓 Scholarship AI Assistant

An AI-powered scholarship guidance system that helps students discover eligible scholarships and receive instant answers to scholarship-related queries using Natural Language Processing (NLP) and recommendation techniques.

## 📌 Overview

Scholarship AI Assistant is designed to simplify the scholarship search process for students. The system combines an intelligent FAQ engine with a scholarship recommendation engine to provide personalized guidance based on a student's profile.

The project leverages TF-IDF vectorization, cosine similarity, and rule-based filtering to deliver relevant answers and scholarship recommendations.

---

## ✨ Features

### 🤖 FAQ Assistant

* Answers scholarship-related questions instantly.
* Uses Natural Language Processing (NLP) techniques.
* Finds the most relevant answer using cosine similarity.
* Handles queries about eligibility, documents, application processes, and scholarship rules.

### 🎯 Scholarship Recommendation Engine

* Recommends scholarships based on:

  * Field of Study
  * Gender
  * Family Income
  * Education Level
* Filters scholarships according to eligibility criteria.
* Displays matching scholarship opportunities with benefits and details.

---

## 🛠️ Tech Stack

### Machine Learning

* Python
* Scikit-learn
* TF-IDF Vectorization
* Cosine Similarity

### Data Processing

* JSON
* Pickle Serialization

### Backend

* Node.js (Planned)

### Frontend

* React.js (Planned)

---

## 📂 Project Structure

```text
Scholarship-AI-Assistant/
│
├── backend/
│
├── frontend/
│
└── ml-model/
    ├── database.json
    ├── scholarships.json
    ├── train.py
    ├── predict.py
    ├── recommend.py
    ├── vectorizer.pkl
    ├── questions.pkl
    └── answers.pkl
```

## ⚙️ How It Works

### FAQ Engine

1. User enters a scholarship-related question.
2. Query is preprocessed and converted into TF-IDF vectors.
3. Cosine similarity is calculated against stored FAQ questions.
4. The most relevant answer is returned.

### Recommendation Engine

1. User provides:

   * Field of Study
   * Gender
   * Family Income
   * Education Level

2. The system compares the profile against scholarship eligibility criteria.

3. Matching scholarships are displayed.

---

## 📊 Dataset

### FAQ Dataset

Contains commonly asked scholarship questions and answers.

### Scholarship Dataset

Contains scholarship information including:

* Scholarship Name
* Eligibility Criteria
* Income Limits
* Gender Requirements
* Academic Level
* Benefits

---

## 🚀 Future Enhancements

* Web-based chatbot interface
* User authentication
* Advanced NLP using Transformers
* Multi-language support
* Scholarship application tracking
* Admin dashboard for scholarship management
* AI-powered scholarship ranking system

---

## 🎯 Learning Outcomes

This project helped develop skills in:

* Natural Language Processing (NLP)
* Information Retrieval
* Recommendation Systems
* Python Development
* Machine Learning
* Data Processing
* JSON Dataset Management

---

## 👨‍💻 Author

Developed as a college AI/ML project to help students discover scholarships and access scholarship information efficiently.
