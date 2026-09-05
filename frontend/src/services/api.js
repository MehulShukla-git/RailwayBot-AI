import axios from 'axios';

const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export function getActiveBackendUrl() {
  const stored = localStorage.getItem('railbot_backend_url');
  if (import.meta.env.PROD && stored && (stored.includes('127.0.0.1') || stored.includes('localhost'))) {
    localStorage.removeItem('railbot_backend_url');
    return DEFAULT_BACKEND_URL.replace(/\/+$/, '');
  }
  return (stored || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
}

/**
 * Real backend health check
 * @param {string} [backendUrlOverride] 
 * @returns {Promise<{ isHealthy: boolean, status?: string, message?: string }>}
 */
export async function checkBackendHealth(backendUrlOverride = null) {
  const baseUrl = (backendUrlOverride || getActiveBackendUrl()).replace(/\/+$/, '');
  try {
    const res = await axios.get(`${baseUrl}/health`, {
      timeout: 3500
    });
    if (res.status >= 200 && res.status < 300) {
      return {
        isHealthy: true,
        status: res.data?.status || 'healthy',
        message: res.data?.service || 'RailBot AI Backend'
      };
    }
    return { isHealthy: false, message: `Unexpected status ${res.status}` };
  } catch (error) {
    // Fallback attempt to root '/' if /health is not available
    try {
      const fallbackRes = await axios.get(`${baseUrl}/`, { timeout: 2000 });
      if (fallbackRes.status >= 200 && fallbackRes.status < 300) {
        return {
          isHealthy: true,
          status: 'online',
          message: fallbackRes.data?.message || 'RailBot AI API is running'
        };
      }
    } catch {
      // Both failed
    }

    return {
      isHealthy: false,
      message: error.code === 'ECONNABORTED' 
        ? 'Connection timed out' 
        : (error.response ? `HTTP ${error.response.status}` : 'Offline / Unreachable')
    };
  }
}

/**
 * Send chat message to backend with full error handling and preserved structured data
 * @param {string} message
 * @param {string} [backendUrlOverride]
 * @returns {Promise<{ success: boolean, text: string, source: string, trains?: any[], station?: any, schedule?: any, pnrDetails?: any, route?: any, liveStatus?: any, errorType?: string }>}
 */
export async function sendChatMessage(message, backendUrlOverride = null) {
  const baseUrl = (backendUrlOverride || getActiveBackendUrl()).replace(/\/+$/, '');

  try {
    const res = await axios.post(`${baseUrl}/chat`, {
      message: message
    }, {
      timeout: 12000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.data && (res.data.response !== undefined || res.data.message !== undefined)) {
      return {
        success: true,
        text: res.data.response || res.data.message || 'Information retrieved successfully.',
        source: 'backend',
        trains: res.data.trains || null,
        station: res.data.station || null,
        schedule: res.data.schedule || null,
        pnrDetails: res.data.pnrDetails || null,
        route: res.data.route || null,
        liveStatus: res.data.liveStatus || null
      };
    }

    return {
      success: true,
      text: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
      source: 'backend'
    };

  } catch (error) {
    console.error('[RailBot AI] Backend request failed:', error);

    let errorType = 'network_error';
    let errorMessage = `⚠️ Could not reach the RailBot backend server at ${baseUrl}. Please ensure the FastAPI backend is running.`;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorType = 'timeout';
      errorMessage = '⏱️ The enquiry request timed out. The backend server took too long to process. Please try again.';
    } else if (error.response) {
      errorType = 'server_error';
      const status = error.response.status;
      const detail = error.response.data?.detail || error.response.data?.message;
      errorMessage = `⚠️ Server returned error (HTTP ${status})${detail ? `: ${detail}` : '. Please try again.'}`;
    }

    return {
      success: false,
      text: errorMessage,
      source: 'error',
      errorType: errorType
    };
  }
}
