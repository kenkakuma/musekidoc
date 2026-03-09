require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function analyzeKnowledgeBase() {
  const client = await pool.connect();

  try {
    console.log('========================================');
    console.log('知识库内容分析');
    console.log('========================================\n');

    // 作家统计
    const artistStats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "instagramHandle" IS NOT NULL THEN 1 END) as with_instagram,
        COUNT(CASE WHEN "instagramFollowers" IS NOT NULL THEN 1 END) as with_follower_count,
        AVG("instagramFollowers") FILTER (WHERE "instagramFollowers" IS NOT NULL) as avg_followers,
        MAX("instagramFollowers") as max_followers,
        MIN("instagramFollowers") FILTER (WHERE "instagramFollowers" > 0) as min_followers
      FROM "Artist"
      WHERE published = true
    `);

    console.log('📊 作家统计:');
    console.log(`  总数: ${artistStats.rows[0].total}`);
    console.log(`  有 Instagram: ${artistStats.rows[0].with_instagram}`);
    console.log(`  有粉丝数: ${artistStats.rows[0].with_follower_count}`);
    console.log(`  平均粉丝: ${Math.round(artistStats.rows[0].avg_followers || 0)}`);
    console.log(`  最高粉丝: ${artistStats.rows[0].max_followers || 0}`);
    console.log(`  最低粉丝: ${artistStats.rows[0].min_followers || 0}\n`);

    // 条目分类分布
    const categoryStats = await client.query(`
      SELECT category, COUNT(*) as count
      FROM "PotteryEntry"
      WHERE published = true
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('📚 条目分类分布:');
    categoryStats.rows.forEach(r => console.log(`  ${r.category}: ${r.count}`));

    // 作家年代分布
    const artistBirthYears = await client.query(`
      SELECT
        CASE
          WHEN "birthYear" >= 1990 THEN '1990后 (Z世代)'
          WHEN "birthYear" >= 1980 THEN '1980-1989 (千禧一代)'
          WHEN "birthYear" >= 1960 THEN '1960-1979 (X世代)'
          WHEN "birthYear" >= 1940 THEN '1940-1959 (战后一代)'
          WHEN "birthYear" >= 1920 THEN '1920-1939 (战前一代)'
          WHEN "birthYear" < 1920 THEN '1920前 (明治/大正)'
          ELSE '未知年代'
        END as era,
        COUNT(*) as count
      FROM "Artist"
      WHERE published = true
      GROUP BY era
      ORDER BY MIN("birthYear") DESC NULLS LAST
    `);

    console.log('\n👥 作家年代分布:');
    artistBirthYears.rows.forEach(r => console.log(`  ${r.era}: ${r.count}`));

    // 产地分布
    const regionStats = await client.query(`
      SELECT region, COUNT(*) as count
      FROM "Artist"
      WHERE published = true AND region IS NOT NULL
      GROUP BY region
      ORDER BY count DESC
      LIMIT 15
    `);

    console.log('\n🗺️  作家产地分布 (Top 15):');
    regionStats.rows.forEach(r => console.log(`  ${r.region}: ${r.count}`));

    // 检查缺失信息
    const missingInfo = await client.query(`
      SELECT
        COUNT(CASE WHEN "birthYear" IS NULL THEN 1 END) as missing_birth_year,
        COUNT(CASE WHEN "deathYear" IS NULL AND "birthYear" < 1950 THEN 1 END) as likely_deceased_no_death,
        COUNT(CASE WHEN region IS NULL THEN 1 END) as missing_region,
        COUNT(CASE WHEN "instagramHandle" IS NULL THEN 1 END) as missing_instagram,
        COUNT(CASE WHEN "websiteUrl" IS NULL THEN 1 END) as missing_website,
        COUNT(CASE WHEN "kilnName" IS NULL THEN 1 END) as missing_kiln,
        COUNT(CASE WHEN avatar IS NULL THEN 1 END) as missing_avatar
      FROM "Artist"
      WHERE published = true
    `);

    console.log('\n⚠️  缺失信息统计:');
    console.log(`  缺失出生年份: ${missingInfo.rows[0].missing_birth_year}`);
    console.log(`  可能已故但无卒年: ${missingInfo.rows[0].likely_deceased_no_death}`);
    console.log(`  缺失产地: ${missingInfo.rows[0].missing_region}`);
    console.log(`  缺失 Instagram: ${missingInfo.rows[0].missing_instagram}`);
    console.log(`  缺失网站: ${missingInfo.rows[0].missing_website}`);
    console.log(`  缺失窑场信息: ${missingInfo.rows[0].missing_kiln}`);
    console.log(`  缺失头像: ${missingInfo.rows[0].missing_avatar}`);

    // 内容类型缺口
    const contentGaps = await client.query(`
      SELECT
        COUNT(CASE WHEN category LIKE '%产地窑系%' THEN 1 END) as kiln_entries,
        COUNT(CASE WHEN category LIKE '%技法%' THEN 1 END) as technique_entries,
        COUNT(CASE WHEN category LIKE '%器物%' THEN 1 END) as vessel_entries,
        COUNT(CASE WHEN category LIKE '%历史%' OR category LIKE '%文化%' THEN 1 END) as history_entries,
        COUNT(CASE WHEN category LIKE '%基础知识%' THEN 1 END) as knowledge_entries
      FROM "PotteryEntry"
      WHERE published = true
    `);

    console.log('\n📖 内容类型统计:');
    console.log(`  窑系/产地: ${contentGaps.rows[0].kiln_entries}`);
    console.log(`  技法相关: ${contentGaps.rows[0].technique_entries}`);
    console.log(`  器物用途: ${contentGaps.rows[0].vessel_entries}`);
    console.log(`  历史文化: ${contentGaps.rows[0].history_entries}`);
    console.log(`  基础知识: ${contentGaps.rows[0].knowledge_entries}`);

  } finally {
    client.release();
    await pool.end();
  }
}

analyzeKnowledgeBase().catch(console.error);
