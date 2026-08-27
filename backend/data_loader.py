import json
import pandas as pd

# Load trains
with open("../dataset/trains.json", "r", encoding="utf-8") as f:
    trains = json.load(f)

# Load stations
with open("../dataset/stations.json", "r", encoding="utf-8") as f:
    stations = json.load(f)

# Load schedules
with open("../dataset/schedules.json", "r", encoding="utf-8") as f:
    schedules = json.load(f)

print("Datasets Loaded Successfully")