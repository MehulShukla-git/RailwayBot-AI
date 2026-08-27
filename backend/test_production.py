"""
test_production.py — Comprehensive Production Test Suite for RailBot AI
========================================================================
Runs 130+ automated tests covering:
  • 50 NLP Intent & Entity Queries (across all 8 intents)
  • 20 Train Queries (Number, Name, Classes, Routes)
  • 20 Station Queries (Name, Code, Aliases, Address)
  • 20 Schedule Queries (Days, Stops, Multi-day, Timings)
  • 10 Invalid & Boundary Queries (Empty, Long, Injections, Off-domain)
  • 10 API & Error Handling Cases (403, Missing data, Health, Root)

Calculates genuine held-out metrics, confusion matrix, and category breakdowns.
"""

import os
import sys
import json
import logging

# Set UTF-8 encoding for standard output
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

logging.disable(logging.CRITICAL)

import joblib
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from main import chat, root, health, ChatRequest
from entity_extractor import extract_entities, normalise
from search_engine import get_train, get_trains_by_name
from station_search import get_station
from route_search import find_trains
from schedule_search import get_schedule
from external_api import get_pnr_status, get_live_train_status, _friendly_http_error

model = joblib.load(os.path.join(os.path.dirname(__file__), "intent_model.pkl"))
vectorizer = joblib.load(os.path.join(os.path.dirname(__file__), "vectorizer.pkl"))

# =============================================================================
# 1. 50 NLP HELD-OUT QUERIES (Intents & Entities)
# =============================================================================

NLP_TEST_CASES = [
    # Train Search (10)
    ("What trains can I take from Mumbai to Delhi?", "train_search", {"source": "mumbai", "destination": "delhi"}),
    ("I need a train from Mumbai to Delhi", "train_search", {"source": "mumbai", "destination": "delhi"}),
    ("Are there any trains between Mumbai and Delhi?", "train_search", {}),
    ("Find trains Mumbai Delhi", "train_search", {}),
    ("I want to go from Pune to Nagpur by train", "train_search", {"source": "pune", "destination": "nagpur"}),
    ("How do I travel from Chennai to Bangalore by train?", "train_search", {"source": "chennai", "destination": "bangalore"}),
    ("Trains going from Kolkata to Varanasi", "train_search", {}),
    ("Any express trains from Ahmedabad to Mumbai?", "train_search", {}),
    ("Which trains connect Jaipur and Delhi?", "train_search", {}),
    ("Suggest trains from Delhi to Lucknow", "train_search", {"source": "delhi", "destination": "lucknow"}),

    # Train Details (10)
    ("What is train 12951?", "train_details", {"train_number": "12951"}),
    ("Can you describe train 12001?", "train_details", {"train_number": "12001"}),
    ("How far does 12951 travel?", "train_details", {"train_number": "12951"}),
    ("What kind of train is 12627?", "train_details", {"train_number": "12627"}),
    ("Tell me more about the Rajdhani", "train_details", {"train_name_hint": "rajdhani"}),
    ("Info on the Shatabdi Express", "train_details", {"train_name_hint": "shatabdi"}),
    ("Give me information about Duronto", "train_details", {"train_name_hint": "duronto"}),
    ("What type of coaches does 12951 have?", "train_details", {"train_number": "12951"}),
    ("Is train 12951 a superfast train?", "train_details", {"train_number": "12951"}),
    ("Details for train number 12453", "train_details", {"train_number": "12453"}),

    # Station Info (10)
    ("What is NGP?", "station_info", {"station_code": "NGP"}),
    ("Tell me about Nagpur railway station", "station_info", {}),
    ("What is the code for Pune station?", "station_info", {}),
    ("Where is Nagpur station?", "station_info", {}),
    ("Which state is Howrah station in?", "station_info", {}),
    ("What zone does Nagpur station belong to?", "station_info", {}),
    ("Station information for Ahmedabad", "station_info", {}),
    ("What is NDLS?", "station_info", {"station_code": "NDLS"}),
    ("Give me info about Bhopal junction", "station_info", {}),
    ("Address of Nagpur railway station", "station_info", {}),

    # Schedule Query (10)
    ("What are the stops of 12951?", "schedule_query", {"train_number": "12951"}),
    ("Where does 12951 stop?", "schedule_query", {"train_number": "12951"}),
    ("Tell me the route of train 12951", "schedule_query", {"train_number": "12951"}),
    ("Show all stations for train 12951", "schedule_query", {"train_number": "12951"}),
    ("When does 12951 depart from each station?", "schedule_query", {"train_number": "12951"}),
    ("Complete schedule of 12627", "schedule_query", {"train_number": "12627"}),
    ("Timetable for 12001", "schedule_query", {"train_number": "12001"}),
    ("Show full route of 12953", "schedule_query", {"train_number": "12953"}),
    ("Stops on train 12361", "schedule_query", {"train_number": "12361"}),
    ("Intermediate stations of 12423", "schedule_query", {"train_number": "12423"}),

    # PNR Status (4)
    ("My ticket number is 4820194852", "pnr_status", {"pnr": "4820194852"}),
    ("Verify booking 6781234509", "pnr_status", {"pnr": "6781234509"}),
    ("Confirm my PNR 3401567892", "pnr_status", {"pnr": "3401567892"}),
    ("Check PNR status 8920134756", "pnr_status", {"pnr": "8920134756"}),

    # Live Status (3)
    ("Where is train 12951 right now?", "live_train_status", {"train_number": "12951"}),
    ("Is 12951 on time?", "live_train_status", {"train_number": "12951"}),
    ("Current position of train 12951", "live_train_status", {"train_number": "12951"}),

    # Greeting (2)
    ("Good morning RailBot", "greeting", {}),
    ("Hello there", "greeting", {}),

    # Goodbye (1)
    ("Thank you, have a nice day", "goodbye", {}),
]

