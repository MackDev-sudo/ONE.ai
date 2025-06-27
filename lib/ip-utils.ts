let cachedIp: string | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchIpWithCache = async () => {
  const now = Date.now();
  
  // Return cached IP if it's still valid
  if (cachedIp && (now - lastFetch) < CACHE_DURATION) {
    return cachedIp;
  }

  try {
    const response = await fetch('/api/ip');
    if (!response.ok) {
      throw new Error('Failed to fetch IP');
    }
    const data = await response.json();
    cachedIp = data.ip;
    lastFetch = now;
    return cachedIp;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return null;
  }
};
