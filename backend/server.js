import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import followersRouter from './routes/followers.js';
import unfollowRouter from './routes/unfollow.js';

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DEMO_MODE = !process.env.TWITTER_CLIENT_ID;

// ─── Logging middleware ──────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── CORS ────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // allow all in dev/demo; restrict in prod if needed
    credentials: true,
  })
);

// ─── Body parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Session ─────────────────────────────────────────────────────────────────

const sessionSecret = process.env.SESSION_SECRET || 'flockwatch-dev-secret-change-in-prod';

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PROD && !DEMO_MODE,
      sameSite: IS_PROD ? 'lax' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ─── Static frontend (production / dist build) ───────────────────────────────

const distDir = path.join(process.cwd(), 'dist');

app.use(express.static(distDir));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.0.0',
    demo: DEMO_MODE,
  });
});

// ─── API info ─────────────────────────────────────────────────────────────────

app.get('/api', (req, res) => {
  res.json({
    name: 'FlockWatch API',
    version: '1.0.0',
    description: 'Twitter/X follower analytics — bot detection, bulk unfollow, insights',
    demo: DEMO_MODE,
    endpoints: {
      auth: {
        'GET /api/auth/twitter': 'Initiate OAuth 2.0 PKCE flow',
        'GET /api/auth/callback': 'OAuth callback (Twitter redirects here)',
        'GET /api/auth/me': 'Get current authenticated user',
        'DELETE /api/auth/logout': 'Log out and destroy session',
      },
      followers: {
        'GET /api/followers': 'Paginated followers list with bot scores (query: page, limit, search, filter)',
        'GET /api/followers/bots': 'Followers with botScore >= 60',
        'GET /api/followers/stats': 'Aggregate stats: totals, bot %, not-following-back count',
        'GET /api/followers/following': 'Paginated following list',
      },
      unfollow: {
        'POST /api/unfollow': 'Bulk unfollow (body: { userIds: string[] }, max 400)',
      },
    },
    health: '/health',
    docs: '/docs',
  });
});

// ─── API docs ─────────────────────────────────────────────────────────────────