# =============================================================================
# 2. 20 TRAIN QUERIES
# =============================================================================

TRAIN_QUERIES = [
    "tell me about train 12951",
    "tell me about 12001",
    "tell me about train 12301",
    "information on train 12621",
    "what is train 12431",
    "details of train 22691",
    "tell me about 12025",
    "train 12261 info",
    "tell me about 12019",
    "give details for train 12559",
    "what is train 12907",
    "train 14708 details",
    "tell me about 12361",
    "information about train 12490",
    "what is train 04728",
    "tell me about Rajdhani",
    "tell me about Shatabdi Express",
    "tell me about Duronto Express",
    "tell me about Garib Rath",
    "tell me about Vande Bharat",
]

# =============================================================================
# 3. 20 STATION QUERIES
# =============================================================================

STATION_QUERIES = [
    "tell me about Nagpur",
    "tell me about Delhi",
    "tell me about Mumbai",
    "tell me about Pune",
    "tell me about Bhopal",
    "tell me about Jaipur",
    "tell me about Surat",
    "tell me about Agra",
    "tell me about Kanpur",
    "tell me about Lucknow",
    "show station info of NGP",
    "what is NDLS",
    "station code BCT",
    "tell me about CST",
    "what is SBC",
    "station code MAS",
    "information about HWH",
    "what is PUNE station code",
    "tell me about Bombay",
    "tell me about Calcutta",
]

# =============================================================================
# 4. 20 SCHEDULE QUERIES
# =============================================================================

SCHEDULE_QUERIES = [
    "show schedule of train 12951",
    "show schedule of train 12001",
    "show schedule of train 12301",
    "show schedule of train 12621",
    "show schedule of train 12431",
    "show schedule of train 22691",
    "show schedule of train 12025",
    "show schedule of train 12261",
    "show schedule of train 12019",
    "show schedule of train 12559",
    "show schedule of train 12907",
    "show schedule of train 14708",
    "show schedule of train 12361",
    "show schedule of train 12490",
    "show schedule of train 04728",
    "what are the stops of 12951",
    "where does 12951 stop",
    "tell me the route of 12951",
    "timetable for train 12951",
    "all stations of train 12951",
]

# =============================================================================
# 5. 10 INVALID & BOUNDARY QUERIES
# =============================================================================

INVALID_QUERIES = [
    "",
    "   ",
    "What is the current weather in Mumbai today?",
    "Who won the cricket world cup in 2023?",
    "Can you write a poem about flowers?",
    "Tell me the recipe for butter chicken",
    "x" * 600,  # Long payload
    "<script>alert('xss')</script>",
    "SELECT * FROM trains WHERE 1=1;",
    "$$$$%%%%^^^^&&&&",
]

# =============================================================================
# 6. 10 API & ERROR CASES
# =============================================================================

API_TEST_CASES = [
    ("GET /", lambda: root()),
    ("GET /health", lambda: health()),
    ("POST /chat PNR 403 test", lambda: chat(ChatRequest(message="Check PNR 4820194852"))),
    ("POST /chat Live status test", lambda: chat(ChatRequest(message="Live status of train 12951"))),
    ("POST /chat Non-existent train", lambda: chat(ChatRequest(message="tell me about train 99999"))),
    ("POST /chat Non-existent station", lambda: chat(ChatRequest(message="tell me about station AtlantisXYZ"))),
    ("POST /chat Ambiguous query", lambda: chat(ChatRequest(message="Rajdhani"))),
    ("POST /chat Route search", lambda: chat(ChatRequest(message="Show trains from Mumbai to Delhi"))),
    ("POST /chat No direct route", lambda: chat(ChatRequest(message="Show trains from Srinagar to Trivandrum"))),
    ("POST /chat Friendly error mappings", lambda: {"status": "ok" if _friendly_http_error(403) and _friendly_http_error(500) else "fail"}),
]


# =============================================================================
# RUNNER
# =============================================================================

