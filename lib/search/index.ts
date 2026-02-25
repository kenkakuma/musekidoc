import MiniSearch from 'minisearch'
import type { PotteryEntryData } from '@/lib/db/types'

/**
 * 创建搜索索引
 * 支持中文、日文、英文混合搜索
 */
export function createSearchIndex(entries: PotteryEntryData[]) {
  const miniSearch = new MiniSearch({
    fields: ['nameZh', 'nameJa', 'nameEn', 'description', 'keywords', 'region', 'category'],
    storeFields: ['id', 'slug', 'nameZh', 'nameJa', 'region', 'category'],
    searchOptions: {
      boost: {
        nameZh: 3,      // 中文名称权重最高
        nameJa: 3,      // 日文名称权重最高
        keywords: 2,    // 关键词次之
        nameEn: 1.5,
        region: 1.5,
        category: 1.2,
        description: 1
      },
      fuzzy: 0.2,       // 模糊搜索容错率
      prefix: true,     // 支持前缀搜索
      combineWith: 'OR' // 多关键词匹配模式
    }
  })

  // 构建搜索文档
  const searchDocs = entries.map(entry => ({
    id: entry.id,
    slug: entry.slug,
    nameZh: entry.nameZh,
    nameJa: entry.nameJa,
    nameEn: entry.nameEn || '',
    description: entry.description,
    keywords: Array.isArray(entry.keywords) ? entry.keywords.join(' ') : '',
    region: entry.region,
    category: entry.category
  }))

  miniSearch.addAll(searchDocs)

  return miniSearch
}

/**
 * 执行搜索
 */
export function searchEntries(
  miniSearch: MiniSearch,
  query: string,
  options?: {
    limit?: number
    offset?: number
  }
) {
  if (!query || query.trim().length === 0) {
    return {
      results: [],
      total: 0
    }
  }

  const results = miniSearch.search(query, {
    boost: {
      nameZh: 3,
      nameJa: 3,
      keywords: 2,
      nameEn: 1.5,
      region: 1.5,
      category: 1.2,
      description: 1
    },
    fuzzy: 0.2,
    prefix: true,
    combineWith: 'OR'
  })

  const { limit = 20, offset = 0 } = options || {}

  return {
    results: results.slice(offset, offset + limit),
    total: results.length
  }
}

/**
 * 获取搜索建议（自动完成）
 */
export function getSearchSuggestions(
  miniSearch: MiniSearch,
  query: string,
  limit: number = 5
) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const suggestions = miniSearch.autoSuggest(query, {
    boost: {
      nameZh: 3,
      nameJa: 3,
      keywords: 2
    },
    fuzzy: 0.2,
    prefix: true
  })

  return suggestions.slice(0, limit).map(s => s.suggestion)
}
