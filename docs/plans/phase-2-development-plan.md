# 阶段 2 开发计划：内容扩展与性能优化

**项目名称**: Japan Pottery Knowledge Base
**计划版本**: 2.0
**创建日期**: 2026-02-25
**目标启动日期**: 2026-02-26
**预计完成时间**: 4-6 周

---

## 📋 目录

- [计划概览](#计划概览)
- [阶段目标](#阶段目标)
- [第一周计划](#第一周计划-环境启动与性能优化)
- [第二周计划](#第二周计划-后台功能完善)
- [第三-四周计划](#第三四周计划-内容扩展研究)
- [第五-六周计划](#第五六周计划-高级功能开发)
- [执行指南](#执行指南)
- [验收标准](#验收标准)

---

## 计划概览

### 当前状态
- ✅ 阶段 1 已完成 (100%)
- ✅ 核心功能已实现
- ✅ 已导入 60位作家 + 21个陶器条目
- ⚠️ 数据库环境待启动测试

### 阶段 2 目标

```
内容量: 60 → 200-500 条目
性能: 首页加载 < 1秒，详情页 < 500ms
功能: 批量管理 + 审核工作流 + 统计分析
质量: Lighthouse 性能分数 > 90
```

### 核心价值
1. **性能提升** - 应对大数据量，优化用户体验
2. **管理效率** - 批量编辑、审核流程、内容质量控制
3. **内容完整** - 覆盖日本主要陶艺产地和作家
4. **运营洞察** - 数据统计、趋势分析

---

## 阶段目标

### 功能目标
- [ ] ISR 静态生成优化
- [ ] 数据库查询优化
- [ ] 批量编辑功能
- [ ] 内容审核工作流
- [ ] 统计分析仪表盘
- [ ] 高级筛选功能
- [ ] 图片优化（懒加载、blur placeholder）
- [ ] SEO 优化

### 内容目标
- [ ] 内容量从 81 增加到 200-500
- [ ] 补充西日本作家（30-50位）
- [ ] 补充8个缺失的作家关联
- [ ] 添加专题条目（人间国宝、民艺运动）
- [ ] 收集和上传图片素材

### 性能目标
- [ ] 首页加载时间 < 1秒
- [ ] 详情页加载时间 < 500ms
- [ ] Lighthouse 性能分数 > 90
- [ ] 搜索响应时间 < 300ms
- [ ] 图片优化率 > 80%

---

## 第一周计划：环境启动与性能优化

**时间**: 2026-02-26 ~ 2026-03-02 (5个工作日)
**主要负责**: Full-stack Agent
**优先级**: 🔴 最高

### Day 1 (2026-02-26): 环境启动与功能验证

#### 任务 2.1: 启动数据库并完成功能测试 ⚠️ **紧急**

**预计耗时**: 2小时

**步骤**:

```bash
# 1. 启动 PostgreSQL 容器
docker ps -a | grep postgres-pottery
docker start postgres-pottery

# 2. 验证数据库连接
docker exec -it postgres-pottery psql -U postgres -d pottery_kb -c "\dt"

# 3. 检查数据
docker exec -it postgres-pottery psql -U postgres -d pottery_kb -c "SELECT COUNT(*) FROM \"PotteryEntry\";"
docker exec -it postgres-pottery psql -U postgres -d pottery_kb -c "SELECT COUNT(*) FROM \"Artist\";"

# 4. 启动开发服务器
pnpm dev
```

**测试清单**:
- [ ] 首页加载正常，显示 21 个陶器条目
- [ ] 搜索功能正常
  - [ ] 搜索 "备前" - 应显示备前烧条目
  - [ ] 搜索 "信乐" - 应显示信乐烧条目
  - [ ] 搜索 "六古窯" - 应显示相关条目
  - [ ] 搜索建议下拉框显示
- [ ] 详情页正常
  - [ ] 访问 /pottery/bizen-yaki
  - [ ] 访问 /pottery/shigaraki-yaki
  - [ ] 图片画廊显示（如有图片）
- [ ] 作家页面正常
  - [ ] 访问 /artists - 显示 60 位作家
  - [ ] 访问 /artists/kurokawa-toru
  - [ ] 相关陶器作品显示
- [ ] 后台功能测试
  - [ ] 登录 /admin/login (密码: admin123)
  - [ ] 仪表盘统计显示正确
  - [ ] 条目编辑器加载正常
  - [ ] 批量导入功能测试
  - [ ] 导出功能测试 - 下载 JSON 文件
  - [ ] 图片上传功能测试

**验收标准**:
- 所有功能正常运行，无报错
- 数据显示完整准确
- 搜索返回正确结果
- 导出的 JSON 文件格式正确

**输出**:
- 测试报告文档（docs/test-report-phase1.md）
- 记录所有发现的问题

---

#### 任务 2.2: 代码质量检查与优化

**预计耗时**: 1小时

**步骤**:

```bash
# 1. TypeScript 类型检查
pnpm tsc --noEmit

# 2. ESLint 检查
pnpm lint

# 3. 检查未使用的依赖
npx depcheck

# 4. 检查包大小
npx next build
npx @next/bundle-analyzer
```

**优化清单**:
- [ ] 修复所有 TypeScript 错误
- [ ] 修复所有 ESLint 警告
- [ ] 移除未使用的依赖
- [ ] 分析并优化包大小

**验收标准**:
- 无 TypeScript 错误
- 无 ESLint 错误
- 构建成功，无警告

---

### Day 2 (2026-02-27): ISR 优化

#### 任务 2.3: 实现 ISR (Incremental Static Regeneration)

**预计耗时**: 4小时

**目标**: 优化页面加载速度，实现静态生成 + 增量更新

**实现步骤**:

##### 步骤 1: 更新首页实现 ISR

**文件**: `app/(public)/page.tsx`

```typescript
// 添加 revalidate 配置
export const revalidate = 3600; // 1小时重新验证

// 保持现有的服务器组件逻辑
export default async function HomePage({ searchParams }: HomePageProps) {
  // ... 现有代码
}
```

##### 步骤 2: 优化详情页静态生成

**文件**: `app/(public)/pottery/[slug]/page.tsx`

```typescript
export const revalidate = 3600; // 1小时重新验证

// 预渲染前 100 个热门条目
export async function generateStaticParams() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { slug: true },
    take: 100,
    orderBy: [
      { createdAt: 'desc' }
    ]
  });

  return entries.map((entry) => ({
    slug: entry.slug,
  }));
}

// 动态参数回退
export const dynamicParams = true; // 允许动态生成未预渲染的页面
```

##### 步骤 3: 优化作家详情页

**文件**: `app/(public)/artists/[slug]/page.tsx`

```typescript
export const revalidate = 3600;

export async function generateStaticParams() {
  // 预渲染 Instagram 粉丝数前 50 的作家
  const artists = await prisma.artist.findMany({
    where: { published: true },
    select: { slug: true },
    take: 50,
    orderBy: [
      { instagramFollowers: 'desc' }
    ]
  });

  return artists.map((artist) => ({
    slug: artist.slug,
  }));
}

export const dynamicParams = true;
```

##### 步骤 4: 配置 Next.js 缓存

**文件**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 启用增量缓存
    incrementalCacheHandlerPath: undefined,
  },

  // 图片优化配置
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 生产构建优化
  swcMinify: true,

  // 压缩
  compress: true,
};

module.exports = nextConfig;
```

**验收标准**:
- [ ] 构建时预渲染前 100 个条目
- [ ] 首次访问详情页 < 500ms
- [ ] 缓存命中后 < 100ms
- [ ] `pnpm build` 显示静态页面数量

**测试**:

```bash
# 1. 构建生产版本
pnpm build

# 2. 查看构建报告
# 应显示类似:
# ├ ○ /pottery/[slug] (ISR: 3600 Seconds)
# │   ├ /pottery/bizen-yaki
# │   ├ /pottery/shigaraki-yaki
# │   └ ... (100 个)

# 3. 启动生产服务器
pnpm start

# 4. 测试加载速度
# 使用浏览器开发者工具 Network 标签
# 首次访问应 < 500ms
# 再次访问应 < 100ms (缓存命中)
```

---

### Day 3 (2026-02-28): 数据库优化

#### 任务 2.4: 数据库索引优化

**预计耗时**: 3小时

**目标**: 优化数据库查询性能，减少响应时间

**实现步骤**:

##### 步骤 1: 分析当前查询

**创建**: `scripts/analyze-queries.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
})

async function analyzeQueries() {
  console.log('🔍 分析常见查询性能...\n')

  // 1. 列表查询（首页）
  console.time('列表查询')
  await prisma.potteryEntry.findMany({
    where: { published: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })
  console.timeEnd('列表查询')

  // 2. 搜索查询
  console.time('搜索查询')
  await prisma.potteryEntry.findMany({
    where: {
      published: true,
      OR: [
        { nameZh: { contains: '备前' } },
        { nameJa: { contains: '備前' } },
      ]
    }
  })
  console.timeEnd('搜索查询')

  // 3. 分类筛选
  console.time('分类筛选')
  await prisma.potteryEntry.findMany({
    where: {
      published: true,
      category: { contains: '陶器' },
    }
  })
  console.timeEnd('分类筛选')

  // 4. 作家关联查询
  console.time('作家关联查询')
  await prisma.potteryEntry.findMany({
    where: { published: true },
    include: { artist: true },
    take: 20,
  })
  console.timeEnd('作家关联查询')
}

analyzeQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

运行分析:
```bash
npx tsx scripts/analyze-queries.ts
```

##### 步骤 2: 添加数据库索引

**文件**: `prisma/schema.prisma`

```prisma
model PotteryEntry {
  // ... 现有字段

  // 优化后的索引策略
  @@index([published, createdAt(sort: Desc)])  // 首页列表查询
  @@index([published, category])               // 分类筛选
  @@index([published, region])                 // 产地筛选
  @@index([artistId])                          // 作家关联
  @@index([slug])                              // Slug 查询
  @@index([nameZh])                            // 中文名搜索
  @@index([nameJa])                            // 日文名搜索
}

model Artist {
  // ... 现有字段

  @@index([published, instagramFollowers(sort: Desc)])  // 热门作家
  @@index([slug])
  @@index([nameZh])
  @@index([nameJa])
  @@index([instagramHandle])
}
```

##### 步骤 3: 运行迁移

```bash
# 创建迁移
pnpm prisma migrate dev --name add_performance_indexes

# 检查索引是否创建成功
docker exec -it postgres-pottery psql -U postgres -d pottery_kb -c "\di"
```

##### 步骤 4: 验证性能提升

再次运行分析脚本，对比优化前后:

```bash
npx tsx scripts/analyze-queries.ts
```

**预期结果**:
- 列表查询: < 50ms
- 搜索查询: < 100ms
- 分类筛选: < 50ms
- 关联查询: < 100ms

**验收标准**:
- [ ] 所有索引创建成功
- [ ] 查询时间减少 50% 以上
- [ ] API 响应时间 < 200ms

---

### Day 4 (2026-03-01): 图片优化

#### 任务 2.5: 实现图片懒加载和优化

**预计耗时**: 4小时

**目标**: 优化图片加载，提升 Lighthouse 分数

**实现步骤**:

##### 步骤 1: 使用 Next.js Image 组件

**更新**: `components/public/PotteryCard.tsx`

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { PotteryEntryData } from '@/lib/db/types'

interface PotteryCardProps {
  entry: PotteryEntryData
}

export function PotteryCard({ entry }: PotteryCardProps) {
  const images = entry.images as any[]
  const firstImage = images?.[0]

  return (
    <Link href={`/pottery/${entry.slug}`}>
      <div className="group rounded-lg border bg-white p-4 hover:shadow-lg transition-shadow">
        {/* 优化后的图片 */}
        {firstImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-slate-100 mb-3">
            <Image
              src={firstImage.url}
              alt={firstImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-slate-100 rounded-md mb-3 flex items-center justify-center">
            <span className="text-slate-400 text-sm">暂无图片</span>
          </div>
        )}

        {/* 其他内容保持不变 */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600">
          {entry.nameZh}
        </h3>
        <p className="text-sm text-slate-600 mb-2 font-jp">{entry.nameJa}</p>
        <p className="text-sm text-slate-500 mb-3">{entry.region}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{entry.category.split('/')[0]}</Badge>
          {entry.keywords.slice(0, 2).map((keyword) => (
            <Badge key={keyword} variant="outline">{keyword}</Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
```

##### 步骤 2: 优化详情页图片画廊

**更新**: `components/public/ImageGallery.tsx`

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ImageAsset } from '@/lib/db/types'

interface ImageGalleryProps {
  images: ImageAsset[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">暂无图片</p>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className="space-y-4">
      {/* 主图 - 使用 Next.js Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover"
          priority={selectedIndex === 0}
          quality={90}
        />
      </div>

      {/* 图片说明 */}
      {selectedImage.caption && (
        <p className="text-sm text-slate-600">{selectedImage.caption}</p>
      )}

      {/* 缩略图 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

##### 步骤 3: 配置图片域名

**更新**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 如果使用外部图片源，添加域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],

    // 优化配置
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1年
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 其他配置...
};

module.exports = nextConfig;
```

##### 步骤 4: 生成 blur placeholder

**创建**: `lib/image-utils.ts`

```typescript
import sharp from 'sharp'

// 生成 blur placeholder data URL
export async function getBlurDataURL(imagePath: string): Promise<string> {
  try {
    const buffer = await sharp(imagePath)
      .resize(10, 10, { fit: 'cover' })
      .webp({ quality: 20 })
      .toBuffer()

    const base64 = buffer.toString('base64')
    return `data:image/webp;base64,${base64}`
  } catch (error) {
    console.error('生成 blur placeholder 失败:', error)
    // 返回默认 placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
}
```

**验收标准**:
- [ ] 所有图片使用 Next.js Image 组件
- [ ] 图片懒加载生效
- [ ] Blur placeholder 显示
- [ ] Lighthouse 性能分数 > 85

**测试**:

```bash
# 1. 构建生产版本
pnpm build

# 2. 运行 Lighthouse
# 使用 Chrome DevTools > Lighthouse
# 或命令行:
npx lighthouse http://localhost:3000 --view

# 目标:
# Performance: > 85
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

### Day 5 (2026-03-02): SEO 优化

#### 任务 2.6: SEO 优化和元数据增强

**预计耗时**: 3小时

**目标**: 优化搜索引擎可见性

**实现步骤**:

##### 步骤 1: 创建 Sitemap

**创建**: `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // 获取所有已发布的陶器条目
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  // 获取所有已发布的作家
  const artists = await prisma.artist.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  // 生成 sitemap
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...entries.map((entry) => ({
      url: `${baseUrl}/pottery/${entry.slug}`,
      lastModified: entry.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...artists.map((artist) => ({
      url: `${baseUrl}/artists/${artist.slug}`,
      lastModified: artist.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
```

##### 步骤 2: 创建 robots.txt

**创建**: `app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

##### 步骤 3: 优化元数据

**更新**: `app/(public)/layout.tsx`

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  title: {
    default: '日本陶艺知识库 - 探索日本传统陶瓷艺术',
    template: '%s | 日本陶艺知识库'
  },

  description: '深入了解日本陶艺的历史、技法和名家作品。涵盖六古窑、人间国宝、当代陶艺家等丰富内容。',

  keywords: [
    '日本陶艺', '日本陶器', '日本瓷器',
    '六古窑', '备前烧', '信乐烧', '濑户烧',
    '人间国宝', '陶艺家', '日本传统工艺',
    'Japanese pottery', 'Japanese ceramics',
  ],

  authors: [{ name: 'Japan Pottery Knowledge Base' }],
  creator: 'Japan Pottery Knowledge Base',
  publisher: 'Japan Pottery Knowledge Base',

  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['ja_JP', 'en_US'],
    url: '/',
    siteName: '日本陶艺知识库',
    title: '日本陶艺知识库 - 探索日本传统陶瓷艺术',
    description: '深入了解日本陶艺的历史、技法和名家作品',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '日本陶艺知识库',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '日本陶艺知识库',
    description: '探索日本传统陶瓷艺术',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
  },
}
```

##### 步骤 4: 添加结构化数据

**更新**: `app/(public)/pottery/[slug]/page.tsx`

添加 JSON-LD 结构化数据:

```typescript
export default async function PotteryDetailPage({ params }: DetailPageProps) {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug: params.slug },
    include: { artist: true },
  })

  if (!entry || !entry.published) {
    notFound()
  }

  // 生成结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.nameZh,
    alternativeHeadline: entry.nameJa,
    description: entry.positioning,
    author: entry.artist ? {
      '@type': 'Person',
      name: entry.artist.nameZh,
    } : undefined,
    datePublished: entry.publishedAt?.toISOString(),
    dateModified: entry.updatedAt.toISOString(),
    keywords: entry.keywords.join(', '),
  }

  return (
    <>
      {/* 添加 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 现有页面内容 */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ... */}
      </div>
    </>
  )
}
```

**验收标准**:
- [ ] Sitemap 生成成功 (访问 /sitemap.xml)
- [ ] Robots.txt 正确 (访问 /robots.txt)
- [ ] 元数据完整
- [ ] 结构化数据验证通过

**测试**:

```bash
# 1. 验证 sitemap
curl http://localhost:3000/sitemap.xml

# 2. 验证 robots.txt
curl http://localhost:3000/robots.txt

# 3. 验证结构化数据
# 使用 Google 的结构化数据测试工具:
# https://search.google.com/test/rich-results
```

---

### 第一周总结

**完成的任务**:
- [x] 环境启动与功能验证
- [x] 代码质量检查
- [x] ISR 静态生成优化
- [x] 数据库索引优化
- [x] 图片懒加载优化
- [x] SEO 元数据优化

**关键指标**:
- 首页加载时间: 目标 < 1秒
- 详情页加载时间: 目标 < 500ms
- Lighthouse 分数: 目标 > 85

**输出文档**:
- 测试报告 (docs/test-report-phase1.md)
- 性能优化报告 (docs/performance-optimization.md)

---

## 第二周计划：后台功能完善

**时间**: 2026-03-03 ~ 2026-03-09 (5个工作日)
**主要负责**: Full-stack Agent
**优先级**: 🔴 高

### Day 6-7 (2026-03-03 ~ 2026-03-04): 批量编辑功能

#### 任务 2.7: 实现批量编辑功能

**预计耗时**: 8小时 (2天)

**目标**: 提升后台管理效率，支持批量操作

**功能需求**:

1. **多选功能**
   - 条目列表页添加复选框
   - 全选/取消全选
   - 显示选中数量

2. **批量操作**
   - 批量修改分类
   - 批量修改产地
   - 批量修改状态 (发布/取消发布)
   - 批量添加标签
   - 批量删除

3. **操作确认**
   - 危险操作需二次确认
   - 显示影响的条目数量
   - 操作日志记录

**实现步骤**:

##### 步骤 1: 创建批量操作 API

**创建**: `app/api/entries/bulk-update/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

// 批量更新验证 schema
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, '至少选择一个条目'),
  action: z.enum(['update', 'delete']),
  updates: z.object({
    category: z.string().optional(),
    region: z.string().optional(),
    published: z.boolean().optional(),
    keywords: z.array(z.string()).optional(), // 添加标签
  }).optional(),
})

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = bulkUpdateSchema.parse(body)

    let result: any

    if (validated.action === 'delete') {
      // 批量删除
      result = await prisma.potteryEntry.deleteMany({
        where: {
          id: { in: validated.ids },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          deleted: result.count,
          action: 'delete',
        },
      })
    }

    if (validated.action === 'update' && validated.updates) {
      // 批量更新
      const updateData: any = {}

      if (validated.updates.category) {
        updateData.category = validated.updates.category
      }

      if (validated.updates.region) {
        updateData.region = validated.updates.region
      }

      if (validated.updates.published !== undefined) {
        updateData.published = validated.updates.published
        if (validated.updates.published) {
          updateData.publishedAt = new Date()
        }
      }

      // 处理添加标签（合并现有标签）
      if (validated.updates.keywords && validated.updates.keywords.length > 0) {
        // 需要逐个更新以合并标签
        const entries = await prisma.potteryEntry.findMany({
          where: { id: { in: validated.ids } },
          select: { id: true, keywords: true },
        })

        const updatePromises = entries.map(async (entry) => {
          const existingKeywords = entry.keywords || []
          const newKeywords = validated.updates!.keywords!
          const mergedKeywords = Array.from(
            new Set([...existingKeywords, ...newKeywords])
          )

          return prisma.potteryEntry.update({
            where: { id: entry.id },
            data: {
              ...updateData,
              keywords: mergedKeywords,
            },
          })
        })

        await Promise.all(updatePromises)
        result = { count: updatePromises.length }
      } else {
        // 普通批量更新
        result = await prisma.potteryEntry.updateMany({
          where: {
            id: { in: validated.ids },
          },
          data: updateData,
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          updated: result.count,
          action: 'update',
          fields: Object.keys(validated.updates),
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '无效的操作类型',
        },
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('批量操作错误:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入数据验证失败',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || '批量操作失败',
        },
      },
      { status: 500 }
    )
  }
}
```

##### 步骤 2: 创建批量操作组件

**创建**: `components/admin/BulkActions.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const router = useRouter()
  const [action, setAction] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 批量更新的字段值
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [publishStatus, setPublishStatus] = useState<boolean | undefined>()

  const handleAction = () => {
    if (!action) return
    setIsDialogOpen(true)
  }

  const executeBulkAction = async () => {
    setIsProcessing(true)

    try {
      let requestBody: any = {
        ids: selectedIds,
        action: action === 'delete' ? 'delete' : 'update',
      }

      if (action !== 'delete') {
        requestBody.updates = {}

        if (action === 'category' && category) {
          requestBody.updates.category = category
        } else if (action === 'region' && region) {
          requestBody.updates.region = region
        } else if (action === 'publish' || action === 'unpublish') {
          requestBody.updates.published = action === 'publish'
        } else if (action === 'add-keywords' && newKeywords) {
          requestBody.updates.keywords = newKeywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0)
        }
      }

      const response = await fetch('/api/entries/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          action === 'delete'
            ? `成功删除 ${data.data.deleted} 个条目`
            : `成功更新 ${data.data.updated} 个条目`
        )

        // 刷新页面
        router.refresh()
        onClearSelection()
        setIsDialogOpen(false)
      } else {
        alert(`操作失败: ${data.error?.message || '未知错误'}`)
      }
    } catch (error) {
      console.error('批量操作错误:', error)
      alert('操作失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="font-medium">
          已选择 {selectedIds.length} 个条目
        </span>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择操作" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">修改分类</SelectItem>
            <SelectItem value="region">修改产地</SelectItem>
            <SelectItem value="publish">批量发布</SelectItem>
            <SelectItem value="unpublish">取消发布</SelectItem>
            <SelectItem value="add-keywords">添加标签</SelectItem>
            <SelectItem value="delete">批量删除</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAction} disabled={!action}>
          执行操作
        </Button>

        <Button variant="outline" onClick={onClearSelection}>
          取消选择
        </Button>
      </div>

      {/* 操作确认对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量操作</DialogTitle>
            <DialogDescription>
              {action === 'delete' ? (
                <span className="text-red-600 font-semibold">
                  ⚠️ 警告：此操作将删除 {selectedIds.length} 个条目，且无法恢复！
                </span>
              ) : (
                `即将对 ${selectedIds.length} 个条目执行操作`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {action === 'category' && (
              <div>
                <Label>新分类</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="例如: 陶器/无釉/薪窑"
                />
              </div>
            )}

            {action === 'region' && (
              <div>
                <Label>新产地</Label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="例如: 冈山县·备前市"
                />
              </div>
            )}

            {action === 'add-keywords' && (
              <div>
                <Label>添加标签（逗号分隔）</Label>
                <Input
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="例如: 六古窯,传统,日本遗产"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              取消
            </Button>
            <Button
              onClick={executeBulkAction}
              disabled={isProcessing}
              variant={action === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing ? '处理中...' : '确认执行'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

##### 步骤 3: 更新条目列表页

**更新**: `app/admin/entries/page.tsx`

添加多选功能:

```typescript
'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { BulkActions } from '@/components/admin/BulkActions'
// ... 其他导入

export default function EntriesListPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // ... 获取条目列表

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(entries.map(e => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">陶器条目管理</h1>
        <Button asChild>
          <Link href="/admin/entries/new">新建条目</Link>
        </Button>
      </div>

      {/* 批量操作工具栏 */}
      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* 条目列表表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === entries.length && entries.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>中文名称</TableHead>
              <TableHead>日文名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>产地</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(entry.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(entry.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{entry.nameZh}</TableCell>
                {/* ... 其他单元格 */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

**验收标准**:
- [ ] 可以多选条目
- [ ] 全选/取消全选功能正常
- [ ] 批量修改分类生效
- [ ] 批量修改产地生效
- [ ] 批量发布/取消发布生效
- [ ] 批量添加标签生效
- [ ] 批量删除需二次确认
- [ ] 操作后页面自动刷新

**测试**:
1. 选择多个条目
2. 执行批量修改分类
3. 验证数据库中数据已更新
4. 测试批量删除功能
5. 验证危险操作有确认对话框

---

### Day 8-9 (2026-03-05 ~ 2026-03-06): 内容审核工作流

#### 任务 2.8: 实现内容审核工作流

**预计耗时**: 8小时 (2天)

**目标**: 规范内容质量，建立审核流程

**功能需求**:

1. **状态系统**
   - DRAFT (草稿)
   - PENDING (待审核)
   - PUBLISHED (已发布)
   - REJECTED (已拒绝)
   - ARCHIVED (已归档)

2. **审核功能**
   - 审核列表页（仅显示待审核内容）
   - 审核详情页（查看完整信息）
   - 批准/拒绝操作
   - 审核意见/备注

3. **权限控制**
   - 前台只显示 PUBLISHED 状态
   - 后台根据状态显示不同操作按钮

**实现步骤**:

##### 步骤 1: 更新数据库 Schema

**更新**: `prisma/schema.prisma`

```prisma
enum EntryStatus {
  DRAFT      // 草稿
  PENDING    // 待审核
  PUBLISHED  // 已发布
  REJECTED   // 已拒绝
  ARCHIVED   // 已归档
}

model PotteryEntry {
  // ... 现有字段

  // 替换 published 字段
  status EntryStatus @default(DRAFT)

  // 审核相关
  reviewedBy   String?   // 审核人员
  reviewedAt   DateTime? // 审核时间
  reviewNote   String?   @db.Text // 审核意见

  // 保留现有的 published 字段用于向后兼容
  published    Boolean   @default(false)
  publishedAt  DateTime?

  // ... 其他字段

  @@index([status, createdAt])
}

model Artist {
  // ... 现有字段

  status EntryStatus @default(DRAFT)

  reviewedBy   String?
  reviewedAt   DateTime?
  reviewNote   String?

  published    Boolean   @default(false)

  // ... 其他字段

  @@index([status])
}
```

创建迁移:

```bash
pnpm prisma migrate dev --name add_entry_status
```

##### 步骤 2: 数据迁移脚本

**创建**: `scripts/migrate-to-status.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 迁移现有数据到新状态系统...\n')

  // 更新陶器条目
  const entryResult = await prisma.potteryEntry.updateMany({
    where: { published: true },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })

  const draftResult = await prisma.potteryEntry.updateMany({
    where: { published: false },
    data: {
      status: 'DRAFT',
    },
  })

  console.log(`✅ 更新 ${entryResult.count} 个已发布条目`)
  console.log(`✅ 更新 ${draftResult.count} 个草稿条目`)

  // 更新作家
  const artistPublished = await prisma.artist.updateMany({
    where: { published: true },
    data: { status: 'PUBLISHED' },
  })

  const artistDraft = await prisma.artist.updateMany({
    where: { published: false },
    data: { status: 'DRAFT' },
  })

  console.log(`✅ 更新 ${artistPublished.count} 个已发布作家`)
  console.log(`✅ 更新 ${artistDraft.count} 个草稿作家`)

  console.log('\n🎉 数据迁移完成！')
}

main()
  .catch((e) => {
    console.error('❌ 迁移失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

运行迁移:

```bash
npx tsx scripts/migrate-to-status.ts
```

##### 步骤 3: 创建审核 API

**创建**: `app/api/entries/[id]/review/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/middleware'
import { z } from 'zod'

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'request-changes']),
  note: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = reviewSchema.parse(body)

    // 检查条目是否存在
    const entry = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
    })

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '条目不存在',
          },
        },
        { status: 404 }
      )
    }

    // 根据操作更新状态
    let newStatus: string
    let publishedValue: boolean

    if (validated.action === 'approve') {
      newStatus = 'PUBLISHED'
      publishedValue = true
    } else if (validated.action === 'reject') {
      newStatus = 'REJECTED'
      publishedValue = false
    } else {
      newStatus = 'DRAFT'
      publishedValue = false
    }

    // 更新条目
    const updated = await prisma.potteryEntry.update({
      where: { id: params.id },
      data: {
        status: newStatus as any,
        published: publishedValue,
        publishedAt: publishedValue ? new Date() : null,
        reviewedBy: 'admin', // 可以改为实际的用户 ID
        reviewedAt: new Date(),
        reviewNote: validated.note || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error(`审核条目 ${params.id} 错误:`, error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入数据验证失败',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || '审核失败',
        },
      },
      { status: 500 }
    )
  }
}
```

##### 步骤 4: 创建审核列表页

**创建**: `app/admin/review/page.tsx`

```typescript
import Link from 'next/link'
import { prisma } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ReviewPage() {
  // 获取待审核的条目
  const pendingEntries = await prisma.potteryEntry.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      artist: {
        select: { nameZh: true },
      },
    },
  })

  // 获取最近审核的条目
  const recentReviewed = await prisma.potteryEntry.findMany({
    where: {
      status: { in: ['PUBLISHED', 'REJECTED'] },
      reviewedAt: { not: null },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 10,
    include: {
      artist: {
        select: { nameZh: true },
      },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">内容审核</h1>
        <p className="text-slate-600">
          审核待发布的内容，确保质量标准
        </p>
      </div>

      {/* 待审核列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            待审核内容 ({pendingEntries.length})
          </h2>
        </div>

        {pendingEntries.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>中文名称</TableHead>
                  <TableHead>日文名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>产地</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.nameZh}
                    </TableCell>
                    <TableCell>{entry.nameJa}</TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{entry.region}</TableCell>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/admin/review/${entry.id}`}>
                          审核
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-slate-500">
            暂无待审核内容
          </div>
        )}
      </div>

      {/* 最近审核记录 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">最近审核记录</h2>

        {recentReviewed.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>中文名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>审核时间</TableHead>
                  <TableHead>审核人</TableHead>
                  <TableHead>审核意见</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReviewed.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.nameZh}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'PUBLISHED'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {entry.status === 'PUBLISHED' ? '已通过' : '已拒绝'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.reviewedAt &&
                        new Date(entry.reviewedAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>{entry.reviewedBy || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.reviewNote || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center text-slate-500">
            暂无审核记录
          </div>
        )}
      </div>
    </div>
  )
}
```

##### 步骤 5: 创建审核详情页

**创建**: `app/admin/review/[id]/page.tsx`

```typescript
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db/client'
import { ReviewActions } from '@/components/admin/ReviewActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReviewDetailPageProps {
  params: {
    id: string
  }
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const entry = await prisma.potteryEntry.findUnique({
    where: { id: params.id },
    include: {
      artist: true,
    },
  })

  if (!entry) {
    notFound()
  }

  // 如果不是待审核状态，重定向到审核列表
  if (entry.status !== 'PENDING') {
    redirect('/admin/review')
  }

  const signatureFeatures = entry.signatureFeatures as any as string[]
  const notableArtists = entry.notableArtists as any as string[]
  const representativeForms = entry.representativeForms as any as string[]
  const sources = entry.sources as any as { title: string; url: string }[]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{entry.nameZh}</h1>
          <p className="text-slate-600">{entry.nameJa}</p>
        </div>
        <Badge variant="outline">待审核</Badge>
      </div>

      {/* 审核操作区 */}
      <ReviewActions entryId={entry.id} />

      {/* 内容预览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">中文名称</p>
                <p className="font-medium">{entry.nameZh}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">日文名称</p>
                <p className="font-medium">{entry.nameJa}</p>
              </div>

              {entry.nameEn && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">英文名称</p>
                  <p className="font-medium">{entry.nameEn}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-1">分类</p>
                <p className="font-medium">{entry.category}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">产地</p>
                <p className="font-medium">{entry.region}</p>
              </div>
            </CardContent>
          </Card>

          {/* 描述 */}
          <Card>
            <CardHeader>
              <CardTitle>详细介绍</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {entry.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 定位说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">定位说明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{entry.positioning}</p>
            </CardContent>
          </Card>

          {/* 识别特征 */}
          {signatureFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">识别特征</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {signatureFeatures.map((feature, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 关键词 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">关键词</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entry.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 参考来源 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">参考来源</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-start"
                    >
                      <span className="mr-2">🔗</span>
                      <span>{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

##### 步骤 6: 创建审核操作组件

**创建**: `components/admin/ReviewActions.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface ReviewActionsProps {
  entryId: string
}

export function ReviewActions({ entryId }: ReviewActionsProps) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleReview = async (action: 'approve' | 'reject' | 'request-changes') => {
    if (isProcessing) return

    const actionText =
      action === 'approve'
        ? '批准并发布'
        : action === 'reject'
        ? '拒绝'
        : '请求修改'

    if (!confirm(`确认要${actionText}此条目吗？`)) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/entries/${entryId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
          }`,
        },
        body: JSON.stringify({
          action,
          note: note.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`${actionText}成功！`)
        router.push('/admin/review')
        router.refresh()
      } else {
        alert(`操作失败: ${data.error?.message || '未知错误'}`)
      }
    } catch (error) {
      console.error('审核操作错误:', error)
      alert('操作失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle>审核操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="review-note">审核意见 (可选)</Label>
          <Textarea
            id="review-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入审核意见或修改建议..."
            rows={3}
            className="mt-2"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleReview('approve')}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            ✓ 批准并发布
          </Button>

          <Button
            onClick={() => handleReview('request-changes')}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            ✎ 请求修改
          </Button>

          <Button
            onClick={() => handleReview('reject')}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            ✗ 拒绝
          </Button>
        </div>

        {isProcessing && (
          <p className="text-sm text-center text-slate-600">处理中...</p>
        )}
      </CardContent>
    </Card>
  )
}
```

##### 步骤 7: 更新前台查询

**更新**: `app/(public)/page.tsx`

修改查询条件，只显示已发布内容:

```typescript
const where: any = {
  status: 'PUBLISHED', // 替换 published: true
}
```

**更新**: `app/(public)/pottery/[slug]/page.tsx`

```typescript
const entry = await prisma.potteryEntry.findUnique({
  where: { slug: params.slug },
  include: { artist: true },
})

// 修改检查条件
if (!entry || entry.status !== 'PUBLISHED') {
  notFound()
}
```

##### 步骤 8: 更新侧边栏导航

**更新**: `app/admin/layout.tsx`

添加审核入口:

```typescript
const navItems = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/entries', label: '陶器管理', icon: '🏺' },
  { href: '/admin/artists', label: '作家管理', icon: '👨‍🎨' },
  { href: '/admin/review', label: '内容审核', icon: '✓', badge: pendingCount },
  { href: '/admin/import', label: '批量导入', icon: '📥' },
]
```

**验收标准**:
- [ ] 状态系统正常工作 (DRAFT/PENDING/PUBLISHED/REJECTED/ARCHIVED)
- [ ] 审核列表页显示待审核内容
- [ ] 审核详情页显示完整信息
- [ ] 批准操作正常，内容变为 PUBLISHED
- [ ] 拒绝操作正常，内容变为 REJECTED
- [ ] 前台只显示 PUBLISHED 状态内容
- [ ] 审核记录正确保存

**测试**:
1. 创建一个草稿条目，提交审核（状态 → PENDING）
2. 访问审核列表页，看到待审核条目
3. 进入审核详情页，批准条目
4. 验证条目状态变为 PUBLISHED
5. 前台页面能看到该条目
6. 测试拒绝流程

---

### Day 10 (2026-03-07): 统计分析仪表盘

#### 任务 2.9: 实现统计分析仪表盘

**预计耗时**: 4小时

**目标**: 提供运营洞察和数据可视化

**功能需求**:

1. **核心统计**
   - 总条目数、已发布数、草稿数、待审核数
   - 总作家数、已发布作家数
   - 按分类统计
   - 按产地统计

2. **趋势分析**
   - 每日新增条目图表
   - 每周发布统计
   - 月度增长趋势

3. **热门排行**
   - 热门条目 Top 10（基于创建时间，未来可添加浏览量）
   - 热门分类
   - 热门产地

**实现步骤**:

##### 步骤 1: 创建统计 API

**创建**: `app/api/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    // 1. 基础统计
    const [
      totalEntries,
      publishedEntries,
      draftEntries,
      pendingEntries,
      totalArtists,
      publishedArtists,
    ] = await Promise.all([
      prisma.potteryEntry.count(),
      prisma.potteryEntry.count({ where: { status: 'PUBLISHED' } }),
      prisma.potteryEntry.count({ where: { status: 'DRAFT' } }),
      prisma.potteryEntry.count({ where: { status: 'PENDING' } }),
      prisma.artist.count(),
      prisma.artist.count({ where: { status: 'PUBLISHED' } }),
    ])

    // 2. 按分类统计
    const byCategory = await prisma.potteryEntry.groupBy({
      by: ['category'],
      _count: true,
      where: { status: 'PUBLISHED' },
    })

    // 3. 按产地统计
    const byRegion = await prisma.potteryEntry.groupBy({
      by: ['region'],
      _count: true,
      where: { status: 'PUBLISHED' },
      orderBy: {
        _count: {
          region: 'desc',
        },
      },
      take: 10,
    })

    // 4. 最近30天每日新增
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEntries = await prisma.potteryEntry.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // 按日期分组统计
    const dailyStats = recentEntries.reduce((acc, entry) => {
      const date = entry.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 5. 最近更新的条目
    const recentUpdated = await prisma.potteryEntry.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        updatedAt: true,
      },
    })

    // 6. 热门作家（按粉丝数）
    const topArtists = await prisma.artist.findMany({
      where: {
        status: 'PUBLISHED',
        instagramFollowers: { not: null },
      },
      orderBy: {
        instagramFollowers: 'desc',
      },
      take: 10,
      select: {
        slug: true,
        nameZh: true,
        instagramFollowers: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEntries,
          publishedEntries,
          draftEntries,
          pendingEntries,
          totalArtists,
          publishedArtists,
        },
        byCategory: byCategory.map((item) => ({
          category: item.category,
          count: item._count,
        })),
        byRegion: byRegion.map((item) => ({
          region: item.region,
          count: item._count,
        })),
        dailyStats,
        recentUpdated,
        topArtists,
      },
    })
  } catch (error: any) {
    console.error('获取统计数据错误:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || '获取统计数据失败',
        },
      },
      { status: 500 }
    )
  }
}
```

##### 步骤 2: 安装图表库

```bash
pnpm add recharts
```

##### 步骤 3: 创建统计组件

**创建**: `components/admin/StatCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <span className="text-2xl">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <span
              className={
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-2">vs 上周</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**创建**: `components/admin/DailyChart.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailyChartProps {
  data: Record<string, number>
}

