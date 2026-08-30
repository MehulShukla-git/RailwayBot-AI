"""
main.py — RailBot AI FastAPI Backend (Production-Hardened)
==========================================================

Pipeline:
  User Query → Input Sanitisation → Normalise → Entity Extraction 
  → Dataset Entity Matching → Priority Dispatch → Intent Classification 
  → Confidence Check → Railway Search → Structured Response
"""

import os
import logging
import re
import joblib
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from search_engine import get_train, get_trains_by_name
from station_search import get_station
from route_search import find_trains
from schedule_search import get_schedule
from external_api import get_pnr_status, get_live_train_status, get_diagnostics
from entity_extractor import extract_entities, normalise

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("railbot.main")

# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="RailBot AI API",
    description="NLP Based Railway Enquiry Chatbot",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# LOAD NLP MODEL WITH ROBUST PATHS
# =========================================================

_BASE_DIR = os.path.dirname(__file__)
_MODEL_PATH = os.path.join(_BASE_DIR, "intent_model.pkl")
_VEC_PATH = os.path.join(_BASE_DIR, "vectorizer.pkl")

model = None
vectorizer = None

try:
    if os.path.exists(_MODEL_PATH) and os.path.exists(_VEC_PATH):
        model = joblib.load(_MODEL_PATH)
        vectorizer = joblib.load(_VEC_PATH)
        logger.info("NLP Intent model and Vectorizer loaded successfully.")
    else:
        logger.warning("NLP model/vectorizer file not found at %s. Running with rule-based fallback.", _BASE_DIR)
except Exception as e:
    logger.exception("Failed to load NLP model: %s", e)


# =========================================================
# REQUEST MODEL
# =========================================================

class ChatRequest(BaseModel):
    message: str = Field(..., max_length=1000, description="User railway query")


# =========================================================
# HELPERS — RESPONSE FORMATTERS
# =========================================================

def format_train_details(train: dict) -> str:
    lines = [
        f"Train Number: {train.get('number', 'Not available')}",
        f"Train Name: {train.get('name', 'Not available')}",
        f"From: {train.get('from_station_name', 'Not available')} ({train.get('from_station_code', 'N/A')})",
        f"To: {train.get('to_station_name', 'Not available')} ({train.get('to_station_code', 'N/A')})",
        f"Train Type: {train.get('type', 'Not available')}",
        f"Zone: {train.get('zone', 'Not available')}",
        f"Distance: {train.get('distance', 'Not available')} km",
    ]
    dh = train.get("duration_h")
    dm = train.get("duration_m")
    if dh is not None or dm is not None:
        lines.append(f"Duration: {dh or 0} hours {dm or 0} minutes")
    lines += [
        f"Departure: {train.get('departure', 'Not available')}",
        f"Arrival: {train.get('arrival', 'Not available')}",
        f"Return Train: {train.get('return_train', 'Not available')}",
        "",
        "Coach Availability:",
        f"First AC: {'Yes' if train.get('first_ac') else 'No'}",
        f"Second AC: {'Yes' if train.get('second_ac') else 'No'}",
        f"Third AC: {'Yes' if train.get('third_ac') else 'No'}",
        f"Sleeper: {'Yes' if train.get('sleeper') else 'No'}",
        f"Chair Car: {'Yes' if train.get('chair_car') else 'No'}",
        f"First Class: {'Yes' if train.get('first_class') else 'No'}",
    ]
    classes = train.get("classes")
    if classes:
        lines.append(f"Classes: {classes}")
    return "\n".join(lines)


def format_station_details(station: dict) -> str:
    return (
        f"Station Name: {station.get('name', 'Not available')}\n"
        f"Station Code: {station.get('code', 'Not available')}\n"
        f"State: {station.get('state') or 'Not available'}\n"
        f"Zone: {station.get('zone') or 'Not available'}\n"
        f"Address: {station.get('address') or 'Not available'}"
    )


