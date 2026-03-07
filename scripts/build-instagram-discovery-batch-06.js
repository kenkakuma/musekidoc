const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-06.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-06-summary.md')
const TODAY = '2026-03-07'

const SEEDS = [
  {
    artistSlug: 'otani-tetsuya-alt-instagram',
    instagramHandle: 'otntty',
    nameJa: '大谷哲也',
    nameKana: 'おおたに てつや',
    nameZh: '大谷哲也',
    nameEn: 'Otani Tetsuya',
    birthYear: 1971,
    gender: 'male',
    region: '滋贺县・信乐',
    locationPrefecture: '滋賀県',
    locationCity: '甲賀市',
    locationArea: '信楽町田代',
    style: '白磁、灰釉、信乐系生活器',
    bio: 'Tetsuya Otani, born in 1971 and based in Shigaraki, is one of the best-known makers associated with everyday pottery from the Otani Pottery Studio context. Local studio, shop, and exhibition materials describe a practice centered on white tableware, earthenware cooking pots, and quietly refined vessel forms rooted in Shigaraki materials. This record is included because the artist-operated account @otntty has significantly higher reach than the studio account previously normalized into the database, and it clearly represents the same ceramic author.',
    sources: [
      { title: 'Otani Pottery Studio', url: 'https://ootanis.com/', type: '作家官网' },
      { title: 'OKAZ DESIGN - 大谷哲也', url: 'https://shop.okaz-design.jp/store/%E5%A4%A7%E8%B0%B7%E5%93%B2%E4%B9%9F-c119714013', type: '专题资料' },
      { title: 'Instagram @otntty', url: 'https://www.instagram.com/otntty/', type: '社交媒体' },
    ],
  },
  {
    artistSlug: 'kobayashi-tetsuya-seto',
    instagramHandle: 'tcovayaci',
    nameJa: '小林徹也',
    nameKana: 'こばやし てつや',
    nameZh: '小林徹也',
    nameEn: 'Tetsuya Kobayashi',
    birthYear: 1979,
    gender: 'male',
    region: '爱知县濑户市',
    locationPrefecture: '爱知县',
    locationCity: '濑户市',
    locationArea: '濑户',
    style: '以赤土、木灰釉、粉引和焼締构成的濑户系日用器',
    bio: 'Tetsuya Kobayashi, born in 1979 and based in Seto, Aichi, is a contemporary Japanese ceramic artist whose current public profile combines strong Instagram visibility with gallery and retail circulation. Public exhibition and commerce sources place him in Seto after completing ceramic training in Aichi, and describe work made with iron-rich red clay, natural wood ash glaze, kohiki, rust glaze, and unglazed yakishime. The account is useful for the discovery set because it strengthens Mino-Seto coverage with a clearly identified working potter whose follower count now exceeds the task threshold.',
    sources: [
      { title: 'vowi - Tetsuya Kobayashi Exhibition', url: 'https://vowi.us/etn/tetsuya-kobayashi-exhibition/', type: '展讯媒体' },
      { title: 'CIBONE - Tetsuya Kobayashi', url: 'https://cibone-us.com/products/2206437016098', type: '画廊资料' },
      { title: 'Brutal Ceramics - Tetsuya Kobayashi', url: 'https://brutalceramics.com/en/products/assiette-creuse-en-gres-d-14-5cm-vert-clair-tetsuya-kobayashi', type: '画廊资料' },
    ],
  },
  {
    artistSlug: 'sakaguchi-chika-cyilabo',
    instagramHandle: 'cyilabo',
    nameJa: '坂口知香',
    nameKana: 'さかぐち ちか',
    nameZh: '坂口知香',
    nameEn: 'Chika Sakaguchi',
    birthYear: null,
    gender: 'female',
    region: '和歌山出身・大阪育ち',
    locationPrefecture: '大阪府',
    locationCity: null,
    locationArea: null,
    style: '以动物主题陶器、玻璃绘付与立体插画交织的跨媒介陶艺创作',
    bio: 'Chika Sakaguchi, working under the name CYILABO, is a Japanese ceramic artist and illustrator whose public profile is substantially larger than most independent pottery makers. Her official profile states that she studied ceramics at Kyoto City University of Arts, established Atelier CYILABO after graduation, and has worked across ceramic vessels, three-dimensional illustration, glass painting, and related objects since the early 2000s. While broader in medium than a strictly utilitarian potter, she remains clearly grounded in Japanese ceramic practice and helps improve female coverage in the discovery set.',
    sources: [
      { title: 'CYILABO Official About', url: 'https://cyilabo.com/about.htm', type: '作家官网' },
      { title: 'CYILABO Official Website', url: 'https://cyilabo.com/', type: '作家官网' },
      { title: 'ValuePress - CYILABO collaboration release', url: 'https://www.value-press.com/pressrelease/354692', type: '媒体报道' },
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
  if (/(cibone|brutalceramics|vowi|value-press|san-ei-corp|okaz-design|ootanis|cyilabo)/.test(domain)) return 'medium'
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
      discoveryHashtag: 'missed-handle-and-directory-recovery',
      discoveryDate: TODAY,
      verificationNotes: `Public Instagram metadata fetched on ${TODAY}; candidate seeded from recovered alternate handles and public directory-backed sources.`,
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
      batchId: 'instagram-discovery-batch-06',
    })
  }

  built.sort((a, b) => b.instagramFollowers - a.instagramFollowers)
  writeJson(OUTPUT, built)

  const lines = [
    '# Instagram Discovery Batch 06 Summary',
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
