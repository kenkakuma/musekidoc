import { z } from 'zod'

// 来源验证
export const sourceSchema = z.object({
  title: z.string().min(1, '来源标题不能为空'),
  url: z.string().url('请输入有效的 URL'),
})

// 图片资源验证
export const imageAssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  order: z.number().int().min(0),
})

// 创建条目验证
export const createEntrySchema = z.object({
  slug: z.string()
    .min(2, 'Slug 至少 2 个字符')
    .max(100, 'Slug 最多 100 个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),

  nameZh: z.string().min(2, '中文名称至少 2 个字符').max(255),
  nameJa: z.string().min(1, '日文名称不能为空').max(255),
  nameEn: z.string().max(255).optional(),

  category: z.string().min(1, '分类不能为空'),
  region: z.string().min(1, '产地不能为空'),
  type: z.string().optional(),

  description: z.string().min(100, '描述至少 100 个字符'),
  positioning: z.string().min(10, '定位说明至少 10 个字符'),

  signatureFeatures: z.array(z.string()).min(1, '至少添加 1 个识别特征'),
  keywords: z.array(z.string()).min(3, '至少添加 3 个关键词'),
  notableArtists: z.array(z.string()),
  representativeForms: z.array(z.string()),

  sources: z.array(sourceSchema).min(1, '至少添加 1 个来源'),

  artistId: z.string().uuid().optional(),

  instagramHandle: z.string().optional(),
  instagramFollowers: z.number().int().min(0).optional(),

  priceRange: z.string().optional(),
  exhibitionCount: z.number().int().min(0).optional(),

  images: z.array(imageAssetSchema).optional(),

  published: z.boolean().default(false),
})

// 更新条目验证（所有字段可选）
export const updateEntrySchema = createEntrySchema.partial()

// 查询参数验证
export const entriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(20),
  category: z.string().nullish(),
  region: z.string().nullish(),
  published: z.coerce.boolean().nullish(),
  search: z.string().nullish(),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
export type EntriesQuery = z.infer<typeof entriesQuerySchema>
