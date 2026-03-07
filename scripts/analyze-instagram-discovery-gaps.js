const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const INPUT = path.join(ROOT, 'data/discovered-instagram-artists-master.json')
const OUTPUT = path.join(ROOT, 'data/discovered-instagram-artists-gap-analysis.md')
const TODAY = '2026-03-07'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function normalizeRegion(text) {
  const value = String(text || '')
  if (value.includes('益子')) return '益子'
  if (value.includes('信乐') || value.includes('信楽')) return '信乐'
  if (value.includes('多治见') || value.includes('多治見') || value.includes('美濃') || value.includes('濑户') || value.includes('瀬戸')) return '美浓/濑户'
  if (value.includes('京都')) return '京都'
  if (value.includes('备前') || value.includes('備前')) return '备前'
  if (value.includes('九谷') || value.includes('石川') || value.includes('金沢')) return '九谷/金泽'
  if (value.includes('唐津')) return '唐津'
  if (value.includes('萩')) return '萩'
  return '其他'
}

function guessFemale(name) {
  const text = String(name || '')
  return /子|香|彩|由|美|衣|織|希|穂|あかり|由起子|文$|惠|あゐ/.test(text)
}

function main() {
  const artists = readJson(INPUT)
  const total = artists.length
  const born1980 = artists.filter((artist) => artist.birthYear && artist.birthYear >= 1980)
  const born1990 = artists.filter((artist) => artist.birthYear && artist.birthYear >= 1990)
  const explicitFemale = artists.filter((artist) => artist.gender === 'female')
  const explicitMale = artists.filter((artist) => artist.gender === 'male')
  const femaleGuess = artists.filter((artist) => guessFemale(artist.nameJa || artist.nameZh))
  const regionCounts = {}
  for (const artist of artists) {
    const key = normalizeRegion(artist.region || artist.locationPrefecture || artist.locationCity)
    regionCounts[key] = (regionCounts[key] || 0) + 1
  }

  const lines = [
    '# Instagram Discovery Gap Analysis',
    '',
    `- Generated: ${TODAY}`,
    `- Current total: ${total}`,
    `- Remaining to task minimum (50): ${Math.max(0, 50 - total)}`,
    `- Remaining to task upper target (80): ${Math.max(0, 80 - total)}`,
    '',
    '## Age Coverage',
    '',
    `- Born 1980 or later: ${born1980.length}/${total}`,
    `- Born 1990 or later: ${born1990.length}/${total}`,
    '- Gap: the task card wants 1980-2000 born artists as the core bulk, so this remains the main expansion pressure.',
    '',
    '## Gender Proxy',
    '',
    `- Explicit female count: ${explicitFemale.length}/${total}`,
    `- Explicit male count: ${explicitMale.length}/${total}`,
    `- Female-name heuristic count: ${femaleGuess.length}/${total}`,
    '- Gap: this is still well below the 40-50% target band and needs deliberate female-artist discovery.',
    '',
    '## Production Area Coverage',
    '',
  ]

  for (const [key, value] of Object.entries(regionCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${key}: ${value}`)
  }

  lines.push(
    '',
    '## Priority Next Search',
    '',
    '- P0: young female ceramic artists in Mashiko, Shigaraki, Mino/Seto, Kyoto with 10K+ Instagram followers.',
    '- P1: contemporary Mashiko and Shigaraki artists with clear studio identity and public Instagram bios.',
    '- P2: Mino/Seto and Kyoto artists with gallery representation and 10K+ follower confirmation.',
    '- P3: fill remaining classic-region gaps only after age and gender balance improves.',
    ''
  )

  fs.writeFileSync(OUTPUT, `${lines.join('\n')}\n`)
  console.log(JSON.stringify({ output: OUTPUT, total, born1980: born1980.length, femaleGuess: femaleGuess.length }, null, 2))
}

main()
