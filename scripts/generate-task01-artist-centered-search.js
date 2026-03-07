const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const ACCESSED_AT = '2026-03-06'

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
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

function uniqueBy(items, keyFn) {
  const seen = new Set()
  const output = []
  for (const item of items) {
    const key = keyFn(item)
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(item)
  }
  return output
}

function loadArtistBases() {
  const files = [
    'data/artists-final-batch-1.json',
    'data/artists-final-batch-2.json',
  ]

  const artists = new Map()

  for (const file of files) {
    const json = loadJson(file)
    for (const artist of json.artists || []) {
      artists.set(artist.slug, {
        slug: artist.slug,
        nameZh: artist.nameZh,
        nameJa: artist.nameJa,
        nameEn: artist.nameEn || null,
        bio: artist.bio || '',
        birthYear: artist.birthYear ?? null,
        deathYear: artist.deathYear ?? null,
        region: artist.region || '',
        style: artist.style || '',
        instagramHandle: artist.instagramHandle || null,
        websiteUrl: normalizeUrl(artist.websiteUrl || null),
        sources: (artist.sources || []).map(normalizeSource).filter(Boolean),
      })
    }
  }

  return artists
}

function mergeArtistArrays(artists, relativePaths, field) {
  for (const relativePath of relativePaths) {
    const entries = loadJson(relativePath)
    for (const entry of entries) {
      const current = artists.get(entry.slug) || { slug: entry.slug, sources: [] }
      current[field] = entry[field] || current[field] || []
      artists.set(entry.slug, current)
    }
  }
}

function mergeStudioData(artists, relativePaths) {
  for (const relativePath of relativePaths) {
    const entries = loadJson(relativePath)
    for (const entry of entries) {
      const current = artists.get(entry.slug) || { slug: entry.slug, sources: [] }
      current.kilnName = entry.kilnName || current.kilnName || null
      current.studioName = entry.studioName || current.studioName || null
      current.locationPrefecture = entry.locationPrefecture || current.locationPrefecture || null
      current.locationCity = entry.locationCity || current.locationCity || null
      current.locationArea = entry.locationArea || current.locationArea || null
      current.kilnType = entry.kilnType || current.kilnType || null
      current.studioInfo = entry.studioInfo || current.studioInfo || null
      artists.set(entry.slug, current)
    }
  }
}

