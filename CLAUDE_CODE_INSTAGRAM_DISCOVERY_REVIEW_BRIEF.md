# Claude Code Instagram Discovery Review Brief

## Objective

Review the current Instagram-based Japanese ceramic artist discovery corpus and prepare it for publication.

## Primary Goal

Decide which entries in the current discovery set are publishable now, and identify any records that should remain in review state.

## Files In Scope

Task references:
- `TASK_CODEX_INSTAGRAM_ARTIST_DISCOVERY.md`
- `QUICK_START_INSTAGRAM_DISCOVERY.md`
- `INSTAGRAM_ARTIST_DISCOVERY_WORKFLOW.md`

Discovery data:
- `data/discovered-instagram-artists-batch-01.json`
- `data/discovered-instagram-artists-batch-02.json`
- `data/discovered-instagram-artists-batch-03.json`
- `data/discovered-instagram-artists-batch-04.json`
- `data/discovered-instagram-artists-batch-05.json`
- `data/discovered-instagram-artists-batch-06.json`
- `data/discovered-instagram-artists-batch-07.json`
- `data/discovered-instagram-artists-master.json`
- `data/discovered-instagram-artists-gap-analysis.md`

Scripts:
- `scripts/build-instagram-discovery-batch.js`
- `scripts/refine-instagram-discovery-batch-01.js`
- `scripts/build-instagram-discovery-batch-02.js`
- `scripts/build-instagram-discovery-batch-03.js`
- `scripts/build-instagram-discovery-batch-04.js`
- `scripts/build-instagram-discovery-batch-05.js`
- `scripts/build-instagram-discovery-batch-06.js`
- `scripts/build-instagram-discovery-batch-07.js`
- `scripts/enrich-instagram-discovery-fields.js`
- `scripts/merge-instagram-discovery-batches.js`
- `scripts/analyze-instagram-discovery-gaps.js`
- `scripts/discover-instagram-artists.js`
- `scripts/import-discovered-artists.js`

Handoff docs:
- `CLAUDE_CODE_INSTAGRAM_DISCOVERY_HANDOFF.md`
- `CLAUDE_CODE_INSTAGRAM_DISCOVERY_REVIEW_BRIEF.md`

## Current Verified State

Local verification already run:
- merged record count: `42`
- `followers >= 10,000`: `42/42`
- `sources >= 3`: `42/42`
- `bio >= 150`: `42/42`
- explicit female: `9`
- with `nameKana`: `42/42`

## Review Questions

1. Eligibility
- Is each account genuinely a Japanese ceramic artist?
- Are any records actually studio, staff, brand, repost, or mixed-media accounts that should be excluded?

2. Duplicate logic
- Are any records duplicate artist identities under alternate handles?
- Highest-risk area:
  - artist handle vs studio handle
  - recovered alternate handles from dirty legacy data

3. Source quality
- Are there weak records whose non-Instagram sources are too commerce-heavy?
- Which records should be source-upgraded before publication?

4. Publication set selection
- Which records are strong enough to publish immediately?
- Which records should stay in discovery review state?

## What Needs Extra Attention

### A. Female-artist deficit
The set is still weak on women.
Please identify whether any currently included female records are borderline, and whether any excluded-but-known candidates should be prioritized next.

### B. Age-target deficit
The set is still under target for `1980-2000` born artists.
Please identify whether any existing records should be deprioritized because they do not support the age objective.

### C. Region-target deficit
The set still underperforms the target card in:
- Mashiko
- Shigaraki
- Mino/Seto
- female Kyoto-linked artists

## Suggested Review Commands

```bash
git status --short
node scripts/merge-instagram-discovery-batches.js
node scripts/analyze-instagram-discovery-gaps.js
python3 - <<'PY'
import json
from pathlib import Path
artists=json.loads(Path('data/discovered-instagram-artists-master.json').read_text())
for a in artists:
    if (a.get('instagramFollowers') or 0) < 10000:
        print('UNDER_FOLLOWERS', a['instagramHandle'])
    if len(a.get('sources', [])) < 3:
        print('UNDER_SOURCES', a['instagramHandle'])
    if len((a.get('bio') or '')) < 150:
        print('UNDER_BIO', a['instagramHandle'])
PY
```

## Requested Output Format

Please return:
1. findings first, ordered by severity
2. exact file references
3. any records that should not be published yet
4. any records that are publish-ready now
5. any source upgrades recommended before publication
6. residual risks even if no blocking issues are found

## Publish Guidance

If the corpus is not ready as a single publish set, prefer:
1. publishing a smaller approved subset now
2. leaving the rest as `needsReview: true`
3. documenting which candidates should be targeted in the next discovery pass
