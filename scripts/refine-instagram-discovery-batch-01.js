const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const BATCH_PATH = path.join(ROOT, 'data/discovered-instagram-artists-batch-01.json')
const DETAIL_PATH = path.join(ROOT, 'artists-detail-supplemented.json')
const REPORT_PATH = path.join(ROOT, 'data/discovered-instagram-artists-batch-01-summary.md')
const TODAY = '2026-03-07'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
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
    accessedAt: source.accessedAt || TODAY,
    credibility: source.credibility || inferCredibility(safeUrl),
  }
}

function mergeArtist(batchArtist, detailArtist) {
  const mergedSources = dedupeSources([
    ...(batchArtist.sources || []).map(normalizeSource),
    ...(detailArtist.sources || []).map(normalizeSource),
  ])

  return {
    ...batchArtist,
    nameZh: detailArtist.nameZh || batchArtist.nameZh,
    nameJa: detailArtist.nameJa || batchArtist.nameJa,
    nameEn: detailArtist.nameEn || batchArtist.nameEn,
    birthYear: detailArtist.birthYear ?? batchArtist.birthYear,
    deathYear: detailArtist.deathYear ?? batchArtist.deathYear ?? null,
    age: detailArtist.birthYear ? 2026 - detailArtist.birthYear : batchArtist.age,
    bio: detailArtist.bio || batchArtist.bio,
    region: detailArtist.region || batchArtist.region,
    style: detailArtist.style || batchArtist.style,
    kilnName: detailArtist.kilnName || batchArtist.kilnName,
    studioName: detailArtist.studioName || batchArtist.studioName,
    kilnType: detailArtist.kilnType || batchArtist.kilnType,
    locationPrefecture: detailArtist.locationPrefecture || batchArtist.locationPrefecture,
    locationCity: detailArtist.locationCity || batchArtist.locationCity,
    locationArea: detailArtist.locationArea || batchArtist.locationArea,
    instagramHandle: batchArtist.instagramHandle || detailArtist.instagramHandle,
    websiteUrl: detailArtist.websiteUrl || batchArtist.websiteUrl || null,
    studioInfo: {
      ...(batchArtist.studioInfo || {}),
      studioUrl: sanitizeUrl(detailArtist.websiteUrl) || sanitizeUrl(batchArtist.websiteUrlFromBio) || sanitizeUrl(batchArtist.websiteUrl) || null,
    },
    sources: mergedSources,
    verificationNotes: `${batchArtist.verificationNotes} Refined against artists-detail-supplemented.json on ${TODAY}.`,
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
    `- With 3+ sources: ${artists.filter((artist) => (artist.sources || []).length >= 3).length}/${artists.length}`,
    `- With birth year: ${artists.filter((artist) => artist.birthYear).length}/${artists.length}`,
    `- With kiln or studio name: ${artists.filter((artist) => artist.kilnName || artist.studioName).length}/${artists.length}`,
    '',
    '## Handles',
    '',
  ]

  for (const artist of artists) {
    lines.push(`- @${artist.instagramHandle} | ${artist.nameZh} | ${artist.instagramFollowers.toLocaleString()} followers | ${artist.region || '待确认'} | ${(artist.sources || []).length} sources`)
  }

  fs.writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`)
}

function main() {
  const batch = readJson(BATCH_PATH)
  const detail = Object.fromEntries(readJson(DETAIL_PATH).map((artist) => [artist.artistSlug, artist]))
  const refined = batch.map((artist) => detail[artist.artistSlug] ? mergeArtist(artist, detail[artist.artistSlug]) : artist)
  writeJson(BATCH_PATH, refined)
  buildReport(refined)
  console.log(JSON.stringify({ refined: refined.length, output: BATCH_PATH, report: REPORT_PATH }, null, 2))
}

main()
