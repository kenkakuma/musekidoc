const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ACCESSED_AT = '2026-03-06'

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`)
}

function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function normalizeSource(source) {
  if (!source || !source.title || !source.url) return null
  return {
    title: source.title,
    url: normalizeUrl(source.url),
    accessedAt: source.accessedAt || ACCESSED_AT,
  }
}

function dedupeSources(sources) {
  const byUrl = new Map()
  const output = []
  for (const source of sources.map(normalizeSource).filter(Boolean)) {
    const existing = byUrl.get(source.url)
    if (!existing) {
      byUrl.set(source.url, source)
      output.push(source)
      continue
    }

    const existingGeneric = /reference \d+/i.test(existing.title)
    const incomingGeneric = /reference \d+/i.test(source.title)
    if ((existingGeneric && !incomingGeneric) || source.title.length > existing.title.length) {
      existing.title = source.title
    }
  }
  return output
}

function dedupeStrings(values) {
  return [...new Set((values || []).filter(Boolean))]
}

function dedupeExhibitions(values) {
  const seen = new Set()
  const output = []
  for (const item of values || []) {
    if (!item || !item.title) continue
    const key = `${item.year || ''}|${item.title}|${item.venue || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    output.push(item)
  }
  return output
}

function charCount(text) {
  return [...(text || '')].length
}

function titleFromUrl(url) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  const siteTitles = {
    'kyotodeasobo.com': 'Kyoto de Asobo',
    'utsuwa-ku.com': 'うつわ魯庵',
    'shonan.keizai.biz': '湘南経済新聞',
    'gallery-garaku.ecnet.jp': 'ギャラリー雅楽',
    'hibinokurashi.com': '日々の暮らし',
    'chilchinbito-hiroba.com': 'チルチンびと広場',
    'momijiichi.com': 'もみじ市',
    'niwanowa.info': 'にわのわ',
    'discoverjapan-web.com': 'Discover Japan',
    'fb-terrace.shop': 'FB Terrace',
    'yugen-kyoto.com': 'YUGEN Kyoto',
    'store.hitonoto.com': 'hitonoto store',
    'gallery-soyo.com': 'gallery soyo',
    'ocogeshokuba.com': 'おこげ職場',
    'ippaku.jp': 'ippaku',
    'momofuku.jp': 'momofuku',
    'cooan-g.com': 'cooan',
    'okinishop.easy.co': '沖縄shop',
    'kikikikraft.com': 'KIKIKIKRAFT',
    'tokyoartbeat.com': 'Tokyo Art Beat',
    'pota-pota.com': 'pota-pota',
    'ideot.net': 'IDEOT',
    'people-jp.shop': 'people',
    'taliki-okinawa.com': 'taliki',
    'robanoie.com': 'ろばの家',
    'k-and-a-so-co.net': 'K&A so-co',
    'art-onthetable.com': 'Art on the Table',
    'monoina.com': 'monoina',
    'note.com': 'note',
    'daiichiarts.com': 'Dai Ichi Arts',
    'terra-delft.nl': 'Terra Delft',
  }
  return siteTitles[host] || host
}

