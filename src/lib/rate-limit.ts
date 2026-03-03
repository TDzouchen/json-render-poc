type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const minuteStore = new Map<string, number[]>();
const dailyStore = new Map<string, { dayStart: number; count: number }>();

const MINUTE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE) || 10;
const DAILY_LIMIT = Number(process.env.RATE_LIMIT_PER_DAY) || 100;

const MINUTE_WINDOW_MS = 60_000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;

function minuteLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - MINUTE_WINDOW_MS;
  const timestamps = minuteStore.get(identifier) ?? [];
  const validTimestamps = timestamps.filter((t) => t > windowStart);

  if (validTimestamps.length >= MINUTE_LIMIT) {
    const oldest = validTimestamps[0] ?? now;
    return {
      success: false,
      limit: MINUTE_LIMIT,
      remaining: 0,
      reset: oldest + MINUTE_WINDOW_MS,
    };
  }

  validTimestamps.push(now);
  minuteStore.set(identifier, validTimestamps);

  return {
    success: true,
    limit: MINUTE_LIMIT,
    remaining: Math.max(MINUTE_LIMIT - validTimestamps.length, 0),
    reset: now + MINUTE_WINDOW_MS,
  };
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dailyLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const dayStart = startOfDay(now);
  const current = dailyStore.get(identifier);
  const entry =
    !current || current.dayStart !== dayStart
      ? { dayStart, count: 0 }
      : current;

  if (entry.count >= DAILY_LIMIT) {
    return {
      success: false,
      limit: DAILY_LIMIT,
      remaining: 0,
      reset: dayStart + DAY_WINDOW_MS,
    };
  }

  entry.count += 1;
  dailyStore.set(identifier, entry);

  return {
    success: true,
    limit: DAILY_LIMIT,
    remaining: Math.max(DAILY_LIMIT - entry.count, 0),
    reset: dayStart + DAY_WINDOW_MS,
  };
}

// Requests per minute (sliding window)
export const minuteRateLimit = {
  limit: async (identifier: string) => {
    return minuteLimit(identifier);
  },
};

// Requests per day (fixed window)
export const dailyRateLimit = {
  limit: async (identifier: string) => {
    return dailyLimit(identifier);
  },
};
