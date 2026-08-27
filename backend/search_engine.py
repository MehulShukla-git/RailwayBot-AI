import os
import json
import re
import logging

logger = logging.getLogger(__name__)

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "trains.json")

_train_list = []
_trains_by_number = {}
_trains_by_exact_name = {}

try:
    if os.path.exists(_DATASET_PATH):
        with open(_DATASET_PATH, "r", encoding="utf-8") as f:
            trains_data = json.load(f)
            for feature in trains_data.get("features", []):
                props = feature.get("properties", {})
                if props:
                    _train_list.append(props)
                    num = str(props.get("number", "")).strip()
                    if num:
                        _trains_by_number[num] = props
                    name = str(props.get("name", "")).strip().lower()
                    if name:
                        _trains_by_exact_name[name] = props
        logger.info("Loaded %d trains", len(_train_list))
    else:
        logger.warning("Trains dataset file not found at %s", _DATASET_PATH)
except Exception as e:
    logger.exception("Failed to load trains dataset: %s", e)


def get_train(query: str):
    """
    Return the first matching train dict, or None.
    Matches: exact number, exact name, partial name (case-insensitive).
    """
    if not query:
        return None

    query = str(query).strip().lower()

    # 1. By train number (O(1))
    if re.fullmatch(r"\d{4,5}", query):
        if query in _trains_by_number:
            return _trains_by_number[query]

    # 2. Exact name (O(1))
    if query in _trains_by_exact_name:
        return _trains_by_exact_name[query]

    # 3. Partial name scan
    for t in _train_list:
        if query in str(t.get("name", "")).strip().lower():
            return t

    return None


def get_trains_by_name(name_fragment: str, limit: int = 10) -> list:
    """
    Return a list of matching train dicts (up to `limit`).
    Searches case-insensitively on the train name.
    """
    if not name_fragment:
        return []

    fragment = name_fragment.strip().lower()
    results = []

    for t in _train_list:
        name = str(t.get("name", "")).strip().lower()
        if fragment in name:
            results.append(t)
            if len(results) >= limit:
                break

    return results