def _build_schedule_response(train_no: str, results: list) -> dict:
    """Build the structured schedule payload (shared by all schedule paths)."""
    train_name = results[0].get("train_name", f"Train {train_no}") if results else f"Train {train_no}"
    days_map: dict = {}
    for item in results:
        raw_day = item.get("day")
        try:
            day_num = int(raw_day) if raw_day is not None and str(raw_day).strip().isdigit() else 1
        except (ValueError, TypeError):
            day_num = 1

        days_map.setdefault(day_num, []).append({
            "station_name": item.get("station_name", "Unknown Station"),
            "station_code": item.get("station_code", ""),
            "arrival":      item.get("arrival", "None"),
            "departure":    item.get("departure", "None"),
        })
    days_list = [{"day": d, "stations": days_map[d]} for d in sorted(days_map.keys())]
    return {
        "response": f"Here is the full schedule for {train_no} — {train_name}.",
        "schedule": {
            "trainNumber":  str(train_no),
            "trainName":    train_name,
            "totalStops":   len(results),
            "journeyDays":  len(days_list),
            "days":         days_list,
        },
    }


def _ambiguity_response(matches: list) -> dict:
    """Return a structured list when multiple trains match a name query."""
    lines = [
        "I found multiple matching trains. Please choose one by train number:\n"
    ]
    train_list = []
    for t in matches[:10]:
        lines.append(
            f"• {t.get('number', 'N/A')} — {t.get('name', 'Unknown')}\n"
            f"  {t.get('from_station_name', '?')} → {t.get('to_station_name', '?')}"
        )
        train_list.append(t)
    return {"response": "\n".join(lines), "trains": train_list}


def _not_found_train(query: str) -> dict:
    return {"response": f"I couldn't find a train matching '{query}' in the railway database."}


def _not_found_station(query: str) -> dict:
    return {"response": f"I couldn't find station '{query}' in the railway database."}


def _no_trains_on_route(src: str, dst: str) -> dict:
    return {
        "response": (
            f"I couldn't find any direct trains from {src.title()} to {dst.title()} "
            f"in the current dataset."
        )
    }


HELP_TEXT = (
    "I'm RailBot AI — I can help you with:\n"
    "• Train search (\"trains from Mumbai to Delhi\")\n"
    "• Train details (\"tell me about 12951\")\n"
    "• Station info (\"tell me about Nagpur\" or \"what is NGP\")\n"
    "• Train schedule (\"show schedule of train 12951\")\n"
    "• PNR status (\"check PNR 4820194852\")\n"
    "• Live train status (\"where is train 12951\")"
)

UNKNOWN_DOMAIN = (
    "I'm sorry, I handle only railway enquiries.\n\n"
    + HELP_TEXT
)


def clean_train_query(message: str) -> str:
    query = message.lower().strip()
    phrases = [
        "tell me about train", "tell me about the train", "tell me about",
        "give details of train", "give details of the train", "give details of",
        "show details of train", "show details of the train", "show details of",
        "train details of", "train details for",
        "information about train", "information about the train", "information about",
        "details of train", "details of the train", "details of",
        "what is train", "what is the train",
        "show information about train", "show information about the train",
        "show information about", "train information", "about train"
    ]
    for phrase in sorted(phrases, key=len, reverse=True):
        query = query.replace(phrase, " ")
    return re.sub(r"\s+", " ", query).strip()


def clean_station_query(message: str) -> str:
    query = message.lower().strip()
    phrases = [
        "show station info of", "show station information of", "show station details of",
        "station info of", "station information of", "station details of",
        "tell me about station", "tell me about the station",
        "show information about station", "show information about the station",
        "show station information", "what is the station code of",
        "what is station code of", "what is the code of",
        "give me information about", "give station information for",
        "give station details for", "railway station", "railway", "station"
    ]
    for phrase in sorted(phrases, key=len, reverse=True):
        query = query.replace(phrase, " ")
    return re.sub(r"\s+", " ", query).strip()


