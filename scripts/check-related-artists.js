const fs = require('fs');
const artists = JSON.parse(fs.readFileSync('related-artists-detail.json', 'utf-8'));

console.log('Total artists:', artists.length);
console.log('\nChecking Instagram handles:');
const badHandles = artists.filter(a =>
  a.instagramHandle && (a.instagramHandle.includes('/') || a.instagramHandle.includes(' '))
);
console.log('Bad handles:', badHandles.length);
badHandles.forEach(a => console.log('  -', a.nameZh, ':', a.instagramHandle));

console.log('\nChecking sources type field:');
let totalSources = 0;
let nullType = 0;
artists.forEach(a => {
  (a.sources || []).forEach(s => {
    totalSources++;
    if (!s.type || s.type === null) nullType++;
  });
});
console.log('Sources with null type:', nullType, '/', totalSources);

// Sample sources
console.log('\nSample sources from first artist:');
if (artists[0] && artists[0].sources) {
  artists[0].sources.forEach((s, i) => {
    console.log(`  [${i+1}] type: ${s.type || 'null'} - ${s.title}`);
  });
}
