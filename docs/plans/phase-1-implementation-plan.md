# Phase 1: Japan Pottery Knowledge Base - MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a functional knowledge base with admin backend that enables AI agents to seamlessly research and fill content (target: 50 entries)

**Architecture:** Next.js 14 App Router + PostgreSQL + Prisma ORM. Frontend uses React Server Components for performance. Admin panel with simple password auth. AI agents fill content via forms, bulk import, or API.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui, Sharp (image processing), MiniSearch (client-side search)

**AI Agent Integration:** Every task completion must update `docs/DAILY-LOG.md`. Content filling follows `docs/AI-CONTENT-GUIDE.md`.

---

## 🔄 Daily Workflow for AI Agents

**Before starting ANY task:**
1. Read `docs/DAILY-LOG.md` to understand current progress
2. Move selected task from "待完成任务" to "进行中任务"
3. Update task with start time

**After completing ANY task:**
1. Update `docs/DAILY-LOG.md` with completion status
2. Update progress statistics
3. Commit with format: `feat(task-xxx): description`

---

## Task 0: Project Initialization

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `.env`
- Create: `next.config.js`
- Create: `tsconfig.json`

### Step 0.1: Update DAILY-LOG

**Action:** Mark TASK-001 as in progress

Edit `docs/DAILY-LOG.md`:
```markdown
## 🚧 进行中任务

- [x] **TASK-001**: 项目初始化
  - **开始时间**: 2026-02-24 14:30
```

### Step 0.2: Create Next.js project

**Command:**
```bash
cd E:\musekidoc
pnpm create next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

**Expected output:**
- Next.js project scaffolded
- `app/` directory created
- `package.json` exists

**Verification:**
```bash
pnpm dev
```
Visit `http://localhost:3000` - should see Next.js welcome page

### Step 0.3: Install core dependencies

**Command:**
```bash
pnpm add prisma @prisma/client zod react-hook-form @hookform/resolvers sharp minisearch bcrypt
pnpm add -D @types/bcrypt
```

**Expected output:** Dependencies added to `package.json`

### Step 0.4: Install shadcn/ui

**Command:**
```bash
pnpm dlx shadcn-ui@latest init
```

**Choices when prompted:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Then install base components:**
```bash
pnpm dlx shadcn-ui@latest add button card input select textarea dialog badge table form label
```

**Expected output:** `components/ui/` directory created with components

### Step 0.5: Setup environment variables

**Create:** `.env.example`
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pottery_kb"

# Admin
ADMIN_PASSWORD="changeme"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Image Upload
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

**Create:** `.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pottery_kb"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

### Step 0.6: Update DAILY-LOG completion

Edit `docs/DAILY-LOG.md`:
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-001**: 项目初始化
  - **完成时间**: 2026-02-24 15:00
  - **实际耗时**: 0.5 小时
  - ✅ Next.js 项目创建成功
  - ✅ 核心依赖已安装
  - ✅ shadcn/ui 已配置
  - ✅ 环境变量已设置

## 🚧 进行中任务

_暂无_

## 📈 累计进度统计

| 分类 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| **项目初始化** | 1 | 1 | 100% |
| **数据库设计** | 0 | 2 | 0% |
...
```

### Step 0.7: Commit

```bash
git add .
git commit -m "feat(task-001): initialize Next.js project with Prisma and shadcn/ui"
git push origin main
```

---

## Task 1: Database Schema Design

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db/types.ts`
- Create: `prisma/seed.ts`

### Step 1.1: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## 🚧 进行中任务

- [ ] **TASK-002**: 数据库 Schema 设计
  - **开始时间**: 2026-02-24 15:05
```

### Step 1.2: Initialize Prisma

**Command:**
```bash
pnpm prisma init
```

**Expected output:**
- `prisma/schema.prisma` created
- `.env` updated with DATABASE_URL

### Step 1.3: Write Prisma schema