export function DailyChart({ data }: DailyChartProps) {
  // 转换数据格式
  const chartData = Object.entries(data)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }),
      count,
    }))
    .slice(-14) // 最近14天

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近14天新增条目</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

##### 步骤 4: 更新仪表盘页面

**更新**: `app/admin/page.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin/StatCard'
import { DailyChart } from '@/components/admin/DailyChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getStats() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('获取统计数据失败')
  }

  const data = await response.json()
  return data.data
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">仪表盘</h1>
        <p className="text-slate-600">概览项目统计数据和最近活动</p>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总条目数"
          value={stats.overview.totalEntries}
          subtitle={`已发布 ${stats.overview.publishedEntries} 个`}
          icon="🏺"
        />
        <StatCard
          title="待审核"
          value={stats.overview.pendingEntries}
          subtitle="需要审核"
          icon="⏳"
        />
        <StatCard
          title="总作家数"
          value={stats.overview.totalArtists}
          subtitle={`已发布 ${stats.overview.publishedArtists} 位`}
          icon="👨‍🎨"
        />
        <StatCard
          title="草稿"
          value={stats.overview.draftEntries}
          subtitle="未发布"
          icon="📝"
        />
      </div>

      {/* 图表和列表 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 每日新增图表 */}
        <DailyChart data={stats.dailyStats} />

        {/* 按分类统计 */}
        <Card>
          <CardHeader>
            <CardTitle>按分类统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byCategory.map((item: any) => (
                <div key={item.category} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 按产地统计 */}
        <Card>
          <CardHeader>
            <CardTitle>热门产地 Top 10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byRegion.map((item: any, index: number) => (
                <div key={item.region} className="flex items-center">
                  <span className="text-slate-400 w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm">{item.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近更新 */}
        <Card>
          <CardHeader>
            <CardTitle>最近更新</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUpdated.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/entries/${entry.id}/edit`}
                      className="text-sm font-medium hover:text-blue-600"
                    >
                      {entry.nameZh}
                    </Link>
                    <p className="text-xs text-slate-500">{entry.nameJa}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/entries/new">➕ 新建条目</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/review">✓ 内容审核</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/import">📥 批量导入</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/export/json" target="_blank">
                📤 导出数据
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**验收标准**:
- [ ] 核心统计数据显示正确
- [ ] 每日新增图表正常显示
- [ ] 按分类/产地统计正确
- [ ] 最近更新列表正常
- [ ] 图表响应式设计良好

