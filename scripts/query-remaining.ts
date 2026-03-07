import { prisma } from '../lib/db/client'

async function findRemaining() {
  const remaining = await prisma.artist.findMany({
    where: {
      kilnName: null
    },
    select: {
      slug: true,
      nameZh: true,
      nameJa: true,
      birthYear: true,
      region: true
    },
    orderBy: { birthYear: 'desc' }
  })

  console.log('=== 还需补充窑场信息的作家 ===')
  console.log(`总计: ${remaining.length}/80位\n`)
  
  const groups = {
    modern: [] as any[],
    midCareer: [] as any[],
    veteran: [] as any[],
    masters: [] as any[]
  }
  
  remaining.forEach(a => {
    if (!a.birthYear) {
      groups.masters.push(a)
    } else if (a.birthYear >= 1985) {
      groups.modern.push(a)
    } else if (a.birthYear >= 1970) {
      groups.midCareer.push(a)
    } else if (a.birthYear >= 1950) {
      groups.veteran.push(a)
    } else {
      groups.masters.push(a)
    }
  })
  
  console.log(`\n超新生代/现代 (1985+): ${groups.modern.length}位`)
  groups.modern.forEach(a => console.log(`  - ${a.nameZh} (${a.nameJa}) - ${a.birthYear} - ${a.region || '?'} - ${a.slug}`))
  
  console.log(`\n中坚/成熟 (1970-1984): ${groups.midCareer.length}位`)
  groups.midCareer.forEach(a => console.log(`  - ${a.nameZh} (${a.nameJa}) - ${a.birthYear} - ${a.region || '?'} - ${a.slug}`))
  
  console.log(`\n资深 (1950-1969): ${groups.veteran.length}位`)
  groups.veteran.forEach(a => console.log(`  - ${a.nameZh} (${a.nameJa}) - ${a.birthYear} - ${a.region || '?'} - ${a.slug}`))
  
  console.log(`\n大师/人间国宝 (<1950 or null): ${groups.masters.length}位`)
  groups.masters.forEach(a => console.log(`  - ${a.nameZh} (${a.nameJa}) - ${a.birthYear || '?'} - ${a.region || '?'} - ${a.slug}`))
}

findRemaining().finally(() => process.exit())