**Create:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 陶器条目（核心模型）
model PotteryEntry {
  id        String   @id @default(uuid())
  slug      String   @unique

  // 多语言名称
  nameZh    String
  nameJa    String
  nameEn    String?

  // 分类
  category  String   // 陶器/磁器/作家/产地
  region    String   // 产地
  type      String?  // 类型（可选）

  // 内容
  description  String   @db.Text
  positioning  String   // 定位说明

  // JSON 数组字段
  signatureFeatures    Json   // string[] - 识别特征
  keywords             String[]   // 关键词
  notableArtists       Json   // string[] - 知名作家
  representativeForms  Json   // string[] - 代表器型

  // 媒体
  images    Json?    // ImageAsset[]

  // 关联
  artistId  String?
  artist    Artist?  @relation(fields: [artistId], references: [id])

  // 来源
  sources   Json     // Source[]

  // 社交字段（预留）
  instagramHandle     String?
  instagramFollowers  Int?
  instagramLastSync   DateTime?

  // 市场信息（预留）
  priceRange       String?
  exhibitionCount  Int?
  popularityScore  Int?

  // 商品关联（预留，未来与商城对接）
  relatedProductIds String[]
  externalShopUrl   String?

  // SEO
  seoTitle       String?
  seoDescription String?
  seoKeywords    String[]

  // 元数据
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([category, region])
  @@index([artistId])
  @@index([slug])
  @@index([published])
}

// 作家
model Artist {
  id        String   @id @default(uuid())
  slug      String   @unique

  nameZh    String
  nameJa    String
  nameEn    String?

  bio       String   @db.Text
  birthYear Int?
  deathYear Int?

  // 社交媒体
  instagramHandle    String?   @unique
  instagramFollowers Int?
  instagramLastSync  DateTime?
  websiteUrl         String?

  // 市场数据
  exhibitionCount Int?
  avgPriceRange   String?

  // 媒体
  avatar    String?
  images    Json?

  // 关联
  entries   PotteryEntry[]

  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
}

// 分类（层级结构）
model Category {
  id        String     @id @default(uuid())
  slug      String     @unique

  nameZh    String
  nameJa    String
  nameEn    String?

  description String?  @db.Text

  // 层级
  parentId    String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")

  order     Int        @default(0)

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([slug])
  @@index([parentId])
}

// 管理员用户（简化设计，单用户）
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         String   @default("admin")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 1.4: Create TypeScript types

**Create:** `lib/db/types.ts`

```typescript
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
```

### Step 1.5: Run migration

**Command:**
```bash
pnpm prisma migrate dev --name init
```

**Expected output:**
- Migration file created in `prisma/migrations/`
- Database tables created
- Prisma Client generated

**Verification:**
```bash
pnpm prisma studio
```
Should open Prisma Studio at `http://localhost:5555`

### Step 1.6: Create database client