const manualArtists = {
  'arakawa-toyozo': {
    nameZh: '荒川丰藏',
    nameJa: '荒川豊藏',
    nameEn: 'Arakawa Toyozo',
    birthYear: 1894,
    deathYear: 1985,
    bio: '1894年生于岐阜县。1930年在美浓大萱发现桃山时代志野陶片，成为志野与濑户黑复兴的决定性契机。其后在大萱与多治见建窑，系统研究桃山茶陶，以志野、濑户黑、黄濑户和织部等美浓系茶陶闻名，被认定为重要无形文化财保持者，是现代日本茶陶复兴的关键人物。',
    region: '岐阜县・美浓',
    style: '志野、濑户黑、黄濑户、织部等桃山茶陶复兴',
    sources: [
      { title: '荒川豊藏资料 - 岐阜县现代陶艺美术馆', url: 'https://www.cpm-gifu.jp/museum/02.exhibition/02_1.exhibition/exhibition/2022/07/post-9.html' },
      { title: '荒川豊藏工房资料', url: 'https://www.tajimi-bunka.or.jp/toyozo/' },
    ],
  },
  'suzuki-osamu': {
    nameZh: '鈴木藏',
    nameJa: '鈴木藏',
    nameEn: 'Suzuki Osamu',
    birthYear: 1934,
    deathYear: null,
    bio: '1934年生于岐阜县土岐市。长期专注志野研究，尤其以乳白厚釉与绯色控制见长，发展出被称为“志野白”的高度完成样式。1968年独立后持续研究桃山时代半地下式窑烧成逻辑，并以现代窑炉重建传统志野语汇，1994年被认定为“志野”重要无形文化财保持者。',
    region: '岐阜县・土岐市',
    style: '志野烧、长石白釉、桃山茶陶研究',
    websiteUrl: 'https://www.suzuki-osamu.jp/',
    sources: [
      { title: '卒寿纪念 人间国宝 鈴木藏的志野展', url: 'https://www.momat.go.jp/craft-museum/exhibitions/570' },
      { title: '鈴木藏工房', url: 'https://www.suzuki-osamu.jp/' },
    ],
  },
  'kato-takao': {
    nameZh: '加藤孝造',
    nameJa: '加藤孝造',
    nameEn: 'Kato Takao',
    birthYear: 1935,
    deathYear: null,
    bio: '岐阜县出身的美浓茶陶巨匠，长期以志野、濑户黑、黄濑户等桃山茶陶为研究核心。其作品以厚釉、强烈火色与沉稳器形著称，延续了荒川丰藏之后的美浓系复兴路径。作为黄濑户与志野的重要当代代表，他将桃山茶碗语言持续推进到现代展览语境之中。',
    region: '岐阜县・美浓',
    style: '志野、黄濑户、濑户黑等美浓茶陶',
    sources: [
      { title: '加藤孝造资料 - 岐阜县现代陶艺美术馆', url: 'https://www.cpm-gifu.jp/museum/02.exhibition/02_1.exhibition/exhibition/2023/07/post-31.html' },
      { title: '美浓陶艺家 加藤孝造作品页', url: 'https://www.kurodatoen.co.jp/artist/katotakao/' },
    ],
  },
  'kato-tokuro': {
    nameZh: '加藤唐九郎',
    nameJa: '加藤唐九郎',
    nameEn: 'Kato Tokuro',
    birthYear: 1897,
    deathYear: 1985,
    bio: '1897年生于濑户。以对桃山陶的强烈再发现意识推动了志野、织部、黄濑户等美浓与濑户系茶陶的再评价。其创作兼具考古意识与强烈个人风格，不仅烧制传统类型，也通过豪迈的器形和粗野肌理赋予传统茶陶新的现代生命，被视为20世纪日本茶陶史上的关键人物之一。',
    region: '爱知县・濑户 / 岐阜县・美浓',
    style: '桃山茶陶复兴、织部、黄濑户、志野',
    sources: [
      { title: '加藤唐九郎资料 - 爱知县陶瓷美术馆', url: 'https://www.pref.aichi.jp/touji/exhibition/2019/special_tokuro/' },
      { title: '加藤唐九郎介绍', url: 'https://www.seto-cul.jp/information/index.php?s=1617034224' },
    ],
  },
  'miura-koheiji': {
    nameZh: '三浦小平二',
    nameJa: '三浦小平二',
    nameEn: 'Miura Koheiji',
    birthYear: 1933,
    deathYear: 2006,
    bio: '1933年生于新潟县佐渡。以青磁与青白磁中细腻含蓄的蓝绿色调闻名，尤其擅长在釉层中呈现海与岛屿般的静谧光泽。其作品多为壶、花器、盒与茶器，在现代日本青磁谱系中具有鲜明个人面貌，1982年被认定为“青磁”重要无形文化财保持者。',
    region: '新潟县・佐渡',
    style: '青磁、青白磁、含蓄蓝绿色调',
    sources: [
      { title: '三浦小平二作品资料 - 东京国立近代美术馆', url: 'https://www.momat.go.jp/craft-museum/collections/items/koheiji-miura' },
      { title: '三浦小平二介绍', url: 'https://www.sado-biyori.com/feature/koheiji/' },
    ],
  },
  'inoue-manji': {
    nameZh: '井上萬二',
    nameJa: '井上萬二',
    nameEn: 'Inoue Manji',
    birthYear: 1929,
    deathYear: null,
    bio: '1929年生于佐贺县有田町。以极纯净的白磁轆轤成形和流畅线条著称，强调“白磁不容谎言”的制作伦理。其作品追求无装饰状态下的造型与光泽完整度，1995年被认定为“白磁”重要无形文化财保持者，是有田白磁体系的当代核心代表。',
    region: '佐贺县・有田町',
    style: '白磁、轆轤成形、极简器形',
    websiteUrl: 'https://www.manjiinoue.com/',
    sources: [
      { title: '井上萬二官方站', url: 'https://www.manjiinoue.com/' },
      { title: '井上萬二 白磁资料', url: 'https://www.arita.jp/kouryu/jinbutsu/inouemanji/' },
    ],
  },
  'sakaida-kakiemon-xv': {
    nameZh: '十五代酒井田柿右卫门',
    nameJa: '十五代酒井田柿右衛門',
    nameEn: 'Sakaida Kakiemon XV',
    birthYear: 1968,
    deathYear: null,
    bio: '柿右卫门窑第十五代。继承有田白磁与柿右卫门样式的乳白素地与清朗彩绘传统，在现代展览与窑元经营之间延续家族风格。虽然更为人熟知的是色绘体系，但其作品基础仍建立在高纯度白磁胎与透明釉的稳定控制之上，因此也是现代白磁与有田磁器系统的重要观察点。',
    region: '佐贺县・有田町',
    style: '有田白磁、柿右卫门样式、色绘磁器',
    websiteUrl: 'https://www.kakiemon.co.jp/',
    sources: [
      { title: '柿右卫门官方站', url: 'https://www.kakiemon.co.jp/' },
      { title: '柿右卫门历史', url: 'https://www.kakiemon.co.jp/contents/history/' },
    ],
  },
  'maeda-akihiro': {
    nameZh: '前田昭博',
    nameJa: '前田昭博',
    nameEn: 'Maeda Akihiro',
    birthYear: 1954,
    deathYear: null,
    bio: '1954年生于鸟取县，1977年自建柳濑窑后长期专注白磁创作。其作品以极其克制的线条、柔润的白色层次和稳定而精密的拉坯技术见长，既保留山阴地区的清冷气息，又具强烈现代感。2013年被认定为“白磁”重要无形文化财保持者，是井上萬二之外观察现代日本白磁时不可绕开的代表人物。',
    region: '鸟取县',
    style: '白磁、拉坯成形、山阴系清冷白感',
    sources: [
      { title: '前田昭博资料', url: 'https://www.kogei-japan.com/locale/ja_JP/maedaakihiro/' },
      { title: '前田昭博展览资料', url: 'https://www.momat.go.jp/craft-museum/exhibitions/554' },
    ],
  },
  'tsukamoto-kaiji': {
    nameZh: '塚本快示',
    nameJa: '塚本快示',
    nameEn: 'Tsukamoto Kaiji',
    birthYear: 1912,
    deathYear: 1990,
    bio: '1912年生于岐阜县土岐市，快山窑代表人物。其青白磁作品以刻线、片切雕与细致透明釉层著称，在青磁与白磁之间建立温润的半透明层次。1983年被认定为“青白磁”重要无形文化财保持者，是日本现代青磁谱系中不可回避的关键人物。',
    region: '岐阜县・土岐市',
    style: '青白磁、片切雕、快山窑',
    sources: [
      { title: '塚本快示资料', url: 'https://www.kogei-japan.com/locale/ja_JP/tsukamotokaiji/' },
      { title: '快山窑介绍', url: 'https://kaizan-gama.com/' },
    ],
  },
  'shimizu-uichi': {
    nameZh: '清水卯一',
    nameJa: '清水卯一',
    nameEn: 'Shimizu Uichi',
    birthYear: 1926,
    deathYear: 2004,
    bio: '京都出生的陶艺家，以铁釉、柿釉与天目系高温黑釉研究著称。其作品在京都传统审美与滋贺蓬莱窑的厚重土味之间取得平衡，既重视釉层深度，也追求器形的静穆气息。1985年被认定为“铁釉陶器”重要无形文化财保持者。',
    region: '京都 / 滋贺',
    style: '铁釉、柿釉、天目系黑釉',
    sources: [
      { title: '清水卯一资料', url: 'https://www.kogei-japan.com/locale/ja_JP/shimizuuichi/' },
      { title: '蓬莱窑相关资料', url: 'https://www.city.otsu.lg.jp/museum/uchii/' },
    ],
  },
  'ishiguro-munemaro': {
    nameZh: '石黑宗麿',
    nameJa: '石黒宗麿',
    nameEn: 'Ishiguro Munemaro',
    birthYear: 1893,
    deathYear: 1968,
    bio: '1893年生于富山，后在京都八濑建立“八濑丰窑”。其长期研究中国古代黑釉与铁釉系统，以天目、铁釉与唐风趣味见长，作品具有浓厚的古陶致敬意味。1955年被认定为“铁釉陶器”重要无形文化财保持者，是日本现代铁釉研究的重要奠基者。',
    region: '京都・八濑',
    style: '铁釉、天目、唐风陶艺研究',
    sources: [
      { title: '石黑宗麿资料 - 东京国立近代美术馆', url: 'https://www.momat.go.jp/craft-museum/collections/items/munemaro-ishiguro' },
      { title: '石黑宗麿介绍', url: 'https://www.kurodatoen.co.jp/artist/ishiguromunemaro/' },
    ],
  },
  'muraki-yuji': {
    nameZh: '村木雄児',
    nameJa: '村木雄児',
    nameEn: 'Muraki Yuji',
    birthYear: 1953,
    deathYear: null,
    bio: '1953年生于神奈川县。1970年代在濑户与大谷烧系窑元修业，1980年于静冈伊东市独立。其器物大量使用未精制山土、天然灰釉和登窑薪烧效果，强调土味与日常使用的可靠性，是当代生活陶器中自然灰釉路径的稳定代表。',
    region: '静冈县・伊东市',
    style: '天然灰釉、登窑薪烧、生活器',
    sources: [
      { title: 'G-Call 作家介绍', url: 'https://www.g-call.com/art/muraki/' },
      { title: 'G-Call 作家档案', url: 'https://www.g-call.com/art/muraki/profile.php' },
    ],
  },
  'otani-tetsuya': {
    nameZh: '大谷哲也',
    nameJa: '大谷哲也',
    nameEn: 'Otani Tetsuya',
    birthYear: 1971,
    deathYear: null,
    bio: '1971年生于神户，后在信乐相关研究机构工作并独立作陶。其创作以白磁器、锅类和日用器见长，但在信乐木灰环境与材料控制上同样积累深厚，工作室体系也涵盖灰釉与粉引语言。2008年与大谷桃子共同创立大谷制陶所后，成为当代信乐生活器领域最具辨识度的窑场之一。',
    region: '滋贺县・信乐',
    style: '白磁、灰釉、信乐系生活器',
    websiteUrl: 'https://ootanis.com/',
    sources: [
      { title: '大谷制陶所', url: 'https://ootanis.com/' },
      { title: '大谷哲也商店档案', url: 'https://shop.okaz-design.jp/store/%E5%A4%A7%E8%B0%B7%E5%93%B2%E4%B9%9F-c119714013' },
    ],
  },
  'furutani-nobuyuki': {
    nameZh: '古谷宣幸',
    nameJa: '古谷宣幸',
    nameEn: 'Furutani Nobuyuki',
    birthYear: 1976,
    deathYear: null,
    bio: '滋贺县信乐的当代陶艺家，以柴烧、穴窑与自然落灰效果著称。其作品常以粗陶胎与灰釉、铁釉之间的自然过渡来营造温暖且厚重的表情，在茶器、食器与花器中都能看到鲜明的木烧痕迹。古谷一脉也是现代信乐灰釉和薪窑审美的重要传播者。',
    region: '滋贺县・信乐',
    style: '柴烧、自然灰釉、穴窑木烧',
    sources: [
      { title: '古谷製陶所 / gallery fumoto', url: 'https://galleryfumoto.com/collections/%E5%8F%A4%E8%B0%B7%E8%A3%BD%E9%99%B6%E6%89%80' },
      { title: '古谷宣幸作品页', url: 'https://www.utsuwa-uta.com/?mode=cate&cbid=2114831&csid=0' },
    ],
  },
  'tomimoto-kenkichi': {
    nameZh: '富本宪吉',
    nameJa: '富本憲吉',
    nameEn: 'Tomimoto Kenkichi',
    birthYear: 1886,
    deathYear: 1963,
    bio: '1886年生于奈良。早年深耕图案与工艺教育，后在白磁、色绘与釉色体系上建立鲜明风格，是现代日本陶艺教育与设计观念的重要人物。其作品在白磁素地之上展开几何与植物纹样，同时也在辰砂等高难度发色中探索近代陶艺表达，1955年被认定为“色绘磁器”重要无形文化财保持者。',
    region: '奈良 / 京都',
    style: '白磁、色绘磁器、近代工艺设计',
    sources: [
      { title: '富本宪吉相关资料', url: 'https://www.town.ando.nara.jp/0000001115.html' },
      { title: '京都国立近代美术馆 富本宪吉展资料', url: 'https://www.momak.go.jp/Japanese/exhibitionArchive/2006/363.html' },
    ],
  },
  'kondo-yuzo': {
    nameZh: '近藤悠三',
    nameJa: '近藤悠三',
    nameEn: 'Kondo Yuzo',
    birthYear: 1902,
    deathYear: 1985,
    bio: '1902年生于京都，近代京烧与染付磁器的重要代表。虽然其最著名的是“染付”，但也以辰砂与瑠璃等强色釉对器物表层进行严格控制，在传统京烧体系中体现出强烈现代感。其作品重视白磁胎的纯净度、发色稳定性和器形清整度，对京都磁器系统影响深远。',
    region: '京都',
    style: '染付、辰砂、瑠璃等京烧色釉研究',
    sources: [
      { title: '近藤悠三馆', url: 'https://kondoyuzo.jp/' },
      { title: '近藤悠三资料', url: 'https://www.kyohaku.go.jp/jp/project/related/yuzo/' },
    ],
  },
  'fujimoto-yoshimichi': {
    nameZh: '藤本能道',
    nameJa: '藤本能道',
    nameEn: 'Fujimoto Yoshimichi',
    birthYear: 1919,
    deathYear: 1992,
    bio: '1919年生于东京，师承富本宪吉与加藤土师萌。其最知名的是色绘磁器与自创“釉描加彩”技法，擅长在高纯度素地上构筑细腻而稳定的色层。虽然不以单一辰砂闻名，但在近现代日本高温色釉控制和磁器彩绘系统中具有承上启下的重要位置。',
    region: '东京',
    style: '色绘磁器、釉描加彩、高温色釉控制',
    sources: [
      { title: '藤本能道相关展讯', url: 'https://www.musee-tomo.or.jp/exhibitions/2025/toridori/' },
      { title: '青梅市立美术馆 藤本能道展', url: 'https://www.city.ome.tokyo.jp/site/art-museum/75121.html' },
    ],
  },
  'imaizumi-imaemon-xiii': {
    nameZh: '十三代今泉今右卫门',
    nameJa: '十三代今泉今右衛門',
    nameEn: 'Imaizumi Imaemon XIII',
    birthYear: 1926,
    deathYear: 2001,
    bio: '1926年生于有田赤绘世家，1975年袭名十三代今右卫门。其代表性贡献在于把色锅岛系统重新整理为现代展示语言，并持续提升白磁胎、瑠璃与赤绘装饰之间的均衡。1989年被认定为“色绘磁器”重要无形文化财保持者，也是有田磁器现代传承体系中的核心人物。',
    region: '佐贺县・有田町',
    style: '色锅岛、瑠璃与赤绘磁器',
    websiteUrl: 'https://www.imaemon.co.jp/',
    sources: [
      { title: '今右卫门官方站', url: 'https://www.imaemon.co.jp/' },
      { title: '今右卫门相关资料', url: 'https://www.imaemon.co.jp/about/' },
    ],
  },
  'nakazato-muan': {
    nameZh: '中里无庵（十二代中里太郎右卫门）',
    nameJa: '中里無庵（十二代中里太郎右衛門）',
    nameEn: 'Nakazato Muan',
    birthYear: 1895,
    deathYear: 1985,
    bio: '1895年生于唐津窑业世家，1927年继承十二代中里太郎右卫门。其最重要的贡献是通过古窑址调查与烧成实验复兴古唐津技法，使斑唐津、刷毛目、御本手等桃山系表情重新回到现代视野。1976年被认定为“唐津烧”重要无形文化财保持者，是近现代唐津复兴的核心人物。',
    region: '佐贺县・唐津',
    style: '古唐津复兴、御本手、刷毛目、粉引',
    sources: [
      { title: '中里太郎右卫门陶房', url: 'https://www.nakazato-taroemon.com/' },
      { title: '中里无庵相关资料', url: 'https://www.karatsu-kankou.jp/feature/nakazato.html' },
    ],
  },
  'miwa-jusetsu': {
    nameZh: '三轮壽雪',
    nameJa: '三輪壽雪',
    nameEn: 'Miwa Jusetsu',
    birthYear: 1910,
    deathYear: 2012,
    bio: '1910年生于萩烧名门三轮家，后袭名十一代休雪，晚年号壽雪。其“鬼萩”与强烈白化妆土、粉引效果使萩烧茶碗表面产生粗犷而丰富的白色肌理，是近现代粉引与萩白釉系统中极具辨识度的存在。1983年被认定为“萩烧”重要无形文化财保持者。',
    region: '山口县・萩市',
    style: '萩烧、鬼萩、白化妆土、粉引效果',
    sources: [
      { title: '三轮窑官方站', url: 'https://www.hagiyaki-miwa.com/' },
      { title: '三轮壽雪相关资料', url: 'https://www.hagishi.com/search/detail.php?d=900013' },
    ],
  },
  'uchida-koichi': {
    nameZh: '内田鋼一',
    nameJa: '内田鋼一',
    nameEn: 'Uchida Koichi',
    birthYear: 1969,
    deathYear: null,
    bio: '1969年生。曾在东南亚、中东与西非等地旅行并参与制陶，回国后于四日市独立。其作品从茶碗、急须、花器到大型陶壁跨度很大，常将粉引、土器感和木烧经验转化为带有现代结构感的表面语汇，是当代日本最受关注的跨界型陶艺家之一。',
    region: '三重县・四日市',
    style: '粉引、土器感、现代结构感器物',
    sources: [
      { title: 'G-Call 内田鋼一介绍', url: 'https://www.g-call.com/art/uchida/' },
      { title: 'BANKO archive design museum', url: 'https://banko.info/' },
    ],
  },
  'tokuda-yasokichi': {
    nameZh: '三代德田八十吉',
    nameJa: '三代徳田八十吉',
    nameEn: 'Tokuda Yasokichi III',
    birthYear: 1933,
    deathYear: 2009,
    bio: '1933年生于九谷烧名门。以“燿彩”技法闻名，通过高温釉层重叠和色彩渐变在器物表面形成近乎结晶般的光彩流动效果，重塑了九谷烧在现代工艺中的位置。1997年被认定为“彩釉磁器”重要无形文化财保持者，是现代高温色釉系统的代表性人物。',
    region: '石川县・小松市',
    style: '九谷烧、燿彩、彩釉磁器',
    sources: [
      { title: '德田八十吉窑', url: 'https://www.tokuda-yasokichi.com/' },
      { title: '德田八十吉窑资料', url: 'https://www.tokuda-yasokichi.com/about/' },
    ],
  },
  'raku-kichizaemon-xv': {
    nameZh: '十五代乐吉左卫门',
    nameJa: '十五代樂吉左衛門',
    nameEn: 'Raku Kichizaemon XV',
    birthYear: 1949,
    deathYear: null,
    bio: '1949年生，乐家第十五代当主。其创作在继承黑乐与赤乐传统基础上，更强调茶碗内部空间、火痕和手造感所形成的精神张力。既是乐烧家元体系的继承者，也是将乐烧引入当代艺术语境的关键人物之一。',
    region: '京都',
    style: '乐烧、黑乐、赤乐、手造茶碗',
    websiteUrl: 'https://www.raku-yaki.or.jp/',
    sources: [
      { title: '乐美术馆 / 乐家资料', url: 'https://www.raku-yaki.or.jp/' },
      { title: 'Raku family history', url: 'https://www.raku-yaki.or.jp/e/history/index.html' },
    ],
  },
  chojiro: {
    nameZh: '长次郎',
    nameJa: '長次郎',
    nameEn: 'Chojiro',
    birthYear: null,
    deathYear: null,
    bio: '16世纪后半活跃于京都的陶工，被视为乐烧初代。受千利休审美影响，以手捏成形、低温烧成和引出急冷方式制作茶碗，确立了黑乐与赤乐的基础范式。其作品以极端克制、静穆而富有精神性的造型成为侘茶审美的经典。',
    region: '京都',
    style: '乐烧初创、手捏茶碗、黑乐与赤乐',
    sources: [
      { title: '乐美术馆 / 长次郎资料', url: 'https://www.raku-yaki.or.jp/e/history/index.html' },
      { title: '乐烧历史介绍', url: 'https://www.raku-yaki.or.jp/' },
    ],
  },
  'honami-koetsu': {
    nameZh: '本阿弥光悦',
    nameJa: '本阿弥光悦',
    nameEn: 'Honami Koetsu',
    birthYear: 1558,
    deathYear: 1637,
    bio: '江户初期艺术家、书法家与茶人，亦为乐烧史上的关键人物。其以乐家技术体系烧制的一系列光悦乐茶碗，将文人审美、侘茶精神与乐烧的手造不对称之美结合起来，使乐烧从利休系茶道器物进一步进入更广阔的艺术史视野。',
    region: '京都',
    style: '光悦乐、文人审美、乐烧茶碗',
    sources: [
      { title: '本阿弥光悦与乐烧', url: 'https://www.raku-yaki.or.jp/e/history/index.html' },
      { title: '光悦相关资料', url: 'https://bunka.nii.ac.jp/heritages/detail/159016' },
    ],
  },
  'hayashi-kyosuke': {
    nameZh: '林恭助',
    nameJa: '林恭助',
    nameEn: 'Hayashi Kyosuke',
    birthYear: 1948,
    deathYear: null,
    bio: '现代日本天目研究的重要作家之一，长期挑战油滴、曜变与高难度铁结晶表情。其作品多以碗、盏和壶为中心，强调高温窑内铁结晶与冷却曲线对斑纹生成的决定性作用，是当代天目系实践中常被提及的名字。',
    region: '日本',
    style: '天目、曜变、油滴、铁结晶釉',
    sources: [
      { title: '林恭助 天目作品资料', url: 'https://www.tenmokugallery.com/' },
      { title: '现代天目资料', url: 'https://www.kurodatoen.co.jp/artist/hayashikyosuke/' },
    ],
  },
  'kato-hajime': {
    nameZh: '加藤土师萌',
    nameJa: '加藤土師萌',
    nameEn: 'Kato Hajime',
    birthYear: 1900,
    deathYear: 1968,
    bio: '1900年生于濑户，战后色绘磁器与高温彩釉研究的重要人物。其作品兼具装饰性和学术性，善于从中国明清彩瓷与日本近代工艺中提炼精致而稳定的色釉语言。1961年被认定为“色绘磁器”重要无形文化财保持者。',
    region: '爱知县・濑户 / 神奈川',
    style: '色绘磁器、高温彩釉、近代工艺',
    sources: [
      { title: '加藤土师萌资料', url: 'https://www.pref.kanagawa.jp/docs/yi4/cnt/f530136/' },
      { title: '加藤土师萌介绍', url: 'https://www.kurodatoen.co.jp/artist/katohajime/' },
    ],
  },
  'kuwata-takuro': {
    nameZh: '桑田卓郎',
    nameJa: '桑田卓郎',
    nameEn: 'Kuwata Takuro',
    birthYear: 1981,
    deathYear: null,
    bio: '1981年生于广岛，现于岐阜制作。其作品以爆裂、晶化、强色釉与极端夸张的器形著称，是当代日本高温实验釉的重要代表。虽然并非传统“结晶釉”专门家，但其对于釉层隆起、金属光泽和结晶表面的推进，为理解现代日本彩釉实验提供了重要线索。',
    region: '岐阜县・多治见',
    style: '实验性高温彩釉、晶化表面、当代茶碗',
    sources: [
      { title: 'Alison Jacques - Takuro Kuwata', url: 'https://alisonjacques.com/artists/takuro-kuwata' },
      { title: 'Takuro Kuwata 作品页', url: 'https://www.artspace.com/artists/takuro_kuwata' },
    ],
  },
  'shimomura-atsushi': {
    nameZh: '下村淳',
    nameJa: '下村淳',
    nameEn: 'Shimomura Atsushi',
    birthYear: 1985,
    deathYear: null,
    bio: '1985年生，早年从事网页相关工作，后转向陶艺。2017年在唐津隆太窑师从中里系作家学习，2020年在相模原独立。其器物常见刷毛目、黑刷毛目与粉引效果，并保留“目迹”等叠烧痕，是现代唐津语汇向生活器转换的活跃作家。',
    region: '神奈川县・相模原市',
    style: '刷毛目、粉引、唐津系生活器',
    sources: [
      { title: 'YUGEN 下村淳介绍', url: 'https://www.yugen-kyoto.com/ja-ar/collections/shimomura-atsushi-tw' },
      { title: '下村淳展讯', url: 'https://www.eyl.co.jp/collections/atsushi-shimomura' },
    ],
  },
  'ichino-masahiko': {
    nameZh: '市野雅彦',
    nameJa: '市野雅彦',
    nameEn: 'Ichino Masahiko',
    birthYear: 1973,
    deathYear: null,
    bio: '丹波立杭系作家，广泛运用粉引、御本手和柴烧效果来构成厚重而具茶味的器表。其作品在传统丹波土味基础上加入更细腻的白化妆与粉色窑变观察，常见于茶碗、壶与花器，是现代丹波语境中讨论御本手与粉引时的重要名字。',
    region: '兵库县・丹波篠山',
    style: '粉引、御本手、丹波烧、柴烧',
    sources: [
      { title: '市野雅彦作品页', url: 'https://www.sousou.co.jp/ichino-masahiko/' },
      { title: '丹波立杭作家介绍', url: 'https://tanbayaki.com/artist/ichino-masahiko/' },
    ],
  },
  'hamada-shoji': {
    nameZh: '濱田庄司',
    nameJa: '濱田庄司',
    nameEn: 'Hamada Shoji',
    birthYear: 1894,
    deathYear: 1978,
    bio: '1894年生，是民艺运动最具代表性的陶艺家之一。1920年代移居益子后，将柿釉、黑釉、白釉、盐釉和流挂装饰转化为日用器之美的核心语言，建立了现代益子烧的审美基调。1955年被认定为“民艺陶器”重要无形文化财保持者，其影响延续到濱田家三代与整个益子系统。',
    region: '栃木县・益子町',
    style: '民艺陶器、柿釉、黑釉、盐釉、流挂',
    sources: [
      { title: '民艺运动中的濱田庄司', url: 'https://www.douban.com/note/621280159/' },
      { title: '濱田庄司相关资料', url: 'https://www.mashiko-sankokan.net/hamadasyoji/' },
    ],
  },
  'shimaoka-tatsuzo': {
    nameZh: '岛冈达三',
    nameJa: '島岡達三',
    nameEn: 'Shimaoka Tatsuzo',
    birthYear: 1919,
    deathYear: 2007,
    bio: '1919年生，战后在濱田庄司指导下于益子独立，后发展出著名的縄文象嵌技法。除象嵌外，他也大量运用柿釉、糠釉、黑釉等民艺系统釉药来支撑朴实厚重的器形。1996年被认定为“民艺陶器（縄文象嵌）”重要无形文化财保持者，是益子传统釉药系统的重要传承者。',
    region: '栃木县・益子町',
    style: '民艺陶器、縄文象嵌、柿釉、糠釉',
    sources: [
      { title: '島岡達三相关资料', url: 'https://www.mashiko-museum.jp/collection/shimaoka/' },
      { title: '島岡達三与縄文象嵌', url: 'https://masuken.jp/column/ningenkokuhou14/' },
    ],
  },
  'hamada-tomoo': {
    nameZh: '滨田友绪',
    nameJa: '濱田友緒',
    nameEn: 'Hamada Tomoo',
    birthYear: 1967,
    deathYear: null,
    bio: '1967年生于益子，濱田窑第三代当主，也是濱田庄司的外孙。其创作与研究工作延续益子传统的柿釉、黑釉、白釉、青釉与赤绘体系，同时通过展览和驻留活动把濱田家工艺传统转译到国际观众面前。作为今日益子传统釉药系统的重要维护者，他在工房与研究馆两端都承担关键角色。',
    region: '栃木县・益子町',
    style: '益子传统釉药、柿釉、黑釉、白釉、赤绘',
    sources: [
      { title: '濱田窑 / 濱田友绪资料', url: 'https://mashiko-hamada.com/' },
      { title: '濱田友绪工房信息', url: 'https://mashiko-hamada.com/tomoo/' },
    ],
  },
}

