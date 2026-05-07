import { calculateBotScore } from './botDetection.js'

const now = new Date()
const daysAgo = (d) => new Date(now - d * 86400000).toISOString()

const rawFollowers = [
  { id: '1', username: 'elonmusk', name: 'Elon Musk', profileImageUrl: 'https://i.pravatar.cc/48?img=1', bio: 'CEO of Tesla, SpaceX, X. Technoking.', followersCount: 180000000, followingCount: 620, tweetCount: 42000, createdAt: daysAgo(5000), isVerified: true, followsYouBack: true },
  { id: '2', username: 'sama', name: 'Sam Altman', profileImageUrl: 'https://i.pravatar.cc/48?img=2', bio: 'CEO of OpenAI. Building AGI for the benefit of humanity.', followersCount: 2100000, followingCount: 1200, tweetCount: 8200, createdAt: daysAgo(4200), isVerified: true, followsYouBack: false },
  { id: '3', username: 'naval', name: 'Naval Ravikant', profileImageUrl: 'https://i.pravatar.cc/48?img=3', bio: 'Seeking happiness. @AngelList, @Epinions founder. Investor in 200+ cos.', followersCount: 2400000, followingCount: 88, tweetCount: 18000, createdAt: daysAgo(5500), isVerified: true, followsYouBack: false },
  { id: '4', username: 'paulg', name: 'Paul Graham', profileImageUrl: 'https://i.pravatar.cc/48?img=4', bio: 'Co-founder of Y Combinator. Writer. Lisp hacker.', followersCount: 1600000, followingCount: 350, tweetCount: 6800, createdAt: daysAgo(4800), isVerified: true, followsYouBack: true },
  { id: '5', username: 'levelsio', name: 'Pieter Levels 🤖', profileImageUrl: 'https://i.pravatar.cc/48?img=5', bio: 'Building profitable startups while traveling the world.', followersCount: 430000, followingCount: 890, tweetCount: 55000, createdAt: daysAgo(4000), isVerified: false, followsYouBack: true },
  { id: '6', username: 'bot123456789', name: 'user bot', profileImageUrl: null, bio: null, followersCount: 2, followingCount: 8900, tweetCount: 0, createdAt: daysAgo(15), isVerified: false, followsYouBack: false },
  { id: '7', username: 'cryptoXYZ987654', name: 'Crypto Gains', profileImageUrl: null, bio: 'DMs open. Crypto signals 🚀', followersCount: 5, followingCount: 4200, tweetCount: 3, createdAt: daysAgo(22), isVerified: false, followsYouBack: false },
  { id: '8', username: 'spambot123456', name: 'Free Money!!!', profileImageUrl: null, bio: null, followersCount: 1, followingCount: 9999, tweetCount: 0, createdAt: daysAgo(7), isVerified: false, followsYouBack: false },
  { id: '9', username: 'sarah_techie', name: 'Sarah Chen', profileImageUrl: 'https://i.pravatar.cc/48?img=9', bio: 'Frontend engineer @Vercel. React enthusiast. Coffee addict ☕', followersCount: 12400, followingCount: 890, tweetCount: 3400, createdAt: daysAgo(2200), isVerified: false, followsYouBack: true },
  { id: '10', username: 'marckohlbrugge', name: 'Marc Köhlbrügge', profileImageUrl: 'https://i.pravatar.cc/48?img=10', bio: 'Founder of @WIP. Building things, shipping often.', followersCount: 85000, followingCount: 1200, tweetCount: 22000, createdAt: daysAgo(3800), isVerified: false, followsYouBack: true },
  { id: '11', username: 'alexhormozi', name: 'Alex Hormozi', profileImageUrl: 'https://i.pravatar.cc/48?img=11', bio: 'I help companies scale. $100M+ exits. @AcquisitionCom', followersCount: 1200000, followingCount: 200, tweetCount: 15000, createdAt: daysAgo(3200), isVerified: true, followsYouBack: false },
  { id: '12', username: 'anotherbot654321', name: 'News Update', profileImageUrl: null, bio: null, followersCount: 0, followingCount: 6000, tweetCount: 0, createdAt: daysAgo(3), isVerified: false, followsYouBack: false },
  { id: '13', username: 'emmabostian', name: 'Emma Bostian', profileImageUrl: 'https://i.pravatar.cc/48?img=13', bio: 'Software Engineer @Spotify. Author. Podcast host. She/Her 🏳️‍🌈', followersCount: 92000, followingCount: 1800, tweetCount: 28000, createdAt: daysAgo(3100), isVerified: false, followsYouBack: true },
  { id: '14', username: 'swyx', name: 'swyx', profileImageUrl: 'https://i.pravatar.cc/48?img=14', bio: 'AI Researcher @Smol.ai. Learn in public. DX Engineer.', followersCount: 105000, followingCount: 2100, tweetCount: 31000, createdAt: daysAgo(2800), isVerified: false, followsYouBack: false },
  { id: '15', username: 'ghost_acct111', name: '', profileImageUrl: null, bio: null, followersCount: 3, followingCount: 200, tweetCount: 1, createdAt: daysAgo(60), isVerified: false, followsYouBack: false },
  { id: '16', username: 'thecultureddev', name: 'The Cultured Dev', profileImageUrl: 'https://i.pravatar.cc/48?img=16', bio: 'Building SaaS products. Talking about code, design, and indie hacking.', followersCount: 34000, followingCount: 1500, tweetCount: 9800, createdAt: daysAgo(1900), isVerified: false, followsYouBack: true },
  { id: '17', username: 'randombot778899', name: 'Bot Account', profileImageUrl: null, bio: null, followersCount: 0, followingCount: 5500, tweetCount: 0, createdAt: daysAgo(12), isVerified: false, followsYouBack: false },
  { id: '18', username: 'devadvocate_jen', name: 'Jennifer Lopez 👩‍💻', profileImageUrl: 'https://i.pravatar.cc/48?img=18', bio: 'Dev Advocate @AWS. Speaker. Python & Rust enthusiast. Mom of 2.', followersCount: 47000, followingCount: 3200, tweetCount: 18700, createdAt: daysAgo(2500), isVerified: false, followsYouBack: true },
  { id: '19', username: 'bentossell', name: 'Ben Tossell', profileImageUrl: 'https://i.pravatar.cc/48?img=19', bio: 'Building @Makerpad. No-code tools newsletter.', followersCount: 55000, followingCount: 900, tweetCount: 14200, createdAt: daysAgo(2600), isVerified: false, followsYouBack: false },
  { id: '20', username: 'inactive_user_42', name: 'Inactive Person', profileImageUrl: 'https://i.pravatar.cc/48?img=20', bio: 'Just lurking...', followersCount: 120, followingCount: 340, tweetCount: 2, createdAt: daysAgo(800), isVerified: false, followsYouBack: false },
  { id: '21', username: 'csaba_kissi', name: 'Csaba Kissi', profileImageUrl: 'https://i.pravatar.cc/48?img=21', bio: 'UI/UX Designer. Turning ideas into stunning visuals. Freelancer.', followersCount: 78000, followingCount: 4200, tweetCount: 26000, createdAt: daysAgo(2200), isVerified: false, followsYouBack: true },
  { id: '22', username: 'joshwcomeau', name: 'Josh W. Comeau', profileImageUrl: 'https://i.pravatar.cc/48?img=22', bio: 'Friendly neighborhood dev. Creator of CSS for JS Devs course.', followersCount: 142000, followingCount: 450, tweetCount: 11400, createdAt: daysAgo(3400), isVerified: false, followsYouBack: false },
  { id: '23', username: 'KentCDodds', name: 'Kent C. Dodds', profileImageUrl: 'https://i.pravatar.cc/48?img=23', bio: 'Improving the world with quality software. Epic React creator.', followersCount: 168000, followingCount: 1100, tweetCount: 42000, createdAt: daysAgo(3700), isVerified: false, followsYouBack: true },
  { id: '24', username: 'wesbos', name: 'Wes Bos', profileImageUrl: 'https://i.pravatar.cc/48?img=24', bio: 'Web developer, teacher, and podcaster. Syntax.fm co-host.', followersCount: 194000, followingCount: 760, tweetCount: 38000, createdAt: daysAgo(4100), isVerified: false, followsYouBack: false },
  { id: '25', username: 'freeCodeCamp', name: 'freeCodeCamp.org', profileImageUrl: 'https://i.pravatar.cc/48?img=25', bio: 'Learn to code — for free. Build projects. Earn certifications.', followersCount: 890000, followingCount: 2400, tweetCount: 62000, createdAt: daysAgo(4500), isVerified: true, followsYouBack: false },
  { id: '26', username: 'spammy334455', name: 'Get Rich Quick', profileImageUrl: null, bio: 'Follow for financial freedom 💰', followersCount: 8, followingCount: 7800, tweetCount: 4, createdAt: daysAgo(45), isVerified: false, followsYouBack: false },
  { id: '27', username: 'theo_browne', name: 'Theo - t3.gg', profileImageUrl: 'https://i.pravatar.cc/48?img=27', bio: 'TypeScript enjoyer. Founder @PingDotGG. React, tRPC, Prisma.', followersCount: 245000, followingCount: 580, tweetCount: 19800, createdAt: daysAgo(2900), isVerified: false, followsYouBack: true },
  { id: '28', username: 'mattpocock', name: 'Matt Pocock', profileImageUrl: 'https://i.pravatar.cc/48?img=28', bio: 'Total TypeScript creator. Making TypeScript make sense.', followersCount: 82000, followingCount: 620, tweetCount: 7400, createdAt: daysAgo(2100), isVerified: false, followsYouBack: false },
  { id: '29', username: 'ghost_112233', name: null, profileImageUrl: null, bio: null, followersCount: 0, followingCount: 1200, tweetCount: 0, createdAt: daysAgo(18), isVerified: false, followsYouBack: false },
  { id: '30', username: 'jenniferdewalt', name: 'Jennifer Dewalt', profileImageUrl: 'https://i.pravatar.cc/48?img=30', bio: 'Built 180 websites in 180 days. Founder @Braid.', followersCount: 28000, followingCount: 980, tweetCount: 8900, createdAt: daysAgo(3000), isVerified: false, followsYouBack: true },
]