function sourceType(source) {
  const url = typeof source === 'string' ? source : source?.url
  const title = typeof source === 'string' ? '' : String(source?.title || '').toLowerCase()
  if (!url) return 'other'

  const host = new URL(url).hostname.replace(/^www\./, '')
  if (host === 'instagram.com') return 'social'
  if (
    title.includes('个人网站') ||
    title.includes('官方') ||
    title.includes('官网') ||
    title.includes('official') ||
    title.includes('作家简介') ||
    title.includes('profile') ||
    host.includes('tomonarihashimoto.com') ||
    host.includes('uchidakaori.com') ||
    host.includes('ryutafukumura.com') ||
    host.includes('tomoyasakai.com') ||
    host.includes('sakaitomoya.amebaownd.com') ||
    host.includes('kinjojirokan.com') ||
    host.includes('hagiyaki-miwa.com') ||
    host.includes('homofaber.com') ||
    host.includes('gov') ||
    host.includes('city.') ||
    host.includes('pref.') ||
    host.includes('town.') ||
    host.includes('vill.') ||
    host.includes('momat.go.jp') ||
    host.includes('momak.go.jp') ||
    host.includes('bizen-moa.jp') ||
    host.includes('musee-') ||
    host.includes('museum') ||
    host.includes('art-kano.jp') ||
    host.includes('yuntanza-museum.jp')
  ) return 'official'
  if (
    host.includes('base.') ||
    host.includes('ippaku.jp') ||
    host.includes('katakuchi.jp') ||
    host.includes('kiiroi-tori.shop') ||
    host.includes('mizusai.jp') ||
    host.includes('people-jp.shop') ||
    host.includes('monoina.com') ||
    host.includes('kuramonzen.com') ||
    host.includes('kikikikraft.com') ||
    host.includes('momofuku.jp') ||
    host.includes('fb-terrace.shop') ||
    host.includes('cooan-g.com') ||
    host.includes('gallery-garaku') ||
    host.includes('robanoie.com') ||
    host.includes('art-onthetable.com') ||
    host.includes('gallery') ||
    host.includes('shop') ||
    host.includes('store') ||
    host.includes('utsuwa') ||
    host.includes('wondermug') ||
    host.includes('g-call') ||
    host.includes('kurodatoen') ||
    host.includes('kurodatouen') ||
    host.includes('artspace') ||
    host.includes('tokyo.com') ||
    host.includes('shogeikan')
  ) return 'gallery_ecommerce'
  if (
    host.includes('brutus.jp') ||
    host.includes('hibinokurashi') ||
    host.includes('chilchinbito') ||
    host.includes('tokyoartbeat') ||
    host.includes('tokyoweekender') ||
    host.includes('taliki') ||
    host.includes('shonan.keizai') ||
    host.includes('kurashi-yohin') ||
    host.includes('momijiichi') ||
    host.includes('niwanowa') ||
    host.includes('wwdjapan') ||
    host.includes('discoverjapan') ||
    host.includes('madamefigaro') ||
    host.includes('pen-online') ||
    host.includes('okinawatimes') ||
    host.includes('sanyonews') ||
    host.includes('okitive') ||
    host.includes('nihonmono') ||
    host.includes('atpress') ||
    host.includes('rarea')
  ) return 'lifestyle_media'
  if (
    host.includes('note.com') ||
    host.includes('ameblo.jp') ||
    host.includes('facebook.com') ||
    host.includes('influencerdb.jp') ||
    host.includes('museum.or.jp') ||
    host.includes('piratsuka') ||
    host.includes('douban') ||
    host.includes('ci.nii') ||
    host.includes('nact.jp')
  ) return 'community_aggregator'
  return 'other'
}

function roster80() {
  const set = new Set()
  const addFromArtists = (file) => {
    const json = readJson(file)
    for (const artist of json.artists || []) {
      if (artist.slug !== 'ando-masanobu') set.add(artist.slug)
    }
  }
  const addFromArray = (file) => {
    for (const item of readJson(file)) {
      if (item.slug !== 'ando-masanobu') set.add(item.slug)
    }
  }

  addFromArtists('data/artists-batch-1.json')
  addFromArtists('data/artists-final-batch-1.json')
  addFromArtists('data/artists-final-batch-2.json')
  addFromArray('data/artists-awards-exhibitions-batch-1.json')
  addFromArray('data/artists-awards-exhibitions-batch-2.json')
  addFromArray('data/artists-awards-exhibitions-batch-4.json')
  addFromArray('data/artists-awards-exhibitions-batch-5.json')
  addFromArray('data/artists-awards-exhibitions-batch-6.json')

  return [...set].sort()
}