function buildArtists() {
  const artists = loadArtistBases()

  mergeArtistArrays(artists, [
    'data/artists-awards-exhibitions-batch-1.json',
    'data/artists-awards-exhibitions-batch-2.json',
    'data/artists-awards-exhibitions-batch-4.json',
    'data/artists-awards-exhibitions-batch-5.json',
    'data/artists-awards-exhibitions-batch-6.json',
  ], 'awards')

  mergeArtistArrays(artists, [
    'data/artists-awards-exhibitions-batch-1.json',
    'data/artists-awards-exhibitions-batch-2.json',
    'data/artists-awards-exhibitions-batch-4.json',
    'data/artists-awards-exhibitions-batch-5.json',
    'data/artists-awards-exhibitions-batch-6.json',
  ], 'exhibitions')

  mergeStudioData(artists, [
    'data/artists-studio-kiln-batch-1.json',
    'data/artists-studio-kiln-batch-2.json',
    'data/artists-studio-kiln-batch-4.json',
    'data/artists-studio-kiln-batch-6.json',
    'data/artists-studio-kiln-batch-7.json',
    'data/artists-studio-kiln-batch-9.json',
    'data/artists-studio-kiln-batch-15.json',
    'data/artists-studio-kiln-batch-18.json',
  ])

  for (const [slug, seed] of Object.entries(manualArtists)) {
    const current = artists.get(slug) || { slug, sources: [] }
    artists.set(slug, {
      ...current,
      ...seed,
      slug,
      sources: uniqueBy(
        [...(seed.sources || []), ...(current.sources || [])].map(normalizeSource).filter(Boolean),
        (item) => item.url
      ),
      awards: current.awards || [],
      exhibitions: current.exhibitions || [],
    })
  }

  for (const artist of artists.values()) {
    const studioInfo = artist.studioInfo || {}
    if (!artist.birthYear && studioInfo.birthYear) artist.birthYear = studioInfo.birthYear
    if (!artist.deathYear && studioInfo.deathYear) artist.deathYear = studioInfo.deathYear
    if (!artist.websiteUrl && studioInfo.website) artist.websiteUrl = normalizeUrl(studioInfo.website)
    if (!artist.instagramHandle && studioInfo.instagram) {
      artist.instagramHandle = String(studioInfo.instagram).replace(/^@/, '')
    }
    artist.awards = artist.awards || []
    artist.exhibitions = artist.exhibitions || []
    artist.sources = uniqueBy((artist.sources || []).map(normalizeSource).filter(Boolean), (item) => item.url)
  }

  return artists
}

