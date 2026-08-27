from schedule_search import get_schedule

train_no = input("Enter Train Number: ")

results = get_schedule(train_no)

if results:
    print("\nSchedule:\n")

    for item in results[:10]:
        print(
            item.get("station_name"),
            "| Arrival:", item.get("arrival"),
            "| Departure:", item.get("departure")
        )
else:
    print("Schedule not found")