import { Router } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { TwitterClient } from '../twitter.js';
import { clearCache } from '../db.js';

const router = Router();

const DEMO_MODE = !process.env.TWITTER_CLIENT_ID;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a cryptographically random URL-safe string (43–128 chars). */
function generateCodeVerifier() {
  return crypto.randomBytes(64).toString('base64url').slice(0, 96);
}

/** Compute PKCE code_challenge = BASE64URL(SHA256(code_verifier)). */
function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/** Generate a random state token to prevent CSRF. */
function generateState() {
  return crypto.randomBytes(24).toString('base64url');
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/twitter
 * Initiates the OAuth 2.0 PKCE flow.
 */
router.get('/twitter', (req, res) => {
  if (DEMO_MODE) {
    // In demo mode skip OAuth entirely — set a demo session
    req.session.userId = 'demo';
    req.session.username = 'demo_user';
    req.session.name = 'Demo User';
    req.session.profileImageUrl =
      'https://api.dicebear.com/7.x/avataaars/svg?seed=FlockWatch';
    req.session.accessToken = 'demo';
    return res.redirect('/');
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_CALLBACK_URL;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Persist verifier + state in session for callback validation
  req.session.codeVerifier = codeVerifier;
  req.session.oauthState = state;

  const scopes = [
    'tweet.read',
    'users.read',
    'follows.read',
    'follows.write',
    'offline.access',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  return res.redirect(authUrl);
});

/**
 * GET /api/auth/callback
 * Twitter redirects here with ?code=...&state=...
 */
router.get('/callback', async (req, res) => {
  if (DEMO_MODE) {
    return res.redirect('/');
  }

  const { code, state, error } = req.query;

  if (error) {
    console.error('[auth/callback] OAuth error from Twitter:', error);
    return res.redirect('/?error=oauth_denied');
  }

  if (!code) {
    return res.redirect('/?error=missing_code');
  }

  // Validate state to prevent CSRF
  if (state !== req.session.oauthState) {
    console.warn('[auth/callback] State mismatch — possible CSRF');
    return res.redirect('/?error=state_mismatch');
  }

  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) {
    return res.redirect('/?error=missing_verifier');
  }

  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const redirectUri = process.env.TWITTER_CALLBACK_URL;

    // Exchange authorization code for tokens
    const tokenRes = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;

    if (!access_token) {
      throw new Error('No access_token in Twitter response');
    }

    // Fetch user profile
    const client = new TwitterClient(access_token);
    const me = await client.getMe();

    // Store in session (never expose tokens to frontend)
    req.session.userId = me.id;
    req.session.username = me.username;
    req.session.name = me.name;
    req.session.profileImageUrl = me.profile_image_url || null;
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token || null;
    req.session.followersCount = me.public_metrics?.followers_count ?? 0;
    req.session.followingCount = me.public_metrics?.following_count ?? 0;

    // Clean up PKCE state
    delete req.session.codeVerifier;
    delete req.session.oauthState;

    return res.redirect('/');
  } catch (err) {
    console.error('[auth/callback] Token exchange failed:', err.message);
    if (err.response?.data) {
      console.error('[auth/callback] Twitter error body:', JSON.stringify(err.response.data));
    }
    return res.redirect('/?error=token_exchange_failed');
  }
});

/**
 * GET /api/auth/me
 * Returns current session user or 401.
 */
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'NOT_AUTHENTICATED', message: 'Not logged in' },
    });
  }

  // Attempt to refresh public_metrics from cache or API
  let followersCount = req.session.followersCount ?? 0;
  let followingCount = req.session.followingCount ?? 0;

  if (!DEMO_MODE && req.session.accessToken && req.session.accessToken !== 'demo') {
    try {
      const client = new TwitterClient(req.session.accessToken);
      const me = await client.getMe();
      followersCount = me.public_metrics?.followers_count ?? followersCount;
      followingCount = me.public_metrics?.following_count ?? followingCount;
      // Keep session fresh
      req.session.followersCount = followersCount;
      req.session.followingCount = followingCount;
    } catch (err) {
      // Non-fatal: use cached counts
      console.warn('[auth/me] Could not refresh metrics:', err.message);
    }
  } else if (DEMO_MODE) {
    followersCount = 1482;
    followingCount = 763;
  }

  return res.json({
    success: true,
    data: {
      id: req.session.userId,
      username: req.session.username,
      name: req.session.name,
      profileImageUrl: req.session.profileImageUrl,
      followersCount,
      followingCount,
    },
  });
});

/**
 * DELETE /api/auth/logout
 * Destroys the session.
 */
router.delete('/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy((err) => {
    if (err) {
      console.error('[auth/logout] Session destroy error:', err);
      return res.status(500).json({
        success: false,
        error: { code: 'LOGOUT_FAILED', message: 'Could not destroy session' },
      });
    }
    if (userId) clearCache(userId);
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

export default router;
