import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")

with open(os.path.join(DATASET_DIR, "trains.json"), "r", encoding="utf-8") as f:
    trains = json.load(f)

with open(os.path.join(DATASET_DIR, "stations.json"), "r", encoding="utf-8") as f:
    stations = json.load(f)

with open(os.path.join(DATASET_DIR, "schedules.json"), "r", encoding="utf-8") as f:
    schedules = json.load(f)

print("Datasets Loaded Successfully")