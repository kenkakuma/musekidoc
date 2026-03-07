# Claude Code Instagram Discovery Handoff

## Scope

This handoff covers the Instagram artist discovery workstream only.

Included task context files:
- `TASK_CODEX_INSTAGRAM_ARTIST_DISCOVERY.md`
- `QUICK_START_INSTAGRAM_DISCOVERY.md`
- `INSTAGRAM_ARTIST_DISCOVERY_WORKFLOW.md`

Included generated data files:
- `data/discovered-instagram-artists-batch-01.json`
- `data/discovered-instagram-artists-batch-01-summary.md`
- `data/discovered-instagram-artists-batch-02.json`
- `data/discovered-instagram-artists-batch-02-summary.md`
- `data/discovered-instagram-artists-batch-03.json`
- `data/discovered-instagram-artists-batch-03-summary.md`
- `data/discovered-instagram-artists-batch-04.json`
- `data/discovered-instagram-artists-batch-04-summary.md`
- `data/discovered-instagram-artists-batch-05.json`
- `data/discovered-instagram-artists-batch-05-summary.md`
- `data/discovered-instagram-artists-batch-06.json`
- `data/discovered-instagram-artists-batch-06-summary.md`
- `data/discovered-instagram-artists-batch-07.json`
- `data/discovered-instagram-artists-batch-07-summary.md`
- `data/discovered-instagram-artists-master.json`
- `data/discovered-instagram-artists-master-summary.md`
- `data/discovered-instagram-artists-gap-analysis.md`

Included scripts:
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

Excluded from this handoff:
- unrelated knowledge-base enrichment files
- unrelated task prompt files outside Instagram discovery
- untouched baseline app code

## Current Verified State

The current merged dataset is:
- total artists: `42`
- with `followers >= 10,000`: `42/42`
- with `sources >= 3`: `42/42`
- with `bio >= 150`: `42/42`
- with explicit `gender`: `42/42`
- with `nameKana`: `42/42`

Current distribution snapshot:
- explicit female: `9`
- explicit male: `33`
- born `1980+`: `19`
- born `1990+`: `4`
- remaining to task minimum `50`: `8`

Regional snapshot from current gap analysis:
- `美浓/濑户`: `7`
- `京都`: `6`
- `信乐`: `5`
- `益子`: `3`
- `备前`: `1`
- `其他`: `20`

## What Was Done

1. Built a reproducible multi-batch discovery pipeline.
2. Pulled public Instagram profile metadata for current follower counts.
3. Merged Instagram metrics with local artist detail where available.
4. Added gap analysis to quantify:
   - remaining count to 50 / 80
   - age coverage
   - gender coverage
   - production-area coverage
5. Recovered missed candidates from:
   - legacy seed files
   - alternate / dirty Instagram handles
   - public pottery influencer directories
6. Normalized `gender`, `nameKana`, and part of the location detail on the discovery set.

## Important Interpretation Notes

1. This is a discovery dataset, not a final publish truth set.
- Every record is intentionally kept as:
  - `published: false`
  - `needsReview: true`

2. Current follower counts were fetched from public Instagram page metadata on `2026-03-07`.
- These counts are suitable for current screening.
- They should still be rechecked before final publication if release is delayed.

3. Some entries are pragmatic inclusions.
- A small number are included because they materially improve coverage and clearly meet the Instagram threshold, even if they are not perfect fits for the regional or age quotas.

4. The main remaining weakness is not field completeness.
- The main remaining weakness is target composition:
  - too few women
  - too few `1980-2000` born artists
  - too few priority-region artists relative to the task card target

## Review Priorities For Claude Code

1. Eligibility correctness
- Confirm each record is genuinely a Japanese ceramic artist account.
- Exclude studio-only, staff-only, repost, or mixed-discipline accounts if they fail the task card definition.

2. Source quality
- Check whether each artist has at least:
  - Instagram source
  - 2 additional reachable sources
- Prefer upgrading weak shop-only or article-only entries to artist-owned or institution-backed sources where possible.

3. Duplicate / overlap logic
- Check whether alternate handles accidentally represent the same artist twice.
- Highest-risk example:
  - `otnps` vs `otntty`
- Current intent is that `otntty` is the artist-facing account and is the discovery-qualified one.

4. Publish readiness
- Decide which of the `42` can move from discovery state into a publishable shortlist now.
- It is acceptable to publish a smaller review-approved set first instead of all `42`.

## Suggested Verification Commands

```bash
node scripts/merge-instagram-discovery-batches.js
node scripts/analyze-instagram-discovery-gaps.js
python3 - <<'PY'
import json
from pathlib import Path
artists=json.loads(Path('data/discovered-instagram-artists-master.json').read_text())
print('count', len(artists))
print('followers10k', sum(1 for a in artists if (a.get('instagramFollowers') or 0) >= 10000))
print('sources3', sum(1 for a in artists if len(a.get('sources', [])) >= 3))
print('bio150', sum(1 for a in artists if len((a.get('bio') or '')) >= 150))
print('female', sum(1 for a in artists if a.get('gender') == 'female'))
print('withKana', sum(1 for a in artists if a.get('nameKana')))
PY
```

## Recommended Publish Strategy

1. Review the full `42` record master file.
2. Approve a first publish subset that is strongest on:
- source authority
- artist identity certainty
- Japanese ceramic relevance
- profile clarity
3. Keep weaker edge cases in discovery status for a second pass.
4. If publication requires hitting `50+`, continue targeted discovery only for:
- female artists
- `1980+` artists
- Mashiko / Shigaraki / Mino-Seto / Kyoto artists

## Commit Intent

This commit is intended as an Instagram discovery checkpoint for Claude Code review and publication prep.
It should be treated as a reviewable candidate corpus, not as a final publish-approved list.
