import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// 从现有 HTML 文件提取的陶器数据
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
    signatureFeatures: ["日本陶磁协会公开「人间国宝（陶磁）」列表（名家节点统一索引源）"],
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
    positioning: "六大古窑体系主标签（用于「产地—技法—作家」归档）",
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
    positioning: "以窯变「景色」为核心；名家体系清晰（人间国宝）",
    description: "备前烧是日本六古窑之一，产于冈山县备前市伊部地区。其最大特点是无釉高温烧成（焼締），通过薪窑烧制过程中产生的窯变形成独特的「景色」。备前烧拥有完整的名家传承体系，包括多位人间国宝。",
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

  // 2. 导入陶器数据
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
          relatedProductIds: [],
          seoKeywords: [],
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