function findTechniqueEntries() {
  const sources = [
    ...loadJson('data/glaze-technique-entries.json'),
    ...loadJson('data/batch-important-techniques.json'),
  ]
  const bySlug = new Map()
  for (const entry of sources) bySlug.set(entry.slug, entry)
  return bySlug
}

const techniqueSpecs = [
  {
    slug: 'shino-yaku',
    lookupSlug: 'shino-glaze',
    nameZh: '志野釉',
    nameJa: '志野釉（しのゆう）',
    nameEn: 'Shino Glaze',
    category: '釉药技法',
    region: '岐阜县・美浓',
    type: '长石釉',
    positioning: '桃山茶陶核心白釉，以厚釉、绯色和针孔见长。',
    keywords: ['志野釉', '美浓烧', '桃山茶陶', '长石釉', '绯色', '针孔', '鈴木藏', '荒川丰藏', '加藤孝造'],
    artistSlugs: ['suzuki-osamu', 'arakawa-toyozo', 'kato-takao'],
    representativeForms: ['茶碗', '向付', '水指', '香合', '花入'],
    sources: [
      { title: '志野釉专业资料', url: 'https://touroji.com/yuuyakunosyurui/shinoyuu.html' },
      { title: '鈴木藏工房', url: 'https://www.suzuki-osamu.jp/' },
    ],
  },
  {
    slug: 'oribe-yaku',
    lookupSlug: 'oribe-glaze',
    nameZh: '织部釉',
    nameJa: '織部釉（おりべゆう）',
    nameEn: 'Oribe Glaze',
    category: '釉药技法',
    region: '岐阜县・美浓',
    type: '铜绿釉',
    positioning: '以铜绿色为标志，体现桃山时代最自由的茶陶语言。',
    keywords: ['织部釉', '铜绿釉', '青织部', '黑织部', '古田织部', '美浓烧', '加藤唐九郎', '荒川丰藏'],
    artistSlugs: ['arakawa-toyozo', 'kato-tokuro', 'suzuki-osamu'],
    representativeForms: ['沓形茶碗', '向付', '盘', '花入', '食笼'],
    sources: [
      { title: '织部相关专业资料', url: 'https://touroji.com/choice/oribe.html' },
      { title: '爱知县陶瓷美术馆 加藤唐九郎资料', url: 'https://www.pref.aichi.jp/touji/exhibition/2019/special_tokuro/' },
    ],
  },
  {
    slug: 'seiji-yu',
    lookupSlug: 'seiji-celadon',
    nameZh: '青磁釉',
    nameJa: '青磁釉（せいじゆう）',
    nameEn: 'Celadon Glaze',
    category: '釉药技法',
    region: '日本全国（以佐渡、美浓、有田为线索）',
    type: '青绿色透明釉',
    positioning: '以还原烧成下的青绿色透明感，呈现玉质般的宁静气息。',
    artistSlugs: ['miura-koheiji', 'tsukamoto-kaiji', 'imaizumi-imaemon-xiii'],
    representativeForms: ['壶', '花器', '水指', '盒', '香炉'],
    sources: [
      { title: '青磁概述', url: 'https://ja.wikipedia.org/wiki/%E9%9D%92%E7%A3%81' },
      { title: '三浦小平二作品资料', url: 'https://www.momat.go.jp/craft-museum/collections/items/koheiji-miura' },
    ],
  },
  {
    slug: 'hakuji-yu',
    lookupSlug: 'hakuji',
    nameZh: '白磁釉',
    nameJa: '白磁釉（はくじゆう）',
    nameEn: 'White Porcelain Glaze',
    category: '釉药技法',
    region: '佐贺县・有田 / 鸟取县',
    type: '透明釉磁器',
    positioning: '以极高纯度白瓷胎和透明釉追求无装饰之美。',
    artistSlugs: ['inoue-manji', 'maeda-akihiro', 'sakaida-kakiemon-xv'],
    representativeForms: ['壶', '钵', '皿', '花瓶', '香炉'],
    sources: [
      { title: '井上萬二官方站', url: 'https://www.manjiinoue.com/' },
      { title: '柿右卫门官方站', url: 'https://www.kakiemon.co.jp/' },
    ],
  },
  {
    slug: 'tenmoku-yu',
    lookupSlug: 'tenmoku-glaze',
    nameZh: '天目釉',
    nameJa: '天目釉（てんもくゆう）',
    nameEn: 'Tenmoku Glaze',
    category: '釉药技法',
    region: '濑户 / 美浓 / 京都',
    type: '铁结晶黑釉',
    positioning: '以高铁黑釉与结晶斑纹见长，是茶碗世界中的深色经典。',
    keywords: ['天目釉', '黑釉', '铁结晶', '油滴', '曜变', '茶碗', '清水卯一', '石黑宗麿'],
    artistSlugs: ['shimizu-uichi', 'ishiguro-munemaro', 'hayashi-kyosuke'],
    representativeForms: ['茶碗', '盏', '壶', '盘', '花器'],
    sources: [
      { title: '天目釉条目', url: 'https://ja.wikipedia.org/wiki/%E5%A4%A9%E7%9B%AE' },
      { title: '现代天目资料', url: 'https://www.kurodatoen.co.jp/artist/hayashikyosuke/' },
    ],
  },
  {
    slug: 'tetsu-yu',
    nameZh: '铁釉',
    nameJa: '鉄釉（てつゆう）',
    nameEn: 'Iron Glaze',
    category: '釉药技法',
    region: '京都 / 益子 / 美浓',
    type: '高铁发色釉',
    positioning: '以铁分发色为核心，覆盖黑釉、柿釉和深褐色系统。',
    description: '铁釉是以氧化铁为主要着色来源的高温釉药总称，在日本茶陶与民艺器物体系中具有极高覆盖率。根据釉方、胎土和气氛差异，铁釉可以呈现漆黑、赤褐、柿色、飴色甚至近似天目的结晶表情，因此既是传统窑场中最基础的发色系统之一，也是最能体现材料和火候微差的釉层类型。京都系铁釉重视器形和釉色的凝练，益子与民艺系统则常把铁釉与流挂、刷毛目和象嵌并置，形成更生活化的审美。现代作家如清水卯一和石黑宗麿将铁釉推向高度精神性表达，而岛冈达三、濱田系作家则让铁釉继续服务于“用之美”。',
    positioning: '从黑釉到柿釉，铁分控制决定了日本高温釉的深色骨架。',
    signatureFeatures: [
      '以氧化铁作为主要着色源',
      '同一系统可呈现黑、褐、柿、飴等变化',
      '与还原或氧化气氛高度相关',
      '常见于茶碗、壶、钵等高温器物',
      '能与流挂、象嵌、刷毛目组合使用',
    ],
    keywords: ['铁釉', '黑釉', '柿釉', '天目', '高温釉', '茶陶', '清水卯一', '石黑宗麿'],
    artistSlugs: ['shimizu-uichi', 'ishiguro-munemaro', 'shimaoka-tatsuzo'],
    representativeForms: ['茶碗', '壶', '钵', '皿', '花器'],
    sources: [
      { title: '清水卯一资料', url: 'https://www.kogei-japan.com/locale/ja_JP/shimizuuichi/' },
      { title: '石黑宗麿资料', url: 'https://www.kurodatoen.co.jp/artist/ishiguromunemaro/' },
    ],
  },
  {
    slug: 'hai-yu',
    lookupSlug: 'ash-glaze',
    nameZh: '灰釉',
    nameJa: '灰釉（はいゆう）',
    nameEn: 'Ash Glaze',
    category: '釉药技法',
    region: '信乐 / 静冈 / 日本各地木烧系',
    type: '植物灰釉',
    positioning: '以草木灰为基础，是最能体现柴烧自然性的传统釉药。',
    keywords: ['灰釉', '植物灰', '柴烧', '穴窑', '自然落灰', '信乐', '大谷哲也', '古谷宣幸', '村木雄児'],
    artistSlugs: ['otani-tetsuya', 'furutani-nobuyuki', 'muraki-yuji'],
    representativeForms: ['碗', '壶', '皿', '土锅', '花器'],
    sources: [
      { title: '灰釉条目', url: 'https://zh.wikipedia.org/zh-hans/%E7%81%B0%E9%87%89' },
      { title: '古谷製陶所', url: 'https://galleryfumoto.com/collections/%E5%8F%A4%E8%B0%B7%E8%A3%BD%E9%99%B6%E6%89%80' },
    ],
  },
  {
    slug: 'shinsha-yu',
    lookupSlug: 'shinsha',
    nameZh: '辰砂釉',
    nameJa: '辰砂釉（しんしゃゆう）',
    nameEn: 'Copper Red Glaze',
    category: '釉药技法',
    region: '京都 / 奈良 / 东京',
    type: '铜红釉',
    positioning: '以微量铜在还原气氛中发出红色，是高温色釉中的难点项目。',
    artistSlugs: ['tomimoto-kenkichi', 'kondo-yuzo', 'fujimoto-yoshimichi'],
    representativeForms: ['花瓶', '壶', '皿', '盒', '装饰器'],
    sources: [
      { title: '辰砂条目', url: 'https://ja.wikipedia.org/wiki/%E8%BE%B0%E7%A0%82' },
      { title: '辰砂说明 - 三池烧', url: 'https://miikeyaki.net/sinsya_ni_tuite/' },
    ],
  },
  {
    slug: 'ruri-yu',
    nameZh: '瑠璃釉',
    nameJa: '瑠璃釉（るりゆう）',
    nameEn: 'Lapis Blue Glaze',
    category: '釉药技法',
    region: '有田 / 唐津',
    type: '钴蓝釉',
    description: '瑠璃釉是以氧化钴为主要着色剂烧成的深蓝色釉药，在日本磁器体系中常与白磁胎、赤绘和金彩形成鲜明对比。其色泽可以从近乎夜空的深蓝到带紫调的明亮钴蓝不等，既可整器满施，也可作为局部色块或口沿、盖钮等视觉重心使用。在有田和色锅岛系统中，瑠璃常被用来衬托赤绘、金彩和白磁的层次；在唐津与京烧语境中，它又经常承担更厚重的背景色或器形轮廓强化功能。瑠璃釉最困难的部分在于发色均匀和釉层深度控制，过厚会失去透明感，过薄则难以形成庄重蓝调，因此历来被视为高阶色釉。',
    positioning: '深蓝钴釉让白磁和色绘拥有最强烈的视觉对比。',
    signatureFeatures: [
      '以氧化钴作为主要着色剂',
      '呈现从深蓝到紫蓝的高饱和色层',
      '常与白磁胎、赤绘或金彩并置',
      '整器施釉与局部施色都常见',
      '要求釉层均匀且厚薄精准',
    ],
    keywords: ['瑠璃釉', '钴蓝釉', '色锅岛', '有田烧', '白磁', '高温色釉', '今右卫门', '柿右卫门'],
    artistSlugs: ['imaizumi-imaemon-xiii', 'sakaida-kakiemon-xv', 'nakazato-muan'],
    representativeForms: ['香炉', '花瓶', '皿', '盒', '茶器'],
    sources: [
      { title: '今右卫门官方站', url: 'https://www.imaemon.co.jp/' },
      { title: '柿右卫门官方站', url: 'https://www.kakiemon.co.jp/' },
    ],
  },
  {
    slug: 'ki-seto-yu',
    lookupSlug: 'ki-seto-glaze',
    nameZh: '黄濑户',
    nameJa: '黄瀬戸（きせと）',
    nameEn: 'Ki-Seto Glaze',
    category: '釉药技法',
    region: '濑户 / 美浓',
    type: '黄釉',
    positioning: '以温润黄调和胆矾绿彩构成桃山茶陶中的暖色系经典。',
    keywords: ['黄濑户', '黄釉', '胆矾绿彩', '美浓烧', '濑户', '桃山茶陶', '荒川丰藏', '加藤唐九郎', '加藤孝造'],
    artistSlugs: ['arakawa-toyozo', 'kato-tokuro', 'kato-takao'],
    representativeForms: ['茶碗', '向付', '香合', '花入', '盘'],
    sources: [
      { title: '黄濑户相关资料', url: 'https://www.pref.aichi.jp/touji/exhibition/2019/special_tokuro/' },
      { title: '黄濑户基础条目', url: 'https://ja.wikipedia.org/wiki/%E9%BB%84%E7%80%AC%E6%88%B8' },
    ],
  },
  {
    slug: 'raku-yu',
    nameZh: '乐釉',
    nameJa: '楽釉（らくゆう）',
    nameEn: 'Raku Glaze',
    category: '釉药技法',
    region: '京都',
    type: '低温乐烧釉',
    description: '乐烧体系以手捏成形、低温烧成和出窑急冷为基础，其中黑乐与赤乐两大系统构成了所谓“乐釉”的核心外观经验。与高温长石釉或灰釉不同，乐釉更强调胎体与釉层在低温中的快速变化，以及制作者手直接塑形后留下的微妙起伏。黑乐通常沉稳深黑，吸光而厚重；赤乐则在赤土和透明釉配合下展现温暖的砖红与朱色。乐釉并不依赖复杂装饰，而是以表层紧张感、口缘与足部处理、以及拿在手中的重量和平衡来建立价值。自长次郎以来，乐家世代对釉药调配、烧成时机和精神性审美持续推进，使其成为日本茶陶体系中最具象征性的釉层经验之一。',
    positioning: '黑乐与赤乐以低温急冷塑造出最具侘茶精神的茶碗表面。',
    signatureFeatures: [
      '手捏成形而非轆轤成形',
      '低温烧成并常在烧成中出窑',
      '黑乐与赤乐为两大核心系统',
      '釉层强调吸光感和手感',
      '高度服务于茶道审美与精神性',
    ],
    keywords: ['乐烧', '乐釉', '黑乐', '赤乐', '长次郎', '乐吉左卫门', '侘茶', '京都'],
    artistSlugs: ['raku-kichizaemon-xv', 'chojiro', 'honami-koetsu'],
    representativeForms: ['茶碗'],
    sources: [
      { title: '乐美术馆 / 乐家资料', url: 'https://www.raku-yaki.or.jp/' },
      { title: 'Raku family history', url: 'https://www.raku-yaki.or.jp/e/history/index.html' },
    ],
  },
  {
    slug: 'kohiki-yu',
    lookupSlug: 'kohiki',
    nameZh: '粉引',
    nameJa: '粉引（こひき）',
    nameEn: 'Kohiki',
    category: '釉药技法',
    region: '萩 / 唐津 / 日本各地',
    type: '白化妆土技法',
    positioning: '白化妆土与透明釉叠加出的柔和白感，是最具亲近性的茶与食器表面之一。',
    artistSlugs: ['miwa-jusetsu', 'nakazato-muan', 'uchida-koichi'],
    representativeForms: ['茶碗', '钵', '盘', '德利', '花器'],
    sources: [
      { title: '粉引条目', url: 'https://ja.wikipedia.org/wiki/%E7%B2%89%E5%BC%95' },
      { title: '粉引说明', url: 'https://afugi.net/districtproduct/02tableware/pottery/10420/' },
    ],
  },
  {
    slug: 'kessho-yu',
    nameZh: '结晶釉',
    nameJa: '結晶釉（けっしょうゆう）',
    nameEn: 'Crystal Glaze',
    category: '釉药技法',
    region: '九谷 / 美浓 / 当代实验陶艺',
    type: '高温结晶釉',
    description: '结晶釉指在高温烧成与控制冷却过程中，让釉层内部析出可视晶体花纹的釉药系统。其形成依赖釉中锌、钛等成分以及精确的保温和降温程序，因此与传统单一发色釉相比，对窑程控制要求更高。日本语境中，严格意义的结晶釉并不总是与某一单独窑系绑定，但在九谷烧的彩釉实验、现当代美浓系高温色釉和当代陶艺对晶化表面的追求中，都能看到它的影响。作品往往会出现星点、放射状花纹或近似矿物生长的肌理，这使其在近现代日本工艺中成为最具观赏性的釉层类型之一，也经常与器物造型、雕塑性和展览性结合。',
    positioning: '通过窑程控制让釉层“长出”晶体，是最具实验性的高温彩釉之一。',
    signatureFeatures: [
      '依赖保温与控制冷却形成晶体',
      '釉层常见放射状或矿物状纹样',
      '高温配方中常含锌等结晶促进成分',
      '作品之间差异极大，偶然性高',
      '常用于展览性较强的现代器物与雕塑',
    ],
    keywords: ['结晶釉', '晶化', '高温彩釉', '九谷烧', '燿彩', '当代陶艺', '德田八十吉', '桑田卓郎'],
    artistSlugs: ['tokuda-yasokichi', 'kato-hajime', 'kuwata-takuro'],
    representativeForms: ['花瓶', '壶', '盒', '雕塑器', '茶碗'],
    sources: [
      { title: '德田八十吉窑', url: 'https://www.tokuda-yasokichi.com/' },
      { title: '桑田卓郎艺术家页面', url: 'https://alisonjacques.com/artists/takuro-kuwata' },
    ],
  },
  {
    slug: 'gohonte-yu',
    nameZh: '御本手',
    nameJa: '御本手（ごほんで）',
    nameEn: 'Gohonte',
    category: '釉药技法',
    region: '唐津 / 丹波',
    type: '铁分红斑表情',
    description: '御本手原本是茶人对某类带有淡红、粉红或火色斑点茶碗的称呼，后被视作一种可辨认的表面现象。它通常出现在粉引、唐津、萩等白化妆土或浅色釉层之上，成因与胎土或化妆土中的铁分、窑内气氛和烧成位置密切相关。典型御本手并非直接“画出”的红，而是白色或淡色表面上自然浮现的红斑、口红或高台周围色晕，因此极具偶然性和茶席趣味。日本近现代作家尤其重视这种不完全可控的发色，因为它与茶碗的景色感、使用后的变化和窑变哲学紧密相连。复兴古唐津的中里无庵一系，以及丹波和当代茶陶作家，都把御本手视作粉引与白化妆土世界中的重要观察点。',
    positioning: '白色表面自然浮出的粉红火色，是茶碗景色中的细腻惊喜。',
    signatureFeatures: [
      '多见于白化妆土或浅色釉层表面',
      '呈现粉红、淡红或口红般斑点',
      '与铁分、窑位和气氛变化密切相关',
      '偶然性强，难以完全复制',
      '常被茶人视为器物“景色”的核心之一',
    ],
    keywords: ['御本手', '唐津烧', '粉引', '红斑', '茶碗', '窑变', '中里无庵', '丹波烧'],
    artistSlugs: ['nakazato-muan', 'shimomura-atsushi', 'ichino-masahiko'],
    representativeForms: ['茶碗', '盃', '壶', '盘', '花器'],
    sources: [
      { title: '唐津烧发祥说明', url: 'http://karatsuyakinosato.jp/karatsuyakinokoto.html' },
      { title: '中里太郎右卫门陶房', url: 'https://www.nakazato-taroemon.com/' },
    ],
  },
  {
    slug: 'kaki-yu',
    nameZh: '柿釉',
    nameJa: '柿釉（かきゆう）',
    nameEn: 'Persimmon Glaze',
    category: '釉药技法',
    region: '益子 / 民艺系统',
    type: '铁分褐红釉',
    description: '柿釉是日本民艺陶器中最具代表性的暖色高温釉之一，因釉面常呈现熟柿般的赤褐、橙褐或深赭色而得名。其基础仍是铁分发色系统，但与单纯黑釉、飴釉相比，柿釉更强调温暖、厚实和日常器皿的包容感。益子烧和民艺运动使柿釉广为人知：濱田庄司及其后的濱田家、岛冈达三等作家，常将柿釉与流挂、白釉、黑釉、刷毛目或赤绘并置，形成层次丰富而不失朴素的器表。柿釉的难点在于铁分比例、胎土吸收性和烧成气氛的协调，稍有偏差就会偏黑或偏干，因此优秀柿釉作品往往兼具厚重与透明感。它既是“用之美”的颜色，也是现代益子传统的视觉象征。',
    positioning: '温暖赤褐色让民艺器物既厚实又亲近，是益子传统釉药的核心之一。',
    signatureFeatures: [
      '以铁分发出柿色、赭褐或赤褐色',
      '常与流挂、白釉、黑釉搭配',
      '在益子和民艺器物中极为常见',
      '兼具厚重感与温暖透明感',
      '适用于日用钵盘与茶器',
    ],
    keywords: ['柿釉', '益子烧', '民艺', '铁釉', '濱田庄司', '島岡達三', '用之美', '暖色高温釉'],
    artistSlugs: ['hamada-shoji', 'shimaoka-tatsuzo', 'hamada-tomoo'],
    representativeForms: ['大皿', '钵', '茶碗', '壶', '花器'],
    sources: [
      { title: '濱田窑 / 濱田友绪', url: 'https://mashiko-hamada.com/tomoo/' },
      { title: '岛冈达三与益子传统', url: 'https://masuken.jp/column/ningenkokuhou14/' },
    ],
  },
]

