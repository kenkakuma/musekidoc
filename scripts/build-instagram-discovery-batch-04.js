const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-04.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-04-summary.md')
const TODAY = '2026-03-07'

const SEEDS = [
  {
    artistSlug: 'iwamura-en',
    instagramHandle: 'eniwamura',
    nameJa: '岩村遠',
    nameZh: '岩村远',
    nameEn: 'En Iwamura',
    birthYear: 1988,
    gender: 'male',
    region: '京都出身・滋贺县信乐',
    locationPrefecture: '滋贺县',
    locationCity: '甲贺市',
    locationArea: '信乐町',
    style: '以 Ma、埴轮、绳文与当代雕塑语汇交织的大型陶雕创作',
    bio: 'En Iwamura, born in 1988 in Kyoto, is a contemporary Japanese ceramic sculptor now based in Shigaraki. Public museum and gallery sources consistently place his practice between contemporary sculpture and ceramic discourse, with recurring reference to the Japanese concept of Ma, Jomon line work, and playful mask-like or biomorphic forms. His profile shows strong international visibility through museums, galleries, and residency programs while remaining rooted in Japanese clay culture.',
    sources: [
      { title: 'En Iwamura Official Website', url: 'https://en-iwamura.com/', type: '作家官网' },
      { title: 'Ross + Kramer - En Iwamura', url: 'https://www.rkgallery.com/artists/en-iwamura/', type: '画廊资料' },
      { title: 'AMOCA - En Iwamura: Legacy in the Vault', url: 'https://www.amoca.org/past-exhibitions/eniwamura/', type: '机构资料' },
    ],
  },
  {
    artistSlug: 'yamamoto-masahiko',
    instagramHandle: 'masayama.kai',
    nameJa: '山本雅彦',
    nameZh: '山本雅彦',
    nameEn: 'Masahiko Yamamoto',
    birthYear: 1981,
    gender: 'male',
    region: '奈良县曽尔村',
    locationPrefecture: '奈良县',
    locationCity: '曽尔村',
    locationArea: null,
    style: '以采土、原始信仰和器形实验连接当代器物与古代感性的奈良陶艺',
    bio: 'Masahiko Yamamoto, born in 1981 in Takatori, Nara, is a ceramic artist currently based in Soni Village. Recent exhibition and sales material describe a practice grounded in digging and testing clays from many parts of Japan, then translating animistic and ethnographic sensibilities into hand-built vessels and sculptural forms. His biography shows a clear Nara lineage, formal ceramic training, and an increasingly international presentation context that extends beyond conventional utilitarian pottery.',
    sources: [
      { title: 'vowi - Masahiko Yamamoto Exhibition: Contemporary Animism', url: 'https://vowi.us/etn/masahiko-yamamoto-exhibition-contemporary-animism/', type: '展讯媒体' },
      { title: 'Maud and Mabel - Masahiko Yamamoto Feldspar Tsubo', url: 'https://maudandmabel.com/products/masahiko-yamamoto-feldspar-tsubo', type: '画廊资料' },
      { title: 'Utsuwa YuuYuu - 山本雅彦 珊瑚釉六角皿', url: 'https://www.utsuwayayuuyuu.com/SHOP/MY-072.html', type: '电商资料' },
    ],
  },
  {
    artistSlug: 'shinohara-nozomu',
    instagramHandle: 'shin3kibou',
    nameJa: '篠原希',
    nameZh: '篠原希',
    nameEn: 'Nozomu Shinohara',
    birthYear: 1972,
    gender: 'male',
    region: '大阪出身・滋贺县信乐',
    locationPrefecture: '滋贺县',
    locationCity: '甲贺市',
    locationArea: '信乐町',
    style: '以穴窑木烧、火色、灰被与信乐土实验推动当代信乐烧表达',
    bio: 'Nozomu Shinohara, born in 1972 in Osaka and based in Shigaraki, is a veteran wood-fire ceramic artist centered on anagama firing. Current gallery and exhibition sources describe a practice focused on pushing Shigaraki clay beyond expected limits, using fire, ash, and clay melt behavior to generate irregular forms, biidoro surfaces, and vivid yakishime landscapes. His long activity in Shigaraki and recognition as a traditional craftsman position him as a strong bridge between regional kiln culture and contemporary collector demand.',
    sources: [
      { title: 'PAKUPAKUAN - SHINOHARA Nozomu', url: 'https://pakupakuan.jp/exhibition/sukiyanen.html', type: '画廊资料' },
      { title: 'Tosei Kyoto Gallery - 篠原希 個展', url: 'https://www.gallerytosei.com/kyoto/exhibitions/exhibitions-2219/', type: '展讯媒体' },
    ],
  },
  {
    artistSlug: 'uchida-midori',
    instagramHandle: 'uchidamidori',
    nameJa: '内田翠',
    nameZh: '内田翠',
    nameEn: 'Midori Uchida',
    birthYear: 1983,
    gender: 'female',
    region: '兵库出身・岐阜县',
    locationPrefecture: '岐阜县',
    locationCity: null,
    locationArea: null,
    style: '以炭化烧成、烧締与手筑造形描绘内在风景的当代陶艺',
    bio: 'Midori Uchida, born in 1983 in Kobe, studied ceramics at Osaka University of Arts and completed the Tajimi City Pottery Design and Technical Center program before establishing her practice in Gifu. Gallery material consistently emphasizes carbonization firing, hand-built unglazed forms, and an interest in capturing inner landscapes through kiln phenomena. Her exhibition record shows sustained visibility in Gifu, Tokyo, Kyoto, and art-fair contexts, making her a strong female candidate aligned with the task card’s contemporary focus.',
    sources: [
      { title: 'GALLERY crossing - Midori UCHIDA', url: 'https://gallerycrossing.com/en/artists/midori-uchida', type: '画廊资料' },
      { title: 'GALLERY crossing - Inner Landscape', url: 'https://gallerycrossing.com/en/exhibitions/midoriuchida2024', type: '展讯媒体' },
      { title: 'Tokyo Art Beat - Midori Uchida Trace of the Wind', url: 'https://www.tokyoartbeat.com/en/events/-/Midori-Uchida-Trace-of-the-Wind/gallery-crossing/2025-11-08', type: '展讯媒体' },
    ],
  },
  {
    artistSlug: 'abe-haruya',
    instagramHandle: 'abe_haruya',
    nameJa: '阿部春弥',
    nameZh: '阿部春弥',
    nameEn: 'Haruya Abe',
    birthYear: 1982,
    gender: 'male',
    region: '长野县上田市',
    locationPrefecture: '长野县',
    locationCity: '上田市',
    locationArea: null,
    style: '以阳刻、面取、蜂巢纹与白磁系器物闻名的高传播度器作家',
    bio: 'Haruya Abe, born in 1982 in Sanada, Nagano, is a Japanese potter whose videos and process documentation have given him unusually high visibility on Instagram. His official profile and media coverage trace a practice rooted in formal ceramic training, apprenticeship under Bizen potter Ide Yamamoto, and independent work in Ueda since 2004. The work itself is associated with refined relief carving, faceting, clean silhouettes, and highly shareable making videos, which helps explain the scale of his social following relative to peers.',
    sources: [
      { title: 'Haruya Abe Official Site', url: 'https://haruyaabe.com/', type: '作家官网' },
      { title: 'Haruya Abe About', url: 'https://haruyaabe.com/about/', type: '作家官网' },
      { title: 'My Modern Met - Abe Haruya', url: 'https://mymodernmet.com/abe-haruya-japanese-pottery-videos/', type: '媒体报道' },
      { title: 'The Local - Haruya Abe', url: 'https://thelocaljp.com/artists/', type: '专题资料' },
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
  if (/(amoca|museum|ac\.jp|official|gov|edu)/.test(domain)) return 'high'
  if (/(gallery|artbeat|woawgallery|rkgallery|maudandmabel|wadagarou|crossing|pakupakuan|tosei|thelocaljp|mymodernmet|vowi)/.test(domain)) return 'medium'
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
  const forms = ['茶碗', '皿', '盘', '花器', '鉢', '杯', '酒器', '徳利', '壶', 'マグ', 'vessel', 'sculpture']
  return forms.filter((item) => String(text || '').toLowerCase().includes(String(item).toLowerCase())).slice(0, 5)
}

function mainTechniquesFromStyle(text) {
  const mapping = [
    ['木烧', 'wood firing'],
    ['穴窑', 'anagama'],
    ['烧締', 'yakishime'],
    ['炭化烧成', 'carbonization firing'],
    ['手筑', 'hand-building'],
    ['盘筑', 'coil building'],
    ['阳刻', 'relief carving'],
    ['面取', 'faceting'],
  ]
  return mapping.filter(([needle]) => String(text || '').includes(needle)).map(([, value]) => value)
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
      mainTechniques: mainTechniquesFromStyle(seed.style),
      mainForms: mainFormsFromText(seed.bio),
      colorPalette: null,
      discoveryHashtag: 'regional-artist-web-search',
      discoveryDate: TODAY,
      verificationNotes: `Public Instagram metadata fetched on ${TODAY}; seeded from external ceramic media, gallery, and official artist pages.`,
      nameJa: seed.nameJa,
      nameKana: null,
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
      batchId: 'instagram-discovery-batch-04',
    })
  }

  built.sort((a, b) => b.instagramFollowers - a.instagramFollowers)
  writeJson(OUTPUT, built)

  const lines = [
    '# Instagram Discovery Batch 04 Summary',
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
