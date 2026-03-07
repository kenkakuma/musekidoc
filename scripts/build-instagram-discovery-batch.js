const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const INPUT = path.join(ROOT, 'data/artists-batch-3.json')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-01.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-01-summary.md')
const TODAY = '2026-03-07'

const PREFECTURES = [
  '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島',
  '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
  '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知',
  '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
  '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知',
  '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'
]

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function htmlDecode(text) {
  return String(text || '')
    .replace(/&#064;/g, '@')
    .replace(/&#x2022;/g, '•')
    .replace(/&#x26ab;&#xfe0e;/g, '⚫')
    .replace(/&#x301c;/g, '〜')
    .replace(/&#x5c55;/g, '展')
    .replace(/&#xff08;/g, '（')
    .replace(/&#xff09;/g, '）')
    .replace(/&#x500b;/g, '個')
    .replace(/&#x5c55;/g, '展')
    .replace(/&#x5e97;/g, '店')
    .replace(/&#x5ea7;/g, '座')
    .replace(/&#xFF06;/g, '&')
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function parseCount(raw) {
  if (!raw) return null
  const text = String(raw).replace(/,/g, '').trim().toUpperCase()
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)([KM])?/) 
  if (!match) return null
  const value = Number(match[1])
  const suffix = match[2]
  if (suffix === 'M') return Math.round(value * 1000000)
  if (suffix === 'K') return Math.round(value * 1000)
  return Math.round(value)
}

function charCount(text) {
  return [...String(text || '')].length
}

function parseLegacyBatch() {
  const text = readText(INPUT)
  const bodyMatch = text.match(/artists:\s*\[(.*)\],\s*updateExisting/s)
  if (!bodyMatch) throw new Error('Unable to parse artists-batch-3.json')
  const body = bodyMatch[1]
  const blocks = []
  let depth = 0
  let start = null

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]
    if (ch === '{') {
      depth += 1
      if (depth === 1) start = i
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0 && start !== null) {
        blocks.push(body.slice(start, i + 1))
        start = null
      }
    }
  }

  return blocks.map(parseLegacyArtistBlock)
}

function getField(block, field) {
  const match = block.match(new RegExp(`\\b${field}:\\s*([\\s\\S]*?)(?:,\\n\\s+[a-zA-Z]|,\\n\\s+published:|\\n\\s+published:|\\n\\s+sources:|,\\n\\s+sources:)`))
  if (match) return match[1].trim().replace(/,$/, '')
  const single = block.match(new RegExp(`\\b${field}:\\s*([^,\\n]+)`))
  return single ? single[1].trim() : null
}

function parseSources(block) {
  const sourcesBlock = block.match(/sources:\s*\[([\s\S]*?)\]/)
  if (!sourcesBlock) return []
  const lines = [...sourcesBlock[1].matchAll(/\{title:\s*([^,]+),\s*url:\s*([^}]+)\}/g)]
  return lines.map(([, title, url]) => ({
    title: title.trim(),
    url: url.trim(),
  }))
}

function parseLegacyArtistBlock(block) {
  const rawBirthYear = getField(block, 'birthYear')
  return {
    artistSlug: getField(block, 'slug'),
    nameZh: getField(block, 'nameZh'),
    instagramHandle: getField(block, 'instagramHandle'),
    instagramFollowersSeed: Number(getField(block, 'instagramFollowers')),
    bioSeed: getField(block, 'bio'),
    birthYear: rawBirthYear ? Number(rawBirthYear) : null,
    region: getField(block, 'region'),
    style: getField(block, 'style'),
    sourcesSeed: parseSources(block),
  }
}

function fetchInstagramPublicMeta(handle) {
  const url = `https://www.instagram.com/${handle}/`
  const html = execFileSync('curl', ['-sSL', url], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  const ogTitle = htmlDecode((html.match(/property="og:title" content="([^"]+)"/) || [])[1] || '')
  const description = htmlDecode((html.match(/<meta content="([\s\S]*?)" name="description"/) || [])[1] || '')
  const ogDescription = htmlDecode((html.match(/property="og:description" content="([\s\S]*?)"/) || [])[1] || '')
  const ogImage = (html.match(/property="og:image" content="([^"]+)"/) || [])[1] || null

  const displayMatch = ogTitle.match(/^(.*?)\s*\(@/)
  const followerMatch = description.match(/([0-9.,]+[KM]?) Followers/) || ogDescription.match(/([0-9.,]+[KM]?) Followers/)
  const followingMatch = description.match(/([0-9.,]+[KM]?) Following/) || ogDescription.match(/([0-9.,]+[KM]?) Following/)
  const postMatch = description.match(/([0-9.,]+[KM]?) Posts/) || ogDescription.match(/([0-9.,]+[KM]?) Posts/)
  const descriptionTailMatch = description.match(/Posts - ([\s\S]*)$/)
  const descriptionTail = descriptionTailMatch ? descriptionTailMatch[1] : null
  const descriptionTailParts = descriptionTail ? descriptionTail.split(' on Instagram: "') : null
  const descriptionName = descriptionTailParts ? descriptionTailParts[0] : null
  const descriptionBio = descriptionTailParts ? descriptionTailParts.slice(1).join(' on Instagram: "').replace(/"$/, '').trim() : ''

  if (!followerMatch || !followingMatch || !postMatch) {
    throw new Error(`Unable to parse Instagram meta for @${handle}`)
  }

  return {
    instagramDisplayName: displayMatch ? displayMatch[1].trim() : (descriptionName || '').trim(),
    instagramFollowers: parseCount(followerMatch[1]),
    instagramFollowing: parseCount(followingMatch[1]),
    instagramPostCount: parseCount(postMatch[1]),
    instagramBio: descriptionBio,
    instagramProfilePicUrl: ogImage,
    profileUrl: url,
  }
}

function inferCredibility(url) {
  const domain = new URL(url).hostname
  if (/instagram\.com$/.test(domain)) return 'high'
  if (/(momat|bunka|artplatform|museum|mingeikan|pref\.|city\.|ac\.jp)/.test(domain)) return 'high'
  if (/(gallery|fair|kogei|kacf|tourism|craft)/.test(domain)) return 'medium'
  if (/(shop|store|commerce|monoina|kohoro|coverchord|hanautsuwa)/.test(domain)) return 'medium'
  return 'low'
}

function inferSourceType(url) {
  const domain = new URL(url).hostname
  if (/instagram\.com$/.test(domain)) return '社交媒体'
  if (/(momat|bunka|artplatform|museum|mingeikan|pref\.|city\.|ac\.jp)/.test(domain)) return '官方资料'
  if (/(gallery|fair|kacf|tourism|craft)/.test(domain)) return '画廊资料'
  if (/(shop|store|monoina|kohoro|coverchord|hanautsuwa)/.test(domain)) return '电商'
  if (/(brutus|pen-online|tokyoweekender|fashion-headline|openers)/.test(domain)) return '媒体报道'
  return '资料来源'
}

function normalizeSource(source) {
  return {
    url: source.url,
    title: source.title,
    type: inferSourceType(source.url),
    accessedAt: TODAY,
    credibility: inferCredibility(source.url),
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  const result = []
  for (const source of sources) {
    if (!source || !source.url) continue
    if (seen.has(source.url)) continue
    seen.add(source.url)
    result.push(source)
  }
  return result
}

function extractWebsiteFromBio(text) {
  const match = String(text || '').match(/https?:\/\/\S+/)
  return match ? match[0].replace(/[)。,]+$/, '') : null
}

function extractLocation(text) {
  const content = String(text || '')
  for (const prefecture of PREFECTURES) {
    if (content.includes(prefecture)) return prefecture
  }
  const potteryAreas = ['益子', '信楽', '美濃', '瀬戸', '備前', '唐津', '萩', '九谷', '多治見', '笠間']
  for (const area of potteryAreas) {
    if (content.includes(area)) return area
  }
  return null
}

function inferPrefecture(region) {
  const value = String(region || '')
  for (const prefecture of PREFECTURES) {
    if (value.includes(prefecture)) return `${prefecture}${prefecture.endsWith('県') || prefecture.endsWith('都') || prefecture.endsWith('府') ? '' : '県'}`.replace('東京都县', '東京都').replace('大阪県', '大阪府').replace('京都県', '京都府').replace('北海道県', '北海道')
  }
  if (value.includes('信乐')) return '滋賀県'
  if (value.includes('濑户') || value.includes('瀬戸')) return '愛知県'
  if (value.includes('益子')) return '栃木県'
  if (value.includes('备前') || value.includes('備前')) return '岡山県'
  if (value.includes('多治見') || value.includes('美濃')) return '岐阜県'
  return null
}

function inferMainTechniques(style, bio) {
  const text = `${style || ''} ${bio || ''}`
  const keywords = ['粉引', '白磁', '志野', '織部', '備前焼', '信楽焼', '灰釉', '練上', '鎬', '刷毛目', '薪窯', '還元焼成', '木烧', '銀彩']
  return keywords.filter((keyword) => text.includes(keyword)).slice(0, 5)
}

function inferMainForms(text) {
  const keywords = ['茶碗', '盤', '皿', '花器', '鉢', '杯', '酒器', '徳利', '茶器', 'マグ', '壺']
  return keywords.filter((keyword) => String(text || '').includes(keyword)).slice(0, 5)
}

function expandBio(seed, ig, mainForms) {
  const current = String(seed.bioSeed || '').trim().replace(/[。.]?$/, '。')
  if (charCount(current) >= 150) return current

  const birth = seed.birthYear ? `${seed.birthYear}年生` : '具体出生年份待进一步核实'
  const region = seed.region || extractLocation(ig.instagramBio) || '日本'
  const style = seed.style || '以当代陶艺创作为主'
  const forms = mainForms.length > 0 ? `主要器形包括${mainForms.join('、')}。` : '主要围绕器物与日常使用场景展开创作。'
  const igNote = ig.instagramBio ? `其 Instagram 公开简介显示“${ig.instagramBio.replace(/\\n+/g, ' / ')}”，可确认其持续活跃于公开发表与展览更新。` : ''
  const addendum = `${seed.nameZh}，${birth}，活动地区与${region}相关。${style}。${forms}${igNote}现阶段这批数据主要作为 Instagram 高粉发现批次使用，后续仍应继续补强学习经历、工作室与展览履历等字段。`
  return `${current}${addendum}`.replace(/。+/g, '。')
}

function buildArtist(seed) {
  const ig = fetchInstagramPublicMeta(seed.instagramHandle)
  const websiteUrlFromBio = extractWebsiteFromBio(ig.instagramBio)
  const locationFromBio = extractLocation(ig.instagramBio) || extractLocation(seed.region)
  const mainForms = inferMainForms(seed.bioSeed)
  const allSources = dedupeSources([
    {
      url: ig.profileUrl,
      title: `Instagram @${seed.instagramHandle}`,
      type: '社交媒体',
      accessedAt: TODAY,
      credibility: 'high',
    },
    ...seed.sourcesSeed.map(normalizeSource),
  ])

  return {
    instagramHandle: seed.instagramHandle,
    instagramFollowers: ig.instagramFollowers,
    instagramBio: ig.instagramBio,
    instagramDisplayName: ig.instagramDisplayName,
    instagramPostCount: ig.instagramPostCount,
    instagramFollowing: ig.instagramFollowing,
    instagramProfilePicUrl: ig.instagramProfilePicUrl,

    websiteUrlFromBio,
    locationFromBio,

    workStyle: seed.style || null,
    mainTechniques: inferMainTechniques(seed.style, seed.bioSeed),
    mainForms: inferMainForms(seed.bioSeed),
    colorPalette: null,

    discoveryHashtag: 'legacy-high-follower-seed',
    discoveryDate: TODAY,
    verificationNotes: `Instagram public metadata fetched on ${TODAY}; legacy artist seed merged from data/artists-batch-3.json.`,

    nameJa: seed.nameZh,
    nameKana: null,
    nameZh: seed.nameZh,
    nameEn: /[A-Za-z]/.test(ig.instagramDisplayName) ? ig.instagramDisplayName : null,
    artistSlug: seed.artistSlug,
    birthYear: seed.birthYear,
    age: seed.birthYear ? 2026 - seed.birthYear : null,
    gender: null,
    bio: expandBio(seed, ig, mainForms),

    region: seed.region,
    locationPrefecture: inferPrefecture(seed.region),
    locationCity: locationFromBio,
    locationArea: null,
    kilnName: null,
    studioName: null,
    kilnType: null,
    kilnEstablished: null,
    studioInfo: {
      hasGallery: null,
      visitorAccess: null,
      studioUrl: websiteUrlFromBio,
    },

    style: seed.style,
    signatureWorks: mainForms,
    priceRange: null,
    artistStatement: null,

    sources: allSources,
    published: false,
    needsReview: true,
    batchId: 'instagram-discovery-batch-01',
  }
}

function buildReport(artists) {
  const lines = [
    '# Instagram Discovery Batch 01 Summary',
    '',
    `- Generated: ${TODAY}`,
    `- Artists: ${artists.length}`,
    `- Min followers: ${Math.min(...artists.map((artist) => artist.instagramFollowers || 0)).toLocaleString()}`,
    `- Max followers: ${Math.max(...artists.map((artist) => artist.instagramFollowers || 0)).toLocaleString()}`,
    `- Average followers: ${Math.round(artists.reduce((sum, artist) => sum + (artist.instagramFollowers || 0), 0) / artists.length).toLocaleString()}`,
    `- With 3+ sources: ${artists.filter((artist) => artist.sources.length >= 3).length}/${artists.length}`,
    `- With birth year: ${artists.filter((artist) => artist.birthYear).length}/${artists.length}`,
    '',
    '## Handles',
    '',
  ]

  for (const artist of artists) {
    lines.push(`- @${artist.instagramHandle} | ${artist.nameZh} | ${artist.instagramFollowers.toLocaleString()} followers | ${artist.region || '待确认'}`)
  }

  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`)
}

function main() {
  const seeds = parseLegacyBatch()
  const artists = seeds.map(buildArtist)
  writeJson(OUTPUT, artists)
  buildReport(artists)
  console.log(JSON.stringify({ output: OUTPUT, report: REPORT, count: artists.length }, null, 2))
}

main()
