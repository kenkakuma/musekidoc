/**
 * 修复知识库审核中发现的问题
 * - P0: Instagram handle 格式错误
 * - P1: 缺失 type 字段
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`)
}

/**
 * 推断来源类型
 */
function inferSourceType(url, title) {
  // Instagram
  if (url.includes('instagram.com')) return '社交媒体'

  // 官方机构
  if (url.includes('artplatform.go.jp')) return '官方资料'
  if (url.includes('mingeikan.or.jp')) return '机构资料'
  if (url.includes('momat.go.jp')) return '机构资料'
  if (url.includes('.go.jp') || url.includes('bunka.nii.ac.jp')) return '官方资料'

  // 展会和画廊
  if (url.includes('kogei-artfair.jp')) return '展讯媒体'
  if (url.includes('gallery') || url.includes('monzen')) return '画廊资料'
  if (url.includes('gendai-tojiki.com')) return '画廊资料'

  // 生活媒体
  if (url.includes('brutus.jp')) return '生活方式媒体'
  if (url.includes('chilchinbito-hiroba.jp')) return '生活方式媒体'
  if (url.includes('paperc.info')) return '生活方式媒体'
  if (url.includes('highsnobiety.jp')) return '生活方式媒体'

  // 电商
  if (url.includes('monoina.com')) return '电商'
  if (url.includes('kohoro.jp')) return '电商'
  if (url.includes('senchado.jp')) return '电商'
  if (url.includes('coverchord.com')) return '电商'
  if (url.includes('hitonoto.com')) return '电商'
  if (url.includes('hanautsuwa.jp')) return '电商'

  // 专业资料
  if (url.includes('touroji.com')) return '专业资料'
  if (url.includes('yakimono.or.jp')) return '协会资料'

  // 根据 title 判断
  if (title && title.includes('公式网站')) return '作家官网'
  if (title && title.includes('个人网站')) return '作家官网'
  if (title && title.includes('公式プロフィール')) return '作家官网'
  if (title && title.includes('museum') || title && title.includes('美术馆')) return '机构资料'
  if (title && title.includes('gallery') || title && title.includes('画廊')) return '画廊资料'

  // 默认
  return '专题资料'
}

/**
 * P0: 修复 Instagram handle 格式
 */
function fixInstagramHandles() {
  console.log('🔧 P0: 修复 Instagram handle 格式...\n')

  const artists = readJson('artists-detail-supplemented.json')
  let fixedCount = 0

  const fixes = [
    { slug: 'ishida-kazuya', correctHandle: 'bizen_kazuya' },
    { slug: 'otani-tetsuya', correctHandle: 'otnps' },
    { slug: 'ogawa-aya', correctHandle: 'aya_ogawa_ig' },
  ]

  for (const artist of artists) {
    const fix = fixes.find(f => f.slug === artist.artistSlug)
    if (fix) {
      const oldHandle = artist.instagramHandle
      artist.instagramHandle = fix.correctHandle

      // 更新 sources 中的 Instagram URL
      artist.sources = artist.sources.map(source => {
        if (source.url && source.url.includes('instagram.com') && source.url.includes('/')) {
          const newUrl = `https://www.instagram.com/${fix.correctHandle}/`
          console.log(`  ✅ ${artist.nameZh}`)
          console.log(`     旧: ${source.url}`)
          console.log(`     新: ${newUrl}`)
          fixedCount++

          return {
            ...source,
            url: newUrl,
            title: `Instagram @${fix.correctHandle}`,
            type: source.type || '社交媒体',
          }
        }
        return source
      })
    }
  }

  writeJson('artists-detail-supplemented.json', artists)
  console.log(`\n✅ P0 修复完成：${fixedCount} 个 Instagram 链接已修正\n`)

  return fixedCount
}

/**
 * P1: 补充缺失的 type 字段
 */
function fillMissingTypes() {
  console.log('🔧 P1: 补充缺失的 type 字段...\n')

  const artists = readJson('artists-detail-supplemented.json')
  let fixedCount = 0

  for (const artist of artists) {
    for (const source of artist.sources || []) {
      if (!source.type || source.type === null) {
        const inferredType = inferSourceType(source.url || '', source.title || '')
        source.type = inferredType
        fixedCount++

        if (fixedCount <= 10) {
          console.log(`  ${artist.nameZh}: ${source.title?.substring(0, 40)}`)
          console.log(`    推断类型: ${inferredType}`)
        }
      }
    }
  }

  writeJson('artists-detail-supplemented.json', artists)
  console.log(`\n✅ P1 修复完成：${fixedCount} 个来源补充了 type 字段\n`)

  return fixedCount
}

/**
 * 验证修复结果
 */
function verifyFixes() {
  console.log('🔍 验证修复结果...\n')

  const artists = readJson('artists-detail-supplemented.json')

  // 检查 Instagram handle 错误
  const badHandles = artists.filter(a =>
    a.instagramHandle && (a.instagramHandle.includes('/') || a.instagramHandle.includes(' '))
  )

  // 检查缺失 type
  let missingTypeCount = 0
  for (const artist of artists) {
    for (const source of artist.sources || []) {
      if (!source.type || source.type === null) {
        missingTypeCount++
      }
    }
  }

  // 统计 type 分布
  const typeCount = {}
  for (const artist of artists) {
    for (const source of artist.sources || []) {
      const type = source.type || 'null'
      typeCount[type] = (typeCount[type] || 0) + 1
    }
  }

  console.log('验证结果：')
  console.log(`  Instagram handle 错误: ${badHandles.length} 个`)
  console.log(`  缺失 type 的来源: ${missingTypeCount} 个`)
  console.log('')
  console.log('来源类型分布：')
  Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

  if (badHandles.length === 0 && missingTypeCount === 0) {
    console.log('\n✅ 所有问题已修复！')
    return true
  } else {
    console.log('\n⚠️  仍有问题需要处理')
    return false
  }
}

/**
 * 主函数
 */
function main() {
  console.log('=' .repeat(60))
  console.log('知识库问题修复脚本')
  console.log('=' .repeat(60))
  console.log('')

  // P0: 修复 Instagram handles
  const p0Fixed = fixInstagramHandles()

  // P1: 补充 type 字段
  const p1Fixed = fillMissingTypes()

  // 验证
  const verified = verifyFixes()

  console.log('')
  console.log('=' .repeat(60))
  console.log('修复汇总')
  console.log('=' .repeat(60))
  console.log(`P0 - Instagram handles: ${p0Fixed} 个修复`)
  console.log(`P1 - 缺失 type 字段: ${p1Fixed} 个修复`)
  console.log(`验证状态: ${verified ? '✅ 通过' : '⚠️  部分通过'}`)
  console.log('')

  if (verified) {
    console.log('✅ 可以执行数据导入！')
  } else {
    console.log('⚠️  建议手动检查剩余问题')
  }
}

main()
