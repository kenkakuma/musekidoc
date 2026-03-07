const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-02.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-02-summary.md')
const DETAIL_PATH = path.join(ROOT, 'artists-detail-supplemented.json')
const TODAY = '2026-03-07'

const SEEDS = [
  {
    artistSlug: 'kurokawa-toru',
    instagramHandle: 'kurokawa_toru_',
    nameJa: '黒川徹',
    nameZh: '黑川徹',
    nameEn: 'Kurokawa Toru',
    sources: [
      { title: 'N\'so Kyoto - 艺术家介绍', url: 'https://nsokyoto.art/members/toru-kurokawa/', type: '专题资料' },
      { title: 'Garland Magazine 专访', url: 'https://garlandmag.com/toru-kuwakawa/', type: '专题资料' },
      { title: 'Art Platform Japan 黒川徹', url: 'https://artplatform.go.jp/ja/collections/W641807', type: '机构资料' },
    ],
  },
  {
    artistSlug: 'iguchi-daisuke',
    instagramHandle: 'daisuke_igucci',
    nameJa: '井口大輔',
    nameZh: '井口大辅',
    nameEn: 'Iguchi Daisuke',
    sources: [
      { title: 'EHC Art - 艺术家档案', url: 'https://ehc.art/artists/daisuke-iguchi', type: '专题资料' },
      { title: '真冈市文化大使', url: 'https://www.city.moka.lg.jp/kakuka/hishokoho/gyomu/1/ambassador/13878.html', type: '官方资料' },
    ],
  },
  {
    artistSlug: 'yamada-yukico',
    instagramHandle: 'yy_pottery',
    nameJa: '山田由起子',
    nameZh: '山田由起子',
    nameEn: 'Yukico Yamada',
    birthYear: null,
    region: '京都→丹波',
    style: '受自然景观启发的极简、粗犷陶艺，强调手筑与细腻釉面',
    bio: 'Yukico Yamada is a Japan-based ceramic artist associated with Kyoto and Tamba. Her work emphasizes earthy, brutalist silhouettes, hand-built asymmetry, and quiet natural observation. Public gallery material describes her practice as drawing on rural Osaka roots and the landscapes around her studio, while international exhibitions and gallery representation indicate active circulation in both Japan and Europe.',
    sources: [
      { title: 'Maud and Mabel - Yukico Yamada', url: 'https://maudandmabel.com/collections/yukico-yamada', type: '画廊资料' },
      { title: 'Maud and Mabel - Koto no Ha', url: 'https://maudandmabel.com/blogs/events/koto-no-ha-a-solo-exhibition-of-works-by-yukico-yamada', type: '展讯媒体' },
      { title: 'Volume Ceramics - Yukico Yamada', url: 'https://volumeceramics.com/en/collections/yukico-yamada', type: '画廊资料' },
    ],
  },
  {
    artistSlug: 'anayama-daisuke',
    instagramHandle: 'ana0929',
    nameJa: '穴山大輔',
    nameZh: '穴山大辅',
    nameEn: 'Daisuke Anayama',
    birthYear: 1981,
    region: '爱知县濑户市',
    style: '以达摩、黑陶与景观记忆为主题的当代濑户陶艺',
    bio: 'Daisuke Anayama, born in 1981, is a Japanese ceramic artist based in Seto, Aichi. Public sources describe him as the director of SUIYO and a maker whose pottery reflects landscapes, stones, and memory through black pottery and hand-formed Daruma motifs. His work circulates through artist platforms and galleries, and is presented as a contemporary evolution of classic Japanese ceramic language.',
    sources: [
      { title: 'Daisuke Anayama 官方网站', url: 'https://anayama0929.wixsite.com/website', type: '作家官网' },
      { title: 'IPPIN PROJECT - SUIYO', url: 'https://www.ippinproject.com/suiyo', type: '专题资料' },
      { title: 'Galerie 21 - Ko-Daruma by Daisuke Anayama', url: 'https://www.galerie21.online/product-page/ko-daruma-by-daisuke-anayama-1-1', type: '画廊资料' },
    ],
  },
  {
    artistSlug: 'suzuki-takashi-daidai',
    instagramHandle: 'kobo_daidai',
    nameJa: '鈴木隆',
    nameZh: '铃木隆',
    nameEn: 'Suzuki Takashi',
    birthYear: null,
    region: '神奈川县小田原',
    style: '以みかん灰釉、青瓷与日用器为主的小田原陶艺',
    bio: 'Suzuki Takashi is a Japanese ceramic artist based in Odawara and the founder of Kōbō Daidai. Public exhibition and commerce material consistently highlights his mikan ash glaze, translucent blue-green celadon, and practical tableware forms. His work is tied to local citrus ash materials and is frequently shown in gallery-style exhibitions and specialist ceramic retail contexts.',
    sources: [
      { title: '大人の焼き物 - 工房橙 作家 鈴木隆', url: 'https://otonayaki.com/collections/takashi_suzuki', type: '电商' },
      { title: 'Tokyo Art Beat - 鈴木隆 作陶展', url: 'https://www.tokyoartbeat.com/events/-/Takashi-Suzuki-Exhibition/gallery-jiyugaoka/2024-12-05', type: '展讯媒体' },
      { title: 'Table Times - 鈴木隆', url: 'https://www.tabletimes.jp/feature_saenosweets/', type: '生活方式媒体' },
    ],
  },
  {
    artistSlug: 'koga-takahiro',
    instagramHandle: 'takahiro00koga',
    nameJa: '古賀崇洋',
    nameZh: '古贺崇洋',
    nameEn: 'Takahiro Koga',
    birthYear: 1987,
    region: '福冈→鹿儿岛',
    style: '“反侘寂 / NEO WABI-SABI” 概念下的强烈视觉陶艺',
    bio: 'Takahiro Koga, born in 1987, is a contemporary Japanese ceramic artist known for his studded porcelain works, armor-inspired sake vessels, and the concept of anti-wabi-sabi or neo-wabi-sabi. Official and institutional material places him in dialogue with tea culture, pop culture, and contemporary craft platforms, while recent exhibitions show sustained visibility in Japan and abroad.',
    sources: [
      { title: '古賀崇洋 官方 About', url: 'https://takahirokoga.jp/about/', type: '作家官网' },
      { title: 'B-OWND Takahiro Koga Solo Exhibition', url: 'https://hs.b-ownd.com/takahirokoga-get-stand-up', type: '展讯媒体' },
      { title: 'Tanseisha Release - Takahiro Koga', url: 'https://www.tanseisha.co.jp/en/news/release/2021/post-37967', type: '官方资料' },
      { title: 'J-WAVE News - Takahiro Koga', url: 'https://news.j-wave.co.jp/2019/11/1110-one-ok-rocktakam-floverbal.html', type: '媒体报道' },
    ],
  },
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
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
  const first = text.split(/\s+\/\s+|\s+/)[0]
  try {
    return new URL(first).toString()
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
  if (/(momat|bunka|artplatform|museum|mingeikan|pref\.|city\.|ac\.jp|tanseisha)/.test(domain)) return 'high'
  if (/(gallery|fair|kogei|kacf|tourism|craft|b-ownd|maudandmabel)/.test(domain)) return 'medium'
  if (/(shop|store|commerce|monoina|kohoro|coverchord|hanautsuwa|otonayaki|galerie21|ippinproject)/.test(domain)) return 'medium'
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
  const forms = ['茶碗', '皿', '盘', '花器', '鉢', '杯', '酒器', '徳利', '壶', 'マグ']
  return forms.filter((item) => String(text || '').includes(item)).slice(0, 5)
}

function main() {
  const details = fs.existsSync(DETAIL_PATH)
    ? Object.fromEntries(readJson(DETAIL_PATH).map((artist) => [artist.artistSlug, artist]))
    : {}

  const built = []
  for (const seed of SEEDS) {
    const ig = fetchInstagramPublicMeta(seed.instagramHandle)
    if (!ig.instagramFollowers || ig.instagramFollowers < 10000) continue
    const detail = details[seed.artistSlug] || {}
    const sources = dedupeSources([
      normalizeSource({ url: ig.profileUrl, title: `Instagram @${seed.instagramHandle}`, type: '社交媒体' }),
      ...seed.sources.map(normalizeSource),
      ...(detail.sources || []).map(normalizeSource),
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
      workStyle: detail.style || seed.style || null,
      mainTechniques: [],
      mainForms: mainFormsFromText(detail.bio || seed.bio),
      colorPalette: null,
      discoveryHashtag: 'web-search-seed',
      discoveryDate: TODAY,
      verificationNotes: `Public Instagram metadata fetched on ${TODAY}; candidate seeded from web search and local pottery data where available.`,
      nameJa: detail.nameJa || seed.nameJa,
      nameKana: null,
      nameZh: detail.nameZh || seed.nameZh,
      nameEn: detail.nameEn || seed.nameEn,
      artistSlug: seed.artistSlug,
      birthYear: detail.birthYear ?? seed.birthYear ?? null,
      age: (detail.birthYear ?? seed.birthYear) ? 2026 - (detail.birthYear ?? seed.birthYear) : null,
      gender: null,
      bio: detail.bio || seed.bio,
      region: detail.region || seed.region || null,
      locationPrefecture: detail.locationPrefecture || null,
      locationCity: detail.locationCity || null,
      locationArea: detail.locationArea || null,
      kilnName: detail.kilnName || null,
      studioName: detail.studioName || null,
      kilnType: detail.kilnType || null,
      kilnEstablished: null,
      studioInfo: {
        hasGallery: null,
        visitorAccess: null,
        studioUrl: sanitizeUrl(detail.websiteUrl) || null,
      },
      style: detail.style || seed.style || null,
      signatureWorks: mainFormsFromText(detail.bio || seed.bio),
      priceRange: null,
      artistStatement: null,
      sources,
      published: false,
      needsReview: true,
      batchId: 'instagram-discovery-batch-02',
    })
  }

  writeJson(OUTPUT, built)
  const lines = [
    '# Instagram Discovery Batch 02 Summary',
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
