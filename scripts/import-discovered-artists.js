/**
 * 导入从 Instagram 发现的作家到数据库
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const BATCH_FILE = path.join(__dirname, '../data/discovered-artists-batch.json');

/**
 * 验证作家数据完整性
 */
function validateArtist(artist) {
  const errors = [];

  // 必填字段检查
  if (!artist.artistSlug) errors.push('缺少 artistSlug');
  if (!artist.nameZh && !artist.nameJa) errors.push('至少需要中文名或日文名');
  if (!artist.bio || artist.bio.length < 100) errors.push('简介至少需要 100 字');
  if (!artist.instagramHandle) errors.push('缺少 Instagram 账号');
  if (!artist.instagramFollowers || artist.instagramFollowers < 10000) {
    errors.push('Instagram 粉丝数必须 >= 10,000');
  }

  // 来源检查
  if (!artist.sources || artist.sources.length < 3) {
    errors.push('至少需要 3 个来源');
  } else {
    const todoSources = artist.sources.filter(s =>
      s.url?.includes('TODO') || s.title?.includes('TODO')
    );
    if (todoSources.length > 0) {
      errors.push(`有 ${todoSources.length} 个来源未补充完整`);
    }
  }

  // 发布状态检查
  if (artist.published !== true) {
    errors.push('published 字段必须为 true 才能导入');
  }

  return errors;
}

/**
 * 导入单个作家
 */
async function importArtist(client, artist) {
  try {
    // 验证数据
    const errors = validateArtist(artist);
    if (errors.length > 0) {
      return {
        success: false,
        artist: artist.nameZh || artist.nameJa || artist.artistSlug,
        errors: errors
      };
    }

    // 检查是否已存在
    const existing = await client.query(
      'SELECT id FROM "Artist" WHERE slug = $1 OR "instagramHandle" = $2',
      [artist.artistSlug, artist.instagramHandle]
    );

    if (existing.rows.length > 0) {
      return {
        success: false,
        artist: artist.nameZh || artist.nameJa,
        errors: ['作家已存在（slug 或 Instagram 账号重复）']
      };
    }

    // 插入作家
    await client.query(
      `INSERT INTO "Artist" (
        id, slug, "nameZh", "nameJa", "nameEn", bio,
        "birthYear", "deathYear", region, style,
        awards, exhibitions,
        "kilnName", "studioName", "locationPrefecture",
        "locationCity", "locationArea", "kilnType",
        "instagramHandle", "instagramFollowers", "instagramLastSync",
        "websiteUrl", avatar, images, sources,
        published, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10::jsonb, $11::jsonb,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23::jsonb, $24::jsonb,
        $25, NOW(), NOW()
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
        artist.instagramFollowers,
        artist.instagramLastSync,
        artist.websiteUrl,
        artist.avatar,
        JSON.stringify(artist.images || []),
        JSON.stringify(artist.sources || []),
        true
      ]
    );

    return {
      success: true,
      artist: artist.nameZh || artist.nameJa,
      instagramHandle: artist.instagramHandle,
      followers: artist.instagramFollowers
    };

  } catch (error) {
    return {
      success: false,
      artist: artist.nameZh || artist.nameJa || artist.artistSlug,
      errors: [error.message]
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('============================================================');
  console.log('导入从 Instagram 发现的作家');
  console.log('============================================================\n');

  // 检查文件是否存在
  if (!fs.existsSync(BATCH_FILE)) {
    console.log('❌ 未找到数据文件：', BATCH_FILE);
    console.log('\n请先运行：');
    console.log('  node scripts/discover-instagram-artists.js');
    console.log('\n生成作家数据模板，然后补充信息。');
    return;
  }

  // 读取数据
  const artists = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf-8'));
  console.log(`📦 读取到 ${artists.length} 位作家\n`);

  // 筛选可导入的作家
  const readyToImport = artists.filter(a => a.published === true);
  const notReady = artists.filter(a => a.published !== true);

  console.log(`✅ 已准备导入: ${readyToImport.length} 位`);
  console.log(`⏳ 待补充信息: ${notReady.length} 位\n`);

  if (readyToImport.length === 0) {
    console.log('⚠️  没有可导入的作家（published 必须为 true）\n');
    console.log('请编辑数据文件，补充完整信息后再导入。');
    return;
  }

  // 连接数据库
  const client = await pool.connect();

  try {
    console.log('🎨 开始导入作家...\n');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (const artist of readyToImport) {
      const result = await importArtist(client, artist);
      results.push(result);

      if (result.success) {
        successCount++;
        console.log(`  ✅ ${result.artist} (@${result.instagramHandle}, ${result.followers.toLocaleString()} 粉丝)`);
      } else {
        failCount++;
        console.log(`  ❌ ${result.artist}`);
        result.errors.forEach(err => console.log(`     - ${err}`));
      }
    }

    console.log('');
    console.log('============================================================');
    console.log('📊 导入汇总');
    console.log('============================================================\n');
    console.log(`成功: ${successCount} 位`);
    console.log(`失败: ${failCount} 位`);
    console.log('');

    // 失败详情
    if (failCount > 0) {
      console.log('失败详情：');
      results.filter(r => !r.success).forEach(r => {
        console.log(`\n  ${r.artist}:`);
        r.errors.forEach(err => console.log(`    - ${err}`));
      });
      console.log('');
    }

    // 数据库统计
    const totalArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE published = true'
    );
    const igArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE published = true AND "instagramHandle" IS NOT NULL'
    );
    const avgFollowers = await client.query(
      'SELECT AVG("instagramFollowers") as avg FROM "Artist" WHERE "instagramFollowers" > 0'
    );

    console.log('📊 数据库统计：');
    console.log(`  总作家数: ${totalArtists.rows[0].count}`);
    console.log(`  有 Instagram: ${igArtists.rows[0].count}`);
    console.log(`  平均粉丝: ${Math.round(avgFollowers.rows[0].avg || 0).toLocaleString()}`);
    console.log('');

    if (successCount > 0) {
      console.log('✅ 导入完成！');
      console.log('\n下一步：');
      console.log('  1. 访问 http://localhost:3000/artists 查看新作家');
      console.log('  2. 继续搜索更多高人气作家');
      console.log('  3. 运行验证脚本检查数据质量');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