**测试**:
1. 访问 /admin
2. 查看所有统计卡片数据
3. 验证图表显示
4. 检查数据准确性

---

### 第二周总结

**完成的任务**:
- [x] 批量编辑功能
- [x] 内容审核工作流
- [x] 统计分析仪表盘

**关键成果**:
- 管理效率提升 50%+
- 内容质量控制流程建立
- 运营数据可视化

**输出文档**:
- 批量操作使用指南
- 审核流程说明文档

---

## 第三-四周计划：内容扩展研究

**时间**: 2026-03-10 ~ 2026-03-23 (10个工作日)
**主要负责**: Content Research Agent + AI Assistant
**优先级**: 🟡 中高

### 目标

1. **内容量**: 从 81 增加到 200-300
2. **地域覆盖**: 补充西日本地区（九州、北陆）
3. **关联完善**: 补充8个缺失的作家关联
4. **图片收集**: 收集和上传图片素材

### Week 3 (2026-03-10 ~ 2026-03-16): 西日本作家研究

#### Day 11-15: 九州地区作家

**目标产地**:
- 有田烧/伊万里烧 (Arita/Imari) - 佐贺县
- 唐津烧 (Karatsu) - 佐贺县
- 萩烧 (Hagi) - 山口县
- 薩摩焼 (Satsuma) - 鹿儿岛县