**Create:** `lib/db/client.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Step 1.7: Create seed file with existing 14 entries

**Create:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// 从现有 HTML 文件提取的 14 条数据
const EXISTING_DATA = [
  {
    slug: "ningen-kokuho-toji-index",
    nameZh: "人间国宝（陶磁）名单入口",
    nameJa: "日本のやきもの／人間国宝",
    nameEn: "LNT (ceramics) index",
    category: "框架/索引（人名列表）",
    region: "日本（全国）",
    positioning: "定位陶磁领域重要无形文化财保持者（人间国宝）并反查到产地/技法节点",
    description: "日本陶磁协会公开的人间国宝（陶磁）列表，是陶磁领域名家节点的统一索引源。",
    signatureFeatures: ["日本陶磁协会公开"人间国宝（陶磁）"列表（名家节点统一索引源）"],
    keywords: ["人間国宝", "重要無形文化財", "保持者", "陶芸"],
    notableArtists: ["（索引入口）"],
    representativeForms: ["—"],
    sources: [
      {
        title: "日本陶磁协会：日本のやきもの／人間国宝",
        url: "https://www.ceramic.or.jp/museum/yakimono/contents/kokuho.html"
      }
    ]
  },
  {
    slug: "rokkkoyo",
    nameZh: "六古窯（知识库标签）",
    nameJa: "六古窯",
    nameEn: "Six Ancient Kilns (Rokkoyō)",
    category: "框架/分类标签",
    region: "日本（越前・瀬戸・常滑・信楽・丹波・備前）",
    positioning: "六大古窑体系主标签（用于"产地—技法—作家"归档）",
    description: "六古窑是日本最重要的陶瓷产地体系，包括越前、瀬戸、常滑、信楽、丹波、備前六个具有持续性地域传统的窑口。2017年被认定为日本遗产。",
    signatureFeatures: [
      "持续性地域传统体系（非单一窑口/单一作家）",
      "2017年作为日本遗产认定（六古窯）"
    ],
    keywords: ["六古窯", "Rokkoyō", "日本遺産", "Japan Heritage"],
    notableArtists: ["—"],
    representativeForms: ["甕/壺/鉢/皿/茶陶/日用器"],
    sources: [
      {
        title: "六古窯（官方）",
        url: "https://en.sixancientkilns.jp/"
      },
      {
        title: "JNTO：六古窯（日本遗产）",
        url: "https://www.japan.travel/japan-heritage/popular/a4966b88-09bc-4beb-9d38-d055c65761ec"
      }
    ]
  },
  {
    slug: "bizen-yaki",
    nameZh: "备前烧（总览）",
    nameJa: "備前焼",
    nameEn: "Bizen ware",
    category: "陶器 / 无釉 / 薪窑（焼締）",
    region: "冈山县・备前市（伊部/Imbe）",
    positioning: "以窯变"景色"为核心；名家体系清晰（人间国宝）",
    description: "备前烧是日本六古窑之一，产于冈山县备前市伊部地区。其最大特点是无釉高温烧成（焼締），通过薪窑烧制过程中产生的窯变形成独特的"景色"。备前烧拥有完整的名家传承体系，包括多位人间国宝。",
    signatureFeatures: [
      "无釉高温烧成（焼締）",
      "窯变分类：胡麻/緋襷/桟切/窯変",
      "名家：金重陶陽、藤原雄、伊勢崎淳等"
    ],
    keywords: ["備前焼", "無釉", "焼締", "窯変", "人間国宝"],
    notableArtists: ["金重陶陽", "藤原雄", "伊勢崎淳"],
    representativeForms: ["茶碗", "徳利", "ぐい呑", "花器", "壺"],
    sources: [
      {
        title: "六古窯：Bizen",
        url: "https://en.sixancientkilns.jp/bizen/"
      }
    ]
  },
  // ... 其他 11 条数据（为简洁起见，这里省略，实际应包含全部 14 条）
]

async function main() {
  console.log('🌱 开始数据库 seeding...')

  // 1. 创建管理员用户
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pottery-kb.local' },
    update: {},
    create: {
      email: 'admin@pottery-kb.local',
      passwordHash,
      role: 'admin',
    },
  })
  console.log('✅ 管理员用户已创建:', admin.email)

  // 2. 导入 14 条现有数据
  let importedCount = 0
  for (const data of EXISTING_DATA) {
    try {
      await prisma.potteryEntry.upsert({
        where: { slug: data.slug },
        update: {},
        create: {
          slug: data.slug,
          nameZh: data.nameZh,
          nameJa: data.nameJa,
          nameEn: data.nameEn || null,
          category: data.category,
          region: data.region,
          positioning: data.positioning,
          description: data.description,
          signatureFeatures: data.signatureFeatures as any,
          keywords: data.keywords,
          notableArtists: data.notableArtists as any,
          representativeForms: data.representativeForms as any,
          sources: data.sources as any,
          published: true,
          publishedAt: new Date(),
        },
      })
      importedCount++
      console.log(`✅ 导入条目: ${data.nameZh}`)
    } catch (error) {
      console.error(`❌ 导入失败: ${data.nameZh}`, error)
    }
  }

  console.log(`\n🎉 Seeding 完成！`)
  console.log(`   管理员: 1 个`)
  console.log(`   陶器条目: ${importedCount} 个`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Update:** `package.json` - add seed script:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Install tsx:**
```bash
pnpm add -D tsx
```

### Step 1.8: Run seed

**Command:**
```bash
pnpm prisma db seed
```

**Expected output:**
- Admin user created
- 14 pottery entries imported

**Verification:**
```bash
pnpm prisma studio
```
Check that `PotteryEntry` table has 14 records

### Step 1.9: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-002**: 数据库 Schema 设计
  - **完成时间**: 2026-02-24 16:30
  - **实际耗时**: 1.5 小时
  - ✅ Prisma schema 已创建
  - ✅ 数据库迁移成功
  - ✅ 类型定义完整
  - ✅ Seed 数据导入成功（14 条）

## 📈 累计进度统计

| 分类 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| **项目初始化** | 1 | 1 | 100% |
| **数据库设计** | 1 | 2 | 50% |
...
```

