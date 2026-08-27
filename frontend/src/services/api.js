import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export async function sendChatMessage(message, backendUrlOverride = null) {
  const baseUrl = backendUrlOverride || BACKEND_URL;

  try {
    const res = await axios.post(`${baseUrl}/chat`, {
      message: message
    }, {
      timeout: 10000
    });

    // Backend returns { "response": "bot reply text" } along with structured data
    if (res.data && res.data.response) {
      return {
        text: res.data.response,
        source: 'backend',
        trains: res.data.trains,
        station: res.data.station,
        schedule: res.data.schedule,
        pnrDetails: res.data.pnrDetails,
        route: res.data.route,
        liveStatus: res.data.liveStatus
      };
    }

    // Unexpected shape — still return whatever came back
    return {
      text: JSON.stringify(res.data),
      source: 'backend'
    };

  } catch (error) {
    console.error('[RailBot AI] Backend request failed:', error.message);
    return {
      text: '⚠️ Could not reach the RailBot backend server. Please make sure the backend is running at ' + baseUrl,
      source: 'error'
    };
  }
}