**研究步骤**:

1. **使用 WebSearch 搜索作家信息**

```
搜索关键词示例:
- "有田烧 陶艺家 2025"
- "唐津烧 人间国宝"
- "萩烧 作家 Instagram"
- "佐贺县 陶艺"
```

2. **使用 WebFetch 提取详细信息**

访问以下网站:
- 日本陶磁协会: https://www.ceramic.or.jp/
- 各产地官方网站
- 作家个人网站和 Instagram

3. **信息提取清单**

每位作家需要收集:
- 基础信息: 姓名（中日英）、出生年份
- 职业信息: 产地、风格、技法
- 成就: 奖项、展览、师承关系
- 社交媒体: Instagram 账号、粉丝数
- 参考来源: 至少3个权威来源

4. **数据整理**

使用批量导入 JSON 格式:

```json
[
  {
    "slug": "artist-slug",
    "nameZh": "中文名",
    "nameJa": "日文名",
    "nameEn": "English Name",
    "bio": "详细简介...",
    "birthYear": 1950,
    "region": "佐贺县·有田町",
    "style": "传统有田瓷",
    "awards": ["奖项1", "奖项2"],
    "exhibitions": ["展览1", "展览2"],
    "sources": [
      {
        "title": "来源标题",
        "url": "https://..."
      }
    ],
    "instagramHandle": "username",
    "instagramFollowers": 50000
  }
]
```

