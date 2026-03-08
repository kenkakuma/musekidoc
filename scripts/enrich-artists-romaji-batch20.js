const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const ARTISTS_PATH = path.join(ROOT, 'artists-detail-supplemented.json')
const PLAN_PATH = path.join(ROOT, 'data/artist-romaji-source-search-plan.json')
const BATCH_DIR = path.join(ROOT, 'data/artist-romaji-source-batches')
const TODAY = '2026-03-08'
const BATCH_SIZE = 20
const CURL_CONNECT_TIMEOUT_SEC = 4
const CURL_MAX_TIME_SEC = 8
const EXEC_TIMEOUT_MS = 10_000

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function ensureDir(filePath) {
  fs.mkdirSync(filePath, { recursive: true })
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

function runCurl(url) {
  try {
    return execFileSync('curl', [
      '-L',
      '-sS',
      '--connect-timeout',
      String(CURL_CONNECT_TIMEOUT_SEC),
      '--max-time',
      String(CURL_MAX_TIME_SEC),
      url,
    ], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: EXEC_TIMEOUT_MS,
    })
  } catch {
    return ''
  }
}

function fetchStatus(url) {
  try {
    return execFileSync('curl', [
      '-L',
      '-sS',
      '--connect-timeout',
      String(CURL_CONNECT_TIMEOUT_SEC),
      '--max-time',
      String(CURL_MAX_TIME_SEC),
      '-o',
      '/dev/null',
      '-w',
      '%{http_code}',
      url,
    ], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      timeout: EXEC_TIMEOUT_MS,
    }).trim()
  } catch {
    return '000'
  }
}

