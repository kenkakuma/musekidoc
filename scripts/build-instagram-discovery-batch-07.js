const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-07.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-07-summary.md')
const TODAY = '2026-03-07'

const SEEDS = [
  {
    artistSlug: 'abe-shintaro',
    instagramHandle: 'shintaro_abe',
    nameJa: '阿部慎太朗',
    nameKana: 'あべ しんたろう',
    nameZh: '阿部慎太朗',
    nameEn: 'Shintaro Abe',
    birthYear: 1979,
    gender: 'male',
    region: '栃木县・益子',
    locationPrefecture: '栃木县',
    locationCity: '益子町',
    locationArea: '益子',
    style: '以粉引、白釉、花形轮廓与古器物感著称的益子器作家',
    bio: 'Shintaro Abe, born in 1979 and based in Mashiko, is one of the most recognizable contemporary Japanese potters working in tableware and vessel forms. Public shop and exhibition sources consistently emphasize his soft white surfaces, floral or scalloped silhouettes, delicate kohiki-like finish, and the way his work bridges everyday usability with antique sensibility. He is a strong discovery addition because he materially improves Mashiko coverage while comfortably exceeding the Instagram threshold.',
    sources: [
      { title: 'IDEE - Shintaro Abe Exhibition', url: 'https://www.idee.co.jp/shop/news/202412/shintaroabe.html', type: '展讯媒体' },
      { title: 'Utsuwa Hanada - 阿部慎太朗 作陶展', url: 'https://www.utsuwa-hanada.jp/hanada/gallery/saiji202511-02s/', type: '展讯媒体' },
      { title: 'Instagram @shintaro_abe', url: 'https://www.instagram.com/shintaro_abe/', type: '社交媒体' },
    ],
  },
  {
    artistSlug: 'teramura-kousuke',
    instagramHandle: 'kousuke.teramura',
    nameJa: '寺村光輔',
    nameKana: 'てらむら こうすけ',
    nameZh: '寺村光辅',
    nameEn: 'Kousuke Teramura',
    birthYear: 1978,
    gender: 'male',
    region: '京都出身・栃木县益子',
    locationPrefecture: '栃木县',
    locationCity: '益子町',
    locationArea: '益子',
    style: '以白灰釉、土感器形和生活器序列延展的益子日用陶',
    bio: 'Kousuke Teramura, born in 1978 in Kyoto and now working in Mashiko, is a contemporary Japanese ceramic artist whose profile links Kyoto training history with an established Mashiko production base. Public media, retail, and profile sources describe a practice centered on practical vessels, calm natural colors, and the tactile balance between clay body and glaze surface. He is especially useful for this discovery task because he strengthens the underrepresented Mashiko quota while already exceeding the Instagram follower requirement.',
    sources: [
      { title: 'The Local - Kousuke Teramura', url: 'https://thelocaljp.com/artists/', type: '专题资料' },
      { title: 'Kinarino Mall - 寺村光輔', url: 'https://mall.kinarino.jp/item-47006', type: '电商资料' },
      { title: 'OKA TOWN - 寺村光輔 器展', url: 'https://www.oka.town/pressrelease/16768/', type: '展讯媒体' },
      { title: 'Instagram @kousuke.teramura', url: 'https://www.instagram.com/kousuke.teramura/', type: '社交媒体' },
    ],
  },
  {
    artistSlug: 'shimura-kazuaki',
    instagramHandle: 'kazuakishimura',
    nameJa: '志村和晃',
    nameKana: 'しむら かずあき',
    nameZh: '志村和晃',
    nameEn: 'Kazuaki Shimura',
    birthYear: 1980,
    gender: 'male',
    region: '京都修业・千叶县南房总',
    locationPrefecture: '千叶县',
    locationCity: '南房総市',
    locationArea: null,
    style: '以京都、石川、益子修业背景整合成日用器和餐桌器皿语言的现代器作',
    bio: 'Kazuaki Shimura, born in 1980 and now based in Minamiboso, is a Japanese potter whose current practice follows training periods in Kyoto, Ishikawa, and Mashiko. Public profile and retail material consistently describe warm, table-oriented vessels intended to raise the emotional temperature of daily living. While his studio is now outside the four priority regions, his Kyoto and Mashiko training lineage plus follower count make him a pragmatic addition to the discovery dataset.',
    sources: [
      { title: 'Irodori Table - Kazuaki Shimura', url: 'https://irodori-table.com/en/collections/%E5%BF%97%E6%9D%91-%E5%92%8C%E6%99%83-%E3%81%97%E3%82%80%E3%82%89-%E3%81%8B%E3%81%9A%E3%81%82%E3%81%8D', type: '电商资料' },
      { title: 'Niwanowa - 志村和晃 展', url: 'https://niwanowa.info/sorekara/shimura_kazuaki_ten/', type: '展讯媒体' },
      { title: 'Instagram @kazuakishimura', url: 'https://www.instagram.com/kazuakishimura/', type: '社交媒体' },
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
  if (/(idee|utsuwa-hanada|thelocaljp|kinarino|oka\.town|irodori-table|niwanowa)/.test(domain)) return 'medium'
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
  const forms = ['pot', 'vessel', 'plate', 'mug', 'flower', '花器', '皿', '器']
  return forms.filter((item) => String(text || '').toLowerCase().includes(String(item).toLowerCase())).slice(0, 5)
}

function main() {
  const built = []
  for (const seed of SEEDS) {
    const ig = fetchInstagramPublicMeta(seed.instagramHandle)
    if (!ig.instagramFollowers || ig.instagramFollowers < 10000) continue
    const sources = dedupeSources(seed.sources.map(normalizeSource))
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
      discoveryHashtag: 'regional-artist-recovery',
      discoveryDate: TODAY,
      verificationNotes: `Public Instagram metadata fetched on ${TODAY}; candidate seeded from current public regional ceramic profiles and exhibition sources.`,
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
        studioUrl: null,
      },
      style: seed.style,
      signatureWorks: mainFormsFromText(seed.bio),
      priceRange: null,
      artistStatement: null,
      sources,
      published: false,
      needsReview: true,
      batchId: 'instagram-discovery-batch-07',
    })
  }

  built.sort((a, b) => b.instagramFollowers - a.instagramFollowers)
  writeJson(OUTPUT, built)

  const lines = [
    '# Instagram Discovery Batch 07 Summary',
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
