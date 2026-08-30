"""
external_api.py — External Railway API Integration for RailBot AI
==================================================================

Handles real-time PNR and Live Train Status lookups via external REST APIs (RailRadar, RapidAPI, IRCTC).
Supports multi-provider endpoint routing, context-aware error handling,
safe sanitised logging without leaking credentials, and startup configuration validation.
"""

import os
import re
import logging
import urllib.parse
from typing import Dict, Any, Tuple, Optional
import requests
from dotenv import load_dotenv

# Robustly load environment variables from backend/.env or cwd
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_ENV_PATH):
    load_dotenv(_ENV_PATH, override=True)
else:
    load_dotenv()

logger = logging.getLogger("railbot.external_api")


# =========================================================
# CONFIGURATION HELPERS & VALIDATION
# =========================================================

def _sanitize_url(url: str) -> str:
    """Strip sensitive query parameters like key, apikey, token from URLs for logging."""
    if not url:
        return ""
    try:
        parsed = urllib.parse.urlparse(url)
        if not parsed.query:
            return url
        query_pairs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        sanitized_pairs = []
        for k, v in query_pairs:
            if any(secret_word in k.lower() for secret_word in ["key", "token", "secret", "auth", "pass"]):
                sanitized_pairs.append((k, "[REDACTED]"))
            else:
                sanitized_pairs.append((k, v))
        sanitized_query = urllib.parse.urlencode(sanitized_pairs)
        return urllib.parse.urlunparse(parsed._replace(query=sanitized_query))
    except Exception:
        return re.sub(r'(key|token|auth)=[^&]+', r'\1=[REDACTED]', url, flags=re.IGNORECASE)


def _safe_truncate(text: str, max_len: int = 250) -> str:
    """Safely truncate text for logging."""
    if not text:
        return "<empty>"
    clean = text.replace("\r", " ").replace("\n", " ").strip()
    if len(clean) > max_len:
        return clean[:max_len] + f"... [truncated, total {len(clean)} chars]"
    return clean