function extractDuckDuckGoLinks(html) {
  const links = []
  const uddgMatches = [...html.matchAll(/uddg=([^"&]+)/g)]
  for (const match of uddgMatches) {
    try {
      links.push(decodeURIComponent(match[1]))
    } catch {
      // ignore decode failures
    }
  }
  const directMatches = [...html.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"/g)]
  for (const match of directMatches) links.push(match[1])
  return [...new Set(links)]
}

function shouldSkipUrl(url) {
  const low = String(url || '').toLowerCase()
  if (!/^https?:\/\//.test(low)) return true
  if (low.includes('duckduckgo.com')) return true
  if (low.includes('instagram.com')) return true
  if (low.includes('facebook.com')) return true
  if (low.includes('x.com')) return true
  if (low.includes('twitter.com')) return true
  if (low.includes('youtube.com')) return true
  if (low.includes('/search?')) return true
  return false
}

function cleanNameForUrl(nameJa) {
  return String(nameJa || '')
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, '')
    .trim()
}

function inferSourceType(url) {
  const host = new URL(url).hostname
  if (/(museum|momat|bunka|pref\.|city\.|ac\.jp|go\.jp)/.test(host)) return '官方资料'
  if (/(gallery|galler|artfair|artplatform|artsy|moderne|mirviss|daiichiarts|kaikaikiki)/.test(host)) return '画廊资料'
  if (/(official|atelier|studio|pottery|ceramic|kiln|hattatoru|watanabe|ootanis)/.test(host)) return '作家官网'
  if (/(news|press|journal|paper|brutus|discover|asahi|value-press)/.test(host)) return '专题资料'
  return '专题资料'
}

function buildQuery(item) {
  const name = String(item.nameEn || '').trim()
  if (!name) return null
  return `"${name}" pottery profile official`
}

function searchTopSources(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const html = runCurl(url)
  if (!html) return []
  const links = extractDuckDuckGoLinks(html).filter((link) => !shouldSkipUrl(link))
  const picked = []
  for (const link of links) {
    const status = fetchStatus(link)
    if (status !== '200') continue
    picked.push(link)
    if (picked.length >= 3) break
  }
  return picked
}

function fallbackAuthoritativeSources(nameJa) {
  const cleaned = cleanNameForUrl(nameJa)
  if (!cleaned) return []
  const candidates = [
    {
      title: `Wikipedia - ${cleaned}`,
      url: `https://ja.wikipedia.org/wiki/${encodeURIComponent(cleaned)}`,
      type: '百科',
    },
    {
      title: `コトバンク - ${cleaned}`,
      url: `https://kotobank.jp/word/${encodeURIComponent(cleaned)}`,
      type: '辞书',
    },
  ]
  return candidates.filter((source) => fetchStatus(source.url) === '200')
}

function nextBatchId(existingFiles) {
  const ids = existingFiles
    .map((name) => {
      const m = name.match(/^batch-(\d+)-romaji-source\.json$/)
      return m ? Number(m[1]) : null
    })
    .filter((n) => Number.isFinite(n))
  const next = (ids.length ? Math.max(...ids) : 0) + 1
  return String(next).padStart(3, '0')
}

function main() {
  const artists = readJson(ARTISTS_PATH)
  const plan = readJson(PLAN_PATH)

  ensureDir(BATCH_DIR)
  const existingFiles = fs.readdirSync(BATCH_DIR)
  const batchId = nextBatchId(existingFiles)
  // Phase 1: ensure every artist is processed at least once.
  // Phase 2: once pending is exhausted, focus on attempted + sparse profiles.
  const pendingPool = plan.filter((item) => item.status === 'pending')
  const rerunPool = plan.filter((item) => {
    if (item.status !== 'attempted' && item.status !== 'completed') return false
    const sparse = !item.currentWebsiteUrl || !item.currentInstagramHandle || (item.currentSourceCount || 0) <= 3
    return item.status === 'attempted' || sparse
  }).sort((a, b) => {
    const statusRank = (item) => (item.status === 'attempted' ? 0 : 1)
    const rankDiff = statusRank(a) - statusRank(b)
    if (rankDiff !== 0) return rankDiff

    const batchA = Number(a.lastBatchId || 0)
    const batchB = Number(b.lastBatchId || 0)
    if (batchA !== batchB) return batchA - batchB

    return (b.priorityScore || 0) - (a.priorityScore || 0)
  })
  const target = (pendingPool.length > 0 ? pendingPool : rerunPool).slice(0, BATCH_SIZE)
  const phase = pendingPool.length > 0 ? 'pending-first-pass' : 'rerun-attempted-and-sparse'

  const batchResults = []
  const artistMap = new Map(artists.map((artist) => [artist.artistSlug, artist]))

  for (const item of target) {
    const query = buildQuery(item)
    const links = query ? searchTopSources(query) : []
    let pickedSource = links[0] ? {
      title: `Romaji search profile source - ${item.nameEn}`,
      url: links[0],
      accessedAt: TODAY,
      type: inferSourceType(links[0]),
    } : null
    if (!pickedSource) {
      const fallback = fallbackAuthoritativeSources(item.nameJa || '')
      if (fallback.length > 0) {
        pickedSource = {
          ...fallback[0],
          accessedAt: TODAY,
        }
      }
    }

    const artist = artistMap.get(item.artistSlug)
    if (artist && pickedSource) {
      artist.sources = dedupeSources([...(artist.sources || []), pickedSource])
      artist.patchNotes = [...new Set([...(artist.patchNotes || []), `罗马字检索批次${batchId}补充来源`])]
    }

    batchResults.push({
      artistSlug: item.artistSlug,
      nameJa: item.nameJa,
      nameEn: item.nameEn,
      query,
      candidateLinks: links,
      selectedSource: pickedSource,
      status: pickedSource ? 'updated' : 'no_source_found',
    })
  }

  const processedSet = new Set(target.map((item) => item.artistSlug))
  const updatedPlan = plan.map((item) => {
    if (!processedSet.has(item.artistSlug)) return item
    const result = batchResults.find((row) => row.artistSlug === item.artistSlug)
    return {
      ...item,
      status: result && result.selectedSource ? 'completed' : 'attempted',
      lastBatchId: batchId,
      lastUpdatedAt: TODAY,
      lastSelectedSource: result ? result.selectedSource : null,
      currentSourceCount: (() => {
        const artist = artistMap.get(item.artistSlug)
        return artist ? (artist.sources || []).length : item.currentSourceCount
      })(),
      currentWebsiteUrl: (() => {
        const artist = artistMap.get(item.artistSlug)
        return artist ? (artist.websiteUrl || null) : item.currentWebsiteUrl
      })(),
      currentInstagramHandle: (() => {
        const artist = artistMap.get(item.artistSlug)
        return artist ? (artist.instagramHandle || null) : item.currentInstagramHandle
      })(),
    }
  })

  writeJson(ARTISTS_PATH, artists)
  writeJson(PLAN_PATH, updatedPlan)

  const batchPath = path.join(BATCH_DIR, `batch-${batchId}-romaji-source.json`)
  writeJson(batchPath, batchResults)

  console.log(JSON.stringify({
    phase,
    batchId,
    batchSizeRequested: BATCH_SIZE,
    batchSizeActual: target.length,
    updatedCount: batchResults.filter((row) => row.status === 'updated').length,
    noSourceCount: batchResults.filter((row) => row.status === 'no_source_found').length,
    batchPath,
  }, null, 2))
}

main()