### Step 1.10: Commit

```bash
git add .
git commit -m "feat(task-002): add Prisma schema and seed with 14 existing entries"
git push origin main
```

---

## Task 2: API Routes - Entries CRUD

**Files:**
- Create: `lib/validations/entry.ts`
- Create: `app/api/entries/route.ts`
- Create: `app/api/entries/[id]/route.ts`

### Step 2.1: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## 🚧 进行中任务

- [ ] **TASK-003**: API 路由 - 条目 CRUD
  - **开始时间**: 2026-02-24 16:35
```

### Step 2.2: Create validation schemas

**Create:** `lib/validations/entry.ts`

```typescript
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

  published: z.boolean().default(false),
})

// 更新条目验证（所有字段可选）
export const updateEntrySchema = createEntrySchema.partial()

// 查询参数验证
export const entriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  region: z.string().optional(),
  published: z.coerce.boolean().optional(),
  search: z.string().optional(),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>
export type EntriesQuery = z.infer<typeof entriesQuerySchema>
```

### Step 2.3: Create middleware for auth

**Create:** `lib/auth/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌',
        },
      },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (token !== adminPassword) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '认证令牌无效',
        },
      },
      { status: 403 }
    )
  }

  return null // Auth passed
}
```

### Step 2.4: Create entries list API

**Create:** `app/api/entries/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { createEntrySchema, entriesQuerySchema } from '@/lib/validations/entry'
import { requireAuth } from '@/lib/auth/middleware'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/entries - 获取条目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 验证查询参数
    const query = entriesQuerySchema.parse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      category: searchParams.get('category'),
      region: searchParams.get('region'),
      published: searchParams.get('published'),
      search: searchParams.get('search'),
    })

    // 构建 where 条件
    const where: any = {}

    if (query.category) {
      where.category = { contains: query.category }
    }

    if (query.region) {
      where.region = { contains: query.region }
    }

    if (query.published !== undefined) {
      where.published = query.published
    }

    if (query.search) {
      where.OR = [
        { nameZh: { contains: query.search, mode: 'insensitive' } },
        { nameJa: { contains: query.search } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    // 查询总数
    const total = await prisma.potteryEntry.count({ where })

    // 分页查询
    const entries = await prisma.potteryEntry.findMany({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            slug: true,
            nameZh: true,
            nameJa: true,
          },
        },
      },
    })

    const response: ApiResponse = {
      success: true,
      data: entries,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/entries error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '获取条目列表失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/entries - 创建条目（需要认证）
export async function POST(request: NextRequest) {
  // 验证权限
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()

    // 验证输入
    const validated = createEntrySchema.parse(body)

    // 检查 slug 唯一性
    const existing = await prisma.potteryEntry.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: `Slug "${validated.slug}" 已存在`,
          },
        },
        { status: 400 }
      )
    }

    // 创建条目
    const entry = await prisma.potteryEntry.create({
      data: {
        slug: validated.slug,
        nameZh: validated.nameZh,
        nameJa: validated.nameJa,
        nameEn: validated.nameEn || null,
        category: validated.category,
        region: validated.region,
        type: validated.type || null,
        description: validated.description,
        positioning: validated.positioning,
        signatureFeatures: validated.signatureFeatures as any,
        keywords: validated.keywords,
        notableArtists: validated.notableArtists as any,
        representativeForms: validated.representativeForms as any,
        sources: validated.sources as any,
        artistId: validated.artistId || null,
        instagramHandle: validated.instagramHandle || null,
        instagramFollowers: validated.instagramFollowers || null,
        priceRange: validated.priceRange || null,
        exhibitionCount: validated.exhibitionCount || null,
        published: validated.published,
        publishedAt: validated.published ? new Date() : null,
        relatedProductIds: [],
        seoKeywords: [],
      },
    })

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/entries error:', error)

    // Zod 验证错误
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

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '创建条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
```

### Step 2.5: Create entry detail API

**Create:** `app/api/entries/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { updateEntrySchema } from '@/lib/validations/entry'
import { requireAuth } from '@/lib/auth/middleware'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/entries/[id] - 获取单个条目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
      include: {
        artist: true,
      },
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

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`GET /api/entries/${params.id} error:`, error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '获取条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// PUT /api/entries/[id] - 更新条目（需要认证）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = updateEntrySchema.parse(body)

    // 检查条目是否存在
    const existing = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
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

    // 如果更新 slug，检查新 slug 唯一性
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.potteryEntry.findUnique({
        where: { slug: validated.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_SLUG',
              message: `Slug "${validated.slug}" 已存在`,
            },
          },
          { status: 400 }
        )
      }
    }

    // 构建更新数据
    const updateData: any = {}

    // 只更新提供的字段
    Object.keys(validated).forEach((key) => {
      const value = (validated as any)[key]
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    // 如果更新 published 状态为 true，设置 publishedAt
    if (validated.published === true && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }

    // 更新条目
    const entry = await prisma.potteryEntry.update({
      where: { id: params.id },
      data: updateData,
    })

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`PUT /api/entries/${params.id} error:`, error)

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

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '更新条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/entries/[id] - 删除条目（需要认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
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

    await prisma.potteryEntry.delete({
      where: { id: params.id },
    })

    const response: ApiResponse = {
      success: true,
      data: { id: params.id },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`DELETE /api/entries/${params.id} error:`, error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '删除条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
```

### Step 2.6: Test API endpoints

**Using curl or Postman:**

**Test GET (public):**
```bash
curl http://localhost:3000/api/entries
```
Expected: JSON with 14 entries

**Test POST (authenticated):**
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d '{
    "slug": "test-entry",
    "nameZh": "测试条目",
    "nameJa": "テスト",
    "category": "陶器",
    "region": "测试产地",
    "description": "这是一个测试条目的描述，需要至少100个字符。这是一个测试条目的描述，需要至少100个字符。这是一个测试条目的描述，需要至少100个字符。",
    "positioning": "这是定位说明文本",
    "signatureFeatures": ["特征1", "特征2"],
    "keywords": ["关键词1", "关键词2", "关键词3"],
    "notableArtists": [],
    "representativeForms": [],
    "sources": [{"title": "测试来源", "url": "https://example.com"}]
  }'
```
Expected: 201 Created with entry data

**Test GET by ID:**
```bash
curl http://localhost:3000/api/entries/[returned-id]
```
Expected: Entry details

**Test DELETE:**
```bash
curl -X DELETE http://localhost:3000/api/entries/[test-entry-id] \
  -H "Authorization: Bearer admin123"
```
Expected: 200 OK

### Step 2.7: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-003**: API 路由 - 条目 CRUD
  - **完成时间**: 2026-02-24 18:00
  - **实际耗时**: 1.5 小时
  - ✅ Zod 验证 schema 已创建
  - ✅ GET /api/entries 实现并测试
  - ✅ POST /api/entries 实现并测试
  - ✅ GET/PUT/DELETE /api/entries/[id] 实现并测试
  - ✅ 认证中间件已实现

## 📈 累计进度统计

| 分类 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| **API 开发** | 1 | 6 | 16.7% |
...
```

### Step 2.8: Commit

```bash
git add .
git commit -m "feat(task-003): implement entries CRUD API with authentication"
git push origin main
```

---

## Task 3: Frontend - Public Homepage

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `components/public/PotteryCard.tsx`
- Create: `components/public/SearchBar.tsx`

### Step 3.1: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## 🚧 进行中任务

- [ ] **TASK-004**: 前台首页开发
  - **开始时间**: 2026-02-24 18:05
```

### Step 3.2: Create public layout

**Create:** `app/(public)/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Noto_Sans_SC, Noto_Sans_JP } from 'next/font/google'
import '../globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '日本陶器知识库 | Japan Pottery Knowledge Base',
  description: '探索日本陶艺的历史、技法与名家作品',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${notoSansSC.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-slate-50">
          {/* Header */}
          <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">日本陶器知识库</h1>
                <nav className="flex gap-6">
                  <a href="/" className="text-sm hover:text-blue-600">首页</a>
                  <a href="/artists" className="text-sm hover:text-blue-600">作家</a>
                  <a href="/admin" className="text-sm hover:text-blue-600">管理</a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="border-t bg-white mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600">
              <p>© 2026 Japan Pottery Knowledge Base</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
```

### Step 3.3: Create PotteryCard component

**Create:** `components/public/PotteryCard.tsx`

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { PotteryEntryData } from '@/lib/db/types'

interface PotteryCardProps {
  entry: PotteryEntryData
}

export function PotteryCard({ entry }: PotteryCardProps) {
  return (
    <Link href={`/pottery/${entry.slug}`}>
      <div className="group rounded-lg border bg-white p-4 hover:shadow-lg transition-shadow">
        {/* 图片（如果有） */}
        {entry.images && Array.isArray(entry.images) && entry.images.length > 0 && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-100 mb-3">
            <img
              src={entry.images[0].url}
              alt={entry.images[0].alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600">
          {entry.nameZh}
        </h3>

        {/* 日文名 */}
        <p className="text-sm text-slate-600 mb-2 font-jp">
          {entry.nameJa}
        </p>

        {/* 产地 */}
        <p className="text-sm text-slate-500 mb-3">{entry.region}</p>

        {/* 分类标签 */}
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

### Step 3.4: Create SearchBar component

**Create:** `components/public/SearchBar.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }

      router.push(`/?${params.toString()}`)
    }, 300) // 防抖 300ms

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  return (
    <div className="w-full max-w-md">
      <Input
        type="search"
        placeholder="搜索：产地/类型/关键词/作家"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>
  )
}
```

### Step 3.5: Create homepage

**Create:** `app/(public)/page.tsx`

```typescript
import { Suspense } from 'react'
import { prisma } from '@/lib/db/client'
import { PotteryCard } from '@/components/public/PotteryCard'
import { SearchBar } from '@/components/public/SearchBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface HomePageProps {
  searchParams: {
    search?: string
    category?: string
    page?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const search = searchParams.search
  const category = searchParams.category

  // 构建查询条件
  const where: any = {
    published: true,
  }

  if (search) {
    where.OR = [
      { nameZh: { contains: search, mode: 'insensitive' } },
      { nameJa: { contains: search } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = { contains: category }
  }

  // 查询数据
  const [entries, total] = await Promise.all([
    prisma.potteryEntry.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.potteryEntry.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 搜索和筛选区域 */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBar />
          </Suspense>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-slate-600">
          找到 <span className="font-semibold">{total}</span> 个条目
          {search && ` · 搜索："${search}"`}
        </div>
      </div>

      {/* 条目网格 */}
      {entries.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entries.map((entry) => (
              <PotteryCard key={entry.id} entry={entry as any} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/?page=${p}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
                  className={`px-4 py-2 rounded ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border hover:bg-slate-50'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>未找到匹配的条目</p>
          <p className="text-sm mt-2">尝试修改搜索条件或清空筛选</p>
        </div>
      )}
    </div>
  )
}
```

### Step 3.6: Test homepage

**Command:**
```bash
pnpm dev
```

**Visit:** `http://localhost:3000`

**Expected:**
- 14 pottery entries displayed in grid
- Search bar functional (with 300ms debounce)
- Pagination if more than 20 entries
- Clicking card navigates to detail page (will implement next)

### Step 3.7: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-004**: 前台首页开发
  - **完成时间**: 2026-02-24 19:30
  - **实际耗时**: 1.5 小时
  - ✅ 公共布局已创建
  - ✅ 搜索组件实现（防抖）
  - ✅ 陶器卡片组件
  - ✅ 首页列表和分页
  - ✅ 测试通过

## 📈 累计进度统计

| 分类 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| **前台页面** | 1 | 4 | 25% |
...
```

### Step 3.8: Commit

```bash
git add .
git commit -m "feat(task-004): implement public homepage with search and pagination"
git push origin main
```

---

## Task 4: Frontend - Detail Page

**Files:**
- Create: `app/(public)/pottery/[slug]/page.tsx`
- Create: `components/public/ImageGallery.tsx`

### Step 4.1: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## 🚧 进行中任务

- [ ] **TASK-005**: 陶器详情页开发
  - **开始时间**: 2026-02-24 19:35
```

### Step 4.2: Create ImageGallery component

**Create:** `components/public/ImageGallery.tsx`

```typescript
'use client'

import { useState } from 'react'
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
      {/* 主图 */}
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 图片说明 */}
      {selectedImage.caption && (
        <p className="text-sm text-slate-600">{selectedImage.caption}</p>
      )}

      {/* 缩略图 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 4.3: Create detail page

**Create:** `app/(public)/pottery/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/client'
import { ImageGallery } from '@/components/public/ImageGallery'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

interface DetailPageProps {
  params: {
    slug: string
  }
}

// 生成 SEO 元数据
export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug: params.slug },
  })

  if (!entry) {
    return {
      title: '条目不存在',
    }
  }

  return {
    title: `${entry.nameZh} - 日本陶器知识库`,
    description: entry.positioning || entry.description.substring(0, 160),
    openGraph: {
      title: entry.nameZh,
      description: entry.positioning,
    },
  }
}

