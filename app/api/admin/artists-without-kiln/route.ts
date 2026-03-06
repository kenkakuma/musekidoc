import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      where: { kilnName: null },
      select: {
        slug: true,
        nameZh: true,
        nameJa: true,
        nameEn: true
      },
      orderBy: { slug: 'asc' }
    })

    return NextResponse.json({
      success: true,
      count: artists.length,
      artists
    })
  } catch (error) {
    console.error('Error fetching artists without kiln:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}
