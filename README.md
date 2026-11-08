# WNC Family Resource Directory

**Internal staff tool. Not for public distribution.**

Resource directory for Child First families in Buncombe County and Western NC,
organised in the order the SNIFF asks its questions.

Maintained by Skylar Belt, Family Resource Partner, Child First / NC-CFCR RHA Behavioral Health.

This is a working tool for the team, not a public directory. It carries point
people's direct lines, the Child First team's personal addresses, and candid
notes about who answers and who to route around. Keep the build behind
whatever the team already uses; do not put `dist/` on a public URL. Anything
derived from it that goes outside the team needs the team block stripped
first.

## Running it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run check    # validate data/ before committing an export
```

`dist/` is plain static files. Any static host will serve it, and the app keeps
working offline once loaded. The one thing that goes online is Ask AI, and only
when someone presses it (see below); it is also the one part with a server side,
a Netlify function. The typeface
(Inter) is bundled rather than pulled from a CDN, so it renders the same behind
a firewall as it does outside one.

## Files

| File | What it holds |
|---|---|
| `data/resources.json` | 622 resources. Each carries `needs` (SNIFF question keys), `sec` (section), and `src` (where the fact came from). |
| `data/sniff.json` | The 13 sections and the 119 SNIFF questions the directory is ordered by. |
| `data/point-people.json` | 114 named humans, with how fast each one answers. |
| `data/community-resource-assessment.json` | The 84 rows of the Child First Community Resource Assessment, crosswalked to SNIFF questions. |
| `data/changelog.json` | Dead ends, changes in flight, and the 119 questions still open. |
| `data/food-by-day.json` | The weekly pantry and free-meal schedule, by day. |
| `data/events.json` | The team's own picks: events, deadlines and sign-ups by date, each with its source and notes. The Events tab sorts them and folds past ones away. |
| `data/calendar.json` | The Public Edition's family calendar: 1,353 dated listings from 7 Nov 2026 to 7 Nov 2027, 129 repeating series, 10 yearly events not announced yet, and the 16 calendars it was read from. Rebuilt by `scripts/import-public-edition-calendar.cjs`, not edited by hand. The app fetches it only when the Events tab or Ask AI opens. |
| `src/` | The app. Reads the data, edits it, exports it back. |
| `src/styles.css` | The whole design system: tokens at the top, then components. |
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

Events are not edited in the app. Add them to `data/events.json`: a `date`
(YYYY-MM-DD), an `end` for a run of days or a sign-up window, a `kind` of
event, deadline or signup, and a `src` like every other row. `rid` links the
matching resource. Leave past events in: the Events tab moves them under
"Already happened" by itself, so seasonal entries need no clean-up.

The calendar is a different kind of list: a year of library programs, Bounty &
Soul markets, museum and Arboretum programs and the like, as the Public Edition
found them on each organizer's calendar on 7 Nov 2026. The Events tab shows it
with the team's picks, with filters by kind, age, organizer and a search, and
opens one month at a time. Each listing says how it was found ("On the library
calendar, 7 Nov 2026") instead of "Verified". Past listings drop off rather
than pile up. Repeating series and yearly events with no date yet are kept
apart, under the months, so neither reads as a promise. Organizers publish a
few months ahead, so a thin later month means not published yet. To refresh
it, export the next edition of the workbook and rerun the script.

## Ask AI

The **Ask AI** button next to the search box takes a question, a description of
a family's situation, or a whole pasted SNIFF, and asks Google's Gemini which
resources in this directory fit, with a reason for each. Pasting more than one
line into the search box opens it too. Nobody sets anything up: it works in any
browser on any device.

**How it works.** The browser sends only the typed text to this site's own
function, `/api/ask-ai` (`netlify/functions/ask-ai.mjs`). The function builds
the prompt on the server from the directory as deployed (every resource, the
team's upcoming picks, and the next three weeks of the family calendar, 150
events at most), calls Gemini, maps the answer back onto the directory, and
returns it. Gemini can only answer with entries from that list; anything else
it suggests is dropped, and the panel says how many. Because the prompt is
built on the server, the endpoint answers questions about this directory and
nothing else.

**Setting it up (once, on Netlify):**

1. In AI Studio (aistudio.google.com/apikey), copy the key itself. It starts
   with `AQ.` or `AIza`; the service account email shown beside it is not the
   key. Keep billing off and the key stays on the free tier.
2. In Netlify: the site, then Site configuration, then Environment variables,
   then Add a variable. Key `GEMINI_API_KEY`, the key as its value. On a paid
   plan, mark it as a secret and give it the Functions scope only. On the free
   plan those two options are refused (that is how this site's key was set, on
   8 Nov 2026: all scopes and contexts, not marked secret). That is still safe
   here: Vite only builds `VITE_`-prefixed variables into the app, so the key
   never reaches a browser; it is visible only to people on the Netlify team.
3. Redeploy: functions read the value as it was at deploy time, so trigger a new
   deploy (or push a commit) after adding or changing it.

Never put the key in the code, a `VITE_` variable, `netlify.toml` or a chat: a
front-end variable would publish it inside the app for anyone to copy.

**Limits and locks.**

- One shared key means one shared free limit. If it runs out, Ask AI says so and
  waits for the reset; with billing off it never charges.
- The function only answers requests from the app's own pages, and Netlify
  rate-limits it to 10 questions a minute per IP.
- Optional team code: set `ASK_AI_CODE` the same way, and the panel asks each
  browser for that code once before it will answer.
- Speed: Ask AI asks Gemini Flash-Lite, Google's fastest model, with thinking
  turned down to the minimum, and falls back to Flash when Flash-Lite is busy or
  out of its free quota. Netlify cuts this site's functions off at 30 seconds,
  so both together get 24, and the panel shows an answer or a plain "took too
  long", never a platform error. While it works, the button counts the seconds
  and **Stop** cancels.
- Each question leaves a line in Netlify's function logs (Logs, then Functions,
  then `ask-ai`): which model answered, how long it took and how many tokens it
  used. What was asked and answered is never logged.

**Search first.** Gemini does not read all 622 resources for each question. The
function indexes the directory once when it starts (`src/shortlist.js`), and each
question sends Gemini only the closest 120 or so:
- resources that share words with the question,
- the ones tagged with the SNIFF questions it raises, in their own words or in
  everyday ones ("behind on rent" reaches housing help),
- Spanish-capable programs moved up when Spanish comes up.

Each need gets its fair share of the list. The call-first lines and the crisis
lines are always on it. When the search cannot make sense of the text, Gemini
reads the whole directory as before. A prompt is about a third of the size it was.

**The voice.** Gemini is asked to write the way a caring neighbor who knows
every program would talk: warm, plain, hopeful and never judging, on the
family's side and above all trying to help. It always leaves the family
something to try. It puts crisis and safety options first when someone may be
unsafe, never promises eligibility or openings the directory does not state, and
answers in the language it was asked in.

**No client details.** On the free tier Google may keep and review what is
sent. The panel says so, and warns when the text looks like it has a phone
number, an email address, a date of birth or a "Name:" style field. The function
also takes these details out itself before anything goes to Google
(`src/scrub.js`), and the answer says what it took out. It catches:
- names after a label ("Name:", "Mother: Maria Lopez");
- dates of birth;
- phone numbers, emails and ID numbers;
- street addresses.

It cannot spot a name in the middle of a sentence, so the warning still matters.
The function never logs what was asked.

**Safety first, without Gemini.** When a question sounds like someone may be in
danger, the panel shows the crisis lines at once, before and whatever Gemini
answers: 911, then 988, Helpmate's 24-hour line, RHA Mobile Crisis and the
Crisis Text Line, ordered by what was said. The words it listens for, in English
and Spanish, are in `src/urgent.js`. The numbers come from those rows in
`data/resources.json`.

**In an answer:**
- Tap a need to open it under By SNIFF question, with everything filed there.
- Tap one of Gemini's questions to answer it; Ask AI adds the answer to the text
  and looks again.
- **A message for the family** writes the picks up as a warm text message, with
  names, phone numbers, hours and addresses straight from the directory. In
  Spanish, only Gemini's reasons are translated, so a number cannot change.
  Read it over before sending.
- **Did this help?** saves a thumbs up or down, and for a thumbs down a reason
  picked from a list. It saves only the day, the SNIFF needs, resources and
  events named, never the question or the answer. The totals are at
  `/api/ask-feedback` on the site (add `?code=` if `ASK_AI_CODE` is set). They
  are kept in the site's Netlify Blobs store `ask-feedback`.

**About the family** taps (children's ages, Spanish, no car, town) add one plain
line to the question, so the search and Gemini both use them.

**What is open.** Gemini always knows today's date. A question about when ("open
Saturday?", "food tonight") also gets each resource's hours. If it is about food,
it gets that day's Food by day schedule too.

**Locally**, `npm run dev` has no functions, so Ask AI says it is not switched on.
To try it, run `netlify dev` with `GEMINI_API_KEY` set in the shell, or use a
deploy preview. The logic is in `src/ai.js`, `src/shortlist.js`, `src/scrub.js`
and `src/urgent.js`. The panel is `src/components/AskPanel.jsx`. The server side
is `netlify/functions/ask-ai.mjs` and `ask-feedback.mjs`.

## Where the data came from

The workbook calls its ALL RESOURCES tab the master, and the first build of
this app took it at its word. It is not complete. The twelve section tabs and
CRISIS NOW carry rows that never reached it, so `scripts/import-section-tabs.py`
pulls them across: 12 resources that were missing outright, including 988, RHA
Mobile Crisis and the DSS report line, and 53 existing resources that gained a
SNIFF question or opening hours they did not have.

The same organisation appears on several tabs, worded to suit the question it
sits under — the workbook's own SYNC CHECK counts 236 organisations on two or
more tabs. So rows are matched on phone, email and website, not just name, and
a row that matches something already here contributes its question rather than
becoming a second copy.

## Check the dead ends before you refer anyone

The **What changed** tab carries five dead ends: services that are closed or
unreachable, some still listed by findhelp and other aggregators with working
phone numbers. Trinity Place is the clearest case: closed since 2022, still
published. Closed services keep their rows here, renamed with CLOSED and a
note, so a search lands on the warning rather than on nothing.

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

## The team block

`point-people.json` marks the Child First team entries `internal: true` and the
app badges them. Because the tool is internal, it shows them rather than making
you switch them on — but they are personal addresses, and the workbook says to
remove them before sharing outside the team. `point-people.json` exports stamp
`internalUseOnly: true` so the file still says so once it has left the app.

## Sources in this build

- WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx (ALL RESOURCES + 12 section tabs + POINT PEOPLE + WHAT CHANGED + SYNC CHECK)
- Community_Resource_Assessment_Form_2.docx (Child First Community Resource Assessment, Dec 2015)
- Carolina Pediatric Therapy research doc pasted in chat, 24 Aug 2026 (cites carolinapeds.com)
- Correspondence from listed organisations, read 28 Aug 2026 (see `src` on the rows it touched)
- Nurse-Family Partnership community partner meeting notes, 6 Nov 2026, with facts beyond the notes checked by web search (`scripts/apply-nfp-meeting-2026-11-06.mjs`)
- Facebook deep scrape parts 1 to 4 and two family weekend guides, 6 Nov 2026: family resources only, and nothing from the guides without a second source
- Accuracy pass by web search, 6 Nov 2026 (`scripts/apply-accuracy-pass-2026-11-06.mjs`): rows confirmed against an official or the organisation's own source show `vb` "SB (web search)"
- Crisis rows check, searches 6 and 8 Nov 2026 (`scripts/apply-crisis-check-2026-11-08.mjs`): MCOT's numbers corrected, Copestone updated to Sweeten Creek, "The Bridges" flagged as unconfirmed, and the CPS, RHA Mobile Crisis and Vaya crisis lines confirmed
- Concrete Needs check by web search, 8 Nov 2026 (`scripts/apply-concrete-needs-check-2026-11-08.mjs`): ABBA's House corrected from domestic violence housing to a recovery residence for mothers, the Salvation Army shelter's pause flagged, the NC Diaper Bank row's Houston number removed, Medicaid ride lines listed by health plan, cut-off hours fixed, and 13 food, transport, utility, shelter and hotline rows confirmed
- Gap fill by web search, 8 Nov 2026 (`scripts/apply-gap-fill-2026-11-08.mjs`): phones, websites, addresses and hours for 75 rows, copied between duplicate rows of the same organization where one already had them. The script only writes empty fields; details from directories or news say so in `src`, and 9 local resources that exist by word of mouth, with no online listing, are marked that way
- The owner's Google Drive, read 7 Nov 2026 under the Drive merge prompt's rules (metadata first, only family-resource files, no client details; `scripts/apply-drive-merge-2026-11-07.mjs`). The v19 workbook there is the same version this app was built from, and most topic guides predate it, so most of what they name was already here. They added 9 rows (MountainCare adult day, A-B Tech phlebotomy, STEP / More Than a Job NC, Finish Line grants, Trans Lifeline, LGBT National Help Center, National Runaway Safeline, Biltmore Avenue Family Dentistry, Irene Wortham Early Learning Center) and details on 19 others, with every conflict in `note`. Weekend-guide events went in only with a second source: four, checked by web search, and three of those had the venue, time or website wrong in the guide
- A second Drive pass the same day (`scripts/apply-drive-followup-2026-11-07.mjs`) over the family-resource files the first left as candidates: kinship care benefits, the March 2026 caregiver guide, respite options, a caregiver therapy handout and drop-in movement options. Most of it was already here; it added 6 rows (CMARC care management, Botanical Gardens, Folk Art Center, WNC Farmers Market, The Incredible Years, free nature play) and details on 12, including what relatives raising a child in DSS custody can be paid and which therapists are certified in Child-Parent Psychotherapy
- Buncombe County Family Resource Directory, Public Edition, event sheets (`scripts/import-public-edition-calendar.cjs`): its curated family and caregiver calendar of 1,354 occurrences (one, Fire Safety for Kids in Fairview, was already in `events.json`, which kept it and gained the library's details), its recurring series, annual leads and monitored calendars. The full library feed's 74 adult-interest programs stay out, as the Public Edition keeps them out of its family calendar
- Buncombe County Family Resource Directory, Public Edition (workbook checked 7 Nov 2026; `scripts/export-public-edition.py`, then `scripts/import-public-edition-resources.cjs`). 110 of its 169 resources matched rows already here: they filled 37 blank fields and added the Public Edition to `src`. Where it disagrees with a row, the row keeps its own value and `note` names both. The other 59 are new rows. They keep the Public Edition's "confirm current details" status: no `lv`, and "Not stated in the source" where it says nothing about language access