// 预渲染热门条目（前 50 个）
export async function generateStaticParams() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { slug: true },
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export default async function PotteryDetailPage({ params }: DetailPageProps) {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug: params.slug },
    include: {
      artist: true,
    },
  })

  if (!entry || !entry.published) {
    notFound()
  }

  const signatureFeatures = (entry.signatureFeatures as any) as string[]
  const notableArtists = (entry.notableArtists as any) as string[]
  const representativeForms = (entry.representativeForms as any) as string[]
  const sources = (entry.sources as any) as { title: string; url: string }[]
  const images = entry.images ? (entry.images as any) as any[] : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 面包屑 */}
      <nav className="text-sm text-slate-600 mb-6">
        <a href="/" className="hover:text-blue-600">首页</a>
        <span className="mx-2">/</span>
        <span>{entry.nameZh}</span>
      </nav>

      {/* 主标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{entry.nameZh}</h1>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="font-jp">{entry.nameJa}</span>
          {entry.nameEn && (
            <>
              <span>·</span>
              <span>{entry.nameEn}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：图片 */}
        <div className="lg:col-span-2">
          <ImageGallery images={images} />

          {/* 描述 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">详细介绍</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：基础信息 */}
        <div className="space-y-6">
          {/* 基础信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">分类</p>
                <p className="font-medium">{entry.category}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">产地</p>
                <p className="font-medium">{entry.region}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">定位</p>
                <p className="text-sm">{entry.positioning}</p>
              </div>

              {entry.artist && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">相关作家</p>
                  <a
                    href={`/artists/${entry.artist.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entry.artist.nameZh}
                  </a>
                </div>
              )}

              {/* 关键词 */}
              <div>
                <p className="text-sm text-slate-500 mb-2">关键词</p>
                <div className="flex flex-wrap gap-2">
                  {entry.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
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

          {/* 知名作家 */}
          {notableArtists.length > 0 && notableArtists[0] !== '—' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">知名作家</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {notableArtists.map((artist, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{artist}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 代表器型 */}
          {representativeForms.length > 0 && representativeForms[0] !== '—' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">代表器型</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {representativeForms.map((form, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{form}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 来源 */}
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

### Step 4.4: Test detail page

**Visit:** `http://localhost:3000/pottery/bizen-yaki`

**Expected:**
- Full pottery entry details displayed
- Image gallery (if images exist)
- All fields rendered correctly
- Breadcrumb navigation works
- Links to artist page (will implement next)

### Step 4.5: Update DAILY-LOG

Edit `docs/DAILY-LOG.md`:
```markdown
## ✅ 已完成任务（本日）

- [x] **TASK-005**: 陶器详情页开发
  - **完成时间**: 2026-02-24 20:30
  - **实际耗时**: 1 小时
  - ✅ 图片画廊组件
  - ✅ 详情页布局
  - ✅ SEO 元数据生成
  - ✅ 静态参数预生成
  - ✅ 测试通过

## 📈 累计进度统计

| 分类 | 已完成 | 总数 | 进度 |
|------|--------|------|------|
| **前台页面** | 2 | 4 | 50% |
...

## 📝 明日计划

- TASK-006: 管理后台 - 登录和布局
- TASK-007: 管理后台 - 条目编辑器
- TASK-008: 管理后台 - 批量导入
```

### Step 4.6: Commit

```bash
git add .
git commit -m "feat(task-005): implement pottery detail page with image gallery"
git push origin main
```

---

## 🎯 Summary of Phase 1 Plan

This implementation plan contains **18 major tasks** broken into **bite-sized steps** (2-5 minutes each):

**Completed in this document:**
- Task 0: Project Initialization
- Task 1: Database Schema Design
- Task 2: API Routes - Entries CRUD
- Task 3: Frontend - Public Homepage
- Task 4: Frontend - Detail Page

**Remaining tasks** (to be continued in next session):
- Task 5: Frontend - Artists Pages
- Task 6: Admin Backend - Auth & Layout
- Task 7: Admin Backend - Entry Editor (AI content filling core)
- Task 8: Admin Backend - Bulk Import (AI batch filling)
- Task 9: Admin Backend - Dashboard
- Task 10: API Routes - Artists
- Task 11: API Routes - Search
- Task 12: API Routes - Bulk Import
- Task 13: API Routes - Export
- Task 14: Image Upload & Processing
- Task 15: Client-side Search (MiniSearch)
- Task 16: Testing & QA
- Task 17: Content Filling (AI Agent Work)
- Task 18: Documentation

---

## 🤖 AI Agent Daily Workflow Integration

**Every day, AI agents must:**

1. **Start of day:**
   - Read `docs/DAILY-LOG.md`
   - Check "今日任务" and "遇到的问题"
   - Move task to "进行中任务"

2. **During work:**
   - Follow this plan step-by-step
   - Update DAILY-LOG when completing subtasks
   - Record issues in "遇到的问题"

3. **End of day:**
   - Update "已完成任务" with timing
   - Update progress statistics
   - Plan tomorrow's tasks
   - Commit all changes
   - Push to remote

4. **For content filling:**
   - Follow `docs/AI-CONTENT-GUIDE.md`
   - Research topics systematically
   - Use WebSearch and WebFetch tools
   - Validate all information
   - Submit drafts for user review

---

## 📞 Next Steps

**Plan complete and saved to `docs/plans/phase-1-implementation-plan.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
