/**
 * Instagram Discovery Review Script
 * Reviews the 42 discovered artists for publication readiness
 */

const fs = require('fs');
const path = require('path');

const artistsFile = path.join(process.cwd(), 'data/discovered-instagram-artists-master.json');
const artists = JSON.parse(fs.readFileSync(artistsFile, 'utf-8'));

console.log('='.repeat(80));
console.log('INSTAGRAM ARTIST DISCOVERY REVIEW');
console.log('='.repeat(80));
console.log(`Total artists: ${artists.length}\n`);

// Track issues
const issues = {
  critical: [],
  warning: [],
  info: []
};

const publishReady = [];
const needsReview = [];

// ============================================================================
// 1. DUPLICATE DETECTION
// ============================================================================
console.log('1. DUPLICATE DETECTION');
console.log('-'.repeat(80));

const handleMap = new Map();
const nameMap = new Map();
const slugMap = new Map();

artists.forEach((artist, idx) => {
  // Check duplicate handles
  if (handleMap.has(artist.instagramHandle)) {
    issues.critical.push({
      type: 'DUPLICATE_HANDLE',
      handle: artist.instagramHandle,
      artists: [handleMap.get(artist.instagramHandle), artist.nameZh]
    });
  } else {
    handleMap.set(artist.instagramHandle, artist.nameZh);
  }

  // Check duplicate Japanese names
  if (artist.nameJa) {
    if (nameMap.has(artist.nameJa)) {
      issues.warning.push({
        type: 'DUPLICATE_NAME',
        name: artist.nameJa,
        handles: [nameMap.get(artist.nameJa), artist.instagramHandle]
      });
    } else {
      nameMap.set(artist.nameJa, artist.instagramHandle);
    }
  }

  // Check duplicate slugs
  if (slugMap.has(artist.artistSlug)) {
    issues.critical.push({
      type: 'DUPLICATE_SLUG',
      slug: artist.artistSlug,
      artists: [slugMap.get(artist.artistSlug), artist.nameZh]
    });
  } else {
    slugMap.set(artist.artistSlug, artist.nameZh);
  }
});

// Check for potential studio/personal account pairs
const potentialDuplicates = [];
artists.forEach((a1, i) => {
  artists.forEach((a2, j) => {
    if (i >= j) return;

    // Check if same name with different handles
    if (a1.nameJa === a2.nameJa && a1.instagramHandle !== a2.instagramHandle) {
      potentialDuplicates.push({
        name: a1.nameJa,
        handle1: a1.instagramHandle,
        handle2: a2.instagramHandle,
        followers1: a1.instagramFollowers,
        followers2: a2.instagramFollowers
      });
    }

    // Check for similar names (potential alternate romanization)
    if (a1.nameEn && a2.nameEn &&
        a1.nameEn.toLowerCase().includes(a2.nameEn.toLowerCase().split(' ')[0]) &&
        a1.instagramHandle !== a2.instagramHandle) {
      potentialDuplicates.push({
        type: 'similar_en_name',
        name1: a1.nameEn,
        name2: a2.nameEn,
        handle1: a1.instagramHandle,
        handle2: a2.instagramHandle
      });
    }
  });
});

if (potentialDuplicates.length > 0) {
  console.log(`⚠️  Found ${potentialDuplicates.length} potential duplicate(s):`);
  potentialDuplicates.forEach(dup => {
    console.log(`   - ${dup.name || dup.name1}: @${dup.handle1} vs @${dup.handle2}`);
    if (dup.followers1) {
      console.log(`     Followers: ${dup.followers1.toLocaleString()} vs ${dup.followers2.toLocaleString()}`);
    }
  });
} else {
  console.log('✅ No duplicate handles or names detected');
}
console.log('');

// ============================================================================
// 2. SOURCE QUALITY ANALYSIS
// ============================================================================
console.log('2. SOURCE QUALITY ANALYSIS');
console.log('-'.repeat(80));

const sourceStats = {
  highCredibility: 0,
  mediumCredibility: 0,
  lowCredibility: 0,
  commerceHeavy: 0,
  authoritative: 0
};