def get_feature_config(feature: str) -> Tuple[bool, Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Retrieve and validate configuration for a specific feature ('pnr' or 'live_status').
    Supports dedicated feature environment variables with fallback to unified RAILWAY_API_*.

    Returns:
        (is_valid, base_url, api_key, host, error_reason)
    """
    if feature == "pnr":
        base_url = os.getenv("RAILWAY_PNR_API_BASE_URL") or os.getenv("RAILWAY_API_BASE_URL")
        api_key = os.getenv("RAILWAY_PNR_API_KEY") or os.getenv("RAILWAY_API_KEY")
        feature_name = "PNR Enquiry"
    elif feature == "live_status":
        base_url = os.getenv("RAILWAY_LIVE_API_BASE_URL") or os.getenv("RAILWAY_API_BASE_URL")
        api_key = os.getenv("RAILWAY_LIVE_API_KEY") or os.getenv("RAILWAY_API_KEY")
        feature_name = "Live Train Status"
    else:
        base_url = os.getenv("RAILWAY_API_BASE_URL")
        api_key = os.getenv("RAILWAY_API_KEY")
        feature_name = "Railway External API"

    if not api_key or not api_key.strip():
        return False, None, None, None, f"{feature_name} API Key is not configured."

    if not base_url or not base_url.strip():
        return False, None, None, None, f"{feature_name} Base URL is not configured."

    base_url = base_url.strip()
    api_key = api_key.strip()

    # Automatically normalize developer documentation URLs to API endpoints
    if "railradar.in/developers" in base_url:
        base_url = "https://railradar.in/api/v1"

    # Validate URL format
    if not (base_url.startswith("http://") or base_url.startswith("https://")):
        return False, None, None, None, f"{feature_name} Base URL must start with http:// or https:// (got {base_url[:15]})."

    try:
        parsed = urllib.parse.urlparse(base_url)
        host = parsed.netloc or parsed.path.split("/")[0]
        if not host:
            return False, None, None, None, f"{feature_name} host could not be parsed from base URL."
        return True, base_url.rstrip("/"), api_key, host, None
    except Exception as e:
        return False, None, None, None, f"Invalid {feature_name} URL: {e}"


def get_diagnostics() -> Dict[str, Any]:
    """Return safe external API configuration diagnostics without leaking secrets."""
    pnr_valid, _, _, pnr_host, pnr_err = get_feature_config("pnr")
    live_valid, _, _, live_host, live_err = get_feature_config("live_status")

    return {
        "status": "online",
        "pnr_configured": pnr_valid,
        "pnr_host": pnr_host,
        "pnr_error": pnr_err if not pnr_valid else None,
        "live_status_configured": live_valid,
        "live_status_host": live_host,
        "live_status_error": live_err if not live_valid else None,
    }


def validate_startup_config():
    """Validate and log configuration at startup without exposing credentials."""
    diag = get_diagnostics()
    logger.info(
        "External API Startup Check: PNR Configured=%s (Host=%s), Live Status Configured=%s (Host=%s)",
        diag["pnr_configured"],
        diag["pnr_host"] or "None",
        diag["live_status_configured"],
        diag["live_status_host"] or "None"
    )
    if not diag["pnr_configured"]:
        logger.warning("PNR integration disabled/unconfigured: %s", diag["pnr_error"])
    if not diag["live_status_configured"]:
        logger.warning("Live status integration disabled/unconfigured: %s", diag["live_status_error"])


def _build_headers(api_key: str, host: str) -> Dict[str, str]:
    """Build multi-provider headers compatible with RailRadar, RapidAPI, and direct APIs."""
    headers = {
        "x-api-key": api_key,
        "Authorization": f"Bearer {api_key}",
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": host,
        "User-Agent": "RailBot-AI/3.0",
        "Accept": "application/json",
    }
    return headers


# =========================================================
# CONTEXT-AWARE FRIENDLY ERROR MESSAGES
# =========================================================

def _friendly_http_error(status_code: int, context: str = "railway service", feature_type: str = "general") -> str:
    """
    Map HTTP status codes to context-specific, user-friendly messages.
    Never reuses PNR-specific text for Live Train Status or vice versa.
    """
    if feature_type == "pnr" or "pnr" in context.lower():
        messages = {
            400: "The PNR service could not process the request. Please verify the 10-digit PNR number.",
            401: "The PNR service did not authorize this request (invalid API credentials). Please check your API key.",
            403: (
                "The PNR service did not authorize this request. "
                "Please check API credentials or provider subscription access.\n\n"
                "For official PNR status, please check on the Indian Railways portal (indianrail.gov.in)."
            ),
            404: "The requested PNR information could not be found or the PNR record has expired.",
            422: "The PNR service rejected the request format. Please verify the 10-digit PNR number.",
            429: "The PNR enquiry service rate limit has been reached. Please try again in a few moments.",
            500: "The external PNR service is temporarily unavailable. Please try again shortly.",
            502: "The external PNR service gateway is temporarily unavailable. Please try again shortly.",
            503: "The external PNR service is temporarily unavailable. Please try again shortly.",
            504: "The external PNR service timed out. Please try again shortly.",
        }
        return messages.get(
            status_code,
            f"The PNR service returned an unexpected response (HTTP {status_code}). Please try again later."
        )

    if feature_type == "live_status" or "live" in context.lower():
        messages = {
            400: "The live train status service could not process the request. Please verify the train number.",
            401: "The live train status service did not authorize this request (invalid API credentials). Please check your API key.",
            403: (
                "The live train status service did not authorize this request. "
                "Please check API credentials or provider subscription access.\n\n"
                "For official real-time running status, please visit enquiry.indianrail.gov.in or NTES."
            ),
            404: "Live running status for this train could not be found on the external service.",
            422: "The live train status service rejected the request. Please verify the train number.",
            429: "The live train status service rate limit has been reached. Please try again in a few moments.",
            500: "The external live train status service is temporarily unavailable. Please try again shortly.",
            502: "The external live train status service gateway is temporarily unavailable. Please try again shortly.",
            503: "The external live train status service is temporarily unavailable. Please try again shortly.",
            504: "The external live train status service timed out. Please try again shortly.",
        }
        return messages.get(
            status_code,
            f"The live train status service returned an unexpected response (HTTP {status_code}). Please try again later."
        )

    general_messages = {
        400: f"The {context} could not process the request. Please check your input.",
        401: f"The {context} authorization failed. Please check your API credentials.",
        403: f"The {context} did not authorize this request. Please check your API credentials or subscription.",
        404: f"The requested {context} information could not be found.",
        422: f"The {context} rejected the request. Please verify your input.",
        429: f"The {context} rate limit has been reached. Please try again in a few moments.",
        500: f"The {context} is temporarily unavailable. Please try again shortly.",
        502: f"The {context} gateway is temporarily unavailable. Please try again shortly.",
        503: f"The {context} is temporarily unavailable. Please try again shortly.",
    }
    return general_messages.get(
        status_code,
        f"The {context} returned an unexpected error (HTTP {status_code})."
    )


# =========================================================
# PNR STATUS ENQUIRY
# =========================================================

def get_pnr_status(pnr: str) -> Dict[str, Any]:
    """
    Fetches real-time PNR status from the external Railway API provider.
    Configured via RAILWAY_PNR_API_* or RAILWAY_API_* in .env.
    Supports /pnr/{pnr} and /pnr-status/{pnr}.
    """
    is_valid, base_url, api_key, host, error_reason = get_feature_config("pnr")

    if not is_valid:
        logger.warning("[PNR Enquiry] Configuration missing/invalid: %s", error_reason)
        return {
            "error": True,
            "message": (
                "Live PNR status enquiry is not configured on this server. "
                "Please check your PNR on the official Indian Railways website (indianrail.gov.in)."
            ),
        }

    # Support multiple provider endpoint formats
    candidate_urls = [
        f"{base_url}/pnr/{pnr}",
        f"{base_url}/pnr-status/{pnr}",
    ]
    headers = _build_headers(api_key, host)

    response = None
    last_status = 500

    for url in candidate_urls:
        sanitized_url = _sanitize_url(url)
        try:
            logger.info("[PNR Enquiry] Requesting PNR %s from %s", pnr, sanitized_url)
            res = requests.get(url, headers=headers, timeout=10)
            response = res
            last_status = res.status_code

            # Check if this endpoint returned JSON (even error JSON from PRS)
            if "application/json" in res.headers.get("content-type", "").lower() or res.status_code == 200:
                break
        except Exception as ex:
            logger.warning("[PNR Enquiry] Attempt failed for %s: %s", sanitized_url, ex)

    if response is None:
        return {
            "error": True,
            "message": "Could not establish connection to the PNR service. Please verify network access."
        }

    try:
        # Check for JSON error payload from Indian Railways / PRS
        try:
            data = response.json()
        except Exception:
            data = None

        if isinstance(data, dict):
            # If PRS returned a specific error (e.g., PNR_FLUSHED, PNR_NOT_FOUND)
            if data.get("success") is False or data.get("error"):
                err_info = data.get("error")
                if isinstance(err_info, dict):
                    err_msg = err_info.get("message") or err_info.get("code") or "PNR record not found."
                else:
                    err_msg = data.get("message") or str(err_info)
                return {
                    "error": True,
                    "message": f"PNR {pnr}: {err_msg}",
                    "status_code": response.status_code
                }

        # Non-200 and no parsed JSON error
        if response.status_code != 200:
            user_msg = _friendly_http_error(response.status_code, context="PNR service", feature_type="pnr")
            truncated_body = _safe_truncate(response.text)
            logger.error(
                "[PNR Enquiry Failed] Status: %d | Host: %s | URL: %s | Provider Response: %s",
                response.status_code, host, _sanitize_url(response.url), truncated_body
            )
            return {
                "error": True,
                "message": user_msg,
                "status_code": response.status_code,
            }

        if not isinstance(data, dict):
            return {
                "error": True,
                "message": "Received invalid response format from the PNR service."
            }

        # Extract payload (supports RailRadar / RapidAPI schemas)
        payload = data.get("data") if isinstance(data.get("data"), dict) else data

        passenger_list = (
            payload.get("passengerList")
            or payload.get("passengers")
            or payload.get("passenger_list")
            or []
        )

        passengers_data = []
        if isinstance(passenger_list, list):
            for i, pax in enumerate(passenger_list):
                if isinstance(pax, dict):
                    passengers_data.append({
                        "number": pax.get("passengerSerialNumber") or pax.get("number") or i + 1,
                        "current": pax.get("currentStatus") or pax.get("current_status") or pax.get("status") or "Not available",
                        "bookingStatus": pax.get("bookingStatus") or pax.get("booking_status") or "Not available",
                    })

        train_info = payload.get("train") if isinstance(payload.get("train"), dict) else {}
        train_num = payload.get("trainNumber") or payload.get("train_number") or train_info.get("number") or "Not available"
        train_nm = payload.get("trainName") or payload.get("train_name") or train_info.get("name") or f"Train {train_num}"

        return {
            "success": True,
            "data": {
                "pnr": pnr,
                "charting": "CHART PREPARED" if (payload.get("chartPrepared") or payload.get("chartingStatus") == "CHART PREPARED") else "CHART NOT PREPARED",
                "trainNumber": train_num,
                "train": train_nm,
                "date": payload.get("dateOfJourney") or payload.get("doj") or payload.get("journey_date") or payload.get("startDate") or "Not available",
                "boarding": payload.get("boardingStation") or payload.get("from") or payload.get("boarding_point") or "Not available",
                "destination": payload.get("destinationStation") or payload.get("to") or payload.get("reservation_upto") or "Not available",
                "class": payload.get("journeyClass") or payload.get("class") or "Not available",
                "fare": payload.get("totalFare") or payload.get("fare") or "Not available",
                "passengers": passengers_data,
            },
        }

    except requests.exceptions.Timeout:
        logger.error("[PNR Enquiry Failed] Timeout after 10s | Host: %s", host)
        return {
            "error": True,
            "message": "The PNR service took too long to respond. Please try again."
        }
    except requests.exceptions.ConnectionError as ce:
        logger.error("[PNR Enquiry Failed] Connection Error | Host: %s | Error: %s", host, str(ce))
        return {
            "error": True,
            "message": "Could not establish connection to the PNR service. Please verify network access."
        }
    except Exception as e:
        logger.exception("[PNR Enquiry Failed] Unexpected Exception for PNR %s: %s", pnr, e)
        return {
            "error": True,
            "message": "An unexpected error occurred while fetching PNR status. Please try again."
        }


# =========================================================
# LIVE TRAIN STATUS ENQUIRY
# =========================================================

def get_live_train_status(train_no: str) -> Dict[str, Any]:
    """
    Fetches real-time running status of a train from the external Railway API.
    Supports /trains/{train_no}/live (RailRadar) and /trains/{train_no}/live-status (RapidAPI).
    """
    is_valid, base_url, api_key, host, error_reason = get_feature_config("live_status")

    if not is_valid:
        logger.warning("[Live Train Status] Configuration missing/invalid: %s", error_reason)
        return {
            "error": True,
            "message": (
                "Live train running status is not configured on this server. "
                "Please check the train status on the official NTES portal (enquiry.indianrail.gov.in)."
            ),
        }

    candidate_urls = [
        f"{base_url}/trains/{train_no}/live",
        f"{base_url}/trains/{train_no}/live-status",
    ]
    headers = _build_headers(api_key, host)

    response = None
    for url in candidate_urls:
        sanitized_url = _sanitize_url(url)
        try:
            logger.info("[Live Train Status] Requesting train %s from %s", train_no, sanitized_url)
            res = requests.get(url, headers=headers, timeout=10)
            response = res
            if res.status_code == 200 or ("application/json" in res.headers.get("content-type", "").lower() and res.status_code != 404):
                break
        except Exception as ex:
            logger.warning("[Live Train Status] Attempt failed for %s: %s", sanitized_url, ex)

    if response is None:
        return {
            "error": True,
            "message": "Could not establish connection to the live train status service. Please verify network access."
        }

    try:
        # Handle non-200 responses
        if response.status_code != 200:
            user_msg = _friendly_http_error(response.status_code, context="Live Train Status service", feature_type="live_status")
            truncated_body = _safe_truncate(response.text)
            logger.error(
                "[Live Train Status Failed] Status: %d | Host: %s | URL: %s | Provider Response: %s",
                response.status_code, host, _sanitize_url(response.url), truncated_body
            )
            return {
                "error": True,
                "message": user_msg,
                "status_code": response.status_code,
            }

        data = response.json()
        if not isinstance(data, dict):
            logger.error("[Live Train Status Failed] Expected JSON object but got %s", type(data))
            return {
                "error": True,
                "message": "Received invalid response format from the live train status service."
            }

        if data.get("status") is False or data.get("error") is True:
            err_msg = data.get("message") or "Live status data not available for this train."
            logger.warning("[Live Train Status Provider Error] Train %s: %s", train_no, err_msg)
            return {
                "error": True,
                "message": f"Live Status: {err_msg}"
            }

        payload = data.get("data") if isinstance(data.get("data"), dict) else data

        # Extract nested structures from RailRadar or RapidAPI
        current_loc = payload.get("currentLocation") if isinstance(payload.get("currentLocation"), dict) else {}
        next_halt = payload.get("nextHalt") if isinstance(payload.get("nextHalt"), dict) else {}
        train_meta = payload.get("train") if isinstance(payload.get("train"), dict) else {}

        train_name = (
            payload.get("trainName")
            or train_meta.get("name")
            or payload.get("train_name")
            or f"Train {train_no}"
        )

        current_station = (
            current_loc.get("stationName")
            or payload.get("currentStationName")
            or payload.get("current_station_name")
            or payload.get("currentStation")
            or "In Transit"
        )
        if current_loc.get("stationCode") and current_loc.get("stationCode") not in current_station:
            current_station = f"{current_station} ({current_loc['stationCode']})"

        # Delay computation
        delay = current_loc.get("delayMinutes")
        if delay is None:
            delay = payload.get("delayInMinutes") if payload.get("delayInMinutes") is not None else payload.get("delay", 0)
        # Normalize negative delay (arriving early) or 0
        if delay == -1 or delay == 0:
            delay_val = 0
        else:
            delay_val = delay

        # Status text
        status_text = (
            payload.get("status")
            or current_loc.get("status")
            or payload.get("runningStatus")
            or "Running on time"
        )
        if status_text == "completed":
            status_text = f"Journey completed at {current_station}"
        elif status_text == "at-station":
            status_text = f"Currently at {current_station}"

        return {
            "success": True,
            "data": {
                "trainNumber": str(payload.get("trainNumber") or train_no),
                "trainName": train_name,
                "currentStation": current_station,
                "delay": delay_val,
                "lastUpdated": payload.get("lastUpdatedAt") or payload.get("updatedAt") or payload.get("last_updated") or "Recently",
                "nextStation": (
                    next_halt.get("stationName")
                    or payload.get("nextStationName")
                    or payload.get("next_station_name")
                    or payload.get("nextStation")
                    or "Not available"
                ),
                "platform": str(payload.get("platform") or current_loc.get("platform") or "Not available"),
                "status": status_text,
            },
        }

    except requests.exceptions.Timeout:
        logger.error("[Live Train Status Failed] Timeout after 10s | Host: %s", host)
        return {
            "error": True,
            "message": "The live train status service took too long to respond. Please try again."
        }
    except requests.exceptions.ConnectionError as ce:
        logger.error("[Live Train Status Failed] Connection Error | Host: %s | Error: %s", host, str(ce))
        return {
            "error": True,
            "message": "Could not establish connection to the live train status service. Please verify network access."
        }
    except Exception as e:
        logger.exception("[Live Train Status Failed] Unexpected Exception for train %s: %s", train_no, e)
        return {
            "error": True,
            "message": "An unexpected error occurred while fetching live train status. Please try again."
        }


# Run startup check when imported
validate_startup_config()
