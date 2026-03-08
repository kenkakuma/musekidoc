# Romaji Source Batch Process

- Batch size is fixed at 20 artists per run.
- Script: `scripts/enrich-artists-romaji-batch20.js`
- Input:
  - `artists-detail-supplemented.json`
  - `data/artist-romaji-source-search-plan.json`
- Output:
  - `data/artist-romaji-source-batches/batch-XXX-romaji-source.json`

Status semantics in plan:
- `pending`: not processed yet
- `attempted`: processed, but no reliable source found in that run
- `completed`: source added in that run

Execution rule:
- each run processes top 20 with status in `pending` or `attempted`
- first tries romaji-web query source
- falls back to authoritative dictionary/encyclopedia page if reachable
