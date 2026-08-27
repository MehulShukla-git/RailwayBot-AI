import os
import json
import re
import logging

logger = logging.getLogger(__name__)

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "stations.json")

_station_list = []
_stations_by_code = {}
_stations_by_exact_name = {}

try:
    if os.path.exists(_DATASET_PATH):
        with open(_DATASET_PATH, "r", encoding="utf-8") as f:
            stations_data = json.load(f)
            for feature in stations_data.get("features", []):
                props = feature.get("properties", {})
                if props:
                    _station_list.append(props)
                    code = str(props.get("code") or "").strip().lower()
                    if code:
                        _stations_by_code[code] = props
                    name = str(props.get("name") or "").strip().lower()
                    if name:
                        _stations_by_exact_name[name] = props
        logger.info("Loaded %d stations", len(_station_list))
    else:
        logger.warning("Stations dataset file not found at %s", _DATASET_PATH)
except Exception as e:
    logger.exception("Failed to load stations dataset: %s", e)


CITY_ALIASES = {
    "bombay":       "mumbai",
    "calcutta":     "kolkata",
    "madras":       "chennai",
    "new delhi":    "delhi",
    "benaras":      "varanasi",
    "benares":      "varanasi",
    "kashi":        "varanasi",
    "prayagraj":    "allahabad",
    "trivandrum":   "thiruvananthapuram",
    "cochin":       "ernakulam",
    "baroda":       "vadodara",
    "mysuru":       "mysore",
    "bengaluru":    "bangalore",
}


def get_station(query: str):
    """
    Search for a station by code or name.
    Supports exact code match, exact name match, and partial matching.
    """
    if not query:
        return None

    query = query.strip().lower()

    # Clean noise words
    remove_words = [
        "railway", "station", "junction", "jn", "railway station", "city", "term"
    ]
    cleaned = query
    for word in remove_words:
        cleaned = cleaned.replace(word, " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Alias check
    alias_target = CITY_ALIASES.get(cleaned, CITY_ALIASES.get(query))
    if alias_target:
        cleaned = alias_target

    # 1. Exact code match (O(1))
    if query in _stations_by_code:
        return _stations_by_code[query]
    if cleaned in _stations_by_code:
        return _stations_by_code[cleaned]

    # 2. Exact name match (O(1))
    if query in _stations_by_exact_name:
        return _stations_by_exact_name[query]
    if cleaned in _stations_by_exact_name:
        return _stations_by_exact_name[cleaned]

    # 3. Partial match over list
    target = cleaned if cleaned else query
    if len(target) >= 2:
        for props in _station_list:
            name = str(props.get("name") or "").lower()
            code = str(props.get("code") or "").lower()
            if target == name or target == code or target in name or target in code:
                return props

    return None