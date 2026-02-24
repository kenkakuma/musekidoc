import { z } from 'zod'

// 作家创建验证 schema
export const createArtistSchema = z.object({
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  nameZh: z.string().min(1, '中文名不能为空'),
  nameJa: z.string().min(1, '日文名不能为空'),
  nameEn: z.string().optional(),
  bio: z.string().min(50, '简介至少需要50字'),
  birthYear: z.number().int().min(1800).max(2100).optional(),
  deathYear: z.number().int().min(1800).max(2100).optional(),
  region: z.string().optional(),
  style: z.string().optional(),
  awards: z.array(z.string()).optional(),
  exhibitions: z
    .array(
      z.object({
        year: z.number().int(),
        title: z.string(),
        venue: z.string().optional(),
      })
    )
    .optional(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url('来源 URL 格式不正确'),
    })
  ),
  websiteUrl: z.string().url('官网 URL 格式不正确').optional(),
  instagramHandle: z.string().optional(),
  priceRange: z.string().optional(),
  published: z.boolean().default(false),
})

// 作家更新验证 schema（所有字段可选）
export const updateArtistSchema = createArtistSchema.partial()

// 导出类型
export type CreateArtistInput = z.infer<typeof createArtistSchema>
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>
