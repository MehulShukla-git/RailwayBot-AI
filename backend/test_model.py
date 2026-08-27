import joblib

model = joblib.load("intent_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

while True:
    text = input("You: ")

    text_vector = vectorizer.transform([text])

    intent = model.predict(text_vector)

    print("Intent:", intent[0])