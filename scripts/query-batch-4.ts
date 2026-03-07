import { prisma } from '../lib/db/client'

async function findArtists() {
  const artists = await prisma.artist.findMany({
    where: {
      AND: [
        { birthYear: { gte: 1970 } },
        { birthYear: { lte: 1984 } },
        { kilnName: null }
      ]
    },
    select: {
      slug: true,
      nameZh: true,
      nameJa: true,
      birthYear: true
    },
    orderBy: { birthYear: 'asc' }
  })

  console.log('=== Batch 4 候选作家 (1970-1984, 无窑场信息) ===')
  console.log('总计:', artists.length, '位\n')
  artists.forEach(a => {
    console.log(`- ${a.nameZh} (${a.nameJa}) - ${a.birthYear} - slug: ${a.slug}`)
  })
}

findArtists().finally(() => process.exit())
