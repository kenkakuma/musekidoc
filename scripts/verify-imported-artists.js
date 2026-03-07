require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyArtists() {
  const client = await pool.connect();

  try {
    const handles = [
      'abe_haruya',
      'eniwamura',
      'takahiro00koga',
      'otntty',
      'tcovayaci',
      'cyilabo',
      'masayama.kai',
      'hitomihosono',
      'ana0929'
    ];

    const result = await client.query(`
      SELECT slug, "nameZh", "instagramHandle", "instagramFollowers"
      FROM "Artist"
      WHERE "instagramHandle" = ANY($1) AND published = true
      ORDER BY "instagramFollowers" DESC NULLS LAST
    `, [handles]);

    console.log('新导入的艺术家验证:\n');
    result.rows.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.nameZh}`);
      console.log(`   Slug: ${artist.slug}`);
      console.log(`   Instagram: @${artist.instagramHandle}`);
      console.log(`   Followers: ${(artist.instagramFollowers || 0).toLocaleString()}`);
      console.log(`   URL: http://localhost:3001/artists/${artist.slug}`);
      console.log('');
    });

  } finally {
    client.release();
    pool.end();
  }
}

verifyArtists();
