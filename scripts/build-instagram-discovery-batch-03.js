const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const DETAIL_PATH = path.join(ROOT, 'artists-detail-supplemented.json')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-batch-03.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-batch-03-summary.md')
const TODAY = '2026-03-07'

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

function mainFormsFromText(text) {
  const forms = ['茶碗', '皿', '盘', '花器', '鉢', '杯', '酒器', '徳利', '壶', 'マグ']
  return forms.filter((item) => String(text || '').includes(item)).slice(0, 5)
}

function isValidHandle(handle) {
  return /^[A-Za-z0-9._]+$/.test(String(handle || ''))
}

function main() {
  const details = readJson(DETAIL_PATH)
  const covered = new Set()
  for (const file of ['data/discovered-instagram-artists-batch-01.json', 'data/discovered-instagram-artists-batch-02.json']) {
    const full = path.join(ROOT, file)
    if (!fs.existsSync(full)) continue
    for (const artist of readJson(full)) covered.add(artist.instagramHandle)
  }

  const built = []
  for (const detail of details) {
    const handle = detail.instagramHandle
    if (!handle || covered.has(handle) || !isValidHandle(handle)) continue
    const ig = fetchInstagramPublicMeta(handle)
    if (!ig.instagramFollowers || ig.instagramFollowers < 10000) continue
    const sources = dedupeSources([
      normalizeSource({ url: ig.profileUrl, title: `Instagram @${handle}`, type: '社交媒体' }),
      ...(detail.sources || []).map(normalizeSource),
    ])
    built.push({
      instagramHandle: handle,
      instagramFollowers: ig.instagramFollowers,
      instagramBio: ig.instagramBio,
      instagramDisplayName: ig.instagramDisplayName,
      instagramPostCount: ig.instagramPostCount,
      instagramFollowing: ig.instagramFollowing,
      instagramProfilePicUrl: ig.instagramProfilePicUrl,
      websiteUrlFromBio: null,
      locationFromBio: null,
      workStyle: detail.style || null,
      mainTechniques: [],
      mainForms: mainFormsFromText(detail.bio),
      colorPalette: null,
      discoveryHashtag: 'detail-handle-scan',
      discoveryDate: TODAY,
      verificationNotes: `Handle scanned from artists-detail-supplemented.json and Instagram public metadata fetched on ${TODAY}.`,
      nameJa: detail.nameJa,
      nameKana: null,
      nameZh: detail.nameZh,
      nameEn: detail.nameEn,
      artistSlug: detail.artistSlug,
      birthYear: detail.birthYear,
      age: detail.birthYear ? 2026 - detail.birthYear : null,
      gender: null,
      bio: detail.bio,
      region: detail.region,
      locationPrefecture: detail.locationPrefecture,
      locationCity: detail.locationCity,
      locationArea: detail.locationArea,
      kilnName: detail.kilnName,
      studioName: detail.studioName,
      kilnType: detail.kilnType,
      kilnEstablished: null,
      studioInfo: {
        hasGallery: null,
        visitorAccess: null,
        studioUrl: sanitizeUrl(detail.websiteUrl) || null,
      },
      style: detail.style,
      signatureWorks: mainFormsFromText(detail.bio),
      priceRange: null,
      artistStatement: null,
      sources,
      published: false,
      needsReview: true,
      batchId: 'instagram-discovery-batch-03',
    })
  }

  built.sort((a, b) => b.instagramFollowers - a.instagramFollowers)
  writeJson(OUTPUT, built)
  const lines = [
    '# Instagram Discovery Batch 03 Summary',
    '',
    `- Generated: ${TODAY}`,
    `- Artists: ${built.length}`,
    `- Min followers: ${built.length ? Math.min(...built.map((artist) => artist.instagramFollowers || 0)).toLocaleString() : 0}`,
    `- Max followers: ${built.length ? Math.max(...built.map((artist) => artist.instagramFollowers || 0)).toLocaleString() : 0}`,
    '',
    '## Handles',
    '',
  ]
  for (const artist of built) lines.push(`- @${artist.instagramHandle} | ${artist.nameZh} | ${artist.instagramFollowers.toLocaleString()} followers | ${(artist.sources || []).length} sources`)
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`)
  console.log(JSON.stringify({ output: OUTPUT, report: REPORT, count: built.length }, null, 2))
}

main()
