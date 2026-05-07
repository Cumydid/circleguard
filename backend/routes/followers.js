import { Router } from 'express';
import { TwitterClient } from '../twitter.js';
import { getCache, setCache } from '../db.js';

const router = Router();
const DEMO_MODE = !process.env.TWITTER_CLIENT_ID;

// ─── Auth middleware ─────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'NOT_AUTHENTICATED', message: 'Please log in first' },
    });
  }
  next();
}

// ─── Bot detection ───────────────────────────────────────────────────────────

/**
 * calculateBotScore(user) → { score: number, signals: string[] }
 * user has public_metrics.followers_count / following_count / tweet_count
 * and created_at, profile_image_url, description, username
 */
function calculateBotScore(user) {
  const signals = [];
  let score = 0;

  const metrics = user.public_metrics || {};
  const followersCount = metrics.followers_count ?? 0;
  const followingCount = metrics.following_count ?? 0;
  const tweetCount = metrics.tweet_count ?? 0;

  // No profile image
  if (!user.profile_image_url || user.profile_image_url.includes('default_profile')) {
    score += 25;
    signals.push('⚠ No profile photo');
  }

  // No bio/description
  if (!user.description || user.description.trim().length === 0) {
    score += 15;
    signals.push('⚠ No biography');
  }

  // Account age
  if (user.created_at) {
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays < 30) {
      score += 30;
      signals.push('⚠ Very new account');
    } else if (ageDays < 90) {
      score += 15;
      signals.push('⚠ New account');
    }
  }

  // Tweet activity
  if (tweetCount === 0) {
    score += 25;
    signals.push('⚠ Never tweeted');
  } else if (tweetCount < 5) {
    score += 15;
    signals.push('⚠ Barely tweets');
  }

  // Follow-spam pattern
  if (followersCount < 10 && followingCount > 500) {
    score += 20;
    signals.push('⚠ Follow-spam pattern');
  }

  // Suspicious username (e.g. user123456789)
  if (/^[a-z]+\d{6,}$/i.test(user.username)) {
    score += 20;
    signals.push('⚠ Suspicious username pattern');
  }

  // High follow ratio
  if (followingCount / Math.max(followersCount, 1) > 10) {
    score += 15;
    signals.push('⚠ High follow ratio');
  }

  return { score: Math.min(score, 100), signals };
}

// ─── Map Twitter API user → Follower type ────────────────────────────────────

function mapUser(user, followsYouBack = false) {
  const { score, signals } = calculateBotScore(user);
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    profileImageUrl: user.profile_image_url || null,
    bio: user.description || null,
    followersCount: user.public_metrics?.followers_count ?? 0,
    followingCount: user.public_metrics?.following_count ?? 0,
    tweetCount: user.public_metrics?.tweet_count ?? 0,
    createdAt: user.created_at || null,
    isVerified: user.verified || false,
    followsYouBack,
    botScore: score,
    botSignals: signals,
  };
}

// ─── Mock data generation ────────────────────────────────────────────────────

/**
 * Deterministic pseudo-random based on seed integer.
 * Simple LCG so mock data is consistent across requests.
 */
function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const FIRST_PARTS = [
  'alpha', 'beta', 'gamma', 'delta', 'zeta', 'theta', 'sigma', 'lambda',
  'nova', 'cyber', 'tech', 'pixel', 'data', 'flux', 'echo', 'spark',
  'orbit', 'quasar', 'nebula', 'zenith', 'apex', 'vortex', 'prism', 'core',
  'swift', 'brave', 'ghost', 'storm', 'blaze', 'frost', 'lunar', 'solar',
];

const LAST_PARTS = [
  'hawk', 'wolf', 'fox', 'bear', 'lynx', 'crow', 'raven', 'owl',
  'dev', 'hq', 'io', 'hub', 'lab', 'ops', 'pro', 'co',
  'user', 'person', 'one', 'guy', 'gal', 'ace', 'bot', 'node',
];

const BIOS = [
  'Building in public 🚀 | Founder | Investor',
  'Software engineer at a stealth startup',
  'Web3 enthusiast | Coffee addict ☕',
  'Maker. Creator. Thinker.',
  'Digital nomad 🌍 | Travel & Tech',
  'Just here for the memes and the alpha 📈',
  'CTO @ somewhere cool | Open source advocate',
  'Journalist covering AI and society',
  'Design + Code = ❤️',
  'Crypto. DeFi. The future.',
  'Mom, engineer, gamer. She/Her.',
  'Minimalist. Stoic. Reader.',
  'Marketing @ SaaS startup | Growth hacker',
  'Serial entrepreneur. 3 exits. Building #4.',
  'PhD student studying machine learning',
];

