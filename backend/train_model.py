"""
train_model.py
==============
Trains the TF-IDF + Logistic Regression intent classifier.
Uses a held-out test split so accuracy is measured on unseen data.
"""
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ── Load dataset ──────────────────────────────────────────────────────────────
DATASET_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "dataset",
    "intents.csv"
)

data = pd.read_csv(DATASET_PATH)

# Drop blank rows and duplicates
data = data.dropna(subset=["text", "intent"])
data = data.drop_duplicates(subset=["text"])
data["text"] = data["text"].str.strip().str.lower()
data = data[data["text"] != ""]

X = data["text"]
y = data["intent"]

print(f"Total unique examples : {len(X)}")
print(f"Intent distribution :\n{y.value_counts().to_string()}\n")

# ── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.15,
    random_state=42,
    stratify=y,
)

print(f"Training examples : {len(X_train)}")
print(f"Test examples     : {len(X_test)}\n")

# ── Vectoriser ────────────────────────────────────────────────────────────────
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),      # unigrams + bigrams
    max_features=15000,
    sublinear_tf=True,       # log(tf) instead of raw tf
    min_df=1,
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec  = vectorizer.transform(X_test)

# ── Model ─────────────────────────────────────────────────────────────────────
model = LogisticRegression(
    C=2.0,
    max_iter=1000,
    solver="lbfgs",
)
model.fit(X_train_vec, y_train)

# ── Evaluate on held-out test set ────────────────────────────────────────────
y_pred = model.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)

print(f"Held-out test accuracy : {acc * 100:.1f}%\n")
print("Classification report (held-out test set):")
print(classification_report(y_test, y_pred))

# ── Save ──────────────────────────────────────────────────────────────────────
joblib.dump(model, "intent_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model and vectorizer saved.")