/**
 * Tiered Instagram Discovery Import Script
 * Allows importing specific tiers of artists based on review recommendations
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse command line args
const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='));
const tier = tierArg ? tierArg.split('=')[1] : '1';

console.log('='.repeat(80));
console.log(`Instagram Discovery Import - Tier ${tier}`);
console.log('='.repeat(80));
console.log('');

// Define tiers based on review analysis
const TIERS = {
  '1': {
    name: 'Tier 1: Immediate Publication',
    handles: [
      'abe_haruya',
      'eniwamura',
      'takahiro00koga',
      'koudaiujiie',
      'otntty'
    ],
    description: 'Highest quality, publish immediately'
  },
  '2': {
    name: 'Tier 2: Quick Review + Publish',
    handles: [
      'tcovayaci',
      'cyilabo',
      'masayama.kai',
      'hitomihosono',
      's_tomoya1212',
      'ana0929',
      'kaorikurihara.ceramique',
      'yutasegawa_ceramics',
      'hashimoto_tomonari',
      '_takano_kenichi_'
    ],
    description: 'Very strong, light verification needed'
  },
  'all': {
    name: 'All Tier 1 + 2 (Recommended for immediate publication)',
    handles: null, // Will combine tier 1 + 2
    description: 'Combined publication of all reviewed and approved artists'
  }
};

const selectedTier = TIERS[tier];
if (!selectedTier) {
  console.error(`❌ Invalid tier: ${tier}`);
  console.error(`   Valid tiers: ${Object.keys(TIERS).join(', ')}`);
  process.exit(1);
}

console.log(`📦 ${selectedTier.name}`);
console.log(`   ${selectedTier.description}`);
console.log('');

// Load artist data
const masterFile = path.join(process.cwd(), 'data/discovered-instagram-artists-master.json');
const allArtists = JSON.parse(fs.readFileSync(masterFile, 'utf-8'));

// Get handles for selected tier
let targetHandles = selectedTier.handles;
if (tier === 'all') {
  targetHandles = [...TIERS['1'].handles, ...TIERS['2'].handles];
}

// Filter artists
const artistsToImport = allArtists.filter(a =>
  targetHandles.includes(a.instagramHandle)
);

console.log(`Found ${artistsToImport.length} artists to import:`);
artistsToImport.forEach((a, idx) => {
  console.log(`   ${idx + 1}. ${a.nameZh} (@${a.instagramHandle}) - ${a.instagramFollowers.toLocaleString()} followers`);
});
console.log('');

// Confirm import
if (artistsToImport.length === 0) {
  console.error('❌ No artists found for this tier');
  process.exit(1);
}

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importArtists() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const artist of artistsToImport) {
      try {
        // Check if already exists
        const existing = await client.query(
          'SELECT id, slug FROM "Artist" WHERE slug = $1',
          [artist.artistSlug]
        );

        if (existing.rows.length > 0) {
          console.log(`   ⚠️  Skipped (already exists): ${artist.nameZh} (${artist.artistSlug})`);
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
          published: true, // Mark as published
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
        console.error(`   ❌ Error importing ${artist.nameZh}:`, error.message);
        errors.push({ artist: artist.nameZh, error: error.message });
        errorCount++;
      }
    }

    await client.query('COMMIT');

    console.log('');
    console.log('='.repeat(80));
    console.log('Import Summary');
    console.log('='.repeat(80));
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('');
      console.log('Error Details:');
      errors.forEach(e => console.log(`   - ${e.artist}: ${e.error}`));
    }

    // Database stats
    console.log('');
    console.log('Database Statistics:');
    const totalArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE published = true'
    );
    console.log(`   Total published artists: ${totalArtists.rows[0].count}`);

    const instagramArtists = await client.query(
      'SELECT COUNT(*) FROM "Artist" WHERE "instagramHandle" IS NOT NULL AND published = true'
    );
    console.log(`   Artists with Instagram: ${instagramArtists.rows[0].count}`);

    const recentlyAdded = await client.query(
      `SELECT "nameZh", "instagramHandle", "instagramFollowers"
       FROM "Artist"
       WHERE "instagramHandle" = ANY($1)
       ORDER BY "instagramFollowers" DESC`,
      [targetHandles]
    );

    if (recentlyAdded.rows.length > 0) {
      console.log('');
      console.log('Recently Added Artists:');
      recentlyAdded.rows.forEach((a, idx) => {
        console.log(`   ${idx + 1}. ${a.nameZh} (@${a.instagramHandle}) - ${(a.instagramFollowers || 0).toLocaleString()} followers`);
      });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run import
importArtists()
  .then(() => {
    console.log('');
    console.log('✅ Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