function buildTechniques(artistsBySlug) {
  const existing = findTechniqueEntries()
  return techniqueSpecs.map((spec) => {
    const base = spec.lookupSlug ? existing.get(spec.lookupSlug) || {} : {}
    const relatedArtistsDetail = spec.artistSlugs.map((slug) => {
      const artist = artistsBySlug.get(slug)
      if (!artist) throw new Error(`Missing artist detail for ${slug}`)
      return {
        artistSlug: slug,
        nameZh: artist.nameZh,
        nameJa: artist.nameJa,
        nameEn: artist.nameEn,
        birthYear: artist.birthYear ?? null,
        deathYear: artist.deathYear ?? null,
        bio: artist.bio,
        kilnName: artist.kilnName || null,
        studioName: artist.studioName || null,
        locationPrefecture: artist.locationPrefecture || null,
        locationCity: artist.locationCity || null,
        region: artist.region || null,
        style: artist.style || null,
        awards: artist.awards || [],
        exhibitions: artist.exhibitions || [],
        instagramHandle: artist.instagramHandle || null,
        websiteUrl: artist.websiteUrl || null,
        sources: artist.sources || [],
      }
    })

    const sources = uniqueBy(
      [...(spec.sources || []), ...(base.sources || [])].map(normalizeSource).filter(Boolean),
      (item) => item.url
    )

    return {
      slug: spec.slug,
      nameZh: spec.nameZh,
      nameJa: spec.nameJa,
      nameEn: spec.nameEn,
      category: spec.category,
      region: spec.region,
      type: spec.type,
      description: spec.description || base.description,
      positioning: spec.positioning || base.positioning,
      signatureFeatures: spec.signatureFeatures || base.signatureFeatures || [],
      keywords: uniqueBy(
        [...(spec.keywords || []), ...(base.keywords || [])].map((item) => String(item)),
        (item) => item
      ),
      notableArtists: relatedArtistsDetail.map((artist) => artist.nameZh),
      representativeForms: spec.representativeForms || base.representativeForms || [],
      images: [],
      sources,
      relatedArtistsDetail,
    }
  })
}