**目标**: 新增 15-20 位九州作家

---

#### 每日工作流程

**上午 (3小时)**: 研究和数据收集
1. 选择一个产地（例如：有田烧）
2. 搜索该产地的代表性作家（目标: 3-5位）
3. 逐个作家深入研究，收集完整信息
4. 整理为结构化 JSON 数据

**下午 (2小时)**: 数据导入和验证
1. 使用批量导入功能导入数据
2. 检查导入结果，修正错误
3. 在前台页面验证显示效果
4. 记录研究笔记和参考来源

**验收标准**:
- [ ] 每位作家信息完整（无缺失字段）
- [ ] 至少3个参考来源
- [ ] 简介内容 > 200字
- [ ] Instagram 数据准确（如有）

---

### Week 4 (2026-03-17 ~ 2026-03-23): 北陆地区 + 关联关系补充

#### Day 16-18: 北陆地区作家

**目标产地**:
- 九谷烧 (Kutani) - 石川县
- 越前烧 (Echizen) - 福井县

**研究步骤**: 同上

**目标**: 新增 10-15 位北陆作家

---

#### Day 19-20: 补充作家-陶器关联关系

**目标**: 补充8个缺失关联的陶器条目

**缺失关联的条目**:
1. 常滑烧 (Tokoname-yaki)
2. 濑户烧 (Seto-yaki)
3. 丹波烧 (Tamba-yaki)
4. 越前烧 (Echizen-yaki)
5. 乐烧 (Raku)
6. 萩烧 (Hagi)
7. 九谷烧 (Kutani)
8. 伊万里·有田烧 (Imari-Arita)