artists.forEach(artist => {
  const nonInstagramSources = artist.sources.filter(s =>
    !s.url.includes('instagram.com')
  );

  const credibilityScore = {
    high: 0,
    medium: 0,
    low: 0
  };

  const sourceTypes = {
    commerce: 0,
    authoritative: 0,
    neutral: 0
  };

  nonInstagramSources.forEach(source => {
    if (source.credibility === 'high') credibilityScore.high++;
    if (source.credibility === 'medium') credibilityScore.medium++;
    if (source.credibility === 'low') credibilityScore.low++;

    // Check source types
    const commerceTypes = ['电商平台', '画廊销售'];
    const authoritativeTypes = ['官方资料', '博物馆资料', '文化认定', '媒体报道'];

    if (commerceTypes.includes(source.type)) {
      sourceTypes.commerce++;
    } else if (authoritativeTypes.includes(source.type)) {
      sourceTypes.authoritative++;
    } else {
      sourceTypes.neutral++;
    }
  });

  // Flag commerce-heavy profiles (>50% commerce sources)
  if (nonInstagramSources.length >= 2 &&
      sourceTypes.commerce / nonInstagramSources.length > 0.5) {
    issues.warning.push({
      type: 'COMMERCE_HEAVY',
      artist: artist.nameZh,
      handle: artist.instagramHandle,
      commerceCount: sourceTypes.commerce,
      totalNonIG: nonInstagramSources.length
    });
    sourceStats.commerceHeavy++;
  }

  // Flag low credibility dominance
  if (nonInstagramSources.length >= 2 &&
      credibilityScore.low >= nonInstagramSources.length - 1) {
    issues.warning.push({
      type: 'LOW_CREDIBILITY',
      artist: artist.nameZh,
      handle: artist.instagramHandle,
      lowCount: credibilityScore.low,
      totalNonIG: nonInstagramSources.length
    });
  }

  // Track stats
  if (credibilityScore.high >= 2) sourceStats.highCredibility++;
  if (credibilityScore.medium >= 2) sourceStats.mediumCredibility++;
  if (sourceTypes.authoritative >= 1) sourceStats.authoritative++;
});

console.log(`Total artists with high-credibility sources (2+): ${sourceStats.highCredibility}`);
console.log(`Total artists with authoritative sources (1+): ${sourceStats.authoritative}`);
console.log(`Commerce-heavy profiles (>50% commerce): ${sourceStats.commerceHeavy}`);
console.log('');

// ============================================================================
// 3. ELIGIBILITY VERIFICATION
// ============================================================================
console.log('3. ELIGIBILITY VERIFICATION');
console.log('-'.repeat(80));

const eligibilityFlags = [];

artists.forEach(artist => {
  const bio = (artist.bio || '').toLowerCase();
  const workStyle = (artist.workStyle || '').toLowerCase();
  const igBio = (artist.instagramBio || '').toLowerCase();

  // Flag potential non-ceramic artists
  const nonCeramicKeywords = [
    'painter', 'painting', 'sculpture', 'sculptor', 'mixed media',
    '画家', '雕塑', '绘画'
  ];

  const hasNonCeramicKeyword = nonCeramicKeywords.some(kw =>
    bio.includes(kw) || workStyle.includes(kw) || igBio.includes(kw)
  );

  if (hasNonCeramicKeyword) {
    eligibilityFlags.push({
      type: 'NON_CERAMIC_KEYWORD',
      artist: artist.nameZh,
      handle: artist.instagramHandle,
      note: 'Bio contains non-ceramic art keywords'
    });
  }

  // Flag studio/brand accounts
  const studioKeywords = ['studio', 'gallery', 'workshop', 'pottery', 'ceramics', 'collective'];
  const nameIsStudio = studioKeywords.some(kw =>
    (artist.nameEn || '').toLowerCase().includes(kw)
  );

  if (nameIsStudio && !artist.nameJa.match(/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/)) {
    eligibilityFlags.push({
      type: 'POSSIBLE_STUDIO_ACCOUNT',
      artist: artist.nameZh,
      handle: artist.instagramHandle,
      note: `English name contains studio keyword: ${artist.nameEn}`
    });
  }
});

if (eligibilityFlags.length > 0) {
  console.log(`⚠️  Found ${eligibilityFlags.length} eligibility flag(s):`);
  eligibilityFlags.forEach(flag => {
    console.log(`   - @${flag.handle} (${flag.artist}): ${flag.note}`);
  });
} else {
  console.log('✅ All artists appear to be individual ceramic artists');
}
console.log('');

// ============================================================================
// 4. PUBLICATION READINESS SCORING
// ============================================================================
console.log('4. PUBLICATION READINESS SCORING');
console.log('-'.repeat(80));

