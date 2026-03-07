const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const INPUTS = fs.readdirSync(path.join(ROOT, 'data'))
  .filter((name) => /^discovered-instagram-artists-batch-\d+\.json$/.test(name))
  .sort((a, b) => a.localeCompare(b, 'en'))
  .map((name) => `data/${name}`)
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-master.json')
const REPORT = path.join(ROOT, 'data/discovered-instagram-artists-master-summary.md')
const TODAY = '2026-03-07'

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
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

function mergeArtist(base, next) {
  return {
    ...base,
    ...next,
    sources: dedupeSources([...(base.sources || []), ...(next.sources || [])]),
    mainTechniques: [...new Set([...(base.mainTechniques || []), ...(next.mainTechniques || [])].filter(Boolean))],
    mainForms: [...new Set([...(base.mainForms || []), ...(next.mainForms || [])].filter(Boolean))],
    signatureWorks: [...new Set([...(base.signatureWorks || []), ...(next.signatureWorks || [])].filter(Boolean))],
  }
}

function main() {
  const merged = new Map()
  for (const input of INPUTS) {
    if (!fs.existsSync(path.join(ROOT, input))) continue
    const arr = readJson(input)
    for (const artist of arr) {
      const current = merged.get(artist.artistSlug)
      merged.set(artist.artistSlug, current ? mergeArtist(current, artist) : { ...artist })
    }
  }

  const artists = [...merged.values()].sort((a, b) => (b.instagramFollowers || 0) - (a.instagramFollowers || 0))
  fs.writeFileSync(OUTPUT, `${JSON.stringify(artists, null, 2)}\n`)

  const lines = [
    '# Instagram Discovery Master Summary',
    '',
    `- Generated: ${TODAY}`,
    `- Artists: ${artists.length}`,
    `- Min followers: ${Math.min(...artists.map((artist) => artist.instagramFollowers || 0)).toLocaleString()}`,
    `- Max followers: ${Math.max(...artists.map((artist) => artist.instagramFollowers || 0)).toLocaleString()}`,
    `- Average followers: ${Math.round(artists.reduce((sum, artist) => sum + (artist.instagramFollowers || 0), 0) / artists.length).toLocaleString()}`,
    `- With 3+ sources: ${artists.filter((artist) => (artist.sources || []).length >= 3).length}/${artists.length}`,
    '',
    '## Top Accounts',
    '',
  ]
  for (const artist of artists.slice(0, 20)) {
    lines.push(`- @${artist.instagramHandle} | ${artist.nameZh} | ${artist.instagramFollowers.toLocaleString()} followers | ${artist.region || '待确认'}`)
  }
  fs.writeFileSync(REPORT, `${lines.join('\n')}\n`)
  console.log(JSON.stringify({ output: OUTPUT, report: REPORT, count: artists.length }, null, 2))
}

main()