function buildArtistOutput(artistsBySlug, techniques) {
  const usedSlugs = uniqueBy(
    techniques.flatMap((technique) => technique.relatedArtistsDetail.map((artist) => artist.artistSlug)),
    (item) => item
  )
  return usedSlugs.map((slug) => {
    const artist = artistsBySlug.get(slug)
    return {
      artistSlug: slug,
      nameZh: artist.nameZh,
      nameJa: artist.nameJa,
      nameEn: artist.nameEn,
      birthYear: artist.birthYear ?? null,
      deathYear: artist.deathYear ?? null,
      bio: artist.bio,
      kilnName: artist.kilnName || null,
      studioName: artist.studioName || null,
      locationPrefecture: artist.locationPrefecture || null,
      locationCity: artist.locationCity || null,
      region: artist.region || null,
      style: artist.style || null,
      awards: artist.awards || [],
      exhibitions: artist.exhibitions || [],
      instagramHandle: artist.instagramHandle || null,
      websiteUrl: artist.websiteUrl || null,
      sources: artist.sources || [],
    }
  })
}

function buildSourcesList(techniques, artists) {
  const lines = ['# Task 01 Sources', '', `生成日期: ${ACCESSED_AT}`, '']

  lines.push('## Technique Sources', '')
  for (const technique of techniques) {
    lines.push(`### ${technique.nameZh}`)
    for (const source of technique.sources) {
      lines.push(`- [${source.title}](${source.url})`)
    }
    lines.push('')
  }

  lines.push('## Artist Sources', '')
  for (const artist of artists) {
    lines.push(`### ${artist.nameZh}`)
    for (const source of artist.sources) {
      lines.push(`- [${source.title}](${source.url})`)
    }
    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}

function validate(techniques, artists) {
  if (techniques.length !== 15) throw new Error(`Expected 15 techniques, got ${techniques.length}`)
  if (artists.length < 15) throw new Error(`Expected at least 15 detailed artists, got ${artists.length}`)

  for (const technique of techniques) {
    if (technique.relatedArtistsDetail.length < 3) {
      throw new Error(`${technique.slug} has fewer than 3 related artists`)
    }
    if (!Array.isArray(technique.sources) || technique.sources.length < 2) {
      throw new Error(`${technique.slug} has fewer than 2 sources`)
    }
  }
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`)
}

function main() {
  const artistsBySlug = buildArtists()
  const techniques = buildTechniques(artistsBySlug)
  const relatedArtists = buildArtistOutput(artistsBySlug, techniques)
  validate(techniques, relatedArtists)

  writeJson('glaze-techniques.json', techniques)
  writeJson('related-artists-detail.json', relatedArtists)
  fs.writeFileSync(path.join(ROOT, 'sources-list.md'), buildSourcesList(techniques, relatedArtists))

  console.log(`techniques=${techniques.length}`)
  console.log(`artists=${relatedArtists.length}`)
}

if (require.main === module) {
  main()
}

module.exports = {
  buildArtists,
  buildTechniques,
  buildArtistOutput,
  buildSourcesList,
  main,
}
