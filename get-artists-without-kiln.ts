import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
  
  console.log(JSON.stringify(artists, null, 2))
  
  await prisma.$disconnect()
}

main()
