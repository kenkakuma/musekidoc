const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ARTISTS_PATH = path.join(ROOT, 'artists-detail-supplemented.json')
const PLAN_PATH = path.join(ROOT, 'data/artist-romaji-source-search-plan.json')
const TODAY = '2026-03-08'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function normalizeSource(source) {
  if (!source || !source.url) return null
  return {
    title: source.title,
    url: source.url,
    accessedAt: source.accessedAt || TODAY,
    type: source.type || '专题资料',
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  const result = []
  for (const source of sources || []) {
    const normalized = normalizeSource(source)
    if (!normalized) continue
    if (seen.has(normalized.url)) continue
    seen.add(normalized.url)
    result.push(normalized)
  }
  return result
}

function buildRomajiQueries(artist) {
  const romaji = String(artist.nameEn || '').trim()
  if (!romaji) return []
  return [
    `"${romaji}" pottery official site`,
    `"${romaji}" profile ceramic artist`,
    `"${romaji}" instagram`,
    `"${romaji}" exhibition interview`,
  ]
}

const ARTIST_PATCHES = {
  'hatta-toru': {
    websiteUrl: 'https://hattatoru.com/',
    instagramHandle: 'toru_hatta',
    sources: [
      {
        title: 'HATTA TORU Official Profile',
        url: 'https://hattatoru.com/profile.html',
        type: '作家官网',
      },
      {
        title: 'HATTA TORU Official Website',
        url: 'https://hattatoru.com/',
        type: '作家官网',
      },
      {
        title: 'Instagram @toru_hatta',
        url: 'https://www.instagram.com/toru_hatta/',
        type: '社交媒体',
      },
    ],
    patchNotes: [
      '官方主页确认：大阪富田林与堺市双工房/穴窑',
      '官方主页确认：2022 年新增第二基穴窑',
    ],
  },
  'ueda-yuji': {
    sources: [
      {
        title: 'Art Collaboration Kyoto 2022 - Yuji Ueda',
        url: 'https://2022.a-c-k.jp/en/artworks/untitled-blum-poe-5/',
        type: '展讯媒体',
      },
      {
        title: 'Moderne Gallery - Yuji Ueda',
        url: 'https://modernegallery.com/artists/yuji-ueda/',
        type: '画廊资料',
      },
    ],
    patchNotes: [
      '罗马字检索补充：ACK 与海外画廊作家页',
    ],
  },
}

const OFFICIAL_TITLE_PATTERN = /(公式|official|作家官网)/i

function inferWebsiteFromOfficialSource(artist) {
  const source = (artist.sources || []).find((item) => OFFICIAL_TITLE_PATTERN.test(String(item.title || '')))
  if (!source || !source.url) return null
  return source.url
}

function enrichArtists() {
  const artists = readJson(ARTISTS_PATH)
  const updated = artists.map((artist) => {
    const patch = ARTIST_PATCHES[artist.artistSlug]
    if (!patch) return artist

    const mergedSources = dedupeSources([...(artist.sources || []), ...(patch.sources || [])])
    const inferredWebsite = inferWebsiteFromOfficialSource({ ...artist, sources: mergedSources })

    return {
      ...artist,
      websiteUrl: patch.websiteUrl || artist.websiteUrl || inferredWebsite || null,
      instagramHandle: patch.instagramHandle || artist.instagramHandle || null,
      sources: mergedSources,
      patchNotes: [...new Set([...(artist.patchNotes || []), ...(patch.patchNotes || [])])],
    }
  })

  const finalized = updated.map((artist) => {
    if (artist.websiteUrl) return artist
    const inferredWebsite = inferWebsiteFromOfficialSource(artist)
    if (!inferredWebsite) return artist
    return {
      ...artist,
      websiteUrl: inferredWebsite,
      patchNotes: [...new Set([...(artist.patchNotes || []), '根据官方来源标题自动回填 websiteUrl'])],
    }
  })

  writeJson(ARTISTS_PATH, finalized)
  return finalized
}

function buildPlan(artists) {
  function scorePriority(artist) {
    let score = 0
    if (!artist.websiteUrl) score += 3
    if (!artist.instagramHandle) score += 2
    const sourceCount = (artist.sources || []).length
    if (sourceCount <= 3) score += 2
    if (sourceCount <= 2) score += 3
    return score
  }

  const plan = artists.map((artist) => ({
    artistSlug: artist.artistSlug,
    nameJa: artist.nameJa || null,
    nameEn: artist.nameEn || null,
    currentWebsiteUrl: artist.websiteUrl || null,
    currentInstagramHandle: artist.instagramHandle || null,
    currentSourceCount: (artist.sources || []).length,
    priorityScore: scorePriority(artist),
    romajiQueries: buildRomajiQueries(artist),
    sourcePriority: [
      '作家官网/官方 profile',
      '博物馆/机构页面',
      '高质量采访或展讯文章',
      '画廊或电商页面（兜底）',
    ],
    status: 'pending',
  })).sort((a, b) => b.priorityScore - a.priorityScore)

  writeJson(PLAN_PATH, plan)
  return plan
}

function main() {
  const artists = enrichArtists()
  const plan = buildPlan(artists)

  const withRomaji = plan.filter((item) => item.romajiQueries.length > 0).length
  const patched = artists.filter((artist) => (artist.patchNotes || []).length > 0).length

  console.log(JSON.stringify({
    artistsPath: ARTISTS_PATH,
    planPath: PLAN_PATH,
    totalArtists: artists.length,
    artistsWithRomajiQueries: withRomaji,
    patchedArtists: patched,
  }, null, 2))
}

main()
