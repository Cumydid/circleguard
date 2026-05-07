import { Router } from 'express';
import { TwitterClient } from '../twitter.js';
import { clearCache } from '../db.js';

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/unfollow
 * Body: { userIds: string[] }
 * Unfollows each user sequentially with a 1-second delay to respect rate limits.
 */
router.post('/', requireAuth, async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'userIds must be a non-empty array of strings' },
    });
  }

  // Safety cap — Twitter's API has strict rate limits
  if (userIds.length > 400) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'TOO_MANY_IDS',
        message: 'Maximum 400 userIds per request',
      },
    });
  }

  // Validate all IDs are strings
  const invalidIds = userIds.filter((id) => typeof id !== 'string' || id.trim() === '');
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_IDS',
        message: `${invalidIds.length} invalid userId(s) found — must be non-empty strings`,
      },
    });
  }

  const myUserId = req.session.userId;
  let unfollowed = 0;
  let failed = 0;
  const errors = [];

  // Demo mode — simulate unfollowing
  if (DEMO_MODE || req.session.accessToken === 'demo') {
    for (let i = 0; i < userIds.length; i++) {
      await sleep(20); // simulate a tiny delay in demo
      unfollowed++;
    }

    // Bust cache so stats update
    clearCache(myUserId);

    return res.json({
      success: true,
      data: { unfollowed, failed, errors },
      meta: {
        demo: true,
        message: 'Demo mode — no real unfollows performed',
      },
    });
  }

  const client = new TwitterClient(req.session.accessToken);

  for (let i = 0; i < userIds.length; i++) {
    const targetId = userIds[i].trim();

    try {
      await client.unfollowUser(myUserId, targetId);
      unfollowed++;
    } catch (err) {
      failed++;
      const errEntry = {
        userId: targetId,
        code: err.code || 'UNFOLLOW_FAILED',
        message: err.message || 'Unknown error',
      };
      errors.push(errEntry);
      console.warn(`[POST /api/unfollow] Failed to unfollow ${targetId}:`, err.message);

      // If rate limited, abort the rest of the batch
      if (err.code === 'RATE_LIMITED') {
        errors.push({
          userId: 'BATCH_ABORTED',
          code: 'RATE_LIMITED',
          message: `Rate limit hit after ${unfollowed} unfollows. Remaining ${userIds.length - i - 1} skipped.`,
        });
        break;
      }
    }

    // 1-second delay between each unfollow to avoid rate limit
    if (i < userIds.length - 1) {
      await sleep(1000);
    }
  }

  // Invalidate follower cache so the UI reflects changes
  clearCache(myUserId);

  return res.json({
    success: true,
    data: {
      unfollowed,
      failed,
      errors,
    },
    meta: {
      processingMs: unfollowed * 1000 + failed * 1000,
    },
  });
});

export default router;
