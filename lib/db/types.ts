// TypeScript 类型定义，映射 Prisma JSON 字段

export interface ImageAsset {
  id: string
  url: string
  alt: string
  caption?: string
  width: number
  height: number
  order: number
}

export interface Source {
  title: string
  url: string
}

export interface VideoLink {
  title: string
  url: string
  platform: 'youtube' | 'vimeo' | 'other'
}

// API 响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  meta?: {
    total?: number
    page?: number
    pageSize?: number
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

// 陶器条目（完整类型）
export interface PotteryEntryData {
  id: string
  slug: string
  nameZh: string
  nameJa: string
  nameEn?: string | null
  category: string
  region: string
  type?: string | null
  description: string
  positioning: string
  signatureFeatures: string[]
  keywords: string[]
  notableArtists: string[]
  representativeForms: string[]
  images?: ImageAsset[]
  sources: Source[]
  artistId?: string | null
  artist?: ArtistData | null
  instagramHandle?: string | null
  instagramFollowers?: number | null
  priceRange?: string | null
  exhibitionCount?: number | null
  popularityScore?: number | null
  relatedProductIds: string[]
  externalShopUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords: string[]
  published: boolean
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// 作家
export interface ArtistData {
  id: string
  slug: string
  nameZh: string
  nameJa: string
  nameEn?: string | null
  bio: string
  birthYear?: number | null
  deathYear?: number | null
  instagramHandle?: string | null
  instagramFollowers?: number | null
  websiteUrl?: string | null
  exhibitionCount?: number | null
  avgPriceRange?: string | null
  avatar?: string | null
  images?: ImageAsset[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

// 表单输入类型（用于 API 和表单验证）
export interface CreatePotteryEntryInput {
  slug: string
  nameZh: string
  nameJa: string
  nameEn?: string
  category: string
  region: string
  type?: string
  description: string
  positioning: string
  signatureFeatures: string[]
  keywords: string[]
  notableArtists: string[]
  representativeForms: string[]
  sources: Source[]
  artistId?: string
  instagramHandle?: string
  published?: boolean
}
