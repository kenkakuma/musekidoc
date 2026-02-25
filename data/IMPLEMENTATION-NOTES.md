# Implementation Notes: Artist-Pottery Relationships

## Overview
This document provides guidance for implementing the artist-pottery relationships defined in `artist-pottery-relationships.json`.

## Data Files Created

1. **artist-pottery-relationships.json** - Machine-readable relationship data
2. **artist-pottery-relationships-summary.md** - Detailed analysis and methodology
3. **relationship-network-overview.txt** - Quick visual reference
4. **IMPLEMENTATION-NOTES.md** - This file

## Database Schema Assumptions

Based on the pottery entries examined, the database likely uses:

```
PotteryEntry {
  slug: string
  relatedArtists: string[]  // Array of artist slugs
  // ... other fields
}

Artist {
  slug: string
  relatedPotteryTypes: string[]  // Array of pottery entry slugs (if bidirectional)
  // ... other fields
}
```

## Implementation Steps

### Step 1: Validate Data Integrity

Before importing, verify:
- All artist slugs in relationships exist in artist database
- All pottery entry slugs exist in pottery database
- No duplicate relationships

```javascript
// Pseudo-code for validation
relationships.entries.forEach(entry => {
  assert(potteryExists(entry.slug))
  entry.relatedArtists.forEach(artistSlug => {
    assert(artistExists(artistSlug))
  })
})
```

### Step 2: Update Pottery Entries

For each pottery entry in the JSON:

```javascript
// Pseudo-code for update
relationships.entries.forEach(entry => {
  if (entry.operation === 'replace') {
    // Replace entire relatedArtists array
    updatePotteryEntry(entry.slug, {
      relatedArtists: entry.relatedArtists
    })
  } else if (entry.operation === 'append') {
    // Add to existing relatedArtists array
    appendToPotteryEntry(entry.slug, {
      relatedArtists: entry.relatedArtists
    })
  }
})
```

### Step 3: Create Bidirectional Relationships (Optional)

If the Artist schema includes `relatedPotteryTypes`:

```javascript
// Build reverse mapping
const artistToPottery = {}
relationships.entries.forEach(entry => {
  entry.relatedArtists.forEach(artistSlug => {
    if (!artistToPottery[artistSlug]) {
      artistToPottery[artistSlug] = []
    }
    artistToPottery[artistSlug].push(entry.slug)
  })
})

// Update artist entries
Object.entries(artistToPottery).forEach(([artistSlug, potteryTypes]) => {
  updateArtist(artistSlug, {
    relatedPotteryTypes: potteryTypes
  })
})
```

### Step 4: Verify Import

After import, verify:
- Correct number of relationships created
- Sample queries work correctly
- No orphaned references

## Sample Queries After Implementation

### Query 1: Get all artists for Mashiko
```
GET /pottery/mashiko
→ relatedArtists: ["hamada-tomoo", "ishikawa-wakahiko", "yoshizawa-hiro", "nikaido-akihiro", "umano-shingo"]
```

### Query 2: Get pottery types for Kuwata Takuro
```
GET /artists/kuwata-takuro
→ relatedPotteryTypes: ["shino", "oribe"]
```

### Query 3: Get all Mino-region artists
```
GET /pottery/shino
→ relatedArtists: ["kuwata-takuro", "ogata-atsushi"]
GET /pottery/oribe
→ relatedArtists: ["kuwata-takuro"]
```

## Current State vs Target State

### Current State (from pottery files)
- `shino` has: `relatedArtists: ["kuwata-takuro"]`
- `mashiko` has: `relatedArtists: ["hamada-tomoo", "ishikawa-wakahiko", "yoshizawa-hiro"]`
- Most other entries have: `relatedArtists: []`

### Target State (after implementation)
- All 13 entries will have complete relationship arrays
- 8 entries will remain with empty arrays (gaps identified)
- Total of 24 relationships across all entries

## Handling Edge Cases

### Case 1: Artist Works in Multiple Regions
Example: Endo Takashi uses both Shigaraki and Iga clay
- **Solution:** Link to both `shigaraki-yaki` and `iga`
- **Rationale:** Reflects actual practice, useful for discovery