const manualSeeds = {
  'kaneshige-toyo': {
    nameZh: '金重陶陽',
    nameJa: '金重陶陽',
    nameEn: 'Kaneshige Toyo',
    birthYear: 1896,
    deathYear: 1967,
    region: '岡山県・備前市',
    style: '備前焼、茶陶、桃山備前復興',
    bio: '1896年生于备前名门金重家，是现代备前烧复兴的核心人物。其在研究古备前与桃山陶的基础上重建土、火与器形的关系，1956年成为备前烧首位重要无形文化财保持者。',
    sources: [
      { title: '倉敷市立美術館 金重陶陽「閑古鳥香炉」', url: 'https://www.city.kurashiki.okayama.jp/kcam/collection/1012675/1012684/1012728/1012861.html' },
      { title: 'アートコモンズ 金重陶陽 没後50年展', url: 'https://www.nact.jp/artcommons/user/detail/55003' },
      { title: 'APJ 金重陶陽《備前酒呑》', url: 'https://artplatform.go.jp/ja/collections/W1132124' },
    ],
  },
  'fujiwara-kei': {
    nameZh: '藤原啓',
    nameJa: '藤原啓',
    nameEn: 'Fujiwara Kei',
    birthYear: 1899,
    deathYear: 1983,
    region: '岡山県・備前市',
    style: '備前焼、啓備前、茶陶',
    bio: '1899年生于冈山，1940年代转入备前烧，建立了温厚而有力的“啓备前”风格。1970年被认定为备前烧重要无形文化财保持者，是继金重陶陽之后的备前名家。',
    sources: [
      { title: 'FAN美術館・藤原啓記念館', url: 'https://www.museum.or.jp/museum/17689' },
      { title: '安来市加納美術館 藤原啓', url: 'https://www.art-kano.jp/collection/bizenyaki/53' },
      { title: 'おいだ美術 藤原啓「備前片口」', url: 'https://www.oida-art.com/archives/works/w12390' },
    ],
  },
  'fujiwara-yu': {
    nameZh: '藤原雄',
    nameJa: '藤原雄',
    nameEn: 'Fujiwara Yu',
    birthYear: 1932,
    deathYear: 2001,
    region: '岡山県・備前市',
    style: '備前焼、茶陶、百壺展・百花展',
    bio: '1932年生于备前，为藤原啓长子。作品兼具豪放土味与国际传播力，1996年被认定为备前烧重要无形文化财保持者，是现代备前向海外拓展的重要人物。',
    sources: [
      { title: '安来市加納美術館 藤原雄', url: 'https://www.art-kano.jp/collection/bizenyaki/50' },
      { title: 'インターネットミュージアム The 備前', url: 'https://www.museum.or.jp/news/4312' },
      { title: 'アート買取協会 藤原雄', url: 'https://www.artkaitori.com/artwork/%E5%82%99%E5%89%8D%E5%A3%BA/' },
    ],
  },
  'miwa-kyuwa': {
    nameZh: '三輪休和',
    nameJa: '三輪休和',
    nameEn: 'Miwa Kyuwa',
    birthYear: 1895,
    deathYear: 1981,
    region: '山口県・萩市',
    style: '萩焼、枇杷色萩、三輪窯',
    bio: '三轮家十代。其在传统萩烧基础上发展出端正典雅、富有茶味的枇杷色调与白釉层次，1970年被认定为萩烧重要无形文化财保持者。',
    awards: [
      '1970年 重要無形文化財保持者（萩焼）認定',
      '三輪家十代として近代萩焼の基盤を再構築',
    ],
    sources: [
      { title: '三輪窯 公式サイト', url: 'https://www.hagiyaki-miwa.com/' },
      { title: 'しぶや黒田陶苑 三輪休和', url: 'https://kurodatouen.com/gallerydata/554' },
      { title: '山口県立萩美術館・浦上記念館', url: 'https://hum-web.jp/' },
    ],
  },
  'yamamoto-toshu': {
    nameZh: '山本陶秀',
    nameJa: '山本陶秀',
    nameEn: 'Yamamoto Toshu',
    birthYear: 1906,
    deathYear: 1994,
    region: '岡山県・備前市',
    style: '備前焼、轆轤、茶陶',
    bio: '1906年生于备前，以高超轆轤技法和优雅端正的茶陶风格闻名，被称为“茶陶的陶秀”。1987年成为备前烧重要无形文化财保持者。',
    sources: [
      { title: '安来市加納美術館 山本陶秀', url: 'https://www.art-kano.jp/collection/bizenyaki/51' },
      { title: '安来市加納美術館 山本陶秀と青戸慧', url: 'https://www.art-kano.jp/exhibition/kako/y2016/100' },
      { title: 'おいだ美術 山本陶秀「備前」', url: 'https://www.oida-art.com/archives/works/w7848' },
    ],
  },
  'kinjo-jiro': {
    nameZh: '金城次郎',
    nameJa: '金城次郎',
    nameEn: 'Kinjo Jiro',
    birthYear: 1912,
    deathYear: 2004,
    region: '沖縄県・那覇市 / 読谷村',
    style: '壺屋焼、魚紋、海老紋、琉球陶器',
    bio: '1912年生于那霸，是冲绳壶屋烧的代表人物。其鱼纹、海老纹和线刻装饰极具辨识度，1985年成为冲绳首位重要无形文化财保持者。',
    sources: [
      { title: '金城次郎館 公式サイト', url: 'https://www.kinjojirokan.com/' },
      { title: '読谷村 金城次郎展', url: 'https://www.vill.yomitan.okinawa.jp/soshiki/bunka_shinko/gyomu/6111.html' },
      { title: '沖縄タイムス 金城次郎館オープン', url: 'https://www.okinawatimes.co.jp/articles/-/1095470' },
    ],
  },
  'kato-hajime': {
    awards: [
      '1952年 中日文化賞',
      '1961年 重要無形文化財保持者（色絵磁器）認定',
      '1967年 紫綬褒章',
    ],
    sources: [
      { title: '銀座黒田陶苑 加藤土師萌', url: 'https://kurodatouen.com/gallerydata/311' },
    ],
  },
  'hashimoto-tomonari': {
    awards: [
      '2019年 LOEWE Craft Prize ファイナリスト',
      'V&A と LACMA に作品収蔵',
    ],
    instagramHandle: 'hashimoto_tomonari',
    websiteUrl: 'https://tomonarihashimoto.com/profile/',
    sources: [
      { title: '橋本知成 公式プロフィール', url: 'https://tomonarihashimoto.com/profile/' },
      { title: 'Kura Monzen Gallery Hashimoto Tomonari', url: 'https://kuramonzen.com/pages/hashimoto-tomonari-%E6%A9%8B%E6%9C%AC-%E7%9F%A5%E6%88%90' },
      { title: 'WWDJAPAN LOEWE Craft Prize 2019', url: 'https://www.wwdjapan.com/articles/789121' },
    ],
  },
  'ishihara-yukie': {
    sources: [
      { title: 'Yahoo!ショッピング 石原ゆきえ リムプレート', url: 'https://store.shopping.yahoo.co.jp/bamboo-leaf/is-01.html' },
    ],
  },
  'kato-etsuko': {
    sources: [
      { title: '黄色い鳥器店 加藤恵津子', url: 'https://kiiroi-tori.shop/items/63ec7ba37c42ee62d8f090ff' },
    ],
  },
  'kawahara-sachiko': {
    sources: [
      { title: '暮らし用品 川原幸子', url: 'https://www.kurashi-yohin.com/creator/kawaharasachiko/013_page.shtml' },
    ],
  },
  'takada-kae': {
    sources: [
      { title: 'かたくち屋ほとり 高田かえ', url: 'https://www.katakuchi.jp/products/takadakae-bowl02' },
    ],
  },
  'torii-miki': {
    sources: [
      { title: 'k-and-a-so-co', url: 'https://www.k-and-a-so-co.net/' },
    ],
  },
  'uchida-kaori': {
    sources: [
      { title: 'Discover Japan 内田可織', url: 'https://discoverjapan-web.com/article/150005' },
      { title: 'studio knot 内田可織', url: 'https://s-knot.com/about.html' },
    ],
  },
  'sato-naomichi': {
    instagramHandle: 'bonoho_',
    sources: [
      { title: 'SISON GALLERY 佐藤尚理', url: 'https://sison.tokyo/info/6173260' },
      { title: '水犀 佐藤尚理', url: 'https://mizusai.jp/artist/satonaomichi/' },
      { title: 'atpress 佐藤尚理個展', url: 'https://www.atpress.ne.jp/news/312357' },
    ],
  },
}

