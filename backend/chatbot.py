import re
import joblib
from search_engine import get_train
from station_search import get_station
from route_search import find_trains

model = joblib.load("intent_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

while True:

    message = input("You: ")

    msg_vector = vectorizer.transform([message])

    intent = model.predict(msg_vector)[0]

    if intent == "train_details":

        match = re.search(r"\d+", message)

        if match:

            train_no = match.group()

            result = get_train(train_no)

            if result:

                print("\nBot:")
                print("Train Name:", result["name"])
                print("From:", result["from_station_name"])
                print("To:", result["to_station_name"])
                print("Distance:", result["distance"], "km")

            else:
                print("Train not found")

        else:
            print("Please enter a train number")

    elif intent == "station_info":

        station_name = message.replace("show station info of", "").strip()

        result = get_station(station_name)

        if result:

            print("\nBot:")
            print("Station Name:", result["name"])
            print("Station Code:", result["code"])
            print("State:", result["state"])
            print("Zone:", result["zone"])

        else:
            print("Station not found")
        
    elif intent == "train_search":

        message = message.lower()

        if "from" in message and "to" in message:

            source = message.split("from")[1].split("to")[0].strip()
            destination = message.split("to")[1].strip()

            trains = find_trains(source, destination)

            if trains:

                print("\nBot: Found Trains\n")

                for train in trains[:5]:

                    print("Train No:", train["number"])
                    print("Train Name:", train["name"])
                    print()

            else:
                print("No trains found")

        else:
            print("Please specify source and destination")
    else:
        print("Detected Intent:", intent)