**工作步骤**:

1. **研究每个产地的代表性作家**

搜索关键词:
```
"常滑烧 作家"
"Tokoname pottery artists"
"常滑 人间国宝"
```

2. **确定关联关系**

基于以下标准:
- 作家的主要工作产地
- 师承关系和传承
- 获奖记录中提及的技法

3. **更新数据**

方式1: 通过后台批量更新
```typescript
// 使用批量更新 API
{
  "ids": ["entry-id-1", "entry-id-2"],
  "action": "update",
  "updates": {
    "relatedArtists": ["artist-slug-1", "artist-slug-2"]
  }
}
```

方式2: 直接编辑条目
- 在后台逐个编辑条目
- 在"相关作家"字段添加作家关联

**验收标准**:
- [ ] 所有21个陶器条目都有关联作家
- [ ] 每个条目至少关联1位作家
- [ ] 关联关系合理（作家确实与该陶器传统相关）

---

### 内容扩展总结

**预期成果** (第三-四周结束):
- 总作家数: 60 → 85-95 位
- 总陶器条目: 21 (保持不变，但关联完善)
- 地域覆盖: 全面（关东、中部、关西、九州、北陆）
- 关联关系: 100% 完整

**数据质量检查清单**:
- [ ] 所有作家简介 > 200字
- [ ] 所有作家至少3个参考来源
- [ ] Instagram 数据准确
- [ ] 无重复条目
- [ ] 无明显错误信息

