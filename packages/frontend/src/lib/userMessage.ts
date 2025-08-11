export async function extractErrorMessage(res: Response, fallback = 'Something went wrong') {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      if (j?.message) return String(j.message);
      if (j?.error) return String(j.error);
    }
    const t = await res.text();
    if (t) return t.slice(0, 300);
  } catch {}
  return fallback;
}

export function friendlyNetworkError() {
  return 'Unable to reach the server. Check your internet connection and try again.';
}