artists.forEach(artist => {
  let score = 0;
  const flags = [];

  // Follower count (higher = more established)
  if (artist.instagramFollowers >= 50000) score += 3;
  else if (artist.instagramFollowers >= 30000) score += 2;
  else score += 1;

  // Source quality
  const nonIGSources = artist.sources.filter(s => !s.url.includes('instagram.com'));
  const highCredSources = nonIGSources.filter(s => s.credibility === 'high').length;
  const medCredSources = nonIGSources.filter(s => s.credibility === 'medium').length;

  if (highCredSources >= 2) score += 3;
  else if (highCredSources >= 1 || medCredSources >= 2) score += 2;
  else score += 1;

  // Has official website or artist-owned source
  const hasOfficialSource = artist.sources.some(s =>
    s.type === '作家官网' || s.url === artist.websiteUrlFromBio
  );
  if (hasOfficialSource) score += 2;

  // Bio quality (longer and more detailed)
  if (artist.bio && artist.bio.length >= 250) score += 2;
  else if (artist.bio && artist.bio.length >= 150) score += 1;

  // Has birth year
  if (artist.birthYear) score += 1;

  // Has detailed location info
  if (artist.locationPrefecture && artist.locationCity) score += 1;

  // Check for issues
  const hasIssues = issues.critical.some(i =>
    i.handle === artist.instagramHandle || i.artists?.includes(artist.nameZh)
  ) || issues.warning.some(i =>
    i.handle === artist.instagramHandle || i.artist === artist.nameZh
  );

  if (hasIssues) {
    score -= 2;
    flags.push('has_issues');
  }

  // Categorize
  if (score >= 10 && !hasIssues) {
    publishReady.push({
      ...artist,
      score,
      flags
    });
  } else {
    needsReview.push({
      ...artist,
      score,
      flags
    });
  }
});

// Sort by score
publishReady.sort((a, b) => b.score - a.score);
needsReview.sort((a, b) => b.score - a.score);

console.log(`✅ Publish-ready (score >= 10, no issues): ${publishReady.length}`);
console.log(`⚠️  Needs review: ${needsReview.length}`);
console.log('');

// ============================================================================
// 5. DETAILED REPORT
// ============================================================================
console.log('5. DETAILED FINDINGS');
console.log('='.repeat(80));

if (issues.critical.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES (Must fix before publication):');
  issues.critical.forEach(issue => {
    console.log(`\n   Type: ${issue.type}`);
    console.log(`   Details: ${JSON.stringify(issue, null, 2).replace(/^/gm, '   ')}`);
  });
}

