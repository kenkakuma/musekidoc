require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    const categoryStats = await client.query(`
      SELECT category, COUNT(*) as count
      FROM "PotteryEntry"
      WHERE published = true
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('条目分类统计:');
    categoryStats.rows.forEach(r => console.log(`  ${r.category}: ${r.count}`));

    const glazeCheck = await client.query(`
      SELECT slug, "nameZh", category, type
      FROM "PotteryEntry"
      WHERE category = '釉药'
      LIMIT 10
    `);

    console.log('\n釉药技法条目:');
    glazeCheck.rows.forEach(r => console.log(`  ${r.nameZh} (${r.slug}): type=${r.type}`));

  } finally {
    client.release();
    await pool.end();
  }
})();