### Case 2: Contemporary vs Traditional Interpretation
Example: Sakai Tomoya (contemporary) vs Takeuchi Shingo (traditional) both in Seto
- **Solution:** Include both, distinguish in artist bio/style fields
- **Rationale:** Shows breadth of tradition evolution

### Case 3: Artist Trained in One Place, Works in Another
Example: Umano Shingo trained in Mashiko, works in Tokushima
- **Solution:** Link to training tradition (Mashiko)
- **Rationale:** Training connection is culturally significant

### Case 4: Multi-generational Family Traditions
Example: Hamada Tomoo (grandson of Hamada Shoji)
- **Solution:** Note in artist bio, link to relevant pottery entry
- **Rationale:** Heritage is important context

## Data Quality Checks

### Pre-Import Checklist
- [ ] All artist slugs validated against artist database
- [ ] All pottery slugs validated against pottery database
- [ ] No duplicate relationships within entries
- [ ] Reasoning documented for each relationship
- [ ] Operation type specified ("replace" or "append")

### Post-Import Checklist
- [ ] Total relationship count matches expected (24)
- [ ] Sample queries return expected results
- [ ] Bidirectional queries work (if implemented)
- [ ] No broken references
- [ ] UI displays relationships correctly

## Rollback Plan

If issues occur during import:

1. **Backup existing data** before any updates
2. **Log all changes** for audit trail
3. **Implement rollback** by restoring from backup
4. **Investigate failure** using logs
5. **Fix data** and retry import

```javascript
// Example rollback structure
const backup = {
  timestamp: Date.now(),
  entries: potteryEntries.map(e => ({
    slug: e.slug,
    relatedArtists: [...e.relatedArtists]
  }))
}
```

## Future Maintenance

### Adding New Artists
When adding artists to database:
1. Identify relevant pottery traditions
2. Update `artist-pottery-relationships.json`
3. Re-run import script
4. Update documentation

### Adding New Pottery Entries
When adding pottery entries:
1. Research related artists in database
2. Add new entry to relationships JSON
3. Update summary documentation
4. Re-run import script

### Periodic Review
Recommended schedule:
- **Quarterly:** Review new artists, update relationships
- **Annually:** Comprehensive audit of all relationships
- **As needed:** Fix errors, add missing connections

## Performance Considerations

### Indexing
Ensure database indexes on:
- `pottery.relatedArtists` (array field)
- `artist.relatedPotteryTypes` (if implemented)
- `pottery.slug` and `artist.slug` (for joins)

### Caching
Consider caching:
- Popular pottery entry → artists lookups
- Artist profiles with pottery connections
- Regional pottery center pages

### Query Optimization
For "show all artists from Mashiko region":
```javascript
// Efficient: Direct array lookup
db.pottery.findOne({slug: 'mashiko'}).relatedArtists

// Less efficient: Join query
db.artists.find({relatedPotteryTypes: 'mashiko'})
```

## API Integration Examples

### REST API Endpoints
```
GET /api/pottery/:slug/artists
→ Returns array of artist objects related to pottery entry

GET /api/artists/:slug/pottery-types
→ Returns array of pottery entry objects related to artist

GET /api/regions/:region/artists
→ Returns artists working in pottery traditions of that region
```

### GraphQL Schema
```graphql
type PotteryEntry {
  slug: String!
  relatedArtists: [Artist!]!
}

type Artist {
  slug: String!
  relatedPotteryTypes: [PotteryEntry!]!
}

type Query {
  potteryEntry(slug: String!): PotteryEntry
  artist(slug: String!): Artist
}
```

## Documentation Updates Needed

After implementation:
1. Update API documentation with new relationship endpoints
2. Add examples to developer documentation
3. Update user guide with "related artists" feature
4. Create curator guide for maintaining relationships

## Contact & Questions

For questions about:
- **Relationship criteria:** See `artist-pottery-relationships-summary.md`
- **Data structure:** See `artist-pottery-relationships.json`
- **Visual overview:** See `relationship-network-overview.txt`
- **Implementation:** This file

---

**Version:** 1.0
**Created:** 2026-02-25
**Last Updated:** 2026-02-25