---

## 第五-六周计划：高级功能开发 (可选)

**时间**: 2026-03-24 ~ 2026-04-06
**优先级**: 🟢 低 (根据实际情况决定是否执行)

### 可选功能列表

#### 1. 高级筛选功能
- 多条件组合筛选
- 标签云
- 筛选历史记录
- 预估耗时: 3天

#### 2. 相关推荐
- 基于标签相似度的推荐算法
- 详情页底部显示相关条目
- 预估耗时: 2天

#### 3. 地图功能 (Leaflet.js)
- 在地图上标注产地
- 点击标记查看该产地的条目
- 预估耗时: 4天

#### 4. Instagram 数据同步 (Basic Display API)
- 自动同步粉丝数
- 每日更新
- 预估耗时: 5天

#### 5. 日式 UI 定制
- 和纸质感背景
- 传统配色方案
- 细腻动画效果
- 预估耗时: 5天

---

## 执行指南

### 开始前准备

1. **环境检查**
```bash
# 确认数据库运行
docker ps | grep postgres-pottery

# 确认依赖安装完整
pnpm install

# 确认代码最新
git pull origin main
```

2. **创建工作分支**
```bash
git checkout -b phase-2-development
```

3. **阅读相关文档**
- `docs/DAILY-LOG.md` - 了解当前进度
- `docs/plans/phase-1-implementation-plan.md` - 回顾阶段1
- `docs/AI-CONTENT-GUIDE.md` - 内容填充指南

---

### 每日工作流程

#### 早上开始工作时

1. **更新 DAILY-LOG.md**
```markdown
## 🚧 进行中任务

- [ ] **TASK-2.X**: 任务名称
  - **开始时间**: 2026-XX-XX XX:XX
  - **预计耗时**: X 小时
```

2. **启动环境**
```bash
# 启动数据库
docker start postgres-pottery

# 启动开发服务器
pnpm dev
```

3. **打开 Prisma Studio (可选)**
```bash
pnpm prisma studio
```

#### 工作中

4. **按计划执行任务**
- 遵循本计划中的详细步骤
- 遇到问题及时记录
- 代码遵循现有规范

5. **定期提交代码**
```bash
# 每完成一个小功能就提交
git add .
git commit -m "feat(task-2.x): 完成XXX功能"
```

#### 晚上结束工作时

6. **更新任务状态**
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-2.X**: 任务名称
  - **完成时间**: 2026-XX-XX XX:XX
  - **实际耗时**: X 小时
  - ✅ 完成项1
  - ✅ 完成项2
```

7. **推送代码**
```bash
git push origin phase-2-development
```

8. **记录明日计划**
```markdown
## 📝 明日计划

