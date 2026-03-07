import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    const entries = await prisma.potteryEntry.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        nameZh: true,
        category: true,
      },
    })

    const categories: Record<string, any[]> = {}
    entries.forEach(entry => {
      if (!categories[entry.category]) {
        categories[entry.category] = []
      }
      categories[entry.category].push({
        id: entry.id,
        slug: entry.slug,
        nameZh: entry.nameZh,
      })
    })

    const summary = Object.entries(categories)
      .map(([category, items]) => ({
        category,
        count: items.length,
        items: items.map(i => i.nameZh),
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ success: true, data: summary })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