# =========================================================
# CHAT API
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        message = request.message.strip()

        if not message:
            return {"response": "Please enter a railway-related question."}

        # Truncate overly long queries safely
        if len(message) > 500:
            message = message[:500]

        # ── Classify intent ──────────────────────────────────────────────────
        intent = "unknown"
        confidence = 0.0

        if model and vectorizer:
            try:
                msg_vec = vectorizer.transform([message])
                intent = model.predict(msg_vec)[0]
                proba = model.predict_proba(msg_vec)[0]
                confidence = float(max(proba))
            except Exception as ml_err:
                logger.warning("Inference error: %s", ml_err)

        logger.info("Intent=%s conf=%.2f msg=%r", intent, confidence, message[:60])

        # ── Extract entities ─────────────────────────────────────────────────
        ents = extract_entities(message)
        train_number    = ents.get("train_number")
        pnr             = ents.get("pnr")
        station_code    = ents.get("station_code")
        train_name_hint = ents.get("train_name_hint")
        source          = ents.get("source")
        destination     = ents.get("destination")

        # =========================================================
        # PRIORITY 1: PNR (10-digit number dominates everything)
        # =========================================================

        if pnr:
            pnr_result = get_pnr_status(pnr)
            if pnr_result.get("error"):
                return {"response": pnr_result.get("message", "PNR service unavailable.")}
            return {
                "response": f"Here is the PNR status for {pnr}.",
                "pnrDetails": pnr_result.get("data"),
            }

        # =========================================================
        # PRIORITY 2: TRAIN NUMBER (4-5 digit number)
        # =========================================================

        if train_number:
            # ── Live status ──────────────────────────────────────────────────
            if intent == "live_train_status" or any(
                kw in message.lower() for kw in
                ["live", "running", "where is", "track", "spot", "location",
                 "delayed", "on time", "current", "where has", "where did"]
            ):
                live_result = get_live_train_status(train_number)
                if live_result.get("error"):
                    return {"response": live_result.get("message", "Live status service unavailable.")}
                return {
                    "response": f"Live status for Train {train_number}.",
                    "liveStatus": live_result.get("data"),
                }

            # ── Schedule ─────────────────────────────────────────────────────
            if intent == "schedule_query" or any(
                kw in message.lower() for kw in
                ["schedule", "stops", "route", "stations", "halt", "halts",
                 "timetable", "when does", "when do", "pass through", "stop at"]
            ):
                results = get_schedule(train_number)
                if not results:
                    return {"response": f"I couldn't find a schedule for train {train_number} in the dataset."}
                return _build_schedule_response(train_number, results)

            # ── Train details (default for train number) ──────────────────
            train = get_train(train_number)
            if train:
                return {
                    "response": f"Here are the details for Train {train_number} — {train.get('name', '')}.",
                    "trains": [train],
                }
            return _not_found_train(train_number)

        # =========================================================
        # PRIORITY 3: SOURCE + DESTINATION → TRAIN SEARCH
        # =========================================================

        if source and destination:
            trains_found = find_trains(source, destination)
            if not trains_found:
                return _no_trains_on_route(source, destination)

            lines = [f"Sure — I found these trains from {source.title()} to {destination.title()}:\n"]
            for i, t in enumerate(trains_found[:10], 1):
                lines.append(
                    f"{i}. {t.get('number', 'N/A')} — {t.get('name', 'Unknown Train')}\n"
                    f"   Type: {t.get('type', 'N/A')} | "
                    f"Distance: {t.get('distance', 'N/A')} km | "
                    f"Duration: {t.get('duration_h', 0)}h {t.get('duration_m', 0)}m"
                )
            if len(trains_found) > 10:
                lines.append(f"\nShowing 10 of {len(trains_found)} matching trains.")

            return {"response": "\n".join(lines), "trains": trains_found}

        # =========================================================
        # PRIORITY 4: STATION CODE → STATION INFO
        # =========================================================

        if station_code:
            station = get_station(station_code)
            if station:
                return {
                    "response": f"Here is the information for station {station_code}.",
                    "station": station,
                }

        # =========================================================
        # PRIORITY 5: TRAIN NAME HINT → TRAIN DETAILS / AMBIGUITY
        # =========================================================

        if train_name_hint:
            matches = get_trains_by_name(train_name_hint)
            if len(matches) == 1:
                t = matches[0]
                return {
                    "response": f"Here are the details for {t.get('name', train_name_hint)}.",
                    "trains": [t],
                }
            if len(matches) > 1:
                return _ambiguity_response(matches)

        # =========================================================
        # PRIORITY 6: ENTITY-BASED CLEANED QUERIES (Train / Station)
        # =========================================================

        train_query   = clean_train_query(message)
        station_query = clean_station_query(message)

        train_result   = get_train(train_query)     if train_query   else None
        station_result = get_station(station_query) if station_query else None

        if train_result and not station_result:
            return {
                "response": f"Here are the details for {train_result.get('name', train_query)}.",
                "trains": [train_result],
            }

        if station_result and not train_result:
            return {
                "response": f"Here is the information for {station_result.get('name', station_query)} station.",
                "station": station_result,
            }

        if train_result and station_result:
            train_words = [
                "train", "express", "rajdhani", "shatabdi", "duronto",
                "garib rath", "sampark", "superfast", "passenger",
                "memu", "demu", "intercity"
            ]
            if any(w in message.lower() for w in train_words):
                return {
                    "response": f"Here are the details for {train_result.get('name', '')}.",
                    "trains": [train_result],
                }
            return {
                "response": f"Here is the information for {station_result.get('name', '')} station.",
                "station": station_result,
            }

        # =========================================================
        # PRIORITY 7: HIGH-CONFIDENCE NLP (Greeting, Goodbye, Prompts)
        # =========================================================

        if confidence >= 0.60:
            if intent == "pnr_status":
                return {
                    "response": (
                        "Please provide your 10-digit PNR number.\n\n"
                        "Example:\nCheck PNR 4820194852"
                    )
                }

            if intent == "live_train_status":
                return {
                    "response": (
                        "Please provide the train number to check its live status.\n\n"
                        "Example:\nWhere is train 12951"
                    )
                }

            if intent == "schedule_query":
                return {
                    "response": (
                        "Please provide the train number to show its schedule.\n\n"
                        "Example:\nShow schedule of train 12951"
                    )
                }

            if intent == "greeting":
                return {
                    "response": (
                        "Hello! 👋\n\n"
                        "I'm RailBot AI, your intelligent railway assistant.\n\n"
                        + HELP_TEXT + "\n\nHow can I help you today?"
                    )
                }

            if intent == "goodbye":
                return {
                    "response": (
                        "Thank you for using RailBot AI. 🚆\n"
                        "Have a safe and pleasant journey!"
                    )
                }

        # =========================================================
        # PRIORITY 8: LOW-CONFIDENCE NLP INTENTS
        # =========================================================

        if confidence >= 0.40:
            if intent == "train_search":
                return {
                    "response": (
                        "Please specify both source and destination.\n\n"
                        "Example:\nShow trains from Mumbai to Delhi"
                    )
                }

            if intent == "train_details":
                return {
                    "response": (
                        "Please provide a train number or name.\n\n"
                        "Example:\nTell me about train 12951"
                    )
                }

            if intent == "station_info":
                return {
                    "response": (
                        "Please provide a station name or code.\n\n"
                        "Example:\nTell me about Nagpur station"
                    )
                }

            if intent == "schedule_query":
                return {
                    "response": (
                        "Please provide a train number to show the schedule.\n\n"
                        "Example:\nShow schedule of train 12951"
                    )
                }

            if intent == "greeting":
                return {
                    "response": (
                        "Hello! 👋 I'm RailBot AI.\n\n" + HELP_TEXT
                    )
                }

            if intent == "goodbye":
                return {
                    "response": "Goodbye! Have a safe journey. 🚆"
                }

        # =========================================================
        # FALLBACK — unrelated or truly unrecognised
        # =========================================================

        return {"response": UNKNOWN_DOMAIN}

    except Exception as exc:
        logger.exception("Top-level exception in /chat endpoint: %s", exc)
        return {
            "response": (
                "I encountered an unexpected issue while processing your railway enquiry. "
                "Please try again or rephrase your question."
            )
        }


# =========================================================
# ROOT & HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "message": "RailBot AI API is running",
        "status":  "online",
        "version": "3.0.0",
        "docs":    "/docs",
    }


@app.get("/health")
def health():
    diag = get_diagnostics()
    return {
        "status": "healthy",
        "service": "RailBot AI Backend",
        "nlp_model_loaded": model is not None,
        "external_api": {
            "pnr_configured": diag.get("pnr_configured", False),
            "live_status_configured": diag.get("live_status_configured", False),
        }
    }


@app.get("/diagnostics")
def diagnostics():
    diag = get_diagnostics()
    diag["nlp_model_loaded"] = model is not None
    diag["service"] = "RailBot AI API"
    diag["version"] = "3.0.0"
    return diag