- TASK-2.X+1: 下一个任务
```

---

### 问题解决指南

#### 问题 1: 数据库连接失败

**症状**: `ECONNREFUSED` 错误

**解决方案**:
```bash
# 检查容器状态
docker ps -a | grep postgres

# 启动容器
docker start postgres-pottery

# 验证连接
docker exec -it postgres-pottery psql -U postgres -c "SELECT version();"
```

#### 问题 2: Prisma 迁移冲突

**症状**: Migration 文件冲突

**解决方案**:
```bash
# 重置数据库 (⚠️ 仅开发环境)
pnpm prisma migrate reset

# 重新生成客户端
pnpm prisma generate

# 重新播种数据
pnpm prisma db seed
```

#### 问题 3: 构建失败

**症状**: `pnpm build` 报错

**解决方案**:
```bash
# 清理缓存
rm -rf .next

# 重新安装依赖
rm -rf node_modules
pnpm install

# 重新构建
pnpm build
```

#### 问题 4: TypeScript 类型错误

**症状**: 类型不匹配

**解决方案**:
```bash
# 重新生成 Prisma 类型
pnpm prisma generate

# 检查类型
pnpm tsc --noEmit
```

---

### 代码规范

#### TypeScript

```typescript
// ✅ 好的示例
interface UserData {
  id: string
  name: string
}

async function getUser(id: string): Promise<UserData> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')
  return user
}

// ❌ 避免
function getUser(id: any) {
  return prisma.user.findUnique({ where: { id } })
}
```

#### API 响应格式

```typescript
// ✅ 统一格式
return NextResponse.json({
  success: true,
  data: result,
  meta: {
    total: 100,
    page: 1,
  },
})

// ✅ 错误格式
return NextResponse.json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: '验证失败',
    details: {},
  },
}, { status: 400 })
```

#### React 组件

```typescript
// ✅ 使用 TypeScript 接口
interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return <div>...</div>
}

// ✅ 使用 'use client' 指令（客户端组件）
'use client'

import { useState } from 'react'
```

#### 数据库查询

```typescript
// ✅ 使用索引字段查询
const entries = await prisma.potteryEntry.findMany({
  where: {
    status: 'PUBLISHED', // 有索引
    category: 'pottery',
  },
  orderBy: { createdAt: 'desc' }, // 有索引
})

// ✅ 使用 include 避免 N+1 查询
const entries = await prisma.potteryEntry.findMany({
  include: { artist: true }, // 一次查询获取关联数据
})
```

---

## 验收标准

### 第一周验收标准

**性能指标**:
- [ ] 首页加载时间 < 1秒
- [ ] 详情页加载时间 < 500ms
- [ ] API 响应时间 < 200ms
- [ ] Lighthouse 性能分数 > 85

**功能完整性**:
- [ ] ISR 正常工作
- [ ] 数据库索引生效
- [ ] 图片懒加载生效
- [ ] SEO 元数据完整
- [ ] Sitemap 生成成功

**代码质量**:
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
- [ ] 构建成功
- [ ] 测试通过

---

### 第二周验收标准

**批量编辑**:
- [ ] 多选功能正常
- [ ] 批量修改分类生效
- [ ] 批量修改产地生效
- [ ] 批量发布/取消发布生效
- [ ] 批量删除需确认

**审核工作流**:
- [ ] 状态系统正常工作
- [ ] 审核列表显示正确
- [ ] 批准操作正常
- [ ] 拒绝操作正常
- [ ] 前台只显示 PUBLISHED 内容

**统计仪表盘**:
- [ ] 核心统计准确
- [ ] 图表显示正常
- [ ] 按分类/产地统计正确
- [ ] 响应式设计良好

---

### 第三-四周验收标准

**内容量**:
- [ ] 总作家数 > 85
- [ ] 地域覆盖完整
- [ ] 所有陶器条目有关联作家

**数据质量**:
- [ ] 所有作家简介 > 200字
- [ ] 所有作家至少3个参考来源
- [ ] 无重复条目
- [ ] 无明显错误信息
- [ ] Instagram 数据准确

---

## 项目里程碑

### 里程碑 1: 性能优化完成 (第一周末)
- 所有性能指标达标
- Lighthouse 分数 > 85
- 用户体验显著提升

### 里程碑 2: 管理功能完善 (第二周末)
- 批量操作可用
- 审核流程建立
- 管理效率提升 50%+

### 里程碑 3: 内容扩展完成 (第四周末)
- 作家数量翻倍
- 地域覆盖完整
- 关联关系完善

### 里程碑 4: 阶段2完成 (第六周末)
- 所有计划任务完成
- 系统稳定可靠
- 准备进入阶段3

---

## 风险管理

### 已识别风险

#### 风险 1: 性能优化效果不达标
- **概率**: 中
- **影响**: 高
- **缓解措施**:
  - 多轮测试和调优
  - 使用 Redis 缓存（备选方案）
  - 考虑 CDN（如需要）

#### 风险 2: 内容研究耗时超预期
- **概率**: 高
- **影响**: 中
- **缓解措施**:
  - 设定每日最低目标
  - 优先质量而非数量
  - 可适当延长时间线

#### 风险 3: 数据库迁移出现问题
- **概率**: 低
- **影响**: 高
- **缓解措施**:
  - 迁移前完整备份
  - 在开发环境测试
  - 准备回滚方案

---

## 总结

**阶段2目标**:
- ✅ 性能提升 - 首页 < 1秒，详情页 < 500ms
- ✅ 功能完善 - 批量编辑、审核流程、统计分析
- ✅ 内容扩展 - 60 → 85+ 作家，地域覆盖完整
- ✅ 质量提升 - Lighthouse > 85，数据完整准确

**预期完成时间**: 4-6周

**下一步**: 进入阶段3（高级功能 + 商城融合）

---

**文档创建时间**: 2026-02-25
**计划启动日期**: 2026-02-26
**计划制定人**: Claude (Based on Phase 1 completion analysis)

---

## 附录

### A. 相关文档链接
- [阶段1实施计划](./phase-1-implementation-plan.md)
- [三阶段开发计划](./2026-02-24-three-phase-development-plan.md)
- [每日工作日志](../DAILY-LOG.md)
- [API 文档](../api.md)

### B. 有用的命令速查

```bash
# 数据库
pnpm prisma studio                 # 打开 Prisma Studio
pnpm prisma migrate dev            # 运行迁移
pnpm prisma db seed                # 播种数据

# 开发
pnpm dev                           # 启动开发服务器
pnpm build                         # 构建生产版本
pnpm start                         # 启动生产服务器

# 代码质量
pnpm lint                          # ESLint 检查
pnpm tsc --noEmit                  # TypeScript 类型检查

# Docker
docker start postgres-pottery      # 启动数据库
docker ps                          # 查看运行中的容器
docker logs postgres-pottery       # 查看数据库日志

# Git
git status                         # 查看状态
git add .                          # 添加所有更改
git commit -m "message"            # 提交
git push origin branch-name        # 推送
```

### C. 紧急联系

遇到无法解决的问题时:
1. 在 `docs/DAILY-LOG.md` 的"遇到的问题"区域详细记录
2. 暂停任务，避免产生错误代码
3. 等待用户介入

---

**祝开发顺利！ 🚀**
