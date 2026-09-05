import os
import json
import logging

logger = logging.getLogger(__name__)

# Reuse train index from search_engine to avoid duplicate in-memory dataset copies
try:
    from search_engine import _train_list
except ImportError:
    _train_list = []
    _DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "trains.json")
    try:
        if os.path.exists(_DATASET_PATH):
            with open(_DATASET_PATH, "r", encoding="utf-8") as f:
                trains_data = json.load(f)
                for feature in trains_data.get("features", []):
                    props = feature.get("properties", {})
                    if props:
                        _train_list.append(props)
                del trains_data
            logger.info("Route search: Loaded %d trains (fallback)", len(_train_list))
        else:
            logger.warning("Trains dataset not found at %s", _DATASET_PATH)
    except Exception as e:
        logger.exception("Failed to load trains for route search: %s", e)


def find_trains(source: str, destination: str) -> list:
    """
    Search trains connecting source and destination stations.
    Case-insensitive substring search across station names and codes.
    """
    if not source or not destination:
        return []

    src = source.strip().lower()
    dst = destination.strip().lower()

    results = []
    for props in _train_list:
        from_name = str(props.get("from_station_name", "")).lower()
        from_code = str(props.get("from_station_code", "")).lower()
        to_name = str(props.get("to_station_name", "")).lower()
        to_code = str(props.get("to_station_code", "")).lower()

        src_match = (src in from_name or src == from_code)
        dst_match = (dst in to_name or dst == to_code)

        if src_match and dst_match:
            results.append(props)

    return results