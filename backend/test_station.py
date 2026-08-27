from station_search import get_station

name = input("Station Name: ")

result = get_station(name)

if result:
    print(result)
else:
    print("Station Not Found")