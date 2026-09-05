import os
import json
import zlib
import pickle
import gc
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

# Resolve paths relative to this file
_BASE_DIR = os.path.dirname(__file__)
_DATASET_DIR = os.path.join(_BASE_DIR, "..", "dataset")
_CACHE_PATH = os.path.join(_DATASET_DIR, "schedules_cache.pkl")
_JSON_PATH = os.path.join(_DATASET_DIR, "schedules.json")

_schedules_compressed = {}
_loaded = False

try:
    if os.path.exists(_CACHE_PATH):
        # High-performance fast path: load pre-compressed binary cache
        with open(_CACHE_PATH, "rb") as f:
            _schedules_compressed = pickle.load(f)
        _loaded = True
        logger.info("Loaded compressed schedules cache for %d trains", len(_schedules_compressed))
    elif os.path.exists(_JSON_PATH):
        # Fallback path: parse raw schedules.json, group by train, and compress
        logger.info("Schedule cache not found at %s. Building compressed in-memory store from JSON...", _CACHE_PATH)
        grouped = defaultdict(list)
        with open(_JSON_PATH, "r", encoding="utf-8") as f:
            raw_schedules = json.load(f)
            for item in raw_schedules:
                t_no = str(item.get("train_number", "")).strip()
                if t_no:
                    grouped[t_no].append(item)
            del raw_schedules
        gc.collect()

        # Pop keys one-by-one so memory is freed incrementally during compression
        for t_no in list(grouped.keys()):
            stops = grouped.pop(t_no)
            _schedules_compressed[t_no] = zlib.compress(json.dumps(stops).encode("utf-8"), level=1)

        del grouped
        gc.collect()
        _loaded = True
        logger.info("Built compressed schedule store for %d trains", len(_schedules_compressed))

        # Attempt to persist cache for future zero-overhead startups if directory is writable
        try:
            with open(_CACHE_PATH, "wb") as f:
                pickle.dump(_schedules_compressed, f, protocol=pickle.HIGHEST_PROTOCOL)
            logger.info("Persisted schedule cache to %s", _CACHE_PATH)
        except Exception as pe:
            logger.debug("Could not persist schedule cache: %s", pe)
    else:
        logger.warning("Neither schedule cache nor schedules.json found in %s", _DATASET_DIR)
except Exception as e:
    logger.exception("Failed to load schedules dataset: %s", e)


def get_schedule(train_no):
    """
    Retrieve schedule list for a train number in O(1) time.
    Decompresses the train schedule on demand (~0.5ms) to keep heap memory minimal.
    Returns list of stop dicts or empty list.
    """
    if not train_no:
        return []
    clean_no = str(train_no).strip()
    compressed = _schedules_compressed.get(clean_no)
    if compressed is None:
        return []
    try:
        return json.loads(zlib.decompress(compressed).decode("utf-8"))
    except Exception as e:
        logger.error("Failed to decompress schedule for train %s: %s", clean_no, e)
        return []