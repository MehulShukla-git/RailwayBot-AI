"""
entity_extractor.py
===================
Extracts structured entities from raw user messages.

Entities extracted:
  TRAIN_NUMBER       – 4 or 5 digit railway train number
  PNR                – 10 digit PNR
  STATION_CODE       – 2-5 letter uppercase station code (NGP, NDLS, BCT …)
  TRAIN_NAME_HINT    – known name keywords (rajdhani, shatabdi, …)
  SOURCE             – source city / station name
  DESTINATION        – destination city / station name

All functions are pure: they receive a string, return a dict / list / str / None.
They do NOT import FastAPI, the model, or any dataset — those live in main.py.
"""

import re

# =========================================================
# KNOWN TRAIN NAME KEYWORDS
# =========================================================

TRAIN_NAME_KEYWORDS = [
    "rajdhani", "shatabdi", "duronto", "garib rath", "sampark kranti",
    "intercity", "humsafar", "tejas", "vande bharat", "antyodaya",
    "uday", "august kranti", "deccan", "konkan kanya", "mandovi",
    "jan shatabdi", "double decker", "yuva", "superfast", "express",
]

# =========================================================
# KNOWN CITY / STATION ALIASES
# =========================================================
# Maps informal names → canonical search token used in dataset.
# Only add entries when the alias would NOT naturally match.

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

# =========================================================
# STOPWORDS – words that are never a station name
# =========================================================

STOPWORDS = {
    "show", "find", "search", "get", "list", "give", "tell", "what",
    "which", "where", "when", "how", "is", "are", "any", "all",
    "train", "trains", "station", "stations", "railway", "schedule",
    "route", "between", "from", "to", "going", "travel", "travelling",
    "i", "me", "my", "need", "want", "can", "you", "please",
    "available", "options", "suggest", "running", "by", "a", "an",
    "the", "for", "of", "about", "on", "in", "at", "and", "or",
    "there", "do", "does", "have", "has", "be", "been", "will",
    "book", "take", "go", "direct", "service", "services", "with",
    "connecting", "connect", "that", "this", "these", "those",
    "some", "no", "not", "information", "info", "details", "detail",
    "today", "tomorrow", "yesterday",
}


# =========================================================
# NORMALISE TEXT
# =========================================================

def normalise(text: str) -> str:
    """Lowercase, collapse whitespace, expand common aliases."""
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    for alias, canonical in CITY_ALIASES.items():
        text = re.sub(r"\b" + re.escape(alias) + r"\b", canonical, text)
    return text


# =========================================================
# TRAIN NUMBER EXTRACTION
# =========================================================

def extract_train_number(text: str) -> str | None:
    """
    Return the first 4–5 digit train number found.
    Skips 10-digit sequences (those are PNRs).
    Context keywords help avoid false positives from other numbers.
    """
    raw = text.lower()

    # Contextual: "train 12951", "number 12951", "no 12951", "#12951"
    m = re.search(
        r"(?:train\s*(?:no\.?|number\s*(?:is)?|#)?\s*|"
        r"no\.?\s*|number\s*(?:is)?\s*|#\s*)"
        r"(\d{4,5})\b",
        raw
    )
    if m:
        return m.group(1)

    # Standalone 4-5 digit numbers that are NOT part of a 10-digit PNR
    tokens = re.findall(r"\b\d+\b", raw)
    for tok in tokens:
        if len(tok) in (4, 5):
            return tok

    return None


# =========================================================
# PNR EXTRACTION
# =========================================================

def extract_pnr(text: str) -> str | None:
    """Return the first 10-digit PNR number found."""
    m = re.search(r"\b(\d{10})\b", text)
    return m.group(1) if m else None


# =========================================================
# STATION CODE EXTRACTION
# =========================================================

def extract_station_code(text: str) -> str | None:
    """
    Return a 2–5 uppercase letter station code if explicitly mentioned.
    Only matches tokens that look like codes: all caps, 2-5 letters,
    not a common English word.
    """
    raw = text  # keep original case for station code detection

    # Explicit context: "station code NGP", "what is NGP"
    m = re.search(
        r"(?:station\s+code\s+(?:of\s+|for\s+)?|"
        r"code\s+(?:of\s+|for\s+)?|"
        r"what\s+is\s+)([A-Z]{2,5})\b",
        raw
    )
    if m:
        return m.group(1).upper()

    # Standalone all-caps 2-5 letter token
    tokens = raw.split()
    for tok in tokens:
        cleaned = re.sub(r"[^A-Z]", "", tok.upper())
        if 2 <= len(cleaned) <= 5 and tok == tok.upper() and not tok.isdigit():
            # Exclude common English words that happen to be caps
            if cleaned not in {"I", "A", "AN", "THE", "TO", "OR", "IN",
                                "ON", "AT", "IS", "ARE", "AM", "IF", "OF",
                                "BY", "BE", "DO", "OK", "GO", "SO", "WE",
                                "ME", "MY", "UP", "IT", "AS", "HI", "NO",
                                "AI", "ID", "PNR", "AC"}:
                return cleaned

    return None