const potteryKbSectionMap = [
  { match: '厚川文子', slug: 'atsukawa-fumiko' },
  { match: '田鶴濱守人', slug: 'tazuruhama-morito' },
  { match: '掛谷康樹', slug: 'kaketani-yasuki' },
  { match: '石川若彦', slug: 'ishikawa-wakahiko' },
  { match: '尾形篤', slug: 'ogata-atsushi' },
  { match: '@shingo_takeuchi_', slug: 'takeuchi-shingo', instagramHandle: 'shingo_takeuchi_' },
  { match: '石原祥充', slug: 'ishihara-yoshimitsu' },
  { match: '石原ゆきえ', slug: 'ishihara-yukie' },
  { match: '片瀬和宏', slug: 'katase-kazuhiro' },
  { match: '加藤惠津子', slug: 'kato-etsuko' },
  { match: '川原幸子', slug: 'kawahara-sachiko' },
  { match: '水谷智美', slug: 'mizutani-tomomi' },
  { match: '佐藤朱理', slug: 'sato-akari' },
  { match: '@bonoho_', slug: 'sato-naomichi', instagramHandle: 'bonoho_' },
  { match: '高田かえ', slug: 'takada-kae' },
  { match: '高田谷将宏', slug: 'takataya-masahiro' },
  { match: '鳥居美希', slug: 'torii-miki' },
  { match: '内田可織', slug: 'uchida-kaori' },
  { match: '山脇将人', slug: 'yamawaki-masato' },
]