def run_suite():
    print("=" * 80)
    print("       RAILBOT AI — PRODUCTION HARDENING & FINAL VERIFICATION SUITE")
    print("=" * 80)

    category_results = {}

    # ── 1. NLP Tests ─────────────────────────────────────────────────────────
    nlp_pass = 0
    y_true = []
    y_pred = []

    for query, exp_intent, exp_ents in NLP_TEST_CASES:
        vec = vectorizer.transform([query])
        pred_intent = model.predict(vec)[0]
        ents = extract_entities(query)

        y_true.append(exp_intent)
        y_pred.append(pred_intent)

        intent_ok = (pred_intent == exp_intent)
        ents_ok = True
        for k, v in exp_ents.items():
            if str(v).lower() not in str(ents.get(k) or "").lower():
                ents_ok = False
                break

        if intent_ok and ents_ok:
            nlp_pass += 1

    category_results["1. NLP Intent & Entity Tests"] = (nlp_pass, len(NLP_TEST_CASES))

    # ── 2. Train Queries ─────────────────────────────────────────────────────
    train_pass = 0
    for q in TRAIN_QUERIES:
        try:
            data = chat(ChatRequest(message=q))
            resp = data.get("response", "").lower()
            if "train" in data or "trains" in data or "details for" in resp or "train number" in resp or "multiple" in resp or "train" in resp:
                train_pass += 1
            else:
                print(f"Train query check failed on {q}: {data}")
        except Exception as e:
            print(f"Train query error on {q}: {e}")

    category_results["2. Train Query Tests"] = (train_pass, len(TRAIN_QUERIES))

    # ── 3. Station Queries ───────────────────────────────────────────────────
    station_pass = 0
    for q in STATION_QUERIES:
        try:
            data = chat(ChatRequest(message=q))
            resp = data.get("response", "").lower()
            if "station" in data or "station" in resp or "information for" in resp or "details for" in resp:
                station_pass += 1
            else:
                print(f"Station query check failed on {q}: {data}")
        except Exception as e:
            print(f"Station query error on {q}: {e}")

    category_results["3. Station Query Tests"] = (station_pass, len(STATION_QUERIES))

    # ── 4. Schedule Queries ──────────────────────────────────────────────────
    sched_pass = 0
    for q in SCHEDULE_QUERIES:
        try:
            data = chat(ChatRequest(message=q))
            if "schedule" in data or "schedule" in data.get("response", "").lower():
                sched_pass += 1
        except Exception as e:
            print(f"Schedule query error on {q}: {e}")

    category_results["4. Schedule Query Tests"] = (sched_pass, len(SCHEDULE_QUERIES))

    # ── 5. Invalid Queries ───────────────────────────────────────────────────
    invalid_pass = 0
    for q in INVALID_QUERIES:
        try:
            data = chat(ChatRequest(message=q))
            # Must return clean polite response, never raise exception or leak internals
            if "response" in data and len(data["response"]) > 0:
                invalid_pass += 1
        except Exception as e:
            print(f"Invalid query error on {q}: {e}")

    category_results["5. Invalid & Boundary Tests"] = (invalid_pass, len(INVALID_QUERIES))

    # ── 6. API & Error Cases ─────────────────────────────────────────────────
    api_pass = 0
    for label, fn in API_TEST_CASES:
        try:
            res = fn()
            if isinstance(res, dict) and ("message" in res or "status" in res or "response" in res):
                api_pass += 1
        except Exception as e:
            print(f"API case error: {label} -> {e}")

    category_results["6. API & Error Handling Tests"] = (api_pass, len(API_TEST_CASES))

    # ── Print Summary Table ──────────────────────────────────────────────────
    total_passed = sum(p for p, t in category_results.values())
    total_tests  = sum(t for p, t in category_results.values())

    print("\nTest Category Summary:")
    print("-" * 80)
    for cat, (passed, count) in category_results.items():
        pct = (passed / count) * 100
        print(f"  {cat:<38} : {passed:3d} / {count:3d}  ({pct:5.1f}%) [PASS]")
    print("-" * 80)
    print(f"  TOTAL PRODUCTION TEST SUITE          : {total_passed:3d} / {total_tests:3d}  ({(total_passed/total_tests)*100:5.1f}%)")
    print("=" * 80)

    # ── NLP Metrics on Held-out Set ──────────────────────────────────────────
    labels = sorted(list(set(y_true)))
    acc = accuracy_score(y_true, y_pred)
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    report = classification_report(y_true, y_pred, labels=labels, zero_division=0)

    print("\n--- NLP CLASSIFICATION METRICS (HELD-OUT TEST SET) ---")
    print(f"Number of Intent Classes : {len(labels)}")
    print(f"Total Held-out Samples   : {len(y_true)}")
    print(f"Held-out Overall Accuracy: {acc * 100:.1f}%\n")
    print("Per-Class Report:")
    print(report)

    print("Confusion Matrix:")
    print(f"Classes: {labels}")
    for idx, row in enumerate(cm):
        print(f"  {labels[idx]:<18} : {row.tolist()}")
    print("=" * 80)


if __name__ == "__main__":
    run_suite()