app.get('/docs', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FlockWatch API Docs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --blue: #388bfd;
      --green: #3fb950;
      --orange: #d29922;
      --red: #f85149;
      --purple: #bc8cff;
      --yellow: #e3b341;
      --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    header { border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 32px; }
    header h1 { font-size: 2rem; font-weight: 700; color: var(--blue); }
    header p { color: var(--muted); margin-top: 6px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .badge-green { background: rgba(63,185,80,.15); color: var(--green); }
    .badge-blue { background: rgba(56,139,253,.15); color: var(--blue); }
    .badge-red { background: rgba(248,81,73,.15); color: var(--red); }
    .badge-orange { background: rgba(210,153,34,.15); color: var(--orange); }
    section { margin-bottom: 40px; }
    section h2 { font-size: 1.2rem; font-weight: 600; color: var(--text); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .endpoint { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
    .endpoint-header { padding: 14px 18px; display: flex; align-items: center; gap: 10px; }
    .method { font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
    .GET { background: rgba(63,185,80,.15); color: var(--green); }
    .POST { background: rgba(56,139,253,.15); color: var(--blue); }
    .DELETE { background: rgba(248,81,73,.15); color: var(--red); }
    .path { font-family: var(--font-mono); font-size: 0.9rem; color: var(--text); }
    .desc { color: var(--muted); font-size: 0.85rem; margin-left: auto; }
    .endpoint-body { padding: 0 18px 18px; border-top: 1px solid var(--border); }
    pre { background: #010409; border: 1px solid var(--border); border-radius: 6px; padding: 14px; overflow-x: auto; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; margin-top: 12px; }
    .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-top: 14px; margin-bottom: 6px; }
    .kw { color: var(--purple); }
    .str { color: var(--yellow); }
    .num { color: var(--green); }
    .bool { color: var(--orange); }
    footer { border-top: 1px solid var(--border); padding-top: 24px; color: var(--muted); font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>🐦 FlockWatch API <span class="badge badge-green">v1.0</span></h1>
    <p>Twitter/X follower analytics — bot detection, bulk unfollow, engagement insights</p>
  </header>

  <section>
    <h2>Authentication</h2>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/auth/twitter</span>
        <span class="desc">Start OAuth 2.0 PKCE flow</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Description</div>
        <p style="color:var(--muted);font-size:.875rem">Generates PKCE code_verifier + code_challenge, stores verifier in session, then redirects the user to Twitter's authorization page.</p>
        <div class="label">Response</div>
        <pre>302 Redirect → https://twitter.com/i/oauth2/authorize?...</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/auth/callback</span>
        <span class="desc">OAuth callback handler</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Query Params</div>
        <pre><span class="kw">code</span>: string   <span class="str">// authorization code from Twitter</span>
<span class="kw">state</span>: string  <span class="str">// CSRF state token</span></pre>
        <div class="label">Response</div>
        <pre>302 Redirect → / (SPA handles routing)</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/auth/me</span>
        <span class="desc">Get current user</span>
      </div>
      <div class="endpoint-body">
        <div class="label">curl example</div>
        <pre>curl -X GET https://your-domain.com/api/auth/me \
  -H <span class="str">"Cookie: connect.sid=..."</span></pre>
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: {
    <span class="kw">"id"</span>: <span class="str">"1234567890"</span>,
    <span class="kw">"username"</span>: <span class="str">"flockwatch_user"</span>,
    <span class="kw">"name"</span>: <span class="str">"FlockWatch User"</span>,
    <span class="kw">"profileImageUrl"</span>: <span class="str">"https://pbs.twimg.com/profile_images/..."</span>,
    <span class="kw">"followersCount"</span>: <span class="num">1482</span>,
    <span class="kw">"followingCount"</span>: <span class="num">763</span>
  }
}</pre>
        <div class="label">Response 401</div>
        <pre>{ <span class="kw">"success"</span>: <span class="bool">false</span>, <span class="kw">"error"</span>: { <span class="kw">"code"</span>: <span class="str">"NOT_AUTHENTICATED"</span> } }</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method DELETE">DELETE</span>
        <span class="path">/api/auth/logout</span>
        <span class="desc">Log out and destroy session</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Response</div>
        <pre>{ <span class="kw">"success"</span>: <span class="bool">true</span> }</pre>
      </div>
    </div>
  </section>

  <section>
    <h2>Followers &amp; Analytics</h2>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/followers</span>
        <span class="desc">Paginated followers with bot scores</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Query Params</div>
        <pre><span class="kw">page</span>: number    <span class="str">// default 1</span>
<span class="kw">limit</span>: number   <span class="str">// default 50, max 200</span>
<span class="kw">search</span>: string  <span class="str">// filter by username or name</span>
<span class="kw">filter</span>: string  <span class="str">// bots | notFollowingBack | inactive | noPic</span></pre>
        <div class="label">curl example</div>
        <pre>curl "https://your-domain.com/api/followers?filter=bots&amp;limit=50" \
  -H <span class="str">"Cookie: connect.sid=..."</span></pre>
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: {
    <span class="kw">"followers"</span>: [{
      <span class="kw">"id"</span>: <span class="str">"1000042"</span>,
      <span class="kw">"username"</span>: <span class="str">"alpha_hawk9823471"</span>,
      <span class="kw">"name"</span>: <span class="str">"Alpha Hawk"</span>,
      <span class="kw">"profileImageUrl"</span>: <span class="bool">null</span>,
      <span class="kw">"bio"</span>: <span class="bool">null</span>,
      <span class="kw">"followersCount"</span>: <span class="num">3</span>,
      <span class="kw">"followingCount"</span>: <span class="num">1847</span>,
      <span class="kw">"tweetCount"</span>: <span class="num">0</span>,
      <span class="kw">"createdAt"</span>: <span class="str">"2024-11-02T08:14:33.000Z"</span>,
      <span class="kw">"isVerified"</span>: <span class="bool">false</span>,
      <span class="kw">"followsYouBack"</span>: <span class="bool">false</span>,
      <span class="kw">"botScore"</span>: <span class="num">100</span>,
      <span class="kw">"botSignals"</span>: [<span class="str">"⚠ No profile photo"</span>, <span class="str">"⚠ No biography"</span>, <span class="str">"⚠ Never tweeted"</span>, <span class="str">"⚠ Follow-spam pattern"</span>]
    }],
    <span class="kw">"total"</span>: <span class="num">57</span>,
    <span class="kw">"page"</span>: <span class="num">1</span>,
    <span class="kw">"limit"</span>: <span class="num">50</span>,
    <span class="kw">"nextPageToken"</span>: <span class="str">"2"</span>
  }
}</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/followers/bots</span>
        <span class="desc">Followers with botScore ≥ 60</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: { <span class="kw">"bots"</span>: [...], <span class="kw">"total"</span>: <span class="num">48</span> }
}</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/followers/stats</span>
        <span class="desc">Aggregate analytics</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: {
    <span class="kw">"totalFollowers"</span>: <span class="num">200</span>,
    <span class="kw">"totalFollowing"</span>: <span class="num">150</span>,
    <span class="kw">"notFollowingBack"</span>: <span class="num">143</span>,
    <span class="kw">"estimatedBotPercent"</span>: <span class="num">24</span>,
    <span class="kw">"botsCount"</span>: <span class="num">48</span>,
    <span class="kw">"recentFollowers"</span>: [...]
  }
}</pre>
      </div>
    </div>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/api/followers/following</span>
        <span class="desc">People you follow (paginated)</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Query Params</div>
        <pre><span class="kw">page</span>: number   <span class="str">// default 1</span>
<span class="kw">limit</span>: number  <span class="str">// default 50, max 200</span></pre>
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: { <span class="kw">"following"</span>: [...], <span class="kw">"total"</span>: <span class="num">150</span>, <span class="kw">"page"</span>: <span class="num">1</span>, <span class="kw">"limit"</span>: <span class="num">50</span> }
}</pre>
      </div>
    </div>
  </section>

  <section>
    <h2>Bulk Unfollow</h2>

    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method POST">POST</span>
        <span class="path">/api/unfollow</span>
        <span class="desc">Bulk unfollow up to 400 users</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Request Body</div>
        <pre>{ <span class="kw">"userIds"</span>: [<span class="str">"1234567"</span>, <span class="str">"8901234"</span>, <span class="str">"5678901"</span>] }</pre>
        <div class="label">curl example</div>
        <pre>curl -X POST https://your-domain.com/api/unfollow \
  -H <span class="str">"Content-Type: application/json"</span> \
  -H <span class="str">"Cookie: connect.sid=..."</span> \
  -d <span class="str">'{"userIds":["1234567","8901234"]}'</span></pre>
        <div class="label">Response 200</div>
        <pre>{
  <span class="kw">"success"</span>: <span class="bool">true</span>,
  <span class="kw">"data"</span>: {
    <span class="kw">"unfollowed"</span>: <span class="num">2</span>,
    <span class="kw">"failed"</span>: <span class="num">0</span>,
    <span class="kw">"errors"</span>: []
  }
}</pre>
        <div class="label">Notes</div>
        <p style="color:var(--muted);font-size:.875rem">Each unfollow has a 1-second delay to respect Twitter rate limits. Max 400 IDs per request.</p>
      </div>
    </div>
  </section>

  <section>
    <h2>Health</h2>
    <div class="endpoint">
      <div class="endpoint-header">
        <span class="method GET">GET</span>
        <span class="path">/health</span>
        <span class="desc">Service health check</span>
      </div>
      <div class="endpoint-body">
        <div class="label">Response</div>
        <pre>{ <span class="kw">"status"</span>: <span class="str">"ok"</span>, <span class="kw">"uptime"</span>: <span class="num">342.1</span>, <span class="kw">"version"</span>: <span class="str">"1.0.0"</span> }</pre>
      </div>
    </div>
  </section>

  <footer>
    <p>FlockWatch API — Built with Express.js &amp; Twitter API v2</p>
  </footer>
</div>
</body>
</html>`);
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/followers', followersRouter);

// Mount /api/following as an alias → followers router handles /following
// The following route is served at /api/followers/following internally
app.use('/api/following', (req, res, next) => {
  // Rewrite to followers/following
  req.url = '/following' + (req.url === '/' ? '' : req.url);
  followersRouter(req, res, next);
});

app.use('/api/unfollow', unfollowRouter);

// ─── SPA fallback ────────────────────────────────────────────────────────────
// Serve index.html for all non-API routes (React Router / SPA support)

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/docs') {
    return next();
  }
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // dist not built yet — send a minimal placeholder
      res.status(200).send(`<!DOCTYPE html><html><body>
        <h2>FlockWatch</h2>
        <p>Frontend not built yet. Run <code>npm run build</code> in the project root.</p>
        <p>API is available at <a href="/api">/api</a> | <a href="/docs">Docs</a> | <a href="/health">Health</a></p>
      </body></html>`);
    }
  });
});

// ─── 404 for unknown /api routes ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route: ${req.method} ${req.path}` },
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🐦 FlockWatch API listening on port ${PORT}`);
  console.log(`   Mode: ${DEMO_MODE ? '🎭 DEMO (no Twitter credentials)' : '🔑 Live Twitter API'}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Docs:   http://localhost:${PORT}/docs`);
  console.log(`   API:    http://localhost:${PORT}/api\n`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Shutting down FlockWatch API...`);
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    console.log('Server closed cleanly.');
    process.exit(0);
  });

  // Force exit after 10 seconds if server hangs
  setTimeout(() => {
    console.warn('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
