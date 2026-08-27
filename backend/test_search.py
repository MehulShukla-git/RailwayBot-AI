from search_engine import get_train

train_no = input("Enter Train Number: ")

result = get_train(train_no)

if result:
    print("Train Name:", result["name"])
    print("From:", result["from_station_name"])
    print("To:", result["to_station_name"])
    print("Distance:", result["distance"])
else:
    print("Train Not Found")