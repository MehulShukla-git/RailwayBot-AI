import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


# =========================================================
# FRIENDLY ERROR MESSAGES
# =========================================================

def _friendly_http_error(status_code: int, context: str = "railway service") -> str:
    """Map HTTP status codes to user-friendly messages."""
    messages = {
        400: f"The {context} could not process the request. Please check your input.",
        401: f"Railway service authorisation failed. Please check your API credentials.",
        403: (
            "Live PNR status is currently unavailable. "
            "The live railway service did not authorise the request.\n\n"
            "Please try again later or verify the PNR on the official "
            "Indian Railways PNR enquiry (indianrail.gov.in)."
        ),
        404: f"The requested railway information could not be found.",
        422: f"The {context} rejected the request. Please verify your input.",
        429: "Railway service limit reached. Please try again later.",
        500: "The railway service is temporarily unavailable. Please try again shortly.",
        502: "The railway service is temporarily unavailable (bad gateway).",
        503: "The railway service is temporarily unavailable. Please try again shortly.",
    }
    return messages.get(status_code, f"The railway service returned an unexpected error (HTTP {status_code}).")


def get_pnr_status(pnr: str):
    """
    Fetches real-time PNR status from the external Railway API.
    Provider-independent: configured via RAILWAY_API_KEY and RAILWAY_API_BASE_URL in .env
    """
    api_key = os.getenv("RAILWAY_API_KEY")
    base_url = os.getenv("RAILWAY_API_BASE_URL")

    if not api_key or not base_url:
        logger.warning("PNR lookup: RAILWAY_API_KEY or RAILWAY_API_BASE_URL not configured.")
        return {
            "error": True,
            "message": (
                "Live PNR status is not configured on this server. "
                "Please contact the administrator or check your PNR on "
                "the official Indian Railways website (indianrail.gov.in)."
            ),
        }

    try:
        url = f"{base_url.rstrip('/')}/pnr-status/{pnr}"
        host = (
            base_url
            .replace("https://", "")
            .replace("http://", "")
            .split("/")[0]
        )
        headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": host,
        }

        logger.info("Fetching PNR status for %s", pnr)
        response = requests.get(url, headers=headers, timeout=10)

        # Explicit status-code handling before raise_for_status
        if response.status_code != 200:
            user_msg = _friendly_http_error(response.status_code, "PNR service")
            logger.error("PNR API returned HTTP %s for PNR %s", response.status_code, pnr)
            return {"error": True, "message": user_msg}

        data = response.json()

        # Standardise format for frontend
        return {
            "success": True,
            "data": {
                "pnr": pnr,
                "charting": "CHART PREPARED" if data.get("chartPrepared") else "CHART NOT PREPARED",
                "trainNumber": data.get("trainNumber", "Not available"),
                "train": data.get("trainName", f"Train {data.get('trainNumber', 'Unknown')}"),
                "date": data.get("dateOfJourney", "Not available"),
                "boarding": data.get("boardingStation", "Not available"),
                "destination": data.get("destinationStation", "Not available"),
                "class": data.get("journeyClass", "Not available"),
                "fare": data.get("totalFare", "Not available"),
                "passengers": [
                    {
                        "number": i + 1,
                        "current": pax.get("currentStatus", "Not available"),
                        "bookingStatus": pax.get("bookingStatus", "Not available"),
                    }
                    for i, pax in enumerate(data.get("passengerList", []))
                ],
            },
        }

    except requests.exceptions.Timeout:
        logger.error("PNR API request timed out for PNR %s", pnr)
        return {"error": True, "message": "The railway service took too long to respond. Please try again."}
    except requests.exceptions.ConnectionError:
        logger.error("PNR API connection failed for PNR %s", pnr)
        return {"error": True, "message": "Could not connect to the railway service. Please check your connection."}
    except Exception as e:
        logger.exception("Unexpected error fetching PNR %s: %s", pnr, e)
        return {"error": True, "message": "An unexpected error occurred while fetching PNR status. Please try again."}


def get_live_train_status(train_no: str):
    """
    Fetches real-time running status of a train from the external Railway API.
    Provider-independent: configured via RAILWAY_API_KEY and RAILWAY_API_BASE_URL in .env
    """
    api_key = os.getenv("RAILWAY_API_KEY")
    base_url = os.getenv("RAILWAY_API_BASE_URL")

    if not api_key or not base_url:
        logger.warning("Live status lookup: RAILWAY_API_KEY or RAILWAY_API_BASE_URL not configured.")
        return {
            "error": True,
            "message": (
                "Live train status is not configured on this server. "
                "Please check the train status on the official NTES website."
            ),
        }

    try:
        url = f"{base_url.rstrip('/')}/trains/{train_no}/live-status"
        host = (
            base_url
            .replace("https://", "")
            .replace("http://", "")
            .split("/")[0]
        )
        headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": host,
        }

        logger.info("Fetching live status for train %s", train_no)
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            user_msg = _friendly_http_error(response.status_code, "live status service")
            logger.error("Live status API returned HTTP %s for train %s", response.status_code, train_no)
            return {"error": True, "message": user_msg}

        data = response.json()

        return {
            "success": True,
            "data": {
                "trainNumber": train_no,
                "trainName": data.get("trainName", "Unknown Train"),
                "currentStation": data.get("currentStationName", "In Transit"),
                "delay": data.get("delayInMinutes", 0),
                "lastUpdated": data.get("updatedAt", "Recently"),
                "nextStation": data.get("nextStationName", "Not available"),
                "platform": data.get("platform", "Not available"),
                "status": data.get("status", "Not available"),
            },
        }

    except requests.exceptions.Timeout:
        logger.error("Live status API timed out for train %s", train_no)
        return {"error": True, "message": "The railway service took too long to respond. Please try again."}
    except requests.exceptions.ConnectionError:
        logger.error("Live status API connection failed for train %s", train_no)
        return {"error": True, "message": "Could not connect to the railway service. Please check your connection."}
    except Exception as e:
        logger.exception("Unexpected error fetching live status for train %s: %s", train_no, e)
        return {"error": True, "message": "An unexpected error occurred while fetching live train status. Please try again."}
