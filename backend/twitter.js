import axios from 'axios';

const USER_FIELDS =
  'id,name,username,profile_image_url,description,public_metrics,created_at,verified';

/**
 * TwitterClient wraps Twitter API v2 calls using a user Bearer token.
 */
export class TwitterClient {
  constructor(accessToken) {
    this.token = accessToken;
    this.baseUrl = 'https://api.twitter.com/2';
  }

  /** Shared axios instance with auth header */
  _http() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  /** Safely extract axios error data */
  _handleError(err, context) {
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      if (status === 429) {
        const rateLimitErr = new Error('Twitter rate limit exceeded');
        rateLimitErr.code = 'RATE_LIMITED';
        rateLimitErr.resetAt = err.response.headers['x-rate-limit-reset'];
        throw rateLimitErr;
      }

      console.error(`[TwitterClient] ${context} — HTTP ${status}:`, JSON.stringify(data));
      const apiErr = new Error(
        data?.detail || data?.title || `Twitter API error ${status}`
      );
      apiErr.status = status;
      apiErr.twitterData = data;
      throw apiErr;
    }
    console.error(`[TwitterClient] ${context} — network error:`, err.message);
    throw err;
  }

  /**
   * GET /2/users/me
   */
  async getMe() {
    try {
      const res = await this._http().get('/users/me', {
        params: {
          'user.fields':
            'public_metrics,profile_image_url,description,created_at,verified',
        },
      });
      return res.data.data;
    } catch (err) {
      this._handleError(err, 'getMe');
    }
  }

  /**
   * GET /2/users/:id/followers — single page
   */
  async getFollowers(userId, paginationToken = null) {
    try {
      const params = {
        'user.fields': USER_FIELDS,
        max_results: 1000,
      };
      if (paginationToken) params.pagination_token = paginationToken;

      const res = await this._http().get(`/users/${userId}/followers`, { params });
      return res.data; // { data: [], meta: { next_token, result_count } }
    } catch (err) {
      this._handleError(err, 'getFollowers');
    }
  }

  /**
   * GET /2/users/:id/following — single page
   */
  async getFollowing(userId, paginationToken = null) {
    try {
      const params = {
        'user.fields': USER_FIELDS,
        max_results: 1000,
      };
      if (paginationToken) params.pagination_token = paginationToken;

      const res = await this._http().get(`/users/${userId}/following`, { params });
      return res.data;
    } catch (err) {
      this._handleError(err, 'getFollowing');
    }
  }

  /**
   * DELETE /2/users/:myId/following/:targetId
   */
  async unfollowUser(myUserId, targetUserId) {
    try {
      const res = await this._http().delete(
        `/users/${myUserId}/following/${targetUserId}`
      );
      // Returns { data: { following: false } }
      return res.data;
    } catch (err) {
      this._handleError(err, `unfollowUser(${targetUserId})`);
    }
  }

  /**
   * Paginate through ALL followers, collecting every user.
   */
  async fetchAllFollowers(userId) {
    const all = [];
    let nextToken = null;

    do {
      const page = await this.getFollowers(userId, nextToken);
      if (page.data && page.data.length > 0) {
        all.push(...page.data);
      }
      nextToken = page.meta?.next_token || null;
    } while (nextToken);

    return all;
  }

  /**
   * Paginate through ALL following, collecting every user.
   */
  async fetchAllFollowing(userId) {
    const all = [];
    let nextToken = null;

    do {
      const page = await this.getFollowing(userId, nextToken);
      if (page.data && page.data.length > 0) {
        all.push(...page.data);
      }
      nextToken = page.meta?.next_token || null;
    } while (nextToken);

    return all;
  }
}
