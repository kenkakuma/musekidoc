/**
 * 导入 artists-detail-supplemented.json 中所有80位作家
 */

require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const allArtists = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../artists-detail-supplemented.json'), 'utf-8')
);

console.log('============================================================');
console.log('导入 artists-detail-supplemented.json 全部作家');
console.log('============================================================\n');
console.log(`📦 准备导入 ${allArtists.length} 位作家\n`);

async function main() {
  const client = await pool.connect();

  try {
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const artist of allArtists) {
      try {
        // 检查是否已存在
        const existing = await client.query(
          'SELECT id FROM "Artist" WHERE slug = $1',
          [artist.artistSlug]
        );

        if (existing.rows.length > 0) {
          // 更新现有记录
          await client.query(
            `UPDATE "Artist" SET
              "nameZh" = $2, "nameJa" = $3, "nameEn" = $4, bio = $5,
              "birthYear" = $6, "deathYear" = $7, region = $8, style = $9,
              awards = $10::jsonb, exhibitions = $11::jsonb,
              "kilnName" = $12, "studioName" = $13, "locationPrefecture" = $14,
              "locationCity" = $15, "locationArea" = $16, "kilnType" = $17,
              "instagramHandle" = $18, "websiteUrl" = $19, avatar = $20,
              images = $21::jsonb, sources = $22::jsonb,
              "updatedAt" = NOW()
            WHERE slug = $1`,
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
            ]
          );
          skipCount++;
          console.log(`  🔄 更新: ${artist.nameZh} (${artist.artistSlug})`);
        } else {
          // 插入新记录
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
          console.log(`  ✅ 新增: ${artist.nameZh} (${artist.artistSlug})`);
        }
      } catch (error) {
        failCount++;
        console.log(`  ❌ ${artist.nameZh}: ${error.message}`);
      }
    }

    console.log('');
    console.log(`导入完成：✅ ${successCount} 新增，🔄 ${skipCount} 更新，❌ ${failCount} 失败`);
    console.log('');

    // 验证 type 字段覆盖率
    console.log('🔍 验证数据质量...\n');

    const typeStats = await client.query(`
      SELECT slug, "nameZh", sources::text
      FROM "Artist"
      WHERE published = true
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    let totalSources = 0;
    let validTypes = 0;

    typeStats.rows.forEach(row => {
      const sources = JSON.parse(row.sources);
      sources.forEach(s => {
        totalSources++;
        if (s.type && s.type !== 'null') validTypes++;
      });
    });

    console.log(`Type 字段覆盖率（最近10位作家）: ${validTypes}/${totalSources} (${Math.round(validTypes/totalSources*100)}%)\n`);

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

    if (failCount === 0) {
      console.log('✅ 所有作家导入完成！');
    } else {
      console.log(`⚠️  ${failCount} 位作家导入失败`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
