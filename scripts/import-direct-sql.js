/**
 * 直接使用 PostgreSQL 导入数据
 */

require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 连接数据库
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 读取数据
const glazeTechniques = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../glaze-techniques.json'), 'utf-8')
);
const relatedArtists = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../related-artists-detail.json'), 'utf-8')
);

console.log(`📦 准备导入：`);
console.log(`  - 釉药技法：${glazeTechniques.length} 条`);
console.log(`  - 作家信息：${relatedArtists.length} 位`);
console.log('');

/**
 * 导入作家信息
 */
async function importArtists(client) {
  console.log('🎨 开始导入作家信息...');

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const artist of relatedArtists) {
    try {
      // 检查是否已存在
      const existing = await client.query(
        'SELECT id FROM "Artist" WHERE slug = $1',
        [artist.artistSlug]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⚠️  跳过已存在: ${artist.nameZh} (${artist.artistSlug})`);
        skipCount++;
        continue;
      }

      // 插入新作家
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
  console.log(`作家导入完成：✅ ${successCount} 成功，⚠️  ${skipCount} 跳过，❌ ${failCount} 失败`);
  console.log('');

  return { successCount, skipCount, failCount };
}

/**
 * 导入釉药技法
 */
async function importGlazeTechniques(client) {
  console.log('🏺 开始导入釉药技法...');

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const technique of glazeTechniques) {
    try {
      // 检查是否已存在
      const existing = await client.query(
        'SELECT id FROM "PotteryEntry" WHERE slug = $1',
        [technique.slug]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⚠️  跳过已存在: ${technique.nameZh} (${technique.slug})`);
        skipCount++;
        continue;
      }

      // 插入新技法
      await client.query(
        `INSERT INTO "PotteryEntry" (
          id, slug, "nameZh", "nameJa", "nameEn",
          category, region, type, description, positioning,
          "signatureFeatures", keywords, "notableArtists", "representativeForms",
          sources, published, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          $10::jsonb, $11, $12::jsonb, $13::jsonb,
          $14::jsonb, $15, NOW(), NOW()
        )`,
        [
          technique.slug,
          technique.nameZh,
          technique.nameJa,
          technique.nameEn || null,
          technique.category,
          technique.region || '通用',
          technique.type || '釉药技法',
          technique.description,
          technique.positioning,
          JSON.stringify(technique.signatureFeatures || []),
          technique.keywords || [],
          JSON.stringify(technique.notableArtists || []),
          JSON.stringify(technique.representativeForms || []),
          JSON.stringify(technique.sources || []),
          true,
        ]
      );

      successCount++;
      console.log(`  ✅ ${technique.nameZh} (${technique.slug})`);
    } catch (error) {
      failCount++;
      console.log(`  ❌ ${technique.nameZh}: ${error.message}`);
    }
  }

  console.log('');
  console.log(`技法导入完成：✅ ${successCount} 成功，⚠️  ${skipCount} 跳过，❌ ${failCount} 失败`);
  console.log('');

  return { successCount, skipCount, failCount };
}

/**
 * 主函数
 */
async function main() {
  const client = await pool.connect();

  try {
    console.log('============================================================');
    console.log('Task 01 数据批量导入（SQL 版本）');
    console.log('============================================================');
    console.log('');

    // 导入作家
    const artistsResult = await importArtists(client);

    // 导入技法
    const techniquesResult = await importGlazeTechniques(client);

    // 打印统计
    console.log('============================================================');
    console.log('📊 导入汇总报告');
    console.log('============================================================');
    console.log('');
    console.log('作家：');
    console.log(`  - 成功: ${artistsResult.successCount}/${relatedArtists.length}`);
    console.log(`  - 跳过: ${artistsResult.skipCount}`);
    console.log(`  - 失败: ${artistsResult.failCount}`);
    console.log('');
    console.log('技法：');
    console.log(`  - 成功: ${techniquesResult.successCount}/${glazeTechniques.length}`);
    console.log(`  - 跳过: ${techniquesResult.skipCount}`);
    console.log(`  - 失败: ${techniquesResult.failCount}`);
    console.log('');

    // 数据库统计
    const [artistCount, entryCount] = await Promise.all([
      client.query('SELECT COUNT(*) FROM "Artist" WHERE published = true'),
      client.query('SELECT COUNT(*) FROM "PotteryEntry" WHERE published = true'),
    ]);

    console.log('📊 数据库统计：');
    console.log(`  - 已发布作家: ${artistCount.rows[0].count}`);
    console.log(`  - 已发布条目: ${entryCount.rows[0].count}`);
    console.log('');

    if (artistsResult.failCount === 0 && techniquesResult.failCount === 0) {
      console.log('✅ 导入完成！');
    } else {
      console.log('⚠️  部分导入失败，请检查错误详情');
    }
  } catch (error) {
    console.error('❌ 导入过程发生错误：', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