# =========================================================
# TRAIN NAME HINT EXTRACTION
# =========================================================

def extract_train_name_hint(text: str) -> str | None:
    """
    Return the first matching known train name keyword.
    Multi-word keywords (e.g. 'garib rath') are checked first.
    """
    lower = text.lower()
    # Sort by length descending so longer phrases match before substrings
    for kw in sorted(TRAIN_NAME_KEYWORDS, key=len, reverse=True):
        if kw in lower:
            return kw
    return None


# =========================================================
# SOURCE / DESTINATION EXTRACTION
# =========================================================

def extract_source_destination(text: str):
    """
    Return (source, destination) or (None, None).
    Supports many natural phrasings:
      from X to Y | X to Y trains | trains X Y | between X and Y
      i want to go from X to Y | trains connecting X and Y
    """
    lower = normalise(text)

    # ── Pattern 1: "from X to Y" (most common) ───────────────────────
    m = re.search(
        r"\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s+(?:by\s+)?train|trains?|$)",
        lower
    )
    if m:
        src, dst = _clean_place(m.group(1)), _clean_place(m.group(2))
        if src and dst:
            return src, dst

    # ── Pattern 2: "X to Y trains" / "X to Y by train" ──────────────
    m = re.search(
        r"^(.+?)\s+to\s+(.+?)\s+(?:train|trains?|by train|express|route)",
        lower
    )
    if m:
        src, dst = _clean_place(m.group(1)), _clean_place(m.group(2))
        if src and dst:
            return src, dst

    # ── Pattern 3: "between X and Y" ─────────────────────────────────
    m = re.search(r"\bbetween\s+(.+?)\s+and\s+(.+?)(?:\s|$)", lower)
    if m:
        src, dst = _clean_place(m.group(1)), _clean_place(m.group(2))
        if src and dst:
            return src, dst

    # ── Pattern 4: "trains X Y" (positional, last resort) ────────────
    m = re.search(r"\btrains?\s+(\w+)\s+(\w+)", lower)
    if m:
        src, dst = _clean_place(m.group(1)), _clean_place(m.group(2))
        if src and dst and src not in STOPWORDS and dst not in STOPWORDS:
            return src, dst

    # ── Pattern 5: "connecting X and Y" / "going from X to Y" ────────
    m = re.search(
        r"(?:connecting|go(?:ing)?\s+from|travel(?:ling)?\s+from|"
        r"journey\s+from)\s+(.+?)\s+(?:to|and)\s+(.+?)(?:\s|$)",
        lower
    )
    if m:
        src, dst = _clean_place(m.group(1)), _clean_place(m.group(2))
        if src and dst:
            return src, dst

    return None, None


def _clean_place(raw: str) -> str | None:
    """Strip leading/trailing stopwords from a captured place fragment."""
    if not raw:
        return None
    words = raw.strip().split()
    # Remove leading stopwords
    while words and words[0] in STOPWORDS:
        words.pop(0)
    # Remove trailing stopwords
    while words and words[-1] in STOPWORDS:
        words.pop()
    result = " ".join(words).strip()
    return result if result and result not in STOPWORDS else None


# =========================================================
# MASTER EXTRACTOR
# =========================================================

def extract_entities(text: str) -> dict:
    """
    Run all extractors and return a single dict:
    {
        "train_number":    str | None,
        "pnr":             str | None,
        "station_code":    str | None,
        "train_name_hint": str | None,
        "source":          str | None,
        "destination":     str | None,
    }
    """
    norm = normalise(text)
    src, dst = extract_source_destination(norm)
    return {
        "train_number":    extract_train_number(text),
        "pnr":             extract_pnr(text),
        "station_code":    extract_station_code(text),   # use original case
        "train_name_hint": extract_train_name_hint(norm),
        "source":          src,
        "destination":     dst,
    }
