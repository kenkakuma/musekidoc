/**
 * 重新导入修复后的数据
 * 1. 删除已导入的33位作家
 * 2. 重新导入修复后的数据
 */

require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const relatedArtists = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../related-artists-detail.json'), 'utf-8')
);

console.log('============================================================');
console.log('重新导入修复后的数据');
console.log('============================================================\n');

async function main() {
  const client = await pool.connect();

  try {
    // 获取需要重新导入的作家 slugs
    const slugs = relatedArtists.map(a => a.artistSlug);

    console.log(`📦 准备重新导入 ${slugs.length} 位作家\n`);

    // 删除这些作家（如果存在）
    console.log('🗑️  删除旧数据...\n');
    const deleteResult = await client.query(
      'DELETE FROM "Artist" WHERE slug = ANY($1) RETURNING slug, "nameZh"',
      [slugs]
    );

    console.log(`已删除 ${deleteResult.rows.length} 位作家:`);
    deleteResult.rows.forEach(r => console.log(`  - ${r.nameZh} (${r.slug})`));
    console.log('');

    // 重新导入
    console.log('🎨 开始导入修复后的数据...\n');

    let successCount = 0;
    let failCount = 0;

    for (const artist of relatedArtists) {
      try {
        await client.query(
          `INSERT INTO "Artist" (
            id, slug, "nameZh", "nameJa", "nameEn", bio,
            "birthYear", "deathYear", region, style,
            awards, exhibitions,
            "kilnName", "studioName", "locationPrefecture",
            "locationCity", "locationArea", "kilnType",
            "instagramHandle", "websiteUrl", avatar, images, sources,
            published, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10::jsonb, $11::jsonb,
            $12, $13, $14,
            $15, $16, $17,
            $18, $19, $20, $21::jsonb, $22::jsonb,
            $23, NOW(), NOW()
          )`,
          [
            artist.artistSlug,
            artist.nameZh,
            artist.nameJa,
            artist.nameEn || null,
            artist.bio,
            artist.birthYear,
            artist.deathYear,
            artist.region,
            artist.style,
            JSON.stringify(artist.awards || []),
            JSON.stringify(artist.exhibitions || []),
            artist.kilnName,
            artist.studioName,
            artist.locationPrefecture,
            artist.locationCity,
            artist.locationArea,
            artist.kilnType || null,
            artist.instagramHandle,
            artist.websiteUrl,
            artist.avatar || null,
            JSON.stringify(artist.images || []),
            JSON.stringify(artist.sources || []),
            true,
          ]
        );

        successCount++;
        console.log(`  ✅ ${artist.nameZh} (${artist.artistSlug})`);
      } catch (error) {
        failCount++;
        console.log(`  ❌ ${artist.nameZh}: ${error.message}`);
      }
    }

    console.log('');
    console.log(`导入完成：✅ ${successCount} 成功，❌ ${failCount} 失败`);
    console.log('');

    // 验证导入的数据
    console.log('🔍 验证导入的数据质量...\n');

    // 检查 type 字段
    const typeCheck = await client.query(`
      SELECT slug, "nameZh", sources::text
      FROM "Artist"
      WHERE slug = ANY($1)
      LIMIT 3
    `, [slugs]);

    console.log('来源 type 字段验证（随机3位）：\n');
    let totalSources = 0;
    let validTypes = 0;

    typeCheck.rows.forEach(row => {
      const sources = JSON.parse(row.sources);
      console.log(`${row.nameZh}:`);
      sources.forEach((s, i) => {
        totalSources++;
        if (s.type && s.type !== 'null') validTypes++;
        console.log(`  [${i+1}] type: ${s.type || 'null'} - ${s.title?.substring(0, 40)}`);
      });
      console.log('');
    });

    console.log(`Type 字段覆盖率: ${validTypes}/${totalSources} (${Math.round(validTypes/totalSources*100)}%)\n`);

    // 总体统计
    const [artistCount, entryCount] = await Promise.all([
      client.query('SELECT COUNT(*) FROM "Artist" WHERE published = true'),
      client.query('SELECT COUNT(*) FROM "PotteryEntry" WHERE published = true'),
    ]);

    console.log('============================================================');
    console.log('📊 数据库统计');
    console.log('============================================================\n');
    console.log(`已发布作家: ${artistCount.rows[0].count}`);
    console.log(`已发布条目: ${entryCount.rows[0].count}`);
    console.log('');

    if (failCount === 0 && validTypes === totalSources) {
      console.log('✅ 导入完成且数据质量验证通过！');
    } else if (failCount > 0) {
      console.log('⚠️  部分导入失败');
    } else {
      console.log('⚠️  导入成功但 type 字段仍有问题');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
