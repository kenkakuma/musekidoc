require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const quality = await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE jsonb_typeof(sources) = 'array' AND jsonb_array_length(sources) >= 3
        )::int AS sources_ge_3,
        COUNT(*) FILTER (WHERE "websiteUrl" IS NOT NULL)::int AS with_website,
        COUNT(*) FILTER (WHERE "instagramHandle" IS NOT NULL)::int AS with_instagram,
        COUNT(*) FILTER (WHERE "instagramFollowers" IS NOT NULL)::int AS with_instagram_followers,
        COUNT(*) FILTER (WHERE "kilnName" IS NOT NULL)::int AS with_kiln,
        COUNT(*) FILTER (WHERE jsonb_typeof(awards) = 'array' AND jsonb_array_length(awards) > 0)::int AS with_awards,
        COUNT(*) FILTER (WHERE jsonb_typeof(exhibitions) = 'array' AND jsonb_array_length(exhibitions) > 0)::int AS with_exhibitions
      FROM "Artist"
      WHERE published = true
    `);

    const instagramRows = await client.query(`
      SELECT
        slug,
        "nameZh",
        "instagramHandle",
        "instagramFollowers",
        "websiteUrl",
        CASE
          WHEN jsonb_typeof(sources) = 'array' THEN jsonb_array_length(sources)
          ELSE 0
        END AS source_count
      FROM "Artist"
      WHERE published = true AND "instagramHandle" IS NOT NULL
      ORDER BY "instagramFollowers" DESC NULLS LAST, slug
      LIMIT 20
    `);

    console.log('quality', JSON.stringify(quality.rows[0], null, 2));
    console.log('top_instagram_rows');
    for (const row of instagramRows.rows) {
      console.log(JSON.stringify(row));
    }

    const spotCheck = await client.query(`
      SELECT
        slug,
        "nameZh",
        "instagramHandle",
        "instagramFollowers",
        "websiteUrl",
        CASE
          WHEN jsonb_typeof(sources) = 'array' THEN jsonb_array_length(sources)
          ELSE 0
        END AS source_count
      FROM "Artist"
      WHERE slug = ANY($1)
      ORDER BY slug
    `, [[
      'hatta-toru',
      'ueda-yuji',
      'watanabe-takayuki'
    ]]);

    console.log('spot_check_rows');
    for (const row of spotCheck.rows) {
      console.log(JSON.stringify(row));
    }

    const localArtists = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'artists-detail-supplemented.json'), 'utf8')
    );
    const localMap = new Map(localArtists.map((artist) => [artist.artistSlug, artist]));
    const localSlugs = localArtists.map((artist) => artist.artistSlug);
    const dbRows = await client.query(`
      SELECT
        slug,
        "instagramHandle",
        "websiteUrl",
        CASE
          WHEN jsonb_typeof(sources) = 'array' THEN jsonb_array_length(sources)
          ELSE 0
        END AS source_count
      FROM "Artist"
      WHERE slug = ANY($1)
    `, [localSlugs]);

    const mismatchRows = [];
    let missingWebsiteSync = 0;
    let missingInstagramSync = 0;
    let weakerSourcesSync = 0;

    for (const db of dbRows.rows) {
      const local = localMap.get(db.slug);
      if (!local) continue;

      const localSourceCount = Array.isArray(local.sources) ? local.sources.length : 0;
      const websiteMismatch = Boolean(local.websiteUrl) && !db.websiteUrl;
      const instagramMismatch = Boolean(local.instagramHandle) && !db.instagramHandle;
      const sourceMismatch = localSourceCount > Number(db.source_count || 0);

      if (websiteMismatch) missingWebsiteSync++;
      if (instagramMismatch) missingInstagramSync++;
      if (sourceMismatch) weakerSourcesSync++;

      if (websiteMismatch || instagramMismatch || sourceMismatch) {
        mismatchRows.push({
          slug: db.slug,
          localWebsite: local.websiteUrl || null,
          dbWebsite: db.websiteUrl || null,
          localInstagram: local.instagramHandle || null,
          dbInstagram: db.instagramHandle || null,
          localSourceCount,
          dbSourceCount: Number(db.source_count || 0),
        });
      }
    }

    console.log('local_vs_db_sync_summary', JSON.stringify({
      localArtistCount: localArtists.length,
      dbMatchedCount: dbRows.rows.length,
      missingWebsiteSync,
      missingInstagramSync,
      weakerSourcesSync,
      mismatchCount: mismatchRows.length,
    }, null, 2));
    console.log('local_vs_db_sync_sample');
    for (const row of mismatchRows.slice(0, 20)) {
      console.log(JSON.stringify(row));
    }

    const discoveryMaster = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'data', 'discovered-instagram-artists-master.json'), 'utf8')
    );
    const masterByHandle = new Map(
      discoveryMaster
        .filter((artist) => artist.instagramHandle)
        .map((artist) => [artist.instagramHandle, artist])
    );

    const dbInstagram = await client.query(`
      SELECT slug, "nameZh", "instagramHandle", "instagramFollowers"
      FROM "Artist"
      WHERE published = true AND "instagramHandle" IS NOT NULL
    `);

    const matchedMissingFollowers = [];
    const dbHandleSet = new Set(dbInstagram.rows.map((row) => row.instagramHandle));
    let matchedHandles = 0;
    let matchedWithFollowers = 0;
    for (const row of dbInstagram.rows) {
      const master = masterByHandle.get(row.instagramHandle);
      if (!master) continue;
      matchedHandles++;
      if (row.instagramFollowers != null) {
        matchedWithFollowers++;
      } else {
        matchedMissingFollowers.push({
          slug: row.slug,
          nameZh: row.nameZh,
          instagramHandle: row.instagramHandle,
          dbFollowers: row.instagramFollowers,
          masterFollowers: master.instagramFollowers || null,
        });
      }
    }

    console.log('discovery_master_sync_summary', JSON.stringify({
      discoveryMasterCount: discoveryMaster.length,
      dbInstagramCount: dbInstagram.rows.length,
      matchedHandles,
      matchedWithFollowers,
      matchedMissingFollowers: matchedMissingFollowers.length,
    }, null, 2));
    console.log('discovery_master_missing_followers_sample');
    for (const row of matchedMissingFollowers.slice(0, 20)) {
      console.log(JSON.stringify(row));
    }

    const discoveryNotInDb = discoveryMaster
      .filter((artist) => artist.instagramHandle && !dbHandleSet.has(artist.instagramHandle))
      .map((artist) => ({
        artistSlug: artist.artistSlug,
        nameZh: artist.nameZh,
        instagramHandle: artist.instagramHandle,
        instagramFollowers: artist.instagramFollowers || null,
      }));

    console.log(
      'discovery_not_in_db_summary',
      JSON.stringify(
        {
          count: discoveryNotInDb.length,
        },
        null,
        2
      )
    );
    console.log('discovery_not_in_db_sample');
    for (const row of discoveryNotInDb.slice(0, 20)) {
      console.log(JSON.stringify(row));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
