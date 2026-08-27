from route_search import find_trains

source = input("Source: ")
destination = input("Destination: ")

trains = find_trains(source, destination)

if trains:

    for train in trains[:5]:
        print()
        print("Train No:", train["number"])
        print("Train Name:", train["name"])
        print("From:", train["from_station_name"])
        print("To:", train["to_station_name"])

else:
    print("No trains found")