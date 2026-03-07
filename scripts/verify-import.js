require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
  const client = await pool.connect();
  try {
    // 检查修复的 Instagram handles (3个之前有问题的作家)
    console.log('============================================================');
    console.log('数据导入验证报告');
    console.log('============================================================\n');

    const fixedArtists = await client.query(`
      SELECT slug, "nameZh", "instagramHandle", sources::text
      FROM "Artist"
      WHERE slug IN ('ishida-kazuya', 'otani-tetsuya', 'ogawa-aya')
    `);

    console.log('✅ P0 修复验证 - Instagram Handles:\n');
    if (fixedArtists.rows.length > 0) {
      fixedArtists.rows.forEach(row => {
        const sources = JSON.parse(row.sources);
        const igSource = sources.find(s => s.url && s.url.includes('instagram.com'));
        console.log(`${row.nameZh} (${row.slug}):`);
        console.log(`  instagramHandle: ${row.instagramHandle}`);
        if (igSource) {
          console.log(`  Instagram URL: ${igSource.url}`);
          console.log(`  type: ${igSource.type}`);
          // 验证 URL 格式正确（不包含斜杠和空格）
          const isValid = igSource.url.match(/^https:\/\/www\.instagram\.com\/[a-zA-Z0-9_]+\/$/);
          console.log(`  格式验证: ${isValid ? '✅ 正确' : '❌ 错误'}`);
        }
        console.log('');
      });
    } else {
      console.log('  ⚠️  这3位作家尚未导入数据库\n');
    }

    // 检查 type 字段（随机抽样5位作家）
    const typeCheck = await client.query(`
      SELECT slug, "nameZh", sources::text
      FROM "Artist"
      WHERE published = true
      LIMIT 5
    `);

    console.log('✅ P1 修复验证 - 来源 type 字段（随机5位作家）:\n');
    let totalSources = 0;
    let nullTypeCount = 0;

    typeCheck.rows.forEach(row => {
      const sources = JSON.parse(row.sources);
      totalSources += sources.length;
      const nullCount = sources.filter(s => !s.type || s.type === null).length;
      nullTypeCount += nullCount;

      console.log(`${row.nameZh}:`);
      sources.forEach((s, i) => {
        console.log(`  [${i+1}] type: ${s.type || 'null'} - ${s.title?.substring(0, 40) || 'N/A'}`);
      });
      console.log('');
    });

    console.log(`来源 type 统计: ${totalSources - nullTypeCount}/${totalSources} 有效 (${nullTypeCount} 个 null)\n`);

    // 总体统计
    const stats = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE published = true) as published_artists,
        COUNT(*) as total_artists
      FROM "Artist"
    `);

    const entryStats = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE published = true) as published_entries,
        COUNT(*) as total_entries
      FROM "PotteryEntry"
    `);

    const glazeStats = await client.query(`
      SELECT COUNT(*) as glaze_count
      FROM "PotteryEntry"
      WHERE category = '釉药' AND published = true
    `);

    console.log('============================================================');
    console.log('📊 数据库总体统计');
    console.log('============================================================\n');
    console.log(`作家总数: ${stats.rows[0].total_artists}`);
    console.log(`  - 已发布: ${stats.rows[0].published_artists}`);
    console.log(`\n条目总数: ${entryStats.rows[0].total_entries}`);
    console.log(`  - 已发布: ${entryStats.rows[0].published_entries}`);
    console.log(`  - 釉药技法: ${glazeStats.rows[0].glaze_count}`);
    console.log('');

    console.log('✅ 数据导入验证完成！');

  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
