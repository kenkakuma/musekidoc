require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MASTER_PATH = path.join(__dirname, '..', 'data', 'discovered-instagram-artists-master.json');
const TODAY = '2026-03-09';

async function main() {
  const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const masterByHandle = new Map();
  for (const artist of master) {
    if (!artist.instagramHandle) continue;
    if (!artist.instagramFollowers || artist.instagramFollowers < 10000) continue;
    masterByHandle.set(artist.instagramHandle, artist);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const dbRows = await client.query(`
      SELECT id, slug, "nameZh", "instagramHandle", "instagramFollowers"
      FROM "Artist"
      WHERE published = true AND "instagramHandle" IS NOT NULL
    `);

    const updates = [];
    for (const row of dbRows.rows) {
      const source = masterByHandle.get(row.instagramHandle);
      if (!source) continue;
      if (row.instagramFollowers != null) continue;
      updates.push({
        id: row.id,
        slug: row.slug,
        nameZh: row.nameZh,
        instagramHandle: row.instagramHandle,
        instagramFollowers: source.instagramFollowers,
      });
    }

    for (const row of updates) {
      await client.query(
        `
        UPDATE "Artist"
        SET "instagramFollowers" = $2,
            "instagramLastSync" = $3::timestamp,
            "updatedAt" = NOW()
        WHERE id = $1
      `,
        [row.id, row.instagramFollowers, `${TODAY} 00:00:00`]
      );
    }

    console.log(
      JSON.stringify(
        {
          masterCount: master.length,
          candidateHandles: masterByHandle.size,
          dbInstagramRows: dbRows.rows.length,
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