if (issues.warning.length > 0) {
  console.log(`\n⚠️  WARNINGS (${issues.warning.length} total):`);

  // Group by type
  const warningsByType = {};
  issues.warning.forEach(w => {
    if (!warningsByType[w.type]) warningsByType[w.type] = [];
    warningsByType[w.type].push(w);
  });

  Object.entries(warningsByType).forEach(([type, warnings]) => {
    console.log(`\n   ${type} (${warnings.length}):`);
    warnings.slice(0, 5).forEach(w => {
      console.log(`   - @${w.handle} (${w.artist})`);
    });
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more`);
    }
  });
}

console.log('\n' + '='.repeat(80));
console.log('PUBLICATION RECOMMENDATIONS');
console.log('='.repeat(80));

console.log(`\n✅ TIER 1 - PUBLISH IMMEDIATELY (${publishReady.slice(0, 20).length}):`);
publishReady.slice(0, 20).forEach((artist, idx) => {
  console.log(`   ${idx + 1}. @${artist.instagramHandle} - ${artist.nameZh} (score: ${artist.score})`);
  console.log(`      ${artist.instagramFollowers.toLocaleString()} followers | ${artist.sources.length} sources`);
});

if (publishReady.length > 20) {
  console.log(`\n✅ TIER 2 - PUBLISH AFTER REVIEW (${publishReady.slice(20).length}):`);
  publishReady.slice(20).forEach((artist, idx) => {
    console.log(`   ${idx + 21}. @${artist.instagramHandle} - ${artist.nameZh} (score: ${artist.score})`);
  });
}

if (needsReview.length > 0) {
  console.log(`\n⏸️  HOLD FOR IMPROVEMENT (${needsReview.length}):`);
  needsReview.slice(0, 10).forEach((artist, idx) => {
    console.log(`   ${idx + 1}. @${artist.instagramHandle} - ${artist.nameZh} (score: ${artist.score})`);
    if (artist.flags.length > 0) {
      console.log(`      Issues: ${artist.flags.join(', ')}`);
    }
  });
  if (needsReview.length > 10) {
    console.log(`   ... and ${needsReview.length - 10} more`);
  }
}

// ============================================================================
// 6. GENERATE FILTERED OUTPUT
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('GENERATING FILTERED FILES');
console.log('='.repeat(80));

// Save publish-ready subset
const publishReadyFile = path.join(process.cwd(), 'data/discovered-instagram-artists-publish-ready.json');
fs.writeFileSync(
  publishReadyFile,
  JSON.stringify(publishReady.map(a => {
    const { score, flags, ...artist } = a;
    return { ...artist, published: false, needsReview: false };
  }), null, 2)
);
console.log(`\n✅ Saved ${publishReady.length} publish-ready artists to:`);
console.log(`   ${publishReadyFile}`);

// Save needs-review subset
const needsReviewFile = path.join(process.cwd(), 'data/discovered-instagram-artists-needs-review.json');
fs.writeFileSync(
  needsReviewFile,
  JSON.stringify(needsReview.map(a => {
    const { score, flags, ...artist } = a;
    return { ...artist, published: false, needsReview: true };
  }), null, 2)
);
console.log(`\n⚠️  Saved ${needsReview.length} needs-review artists to:`);
console.log(`   ${needsReviewFile}`);

// Save review report
const reportFile = path.join(process.cwd(), 'INSTAGRAM_DISCOVERY_REVIEW_REPORT.md');
const report = `# Instagram Discovery Review Report

Generated: ${new Date().toISOString()}
Reviewed by: Claude Code

## Summary

- **Total Artists**: ${artists.length}
- **Publish-Ready**: ${publishReady.length}
- **Needs Review**: ${needsReview.length}
- **Critical Issues**: ${issues.critical.length}
- **Warnings**: ${issues.warning.length}

## Critical Issues

${issues.critical.length === 0 ? 'None' : issues.critical.map(i => `- ${i.type}: ${JSON.stringify(i)}`).join('\n')}

## Warnings by Type

${Object.entries(issues.warning.reduce((acc, w) => {
  acc[w.type] = (acc[w.type] || 0) + 1;
  return acc;
}, {})).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

## Publication Recommendation

### Tier 1: Publish Immediately (${publishReady.slice(0, 20).length} artists)

${publishReady.slice(0, 20).map((a, i) =>
  `${i + 1}. **${a.nameZh}** (@${a.instagramHandle}) - ${a.instagramFollowers.toLocaleString()} followers, score: ${a.score}/15`
).join('\n')}

${publishReady.length > 20 ? `\n### Tier 2: Publish After Light Review (${publishReady.slice(20).length} artists)\n\n${publishReady.slice(20).map((a, i) =>
  `${i + 21}. **${a.nameZh}** (@${a.instagramHandle}) - score: ${a.score}/15`
).join('\n')}` : ''}

${needsReview.length > 0 ? `\n### Hold for Improvement (${needsReview.length} artists)\n\n${needsReview.slice(0, 10).map((a, i) =>
  `${i + 1}. **${a.nameZh}** (@${a.instagramHandle}) - score: ${a.score}/15${a.flags.length > 0 ? ` | Issues: ${a.flags.join(', ')}` : ''}`
).join('\n')}${needsReview.length > 10 ? `\n... and ${needsReview.length - 10} more` : ''}` : ''}

## Source Quality Statistics

- High credibility sources (2+): ${sourceStats.highCredibility}
- Authoritative sources (1+): ${sourceStats.authoritative}
- Commerce-heavy profiles: ${sourceStats.commerceHeavy}

## Next Steps

1. Review critical issues and resolve duplicates
2. Publish Tier 1 artists (${publishReady.slice(0, 20).length})
3. Light review + publish Tier 2 artists (${publishReady.slice(20).length})
4. Improve and re-review held artists (${needsReview.length})
5. Continue discovery to reach 50 artist minimum (need ${Math.max(0, 50 - publishReady.length)} more)
`;

fs.writeFileSync(reportFile, report);
console.log(`\n📄 Saved detailed review report to:`);
console.log(`   ${reportFile}`);

console.log('\n' + '='.repeat(80));
console.log('REVIEW COMPLETE');
console.log('='.repeat(80));
