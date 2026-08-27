import os
import json
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

# Resolve path relative to this file
_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "schedules.json")

_schedules_by_train = defaultdict(list)
_loaded = False

try:
    if os.path.exists(_DATASET_PATH):
        with open(_DATASET_PATH, "r", encoding="utf-8") as f:
            raw_schedules = json.load(f)
            for item in raw_schedules:
                t_no = str(item.get("train_number", "")).strip()
                if t_no:
                    _schedules_by_train[t_no].append(item)
        _loaded = True
        logger.info("Loaded %d schedule entries for %d trains", len(raw_schedules), len(_schedules_by_train))
    else:
        logger.warning("Schedules dataset file not found at %s", _DATASET_PATH)
except Exception as e:
    logger.exception("Failed to load schedules dataset: %s", e)


def get_schedule(train_no):
    """
    Retrieve schedule list for a train number in O(1) time.
    Returns list of stop dicts or empty list.
    """
    if not train_no:
        return []
    clean_no = str(train_no).strip()
    return _schedules_by_train.get(clean_no, [])