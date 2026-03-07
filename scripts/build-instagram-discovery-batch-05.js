const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-05.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-05-summary.md')
const TODAY = '2026-03-07'

const SEEDS = [
  {
    artistSlug: 'hosono-hitomi',
    instagramHandle: 'hitomihosono',
    nameJa: '細野仁美',
    nameKana: 'ほその ひとみ',
    nameZh: '细野仁美',
    nameEn: 'Hitomi Hosono',
    birthYear: null,
    gender: 'female',
    region: '日本出身・英国伦敦',
    locationPrefecture: null,
    locationCity: 'London',
    locationArea: null,
    style: '以植物、叶脉和花卉纹样构筑精密浮雕陶瓷雕塑的当代作家',
    bio: 'Hitomi Hosono is a Japanese ceramic artist whose work is widely recognized for porcelain and stoneware vessels densely covered with botanical relief. Public museum, gallery, and official sources consistently describe a practice built on close observation of flowers, leaves, and natural growth systems, translated into highly labor-intensive carved and applied surfaces. Although now strongly associated with London, her training and authorship remain clearly Japanese, and her public profile is large enough to make her a meaningful discovery target despite being based outside Japan.',
    sources: [
      { title: 'Hitomi Hosono Official Website', url: 'https://www.hitomihosono.com/', type: '作家官网' },
      { title: 'Adrian Sassoon - Hitomi Hosono', url: 'https://www.adriansassoon.com/artists/hitomi-hosono/', type: '画廊资料' },
      { title: 'The Metropolitan Museum of Art - Hitomi Hosono', url: 'https://www.metmuseum.org/art/collection/search/888972', type: '机构资料' },
    ],
  },
  {
    artistSlug: 'yashiro-narumi',
    instagramHandle: '_narumiyashiro_',
    nameJa: '矢代成美',
    nameKana: 'やしろ なるみ',
    nameZh: '矢代成美',
    nameEn: 'Narumi Yashiro',
    birthYear: null,
    gender: 'female',
    region: '京都出身・哥本哈根',
    locationPrefecture: '京都府',
    locationCity: 'Kyoto',
    locationArea: null,
    style: '以柔和色层、雕塑化器形与北欧语境融合的京都系当代陶艺',
    bio: 'Narumi Yashiro is a Japanese ceramic artist from Kyoto whose recent profile is tied to Copenhagen-based studio practice and international gallery circulation. Public gallery and exhibition sources present her work as balancing sculptural mass, delicate color fields, and tactile vessel forms while maintaining a distinctly Japanese sensitivity to surface and restraint. She is not ideal for the regional quotas because she is now internationally based, but her current follower count and clear authorship make her a strong female discovery candidate worth adding to the pipeline.',
    sources: [
      { title: '1stDibs - Narumi Yashiro Creator Page', url: 'https://www.1stdibs.com/creators/narumi-yashiro/furniture/', type: '画廊资料' },
      { title: '1stDibs - Search Narumi Yashiro', url: 'https://www.1stdibs.com/search/furniture/?q=narumi+yashiro', type: '电商资料' },
    ],
  },
]

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function htmlDecode(text) {
  return String(text || '')
    .replace(/&#064;/g, '@')
    .replace(/&#x2022;/g, '•')
    .replace(/&#x26ab;&#xfe0e;/g, '⚫')
    .replace(/&#x301c;/g, '〜')
    .replace(/&#x500b;/g, '個')
    .replace(/&#x5c55;/g, '展')
    .replace(/&#xff08;/g, '（')
    .replace(/&#xff09;/g, '）')
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

function parseCount(raw) {
  if (!raw) return null
  const text = String(raw).replace(/,/g, '').trim().toUpperCase()
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)([KM])?/)
  if (!match) return null
  const value = Number(match[1])
  if (match[2] === 'M') return Math.round(value * 1000000)
  if (match[2] === 'K') return Math.round(value * 1000)
  return Math.round(value)
}

function sanitizeUrl(value) {
  const text = String(value || '').trim()
  if (!text) return null
  try {
    return new URL(text).toString()
  } catch {
    return null
  }
}

function fetchInstagramPublicMeta(handle) {
  const url = `https://www.instagram.com/${handle}/`
  const html = execFileSync('curl', ['-sSL', url], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  const description = htmlDecode((html.match(/<meta content="([\s\S]*?)" name="description"/) || [])[1] || '')
  const ogTitle = htmlDecode((html.match(/property="og:title" content="([^"]+)"/) || [])[1] || '')
  const ogImage = (html.match(/property="og:image" content="([^"]+)"/) || [])[1] || null
  const followerMatch = description.match(/([0-9.,]+[KM]?) Followers/)
  const followingMatch = description.match(/([0-9.,]+[KM]?) Following/)
  const postMatch = description.match(/([0-9.,]+[KM]?) Posts/)
  const tailMatch = description.match(/Posts - ([\s\S]*)$/)
  const tail = tailMatch ? tailMatch[1] : ''
  const parts = tail.split(' on Instagram: "')
  return {
    instagramDisplayName: (ogTitle.match(/^(.*?)\s*\(@/) || [null, parts[0] || handle])[1].trim(),
    instagramFollowers: parseCount(followerMatch && followerMatch[1]),
    instagramFollowing: parseCount(followingMatch && followingMatch[1]),
    instagramPostCount: parseCount(postMatch && postMatch[1]),
    instagramBio: parts[1] ? parts.slice(1).join(' on Instagram: "').replace(/"$/, '').trim() : '',
    instagramProfilePicUrl: ogImage,
    profileUrl: url,
  }
}

function inferCredibility(url) {
  const safeUrl = sanitizeUrl(url)
  if (!safeUrl) return 'low'
  const domain = new URL(safeUrl).hostname
  if (/instagram\.com$/.test(domain)) return 'high'
  if (/(metmuseum|museum|official|ac\.jp)/.test(domain)) return 'high'
  if (/(gallery|sassoon|mothcopenhagen|brutalceramics|cfileonline)/.test(domain)) return 'medium'
  return 'low'
}

function normalizeSource(source) {
  const safeUrl = sanitizeUrl(source.url)
  if (!safeUrl) return null
  return {
    url: safeUrl,
    title: source.title,
    type: source.type || '资料来源',
    accessedAt: TODAY,
    credibility: inferCredibility(safeUrl),
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  const result = []
  for (const source of sources || []) {
    if (!source || !source.url) continue
    if (seen.has(source.url)) continue
    seen.add(source.url)
    result.push(source)
  }
  return result
}

function mainFormsFromText(text) {
  const forms = ['vessel', 'flower', 'floral', '皿', '盘', '花器', 'sculpture']
  return forms.filter((item) => String(text || '').toLowerCase().includes(String(item).toLowerCase())).slice(0, 5)
}

function main() {
  const built = []
  for (const seed of SEEDS) {
    const ig = fetchInstagramPublicMeta(seed.instagramHandle)
    if (!ig.instagramFollowers || ig.instagramFollowers < 10000) continue
    const sources = dedupeSources([
      normalizeSource({ url: ig.profileUrl, title: `Instagram @${seed.instagramHandle}`, type: '社交媒体' }),
      ...seed.sources.map(normalizeSource),
    ])
    built.push({
      instagramHandle: seed.instagramHandle,
      instagramFollowers: ig.instagramFollowers,
      instagramBio: ig.instagramBio,
      instagramDisplayName: ig.instagramDisplayName,
      instagramPostCount: ig.instagramPostCount,
      instagramFollowing: ig.instagramFollowing,
      instagramProfilePicUrl: ig.instagramProfilePicUrl,
      websiteUrlFromBio: null,
      locationFromBio: null,
      workStyle: seed.style,
      mainTechniques: [],
      mainForms: mainFormsFromText(seed.bio),
      colorPalette: null,
      discoveryHashtag: 'female-artist-web-search',
      discoveryDate: TODAY,
      verificationNotes: `Public Instagram metadata fetched on ${TODAY}; seeded from external museum, gallery, and artist profile pages.`,
      nameJa: seed.nameJa,
      nameKana: seed.nameKana,
      nameZh: seed.nameZh,
      nameEn: seed.nameEn,
      artistSlug: seed.artistSlug,
      birthYear: seed.birthYear,
      age: seed.birthYear ? 2026 - seed.birthYear : null,
      gender: seed.gender,
      bio: seed.bio,
      region: seed.region,
      locationPrefecture: seed.locationPrefecture,
      locationCity: seed.locationCity,
      locationArea: seed.locationArea,
      kilnName: null,
      studioName: null,
      kilnType: null,
      kilnEstablished: null,
      studioInfo: {
        hasGallery: null,
        visitorAccess: null,
        studioUrl: sanitizeUrl(seed.sources[0] && seed.sources[0].url),
      },
      style: seed.style,
      signatureWorks: mainFormsFromText(seed.bio),
      priceRange: null,
      artistStatement: null,
      sources,
      published: false,
      needsReview: true,
      batchId: 'instagram-discovery-batch-05',
    })
  }

  built.sort((a, b) => b.instagramFollowers - a.instagramFollowers)
  writeJson(OUTPUT, built)

  const lines = [
    '# Instagram Discovery Batch 05 Summary',
    '',
    `- Generated: ${TODAY}`,
    `- Artists: ${built.length}`,
    `- Min followers: ${built.length ? Math.min(...built.map((artist) => artist.instagramFollowers || 0)).toLocaleString() : 0}`,
    `- Max followers: ${built.length ? Math.max(...built.map((artist) => artist.instagramFollowers || 0)).toLocaleString() : 0}`,
    '',
    '## Handles',
    '',
  ]
  for (const artist of built) {
    lines.push(`- @${artist.instagramHandle} | ${artist.nameZh} | ${artist.instagramFollowers.toLocaleString()} followers | ${(artist.sources || []).length} sources`)
  }
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`)
  console.log(JSON.stringify({ output: OUTPUT, report: REPORT, count: built.length }, null, 2))
}

main()
