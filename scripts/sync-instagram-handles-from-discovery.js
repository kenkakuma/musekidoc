require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MASTER_PATH = path.join(__dirname, '..', 'data', 'discovered-instagram-artists-master.json');
const TODAY = '2026-03-09';

function isValidInstagramHandle(value) {
  if (!value) return false;
  const handle = String(value).trim();
  if (!handle) return false;
  if (handle === '?' || handle === '-' || /^unknown$/i.test(handle)) return false;
  return /^[A-Za-z0-9._]{2,30}$/.test(handle);
}

async function main() {
  const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const updates = [];

    for (const artist of master) {
      if (!artist.artistSlug) continue;
      const row = await client.query(
        `
        SELECT
          id,
          slug,
          "nameZh",
          "instagramHandle",
          "instagramFollowers",
          "websiteUrl"
        FROM "Artist"
        WHERE slug = $1
      `,
        [artist.artistSlug]
      );

      if (row.rows.length === 0) continue;
      const db = row.rows[0];

      const patch = {
        id: db.id,
        slug: db.slug,
        nameZh: db.nameZh,
        instagramHandle: db.instagramHandle,
        instagramFollowers: db.instagramFollowers,
        websiteUrl: db.websiteUrl,
      };

      let changed = false;

      if (!isValidInstagramHandle(patch.instagramHandle) && isValidInstagramHandle(artist.instagramHandle)) {
        patch.instagramHandle = artist.instagramHandle;
        changed = true;
      }

      if (patch.instagramFollowers == null && artist.instagramFollowers) {
        patch.instagramFollowers = artist.instagramFollowers;
        changed = true;
      }

      const masterWebsite = artist.websiteUrl || artist.websiteUrlFromBio || null;
      if (!patch.websiteUrl && masterWebsite) {
        patch.websiteUrl = masterWebsite;
        changed = true;
      }

      if (!changed) continue;

      await client.query(
        `
        UPDATE "Artist"
        SET
          "instagramHandle" = $2,
          "instagramFollowers" = $3::integer,
          "instagramLastSync" = CASE
            WHEN $3::integer IS NOT NULL THEN $4::timestamp
            ELSE "instagramLastSync"
          END,
          "websiteUrl" = $5,
          "updatedAt" = NOW()
        WHERE id = $1
      `,
        [patch.id, patch.instagramHandle, patch.instagramFollowers, `${TODAY} 00:00:00`, patch.websiteUrl]
      );

      updates.push({
        slug: patch.slug,
        nameZh: patch.nameZh,
        instagramHandle: patch.instagramHandle,
        instagramFollowers: patch.instagramFollowers,
        websiteUrl: patch.websiteUrl,
      });
    }

    console.log(
      JSON.stringify(
        {
          masterCount: master.length,
          updatedCount: updates.length,
          sample: updates.slice(0, 20),
        },
        null,
        2
      )
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
