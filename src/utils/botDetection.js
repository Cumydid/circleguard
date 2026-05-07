/**
 * FlockWatch Bot Detection Engine
 * Calculates a bot score (0-100) and signals for a given follower profile.
 */
export function calculateBotScore(user) {
  let score = 0
  const signals = []

  // No profile image
  if (!user.profileImageUrl || user.profileImageUrl.includes('default_profile')) {
    score += 25
    signals.push('⚠ No profile photo')
  }

  // No bio
  if (!user.bio || user.bio.trim() === '') {
    score += 15
    signals.push('⚠ No biography')
  }

  // Account age checks
  if (user.createdAt) {
    const createdDate = new Date(user.createdAt)
    const now = new Date()
    const ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24)

    if (ageInDays < 30) {
      score += 30
      signals.push('⚠ Very new account')
    } else if (ageInDays < 90) {
      score += 15
      signals.push('⚠ New account')
    }
  }

  // Tweet count
  if (user.tweetCount === 0) {
    score += 25
    signals.push('⚠ Never tweeted')
  } else if (user.tweetCount < 5) {
    score += 15
    signals.push('⚠ Barely tweets')
  }

  // Follow-spam pattern: few followers, many following
  if (user.followersCount < 10 && user.followingCount > 500) {
    score += 20
    signals.push('⚠ Follow-spam pattern')
  }

  // Suspicious username pattern (letters followed by 6+ digits)
  if (/^[a-z]+\d{6,}$/i.test(user.username)) {
    score += 20
    signals.push('⚠ Suspicious username pattern')
  }

  // High follow ratio
  const followRatio = user.followingCount / (user.followersCount || 1)
  if (followRatio > 10) {
    score += 15
    signals.push('⚠ High follow ratio')
  }

  // Cap at 100
  return {
    score: Math.min(100, score),
    signals
  }
}

/**
 * Get bot score color class based on score value
 */
export function getBotScoreColor(score) {
  if (score <= 30) return '#22c55e'
  if (score <= 60) return '#f59e0b'
  return '#ef4444'
}

/**
 * Get bot score label
 */
export function getBotScoreLabel(score) {
  if (score <= 30) return 'Clean'
  if (score <= 60) return 'Suspicious'
  return 'Bot'
}

/**
 * Enrich followers array with bot scores
 */
export function enrichWithBotScores(followers) {
  return followers.map(f => {
    if (f.botScore !== undefined && f.botSignals !== undefined) return f
    const { score, signals } = calculateBotScore(f)
    return { ...f, botScore: score, botSignals: signals }
  })
}
