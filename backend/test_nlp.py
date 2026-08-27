"""
test_nlp.py — Held-out NLP Test Suite
=======================================
50+ natural-language railway queries NOT present in the training data.
Reports: predicted intent, extracted entities, expected vs actual, accuracy %.
Run: python test_nlp.py
"""

import sys
import joblib
from entity_extractor import extract_entities

# ── Load model ───────────────────────────────────────────────────────────────
try:
    model       = joblib.load("intent_model.pkl")
    vectorizer  = joblib.load("vectorizer.pkl")
except FileNotFoundError:
    print("ERROR: intent_model.pkl or vectorizer.pkl not found.")
    print("Run train_model.py first.")
    sys.exit(1)

# ── Test cases ───────────────────────────────────────────────────────────────
# Each entry: (query, expected_intent, expected_entities_subset)
# expected_entities_subset: dict of key→value that must be present in extract_entities()

TESTS = [
    # ── TRAIN SEARCH ─────────────────────────────────────────────────────────
    ("What trains can I take from Mumbai to Delhi?",         "train_search",       {"source": "mumbai", "destination": "delhi"}),
    ("I need a train from Mumbai to Delhi",                  "train_search",       {"source": "mumbai", "destination": "delhi"}),
    ("Are there any trains between Mumbai and Delhi?",       "train_search",       {}),
    ("Find trains Mumbai Delhi",                             "train_search",       {}),
    ("I want to go from Pune to Nagpur by train",            "train_search",       {"source": "pune", "destination": "nagpur"}),
    ("How do I travel from Chennai to Bangalore by train?",  "train_search",       {"source": "chennai", "destination": "bangalore"}),
    ("Trains going from Kolkata to Varanasi",                "train_search",       {}),
    ("Any express trains from Ahmedabad to Mumbai?",         "train_search",       {}),
    ("Which trains connect Jaipur and Delhi?",               "train_search",       {}),
    ("Suggest trains from Delhi to Lucknow",                 "train_search",       {"source": "delhi", "destination": "lucknow"}),
    ("I am looking for trains between Pune and Nagpur",      "train_search",       {}),
    ("Train options from Hyderabad to Pune",                 "train_search",       {}),
    ("Intercity trains from Nashik to Pune",                 "train_search",       {}),
    ("I want to book a train between Mumbai and Delhi",      "train_search",       {}),
    ("Trains from Bhopal to Delhi",                          "train_search",       {"source": "bhopal", "destination": "delhi"}),

    # ── TRAIN DETAILS ────────────────────────────────────────────────────────
    ("What is train 12951?",                                 "train_details",      {"train_number": "12951"}),
    ("Can you describe train 12001?",                        "train_details",      {"train_number": "12001"}),
    ("How far does 12951 travel?",                           "train_details",      {"train_number": "12951"}),
    ("What kind of train is 12627?",                         "train_details",      {"train_number": "12627"}),
    ("Tell me more about the Rajdhani",                      "train_details",      {"train_name_hint": "rajdhani"}),
    ("Info on the Shatabdi Express",                         "train_details",      {"train_name_hint": "shatabdi"}),
    ("Give me information about Duronto",                    "train_details",      {"train_name_hint": "duronto"}),
    ("What type of coaches does 12951 have?",                "train_details",      {"train_number": "12951"}),
    ("Is train 12951 a superfast train?",                    "train_details",      {"train_number": "12951"}),
    ("Does 12951 have AC coaches?",                          "train_details",      {"train_number": "12951"}),
    ("What zone does train 12951 belong to?",                "train_details",      {"train_number": "12951"}),
    ("Details for train number 12453",                       "train_details",      {"train_number": "12453"}),
    ("I want to know about 11011",                           "train_details",      {"train_number": "11011"}),
    ("Full details of 22691",                                "train_details",      {"train_number": "22691"}),
    ("What is the source of train 12951?",                   "train_details",      {"train_number": "12951"}),

    # ── STATION INFO ─────────────────────────────────────────────────────────
    ("What is NGP?",                                         "station_info",       {"station_code": "NGP"}),
    ("Tell me about Nagpur railway station",                 "station_info",       {}),
    ("What is the code for Pune station?",                   "station_info",       {}),
    ("Where is Nagpur station?",                             "station_info",       {}),
    ("Which state is Howrah station in?",                    "station_info",       {}),
    ("What zone does Nagpur station belong to?",             "station_info",       {}),
    ("Station information for Ahmedabad",                    "station_info",       {}),
    ("What is NDLS?",                                        "station_info",       {"station_code": "NDLS"}),
    ("Give me info about Bhopal junction",                   "station_info",       {}),
    ("Address of Nagpur railway station",                    "station_info",       {}),

    # ── SCHEDULE ─────────────────────────────────────────────────────────────
    ("What are the stops of 12951?",                         "schedule_query",     {"train_number": "12951"}),
    ("Where does 12951 stop?",                               "schedule_query",     {"train_number": "12951"}),
    ("Tell me the route of train 12951",                     "schedule_query",     {"train_number": "12951"}),
    ("Show all stations for train 12951",                    "schedule_query",     {"train_number": "12951"}),
    ("When does 12951 depart from each station?",            "schedule_query",     {"train_number": "12951"}),
    ("Complete schedule of 12627",                           "schedule_query",     {"train_number": "12627"}),
    ("Timetable for 12001",                                  "schedule_query",     {"train_number": "12001"}),
    ("Show full route of 12953",                             "schedule_query",     {"train_number": "12953"}),

    # ── PNR ──────────────────────────────────────────────────────────────────
    ("My ticket number is 4820194852",                       "pnr_status",         {"pnr": "4820194852"}),
    ("Verify booking 6781234509",                            "pnr_status",         {"pnr": "6781234509"}),
    ("Confirm my PNR 3401567892",                            "pnr_status",         {"pnr": "3401567892"}),

    # ── LIVE STATUS ──────────────────────────────────────────────────────────
    ("Where is train 12951 right now?",                      "live_train_status",  {"train_number": "12951"}),
    ("Is 12951 on time?",                                    "live_train_status",  {"train_number": "12951"}),
    ("Current position of train 12951",                      "live_train_status",  {"train_number": "12951"}),

    # ── GREETING ─────────────────────────────────────────────────────────────
    ("Good afternoon",                                       "greeting",           {}),
    ("Hey there",                                            "greeting",           {}),

    # ── GOODBYE ──────────────────────────────────────────────────────────────
    ("Ok thanks, I am done",                                 "goodbye",            {}),
    ("Bye, take care",                                       "goodbye",            {}),

    # ── UNKNOWN / OFF-DOMAIN ─────────────────────────────────────────────────
    ("What is the weather in Mumbai?",                       "UNKNOWN",            {}),
    ("Who is the prime minister of India?",                  "UNKNOWN",            {}),
]


