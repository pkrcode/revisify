// Simple retry helper with exponential backoff
export async function withRetry(fn, { retries = 3, baseDelayMs = 1000 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`[retry] Attempt ${i + 1}/${retries + 1}`);
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || '');
      const status = err?.status;
      const retriable = (status >= 500) || /network|timeout|fetch|AI service/i.test(msg);
      console.log(`[retry] Attempt ${i + 1} failed:`, { status, msg, retriable });
      if (i === retries || !retriable) {
        console.log(`[retry] Giving up after ${i + 1} attempts`);
        break;
      }
      const delay = baseDelayMs * Math.pow(2, i);
      console.log(`[retry] Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
