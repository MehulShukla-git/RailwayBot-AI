from search_engine import get_train


query = input("Enter Train Number or Train Name: ")

result = get_train(query)

if result:

    print("\nTrain Found\n")

    print("Train Number:", result.get("number"))
    print("Train Name:", result.get("name"))
    print("From:", result.get("from_station_name"))
    print("To:", result.get("to_station_name"))
    print("Type:", result.get("type"))
    print("Distance:", result.get("distance"))
    print("Duration:", result.get("duration_h"), "hours",
          result.get("duration_m"), "minutes")

else:

    print("Train Not Found")