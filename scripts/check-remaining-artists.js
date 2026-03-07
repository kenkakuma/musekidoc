require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkRemaining() {
  const client = await pool.connect();
  try {
    const allArtists = JSON.parse(
      fs.readFileSync('data/discovered-instagram-artists-master.json', 'utf-8')
    );

    const existingHandles = await client.query(
      'SELECT "instagramHandle" FROM "Artist" WHERE "instagramHandle" IS NOT NULL'
    );

    const existingSet = new Set(existingHandles.rows.map(r => r.instagramHandle));

    const notImported = allArtists.filter(a => !existingSet.has(a.instagramHandle));

    console.log('未导入艺术家数量:', notImported.length);
    console.log('已导入艺术家数量:', 42 - notImported.length);
    console.log('');
    console.log('未导入艺术家（按粉丝数排序）:');
    console.log('');

    notImported
      .sort((a, b) => (b.instagramFollowers || 0) - (a.instagramFollowers || 0))
      .forEach((a, i) => {
        const gender = a.gender === 'female' ? '👩' : '';
        console.log(`${i+1}. ${a.nameZh} (@${a.instagramHandle}) - ${(a.instagramFollowers || 0).toLocaleString()} 粉丝 ${gender}`);
        console.log(`   地区: ${a.region || 'N/A'}`);
        console.log(`   来源: ${a.sources.length} 个`);
        console.log('');
      });
  } finally {
    client.release();
    pool.end();
  }
}

checkRemaining();