# ── Run tests ─────────────────────────────────────────────────────────────────

RAILWAY_INTENTS = {
    "train_search", "train_details", "station_info",
    "schedule_query", "pnr_status", "live_train_status",
    "greeting", "goodbye",
}

intent_correct = 0
entity_checks  = 0
entity_correct = 0
results_table  = []

for query, expected_intent, expected_ents in TESTS:
    vec        = vectorizer.transform([query])
    predicted  = model.predict(vec)[0]
    proba      = float(max(model.predict_proba(vec)[0]))
    ents       = extract_entities(query)

    # For UNKNOWN, we accept any non-railway intent OR a low-confidence prediction
    if expected_intent == "UNKNOWN":
        intent_pass = predicted not in RAILWAY_INTENTS or proba < 0.40
    else:
        intent_pass = (predicted == expected_intent)

    if intent_pass:
        intent_correct += 1

    # Entity checks
    ent_results = []
    for key, expected_val in expected_ents.items():
        entity_checks += 1
        actual_val = str(ents.get(key) or "").lower()
        exp_val    = str(expected_val).lower()
        ok = exp_val in actual_val
        if ok:
            entity_correct += 1
        ent_results.append(f"  {key}: {'OK' if ok else 'FAIL'} (got {ents.get(key)!r}, want {expected_val!r})")

    results_table.append((query, expected_intent, predicted, proba, intent_pass, ent_results))


# -- Print report --------------------------------------------------------------

print("=" * 72)
print("RAILBOT AI -- NLP TEST SUITE RESULTS")
print("=" * 72)

for query, expected, predicted, conf, intent_pass, ent_msgs in results_table:
    status = "PASS" if intent_pass else "FAIL"
    print(f"\n[{status}] conf={conf:.2f}")
    print(f"  Query    : {query}")
    print(f"  Expected : {expected}")
    print(f"  Got      : {predicted}")
    if ent_msgs:
        for em in ent_msgs:
            print(em)

total = len(TESTS)
intent_acc = intent_correct / total * 100
print("\n" + "=" * 72)
print(f"Intent accuracy (held-out): {intent_correct}/{total} = {intent_acc:.1f}%")
if entity_checks:
    ent_acc = entity_correct / entity_checks * 100
    print(f"Entity accuracy           : {entity_correct}/{entity_checks} = {ent_acc:.1f}%")
print("=" * 72)
