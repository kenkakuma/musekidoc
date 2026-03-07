import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function POST() {
  try {
    console.log('开始合并技法分类...')

    // 查找简体"样式"的条目
    const entriesToUpdate = await prisma.potteryEntry.findMany({
      where: {
        category: '技法·样式（Techniques & Styles）'
      },
      select: {
        id: true,
        slug: true,
        nameZh: true,
        category: true,
      }
    })

    console.log(`找到 ${entriesToUpdate.length} 个需要更新的条目`)

    if (entriesToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要更新的条目',
        count: 0
      })
    }

    // 更新分类
    const result = await prisma.potteryEntry.updateMany({
      where: {
        category: '技法·样式（Techniques & Styles）'
      },
      data: {
        category: '技法·様式（Techniques & Styles）'
      }
    })

    // 验证结果
    const updatedEntries = await prisma.potteryEntry.findMany({
      where: {
        category: '技法·様式（Techniques & Styles）'
      },
      select: {
        nameZh: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: `成功合并分类，更新了 ${result.count} 个条目`,
      updated: result.count,
      totalInCategory: updatedEntries.length,
      entries: entriesToUpdate.map(e => e.nameZh),
      allEntriesNow: updatedEntries.map(e => e.nameZh)
    })
  } catch (error) {
    console.error('合并分类出错:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
