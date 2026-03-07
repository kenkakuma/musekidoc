/**
 * Import all remaining unimported Instagram discovery artists
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('='.repeat(80));
console.log('导入剩余 Instagram Discovery 艺术家');
console.log('='.repeat(80));
console.log('');

async function importRemainingArtists() {
  const client = await pool.connect();

  try {
    // Load all artists
    const masterFile = path.join(process.cwd(), 'data/discovered-instagram-artists-master.json');
    const allArtists = JSON.parse(fs.readFileSync(masterFile, 'utf-8'));

    // Get existing handles
    const existingHandles = await client.query(
      'SELECT "instagramHandle" FROM "Artist" WHERE "instagramHandle" IS NOT NULL'
    );
    const existingSet = new Set(existingHandles.rows.map(r => r.instagramHandle));

    // Filter to unimported artists
    const artistsToImport = allArtists.filter(a => !existingSet.has(a.instagramHandle));

    console.log(`找到 ${artistsToImport.length} 位未导入艺术家`);
    console.log('');

    if (artistsToImport.length === 0) {
      console.log('✅ 所有艺术家已导入！');
      return;
    }

    // Sort by followers for display
    artistsToImport.sort((a, b) => (b.instagramFollowers || 0) - (a.instagramFollowers || 0));

    console.log('准备导入：');
    artistsToImport.forEach((a, idx) => {
      const gender = a.gender === 'female' ? '👩' : '';
      console.log(`   ${idx + 1}. ${a.nameZh} (@${a.instagramHandle}) - ${(a.instagramFollowers || 0).toLocaleString()} 粉丝 ${gender}`);
    });
    console.log('');

    await client.query('BEGIN');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const artist of artistsToImport) {
      try {
        // Double-check if exists (in case of race conditions)
        const existing = await client.query(
          'SELECT id, slug FROM "Artist" WHERE slug = $1',
          [artist.artistSlug]
        );

        if (existing.rows.length > 0) {
          console.log(`   ⚠️  跳过（已存在）: ${artist.nameZh} (${artist.artistSlug})`);
          skipCount++;
          continue;
        }

        // Prepare data
        const insertData = {
          slug: artist.artistSlug,
          nameZh: artist.nameZh || null,
          nameJa: artist.nameJa || null,
          nameEn: artist.nameEn || null,
          bio: artist.bio || null,
          birthYear: artist.birthYear || null,
          deathYear: artist.deathYear || null,
          region: artist.region || null,
          locationPrefecture: artist.locationPrefecture || null,
          locationCity: artist.locationCity || null,
          locationArea: artist.locationArea || null,
          style: artist.workStyle || artist.style || null,
          kilnName: artist.kilnName || null,
          studioName: artist.studioName || null,
          kilnType: artist.kilnType || null,
          instagramHandle: artist.instagramHandle || null,
          instagramFollowers: artist.instagramFollowers || null,
          websiteUrl: artist.websiteUrl || artist.websiteUrlFromBio || null,
          avatar: artist.instagramProfilePicUrl || null,
          images: JSON.stringify(artist.images || []),
          sources: JSON.stringify(artist.sources || []),
          published: true,
        };

        // Insert
        await client.query(`
          INSERT INTO "Artist" (
            id, slug, "nameZh", "nameJa", "nameEn", bio,
            "birthYear", "deathYear", region,
            "locationPrefecture", "locationCity", "locationArea",
            style, "kilnName", "studioName", "kilnType",
            "instagramHandle", "instagramFollowers", "websiteUrl",
            avatar, images, sources, published,
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5,
            $6, $7, $8,
            $9, $10, $11,
            $12, $13, $14, $15,
            $16, $17, $18,
            $19, $20::jsonb, $21::jsonb, $22,
            NOW(), NOW()
          )
        `, [
          insertData.slug,
          insertData.nameZh,
          insertData.nameJa,
          insertData.nameEn,
          insertData.bio,
          insertData.birthYear,
          insertData.deathYear,
          insertData.region,
          insertData.locationPrefecture,
          insertData.locationCity,
          insertData.locationArea,
          insertData.style,
          insertData.kilnName,
          insertData.studioName,
          insertData.kilnType,
          insertData.instagramHandle,
          insertData.instagramFollowers,
          insertData.websiteUrl,
          insertData.avatar,
          insertData.images,
          insertData.sources,
          insertData.published,
        ]);

        console.log(`   ✅ ${artist.nameZh} (@${artist.instagramHandle})`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ 错误 ${artist.nameZh}:`, error.message);
        errors.push({ artist: artist.nameZh, error: error.message });
        errorCount++;
      }
    }

    await client.query('COMMIT');

    console.log('');
    console.log('='.repeat(80));
    console.log('导入总结');
    console.log('='.repeat(80));
    console.log(`✅ 成功: ${successCount}`);
    console.log(`⚠️  跳过: ${skipCount}`);
    console.log(`❌ 错误: ${errorCount}`);

    if (errors.length > 0) {
      console.log('');
      console.log('错误详情:');
      errors.forEach(e => console.log(`   - ${e.artist}: ${e.error}`));
    }

    // Database stats
    console.log('');
    console.log('数据库统计:');
    const totalArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE published = true'
    );
    console.log(`   总发布艺术家: ${totalArtists.rows[0].count}`);

    const instagramArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE "instagramHandle" IS NOT NULL AND published = true'
    );
    console.log(`   Instagram 艺术家: ${instagramArtists.rows[0].count}`);

    const femaleArtists = await client.query(
      `SELECT COUNT(*) FROM "Artist"
       WHERE published = true
       AND slug IN (
         SELECT UNNEST(ARRAY[
           'yamada-yukico', 'yashiro-narumi', 'uchida-midori',
           'sakaguchi-chika-cyilabo', 'hosono-hitomi'
         ])
       )`
    );
    console.log(`   女性艺术家: ${femaleArtists.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

importRemainingArtists()
  .then(() => {
    console.log('');
    console.log('✅ 全部导入完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
