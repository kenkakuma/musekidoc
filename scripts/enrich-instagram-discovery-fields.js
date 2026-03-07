const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')

const PATCHES = {
  'aya_ogawa_ig': { gender: 'female', nameKana: 'おがわ あや' },
  'kaorikurihara.ceramique': { gender: 'female', nameKana: 'くりはら かおり' },
  'yy_pottery': { gender: 'female', nameKana: 'やまだ ゆきこ' },
  'karugane_akari': { gender: 'female', nameKana: 'かるがね あかり' },
  'daisukekameta': { gender: 'female', nameKana: 'かめだ ふみ' },
  'uchidamidori': { gender: 'female', nameKana: 'うちだ みどり' },
  'hitomihosono': { gender: 'female', nameKana: 'ほその ひとみ' },
  '_narumiyashiro_': { gender: 'female', nameKana: 'やしろ なるみ' },
  'kurokawa_toru_': { gender: 'male', nameKana: 'くろかわ とおる' },
  'iwasakiryuji': { gender: 'male', nameKana: 'いわさき りゅうじ' },
  's_tomoya1212': { gender: 'male', nameKana: 'さかい ともや' },
  'takurokuwata': { gender: 'male', nameKana: 'くわた たくろう' },
  'bizen_kazuya': { gender: 'male', nameKana: 'いしだ かずや' },
  'shingo_takeuchi_': { gender: 'male', nameKana: 'たけうち しんご' },
  'nceramicstudio': { gender: 'male', nameKana: 'ぬかが あきお' },
  'tomoohamada': { gender: 'male', nameKana: 'はまだ ともお', locationPrefecture: '栃木县', locationCity: '益子町', locationArea: '益子' },
  'hashimoto_tomonari': { gender: 'male', nameKana: 'はしもと ともなり', locationPrefecture: '滋贺县', locationCity: '甲贺市', locationArea: '信乐町' },
  'koudaiujiie': { gender: 'male', nameKana: 'うじいえ こうだい' },
  'bonoho_': { gender: 'male', nameKana: 'さとう なおみち' },
  'yuji____ueda': { gender: 'male', nameKana: 'うえだ ゆうじ', locationPrefecture: '滋贺县', locationCity: '甲贺市', locationArea: '信乐町' },
  'tomoyukihoshino': { gender: 'male', nameKana: 'ほしの ともゆき' },
  'daisuke_igucci': { gender: 'male', nameKana: 'いぐち だいすけ' },
  'yutasegawa_ceramics': { gender: 'male', nameKana: 'せがわ ゆうた' },
  'ryutafukumura': { gender: 'male', nameKana: 'ふくむら りゅうた' },
  't_endoh': { gender: 'male', nameKana: 'えんどう たかし' },
  'ana0929': { gender: 'male', nameKana: 'あなやま だいすけ' },
  'kobo_daidai': { gender: 'male', nameKana: 'すずき たかし', locationPrefecture: '神奈川县', locationCity: '小田原市', locationArea: '根府川' },
  'takahiro00koga': { gender: 'male', nameKana: 'こが たかひろ' },
  'eniwamura': { gender: 'male', nameKana: 'いわむら えん' },
  'masayama.kai': { gender: 'male', nameKana: 'やまもと まさひこ' },
  'shin3kibou': { gender: 'male', nameKana: 'しのはら のぞむ', locationPrefecture: '滋贺县', locationCity: '甲贺市', locationArea: '信乐町' },
  'abe_haruya': { gender: 'male', nameKana: 'あべ はるや' },
  'akihiro_nikaido': { gender: 'male', nameKana: 'にかいどう あきひろ' },
  'yamadyoji': { gender: 'male', nameKana: 'やまだ ようじ' },
  'shuo_iwakiri': { gender: 'male', nameKana: 'いわきり しゅうおう' },
  'otntty': { gender: 'male', nameKana: 'おおたに てつや', locationPrefecture: '滋賀県', locationCity: '甲賀市', locationArea: '信楽町田代' },
  'tcovayaci': { gender: 'male', nameKana: 'こばやし てつや', locationPrefecture: '爱知县', locationCity: '濑户市', locationArea: '濑户' },
  'cyilabo': { gender: 'female', nameKana: 'さかぐち ちか' },
  'ryutaro4126': { gender: 'male', nameKana: 'やまだ りゅうたろう' },
}

function applyPatch(artist) {
  const patch = PATCHES[artist.instagramHandle]
  if (!patch) return artist
  return { ...artist, ...patch }
}

function main() {
  const files = fs.readdirSync(DATA_DIR)
    .filter((name) => /^discovered-instagram-artists-batch-\d+\.json$/.test(name))
    .map((name) => path.join(DATA_DIR, name))

  const summary = []
  for (const file of files) {
    const before = JSON.parse(fs.readFileSync(file, 'utf8'))
    const after = before.map(applyPatch)
    fs.writeFileSync(file, `${JSON.stringify(after, null, 2)}\n`)
    summary.push({ file, count: after.length })
  }

  console.log(JSON.stringify({ updatedFiles: summary.length, files: summary }, null, 2))
}

main()