function potteryKbSources() {
  const text = fs.readFileSync(path.join(ROOT, 'docs/pottery_kb.md'), 'utf8')
  const sections = text.split(/\n(?=## |### )/)
  const output = new Map()

  for (const section of sections) {
    const heading = section.split('\n')[0] || ''
    const matched = potteryKbSectionMap.find((item) => heading.includes(item.match))
    if (!matched) continue

    const urls = [...section.matchAll(/https?:\/\/[^\s)；]+/g)].map((item) => item[0])
    const sources = urls.map((url, index) => ({
      title: titleFromUrl(url),
      url,
    }))

    output.set(matched.slug, {
      artistSlug: matched.slug,
      instagramHandle: matched.instagramHandle || null,
      sources,
    })
  }

  return output
}

function mergeSourceArtist(map, artist) {
  const current = map.get(artist.artistSlug || artist.slug) || {
    artistSlug: artist.artistSlug || artist.slug,
    awards: [],
    exhibitions: [],
    sources: [],
  }

  const merged = {
    ...current,
    ...artist,
    artistSlug: artist.artistSlug || artist.slug || current.artistSlug,
    slug: undefined,
  }

  merged.awards = dedupeStrings([...(current.awards || []), ...(artist.awards || [])])
  merged.exhibitions = dedupeExhibitions([...(current.exhibitions || []), ...(artist.exhibitions || [])])
  merged.sources = dedupeSources([...(current.sources || []), ...(artist.sources || [])])

  map.set(merged.artistSlug, merged)
}

function buildArtistMap() {
  const roster = roster80()
  const artists = new Map(roster.map((slug) => [slug, {
    artistSlug: slug,
    awards: [],
    exhibitions: [],
    sources: [],
  }]))

  const task1 = require('./generate-task01-artist-centered-search.js').buildArtists()
  for (const slug of roster) {
    const seed = task1.get(slug)
    if (!seed) continue
    mergeSourceArtist(artists, {
      artistSlug: slug,
      nameZh: seed.nameZh || null,
      nameJa: seed.nameJa || null,
      nameEn: seed.nameEn || null,
      birthYear: seed.birthYear ?? null,
      deathYear: seed.deathYear ?? null,
      bio: seed.bio || null,
      kilnName: seed.kilnName || null,
      studioName: seed.studioName || null,
      locationPrefecture: seed.locationPrefecture || null,
      locationCity: seed.locationCity || null,
      locationArea: seed.locationArea || null,
      kilnType: seed.kilnType || null,
      region: seed.region || null,
      style: seed.style || null,
      awards: seed.awards || [],
      exhibitions: seed.exhibitions || [],
      instagramHandle: seed.instagramHandle || null,
      websiteUrl: seed.websiteUrl || null,
      sources: seed.sources || [],
    })
  }

  for (const file of ['data/artists-batch-1.json', 'data/artists-final-batch-1.json', 'data/artists-final-batch-2.json']) {
    const json = readJson(file)
    for (const artist of json.artists || []) {
      if (!artists.has(artist.slug)) continue
      mergeSourceArtist(artists, {
        artistSlug: artist.slug,
        nameZh: artist.nameZh || null,
        nameJa: artist.nameJa || null,
        nameEn: artist.nameEn || null,
        birthYear: artist.birthYear ?? null,
        deathYear: artist.deathYear ?? null,
        bio: artist.bio || null,
        region: artist.region || null,
        style: artist.style || null,
        instagramHandle: artist.instagramHandle || null,
        websiteUrl: artist.websiteUrl || null,
        sources: artist.sources || [],
      })
    }
  }

  const related = readJson('related-artists-detail.json')
  for (const artist of related) {
    if (!artists.has(artist.artistSlug)) continue
    mergeSourceArtist(artists, artist)
  }

  const currentSupplements = readJson('artists-detail-supplemented.json')
  for (const artist of currentSupplements) {
    if (!artists.has(artist.artistSlug)) continue
    mergeSourceArtist(artists, artist)
  }

  for (const file of fs.readdirSync(path.join(ROOT, 'data')).filter((name) => /^artists-awards-exhibitions-batch-\d+\.json$/.test(name)).sort()) {
    for (const row of readJson(path.join('data', file))) {
      if (!artists.has(row.slug)) continue
      mergeSourceArtist(artists, {
        artistSlug: row.slug,
        awards: row.awards || [],
        exhibitions: row.exhibitions || [],
      })
    }
  }

  for (const file of fs.readdirSync(path.join(ROOT, 'data')).filter((name) => /^artists-studio-kiln-batch-\d+\.json$/.test(name)).sort()) {
    for (const row of readJson(path.join('data', file))) {
      if (!artists.has(row.slug)) continue
      const studioInfo = row.studioInfo || {}
      mergeSourceArtist(artists, {
        artistSlug: row.slug,
        kilnName: row.kilnName || null,
        studioName: row.studioName || null,
        locationPrefecture: row.locationPrefecture || null,
        locationCity: row.locationCity || null,
        locationArea: row.locationArea || null,
        kilnType: row.kilnType || null,
        instagramHandle: studioInfo.instagram ? String(studioInfo.instagram).replace(/^@/, '') : null,
        websiteUrl: studioInfo.website || null,
      })
    }
  }

  for (const [slug, seed] of potteryKbSources()) {
    if (!artists.has(slug)) continue
    mergeSourceArtist(artists, seed)
  }

  for (const [slug, seed] of Object.entries(manualSeeds)) {
    if (!artists.has(slug)) continue
    mergeSourceArtist(artists, { artistSlug: slug, ...seed })
  }

  for (const artist of artists.values()) {
    if (artist.instagramHandle) {
      artist.sources = dedupeSources([
        ...(artist.sources || []),
        {
          title: `Instagram @${artist.instagramHandle}`,
          url: `https://www.instagram.com/${artist.instagramHandle}/`,
        },
      ])
    } else {
      artist.sources = dedupeSources(artist.sources || [])
    }

    if (artist.websiteUrl) artist.websiteUrl = normalizeUrl(artist.websiteUrl)
    artist.awards = dedupeStrings(artist.awards || [])
    artist.exhibitions = dedupeExhibitions(artist.exhibitions || [])
  }

  return artists
}

function buildOutput() {
  const artists = buildArtistMap()
  return [...artists.values()]
    .sort((a, b) => {
      const ay = a.birthYear ?? 0
      const by = b.birthYear ?? 0
      if (ay !== by) return by - ay
      return (a.artistSlug || '').localeCompare(b.artistSlug || '')
    })
    .map((artist) => ({
      artistSlug: artist.artistSlug,
      nameZh: artist.nameZh || null,
      nameJa: artist.nameJa || null,
      nameEn: artist.nameEn || null,
      birthYear: artist.birthYear ?? null,
      deathYear: artist.deathYear ?? null,
      bio: artist.bio || null,
      kilnName: artist.kilnName || null,
      studioName: artist.studioName || null,
      kilnType: artist.kilnType || null,
      locationPrefecture: artist.locationPrefecture || null,
      locationCity: artist.locationCity || null,
      locationArea: artist.locationArea || null,
      region: artist.region || null,
      style: artist.style || null,
      awards: artist.awards || [],
      exhibitions: artist.exhibitions || [],
      instagramHandle: artist.instagramHandle || null,
      websiteUrl: artist.websiteUrl || null,
      sources: artist.sources || [],
    }))
}

function buildExpansionReport(artists) {
  const counts = {
    official: 0,
    gallery_ecommerce: 0,
    lifestyle_media: 0,
    social: 0,
    community_aggregator: 0,
    other: 0,
  }

  let withKiln = 0
  let withAwards = 0
  let withExhibitions = 0
  let withInstagram = 0

  const missing = []

  for (const artist of artists) {
    if (artist.kilnName) withKiln += 1
    if ((artist.awards || []).length >= 2) withAwards += 1
    if ((artist.exhibitions || []).length >= 2) withExhibitions += 1
    if (artist.instagramHandle) withInstagram += 1

    const seenTypes = new Set((artist.sources || []).map((source) => sourceType(source)))
    for (const type of seenTypes) counts[type] += 1

    const gaps = []
    if (!artist.kilnName) gaps.push('kilnName')
    if (!artist.locationPrefecture) gaps.push('locationPrefecture')
    if (!artist.locationCity) gaps.push('locationCity')
    if ((artist.awards || []).length < 2) gaps.push('awards')
    if ((artist.exhibitions || []).length < 2) gaps.push('exhibitions')
    if ((artist.sources || []).length < 2) gaps.push('sources')
    if (gaps.length) missing.push(`${artist.artistSlug}: ${gaps.join(', ')}`)
  }

  const lines = [
    '# Task 02 Artist 80 Expansion',
    '',
    '## 范围',
    '',
    '- 本轮将补充范围从局部作家扩展到任务定义的全量 80 位作家。',
    '- 名单依据本地批次文件与 `scripts/query-remaining.ts` 的 80 位目标口径整理，排除了计划外的 `ando-masanobu`。',
    '',
    '## 覆盖结果',
    '',
    `- 全量作家数：${artists.length}`,
    `- 已有窑场信息：${withKiln}/${artists.length}`,
    `- 奖项/成就达到 2 条以上：${withAwards}/${artists.length}`,
    `- 展览达到 2 条以上：${withExhibitions}/${artists.length}`,
    `- 含 Instagram 账号：${withInstagram}/${artists.length}`,
    '',
    '## 来源类型覆盖（按至少拥有 1 条该类型来源的作家数统计）',
    '',
    `- 官方/官网/馆藏/政府：${counts.official}`,
    `- 日本陶艺电商/画廊/陶艺网站：${counts.gallery_ecommerce}`,
    `- 生活方式媒体/展讯媒体：${counts.lifestyle_media}`,
    `- Instagram / 社交：${counts.social}`,
    `- 论坛/聚合站/社区：${counts.community_aggregator}`,
    `- 其他：${counts.other}`,
    '',
    '## 搜索对象扩展说明',
    '',
    '- 主来源：官方窑场、作家官网、美术馆、地方政府、博物馆。',
    '- 补充来源：日本陶艺电商、画廊网站、生活方式媒体、展讯聚合站。',
    '- 社交来源：对已有 Instagram handle 的作家补充了直达 profile 链接。',
    '- 社区/聚合来源仅作为辅助，不单独承担核心事实判断。',
    '',
    '## 质量校验',
    '',
    missing.length ? `- 仍需复核：${missing.length} 位` : '- 当前校验无剩余硬缺口',
  ]

  if (missing.length) {
    lines.push('', '### 待复核', '')
    lines.push(...missing.map((item) => `- ${item}`))
  }

  return lines.join('\n')
}

function main() {
  const artists = buildOutput()
  const report = buildExpansionReport(artists)

  writeJson('artists-detail-supplemented.json', artists)
  fs.writeFileSync(path.join(ROOT, 'optimization-report.md'), `${report}\n`)

  const summary = {
    total: artists.length,
    withKiln: artists.filter((artist) => artist.kilnName).length,
    withAwards2: artists.filter((artist) => (artist.awards || []).length >= 2).length,
    withExhibitions2: artists.filter((artist) => (artist.exhibitions || []).length >= 2).length,
    withSources2: artists.filter((artist) => (artist.sources || []).length >= 2).length,
    withInstagram: artists.filter((artist) => artist.instagramHandle).length,
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