function generateMockUsers(count, startSeed, isFollowing = false) {
  const rand = lcg(startSeed);
  const users = [];

  for (let i = 0; i < count; i++) {
    const r = rand;
    const seed = startSeed + i;
    const rng = lcg(seed * 7 + 13);

    const first = FIRST_PARTS[Math.floor(rng() * FIRST_PARTS.length)];
    const last = LAST_PARTS[Math.floor(rng() * LAST_PARTS.length)];

    // Some users get numeric suffixes (bot-like)
    const numericSuffix =
      rng() < 0.18 ? String(Math.floor(rng() * 9000000 + 1000000)) : '';
    const username = `${first}_${last}${numericSuffix}`;
    const name = numericSuffix
      ? username
      : `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;

    // Account age: 1 day to 4 years ago
    const ageMs = rng() * 4 * 365 * 24 * 60 * 60 * 1000;
    const createdAt = new Date(Date.now() - ageMs).toISOString();

    // Metrics — bots have very skewed numbers
    const isBot = rng() < 0.25;
    const followersCount = isBot
      ? Math.floor(rng() * 8)
      : Math.floor(rng() * 12000);
    const followingCount = isBot
      ? Math.floor(rng() * 3000 + 500)
      : Math.floor(rng() * 1500);
    const tweetCount = isBot
      ? Math.floor(rng() * 3)
      : Math.floor(rng() * 8000 + 5);

    const hasPic = !isBot || rng() > 0.5;
    const hasBio = !isBot || rng() > 0.6;
    const bioText = hasBio ? BIOS[Math.floor(rng() * BIOS.length)] : '';

    users.push({
      id: String(1000000 + seed),
      username,
      name,
      profile_image_url: hasPic
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        : null,
      description: bioText,
      created_at: createdAt,
      verified: rng() < 0.03,
      public_metrics: {
        followers_count: followersCount,
        following_count: followingCount,
        tweet_count: tweetCount,
        listed_count: Math.floor(rng() * 200),
      },
    });
  }

  return users;
}

function getMockData() {
  const rawFollowers = generateMockUsers(200, 42);
  const rawFollowing = generateMockUsers(150, 99);

  // Some following users also follow back
  const followingIds = new Set(rawFollowing.map((u) => u.id));

  // Add a few followers who also appear in following
  const crossover = rawFollowing.slice(0, 30);
  const allFollowers = [...rawFollowers, ...crossover.slice(0, 20)];

  const followers = allFollowers.map((u) =>
    mapUser(u, followingIds.has(u.id))
  );
  const following = rawFollowing.map((u) => mapUser(u, true));

  return { followers, following };
}

// ─── Shared fetch-or-cache logic ─────────────────────────────────────────────

async function getFollowerData(req) {
  const userId = req.session.userId;
  const cached = getCache(userId);
  if (cached) return cached;

  let followers, following;

  if (DEMO_MODE || req.session.accessToken === 'demo') {
    const mock = getMockData();
    followers = mock.followers;
    following = mock.following;
  } else {
    const client = new TwitterClient(req.session.accessToken);

    const [rawFollowers, rawFollowing] = await Promise.all([
      client.fetchAllFollowers(userId),
      client.fetchAllFollowing(userId),
    ]);

    const followingIds = new Set(rawFollowing.map((u) => u.id));
    followers = rawFollowers.map((u) => mapUser(u, followingIds.has(u.id)));
    following = rawFollowing.map((u) => mapUser(u, true));
  }

  setCache(userId, { followers, following });
  return { followers, following, cachedAt: Date.now() };
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /api/followers
 * Paginated + filtered list of followers.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { followers } = await getFollowerData(req);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const search = (req.query.search || '').toLowerCase().trim();
    const filter = req.query.filter || '';

    let result = followers;

    // Text search
    if (search) {
      result = result.filter(
        (f) =>
          f.username.toLowerCase().includes(search) ||
          f.name.toLowerCase().includes(search)
      );
    }

    // Preset filters
    switch (filter) {
      case 'bots':
        result = result.filter((f) => f.botScore >= 60);
        break;
      case 'notFollowingBack':
        result = result.filter((f) => !f.followsYouBack);
        break;
      case 'inactive':
        result = result.filter((f) => f.tweetCount < 5);
        break;
      case 'noPic':
        result = result.filter((f) => !f.profileImageUrl);
        break;
    }

    const total = result.length;
    const start = (page - 1) * limit;
    const slice = result.slice(start, start + limit);
    const hasMore = start + limit < total;

    return res.json({
      success: true,
      data: {
        followers: slice,
        total,
        page,
        limit,
        nextPageToken: hasMore ? String(page + 1) : null,
      },
    });
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Twitter rate limit hit. Try again shortly.' },
      });
    }
    console.error('[GET /api/followers]', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch followers' },
    });
  }
});

/**
 * GET /api/followers/bots
 * Returns followers with botScore >= 60.
 */
router.get('/bots', requireAuth, async (req, res) => {
  try {
    const { followers } = await getFollowerData(req);
    const bots = followers.filter((f) => f.botScore >= 60);

    return res.json({
      success: true,
      data: { bots, total: bots.length },
    });
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Twitter rate limit hit. Try again shortly.' },
      });
    }
    console.error('[GET /api/followers/bots]', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch bots' },
    });
  }
});

/**
 * GET /api/followers/stats
 * Aggregate statistics.
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { followers, following } = await getFollowerData(req);

    const totalFollowers = followers.length;
    const totalFollowing = following.length;
    const notFollowingBack = followers.filter((f) => !f.followsYouBack).length;

    const botsCount = followers.filter((f) => f.botScore >= 60).length;
    const estimatedBotPercent =
      totalFollowers > 0 ? Math.round((botsCount / totalFollowers) * 100) : 0;

    // Recent = first 20 in fetch order (Twitter returns most recent first)
    const recentFollowers = followers.slice(0, 20);

    return res.json({
      success: true,
      data: {
        totalFollowers,
        totalFollowing,
        notFollowingBack,
        estimatedBotPercent,
        botsCount,
        recentFollowers,
      },
    });
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Twitter rate limit hit. Try again shortly.' },
      });
    }
    console.error('[GET /api/followers/stats]', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to compute stats' },
    });
  }
});

/**
 * GET /api/following
 * Returns the full following list (paginated).
 */
router.get('/following', requireAuth, async (req, res) => {
  try {
    const { following } = await getFollowerData(req);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const start = (page - 1) * limit;
    const slice = following.slice(start, start + limit);

    return res.json({
      success: true,
      data: {
        following: slice,
        total: following.length,
        page,
        limit,
      },
    });
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Twitter rate limit hit. Try again shortly.' },
      });
    }
    console.error('[GET /api/following]', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch following' },
    });
  }
});

export default router;