// Enrich with bot scores
export const MOCK_FOLLOWERS = rawFollowers.map(f => {
  const { score, signals } = calculateBotScore(f)
  return { ...f, botScore: score, botSignals: signals }
})

export const MOCK_FOLLOWING = MOCK_FOLLOWERS.filter(f =>
  ['elonmusk', 'paulg', 'levelsio', 'sarah_techie', 'marckohlbrugge', 'emmabostian', 'thecultureddev', 'devadvocate_jen', 'csaba_kissi', 'theo_browne', 'KentCDodds', 'jenniferdewalt', 'bot123456789', 'cryptoXYZ987654'].includes(f.username)
)

export const MOCK_BOTS = MOCK_FOLLOWERS.filter(f => f.botScore >= 60)

export const MOCK_STATS = {
  totalFollowers: MOCK_FOLLOWERS.length,
  totalFollowing: MOCK_FOLLOWING.length,
  notFollowingBack: MOCK_FOLLOWING.filter(f => !f.followsYouBack).length,
  estimatedBotPercent: Math.round((MOCK_BOTS.length / MOCK_FOLLOWERS.length) * 100),
  recentFollowers: [...MOCK_FOLLOWERS].slice(0, 10)
}

export const MOCK_GROWTH_DATA = [
  { date: 'Nov 1', followers: 1820 },
  { date: 'Nov 8', followers: 1950 },
  { date: 'Nov 15', followers: 2100 },
  { date: 'Nov 22', followers: 2080 },
  { date: 'Nov 29', followers: 2310 },
  { date: 'Dec 6', followers: 2450 },
  { date: 'Dec 13', followers: 2380 },
  { date: 'Dec 20', followers: 2520 },
  { date: 'Dec 27', followers: 2700 },
  { date: 'Jan 3', followers: 2800 },
  { date: 'Jan 10', followers: 2900 },
  { date: 'Jan 17', followers: 3050 },
]

export const MOCK_AUDIENCE_QUALITY = [
  { name: 'Real Users', value: 18, color: '#22c55e' },
  { name: 'Suspicious', value: 5, color: '#f59e0b' },
  { name: 'Bots', value: 5, color: '#ef4444' },
  { name: 'Inactive', value: 2, color: '#475569' },
]

export const MOCK_ME = {
  id: 'me123',
  username: 'yourusername',
  name: 'Your Name',
  profileImageUrl: 'https://i.pravatar.cc/48?img=50',
  followersCount: MOCK_FOLLOWERS.length,
  followingCount: MOCK_FOLLOWING.length
}
