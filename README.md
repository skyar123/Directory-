# WNC Family Resource Directory

Resource directory for Child First families in Buncombe County and Western NC,
organised in the order the SNIFF asks its questions.

Maintained by Skylar Belt, Family Resource Partner, Child First / NC-CFCR RHA Behavioral Health.

## Running it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run check    # validate data/ before committing an export
```

`dist/` is plain static files. Any static host will serve it, and the app keeps
working offline once loaded — nothing is fetched at runtime.

## Files

| File | What it holds |
|---|---|
| `data/resources.json` | 510 resources. Each carries `needs` (SNIFF question keys), `sec` (section), and `src` (where the fact came from). |
| `data/sniff.json` | The 13 sections and the 119 SNIFF questions the directory is ordered by. |
| `data/point-people.json` | 105 named humans, with how fast each one answers. |
| `data/community-resource-assessment.json` | The 84 rows of the Child First Community Resource Assessment, crosswalked to SNIFF questions. |
| `data/changelog.json` | Dead ends, changes in flight, and the 106 questions still open. |
| `src/` | The app. Reads the data, edits it, exports it back. |
| `scripts/` | The importers that built `data/`, kept so its provenance is reproducible. |

## How a change gets in

1. Open the app, find the resource, edit it or mark it verified.
2. Download `resources.json` from the Data tab.
3. Replace `data/resources.json`, run `npm run check`, commit with what you
   confirmed and how.

Every entry has a `src` field, so a diff shows which document or call a fact
came from. `lv` is the date it was last verified and `vb` is who verified it.

Edits live in the browser's localStorage until you export them. Clearing site
data loses them, so export before you rely on them anywhere else.

## Check the dead ends before you refer anyone

The **What changed** tab carries four services that are closed or unreachable
but still listed by findhelp and other aggregators with working phone numbers.
Trinity Place is the clearest case: closed since 2022, still published.

## Sections

- **I.** Child Development & Early Education
- **II.** Child Behavior & Emotions
- **III.** Child Health
- **IV.** Caregiver Support
- **V.** Adult Education & Work
- **VI.** Family Health
- **VII.** Adult Mental Health
- **VIII.** Concrete Needs
- **IX.** Autism & Neurodivergence
- **X.** Other
- **CRISIS.** Crisis Now
- **RESPITE.** Respite
- **ESPANOL.** Espanol

## A note on the team block

`point-people.json` marks the Child First team entries `internal: true`. Those
are personal email addresses and the workbook says to remove them before sharing
outside the team. The app hides them by default and leaves them out of the
point-people export unless you switch them on.

## Sources in this build

- WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx (ALL RESOURCES + 12 section tabs + POINT PEOPLE + WHAT CHANGED + SYNC CHECK)
- Community_Resource_Assessment_Form_2.docx (Child First Community Resource Assessment, Dec 2015)
- Carolina Pediatric Therapy research doc pasted in chat, 24 Aug 2026 (cites carolinapeds.com)
- Correspondence from listed organisations, read 28 Aug 2026 (see `src` on the rows it touched)
