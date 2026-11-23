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
| `data/resources.json` | 714 resources. Each carries `needs` (SNIFF question keys), `sec` (section), and `src` (where the fact came from). A program the workbook filed in several sections is one row with `secs` (every section it repeats under) and every section's `needs`; `meta.merged` maps the old ids of merged copies to the kept row. |
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
3. Replace `data/resources.json`, run `npm run check` and `npm run search-check`, commit with what you
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

## Working with a family

**The home screen** (Find, before anything is typed) puts the most-used links first:
the free food map, food open today, this week and the visit plan as large cards;
the next events starting this week (the team's own picks first) in a strip that
scrolls sideways; the go-to programs (`GO_TO` in `src/components/Home.jsx`) with
a call button each; saved and recently opened programs; then the need tiles. The
crisis lines are behind the red **Crisis lines** button in the header, on every
screen.

**Back and Home.** Every screen but the home screen has a bar pinned under the
header: **‹ Back** returns to the screen you came from (on a page opened from a
link, the screen above it) and **Home** returns to the home screen with the search
and filters cleared. The Home tab and the app's name in the header do the same.

**Getting around.** Four places, the same on a phone (along the bottom) and a
computer (along the top): **Find**, **Today** (food open today, how many
programs list hours for today, and the next seven days of events), **Plan**, and
**More** (SNIFF questions, Food by day, all events, the assessment, point people,
and upkeep: what changed, what is missing, data). Anything below the four shows a
back link. The address bar follows you (`#/find?q=food&f=free,today`, `#/r/<id>`,
`#/today`), so Back steps back through searches and filters, and a search or a
program can be sent to a teammate.

**Filters.** On Find, **Filters** opens a panel: open today, evenings or weekends,
free, no ID, walk-in, Spanish, ages 0-5, delivery or mobile, Buncombe only, SNIFF
section and needs work. Each shows how many results it would leave, and active
filters show as chips to tap off. Open today, Free and Spanish also sit under the
search box. These are read from each program's own fields (`src/facets.js`): "open
today" reads the hours text ("Mon-Fri", "Tue and Thu", "2nd and 4th Wednesdays"),
so a program whose hours say nothing about days never shows as open today.

**Results.** A broad search is grouped by the SNIFF needs it raises ("Food pantry
136"), the best four first and **See all**. A card shows the name, one line about
the program and the call button; tap it for the rest. Each program has its own page
(**Open its page**), with a link to copy. **Save** keeps a program on Find's
Saved list, and Find also lists the last eight opened (both in this browser only).
`docs/usability-test.md` is a short script for testing all this with the team.

**The Find tab opens on the need.** Before anything is typed, it shows the
crisis lines (911, then 988, Helpmate, Our VOICE, 211 and Code Purple's
recorded message) and a short list of needs: food today, diapers, a safe place
tonight, not safe at home, rent, utilities, childcare, development, a ride,
counseling, legal help, Christmas help, and not sure. Each opens the SNIFF
question that holds the list, the day's Food by day schedule, or a search. The
numbers come from the rows themselves, so fixing a row fixes the strip. The
list is in `src/components/NeedStart.jsx`. Each need is a colored tile with an
icon, and the full directory waits behind **Show all 714 resources** below
them, so the page opens short; typing a search or picking a section shows the
cards as before.

**On a phone** the tabs move to a bar along the bottom of the screen: Find,
Food, Events, Plan (with its count), and More for everything else. The crisis
lines sit two across so the need tiles start on the first screen.

**If this doesn't work.** Some rows carry a backup route (`alt` in
`resources.json`, shown as "If this doesn't work" on the card and in anything
copied for a family): where to go when the first place is full, closed or
says no. They are written to be read by a family, so Skylar's reasons for not
referring somewhere stay in `note`.

**Visit plan.** "Add to visit plan" on a resource or an upcoming event gathers
a short list in the Visit plan tab. From there, **Copy plan for a family**
gives one text with each place's public contact facts and backup, the dates
with their years, and any of the "before you go, ask" questions ticked (rides,
interpreter, children along, disability needs, papers, timing, how to reach
them). **Print or save as PDF** prints the same thing without the app around
it. Staff notes show on screen and are never copied or printed. The plan stays
in this browser only, in the same storage as edits; do not put names or case
details in it. Clear it when the visit is done.

## Ask AI

The **Ask AI** button next to the search box takes a question, a description of
a family's situation, or a whole pasted SNIFF, and asks Google's Gemini which
resources in this directory fit, with a reason for each. Pasting more than one
line into the search box opens it too. Nobody sets anything up: it works in any
browser on any device.

**How it works.** The browser sends only the typed text to this site's own
function, `/api/ask-ai` (`netlify/functions/ask-ai.mjs`). The function builds
the prompt on the server from the directory as deployed (the resources that
fit the question, up to 40 of the team's upcoming picks closest to it, and, when
the question is about things to do, dates or the holidays, up to 60 listings
from the next three weeks of the family calendar), calls Gemini, maps the answer
back onto the directory, and returns it. Gemini can only answer with entries from that list; anything else
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

**The search box uses the same engine.** It used to need every typed word to
appear word for word, which found about a quarter of what fits an everyday search
("groceries", "shelter tonight" and "food for my kids" found almost nothing). Now
`src/search.js` ranks with `src/shortlist.js`: word stems, everyday and Spanish
words for each SNIFF need ("behind on rent", "comida", "panales"), the needs each
resource is filed under, Spanish-capable programs first when the text is in
Spanish, and programs outside Buncombe after the rest unless a town is named.
Names, partial names and phone numbers still match exactly. Rows the team does not
refer to first, and rows kept only to say a program closed, sort last. The Events
search folds accents, matches plurals ("markets", "storytimes") and ignores filler
words ("free events for kids" looks for free events).

**Everyday words for things no SNIFF question covers.** `SAME_AS` in
`src/shortlist.js` adds the directory's own words to a search: "tampons" also looks
for menstrual and hygiene, "pet food" for pet and veterinary (and is not counted as
food), "roof" or "mold" for home repair, "glasses" for vision, "birth certificate"
for the Register of Deeds, "fathers" for dad and fatherhood. Added words count a
little less than typed ones. "Dad" and "mom" are filler in most searches ("food for
my kids' dad"), so they count only in a search about fathers or mothers ("dads
group", "single moms"). A program filed under many needs counts a little less for
each, so a diaper bank filed under domestic violence ranks after the programs that
are about it.

**Checking it.** `npm run search-check` runs 44 everyday searches against what the
directory files under each need, through the same code, and 12 searches whose answer
is a few named programs, which must be near the top ("tampons" must show the period
pantries in the top 5). On 20 Nov 2026: the search box finds 99% (it was 25% before
17 Nov), Ask AI's shortlist 91% (its cap of 120 rows is below the 136 food pantry
rows), and all 12 named-program searches pass. It fails below 95% or 80%, or when a
named program drops out. Run it after an import, and add any search someone reports
as coming up short.

**Search first.** Gemini does not read all 714 resources for each question. The
function indexes the directory once when it starts (`src/shortlist.js`), and each
question sends Gemini only the closest 120 or so:
- resources that share words with the question,
- the ones tagged with the SNIFF questions it raises, in their own words or in
  everyday ones ("behind on rent" reaches housing help),
- Spanish-capable programs moved up when Spanish comes up.

Each need gets its fair share of the list. The call-first lines and the crisis
lines are always on it. Rows Skylar does not refer to first (the Salvation Army)
rank lower and are flagged `not-first`, so Gemini offers them only after other
options or when asked by name.

When the text names no need: a short message with nothing to match ("hi", "ok
thanks") gets only the call-first and crisis lines, and Gemini asks what would
help; a few rare-word matches ("crib") go with those lines; only a long text with
no match at all reads the whole directory. Measured on 17 Nov 2026 at 745
resources: a typical question is about 5,000 to 12,000 tokens, and "hi" about
4,000 (it was about 38,000 when it read everything).

**How many picks.** Up to 15. For one main need Gemini is asked for 10 to 15
choices, for two needs 6 to 8 each, and with more needs two or three each, spread
across areas, days and kinds (for food: pantries, hot meals, markets, fridges,
delivery). Picks are a sample, never the whole list: under them, the answer has an
"All N" button for each need it names, which opens everything the directory files
there, and food answers add Food by day and Skylar's free food map.

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
it gets that day's Food by day schedule too. A food question that names no day
("free food") gets hours and the schedule for today and tomorrow.

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
- WNC Free Food & Supplies community guide (Oct 2026) and flyers shared 13 Nov 2026 (`scripts/apply-food-guide-2026-11-13.mjs`): 39 new food sources, corrections to rows the guide covers, this winter's Code Purple sites, five calendar events, and Salvation Army rows marked as not a first referral
- Code Purple 2026-2027 sheet from the Asheville-Buncombe Continuum of Care and Eblen's Christmas gift assistance page, 16 Nov 2026 (`scripts/apply-holiday-codepurple-2026-11-16.mjs`): official Code Purple rules and numbers, and a row for Eblen's Saint Nicholas Project toy store
- Holiday help refresh, 16 Nov 2026 (`scripts/apply-holiday-refresh-2026-11-16.mjs`): Holiday assistance rewritten for 2026, a WNC Toys for Tots row, and holiday calendar entries updated
- Flyers shared 16 Nov 2026 (`scripts/apply-flyers-2026-11-16.mjs`): Community Closet row and three calendar events
- Holiday sign-up update, 16 Nov 2026 (`scripts/apply-holiday-signup-2026-11-16.mjs`): Eblen sign-up link, ABCCM Christmas Angel row for families, Holiday assistance rewritten
- Facebook holiday sweep, 16 Nov 2026 (`scripts/apply-fb-holiday-sweep-2026-11-16.mjs`): ABCCM application link, Thanksgiving meals, programs reported full, a no-ID free food row
- Mountain Strong Free Clinic flyers, 16 Nov 2026 (`scripts/apply-mountain-strong-2026-11-16.mjs`): a Burnsville free clinic row and its two open house dates
- OK Computer Buncombe Family Navigator build, shared 17 Nov 2026 (`scripts/apply-okc-build-2026-11-17.mjs`): another tool's 14 Nov 2026 reading of official pages. Dream Center holiday dates, Bounty & Soul's weekly schedule (also in Food by day) and intake details; no verified dates, conflicts kept in `note`
- Backup routes, 17 Nov 2026 (`scripts/apply-backup-routes-2026-11-17.mjs`): an "If this doesn't work" route on 31 rows, from the OK Computer build's backups where they held up against the directory, and from Skylar's own stance for the Salvation Army and Christmas rows. Wording only; no new contacts
- Community food, medical and financial lists (the WNC Free Food guide's maintainer) and the October 2026 low-cost happenings list, shared 17 Nov 2026 (`scripts/apply-community-guides-2026-11-17.mjs`): 76 new rows and 16 updated. The rest of the food guide by county, free clinics, counseling and dental care, NCCARE360, four more holiday gift programs, and free family outings. Only two rows were confirmed on their own sites; the rest carry the community list as their source, with conflicts in `note`. NC HOPE (closed since 2022) and a Wayne County charity are left out
- Winter 2026-27 holiday guide, shared 17 Nov 2026 (`scripts/apply-winter-guide-2026-11-17.mjs`): nearly all of its resources were already here, so it adds the season's calendar: holiday closures for schools, libraries, county offices and ART, both school winter breaks, the LIHEAP windows, winter camp sign-up and verified free holiday events, plus notes where it disagrees with the official Code Purple sheet. Left out because no source confirmed them for 2026: APR Friendsgiving (Nov 21), MANNA's pre-Thanksgiving boxes, Haywood Street and 12 Baskets holiday feasts, the Grove Arcade Winter Wonderland, Folk Art Center toy demos, seed swaps and the Black History Month program list
- Food by day update and Skylar's free food map, 17 Nov 2026 (`scripts/apply-food-schedule-2026-11-17.mjs`): Food by day was still the August workbook's 51 entries, so 29 entries for the October food guide's weekly Buncombe sites were added; the NC 211 food row's phone (MATCH's McDowell number) was corrected; Skylar's map got a row and a link on Food by day and in Ask AI food answers, and her map listings flagged the Blessing Barn as possibly paused, Tranzmission's restarted Saturday pantry and BeLoved's Weaverville pantry location
- SNIFF tag fixes, 17 Nov 2026 (`scripts/apply-tag-fixes-2026-11-17.mjs`): 22 need tags that rows' own names or descriptions plainly call for, found by a search audit (food providers such as Swannanoa Communities Together, the Haywood Street Welcome Table and BeLoved's street pantries under Food pantry; two dental clinics; two rent programs; four counseling practices)
- Duplicate rows merged, 17 Nov 2026 (`scripts/apply-merge-duplicates-2026-11-17.mjs`): 34 programs the workbook filed once per SNIFF section (72 rows) are one row each, which still repeats under every SNIFF section and question its copies did. The kept row has the fullest description plus what the others added (Spanish copies marked "En español"), the newest verification and every source; a different phone or address from a copy is in `note`. Old ids still resolve, so saved plans and edits find the program
- Ceremonial Beauty Collective's pay-what-you-can haircuts, a Friends of Swannanoa post shared 18 Nov 2026 (`scripts/apply-ceremonial-haircuts-2026-11-18.mjs`): one row with the post's phone, booking steps (book by phone or the business's Google listing, and say it is for the Pay What You Can special) and holiday-season limit. The post gives no address or end date, and listings online disagree on downtown or West Asheville, so the row says to ask when booking
- Blessing Barn closed, and Sistas Caring 4 Sistas and BeLoved relabelled, 18 Nov 2026 (`scripts/apply-blessing-barn-sc4s-2026-11-18.mjs`): Skylar confirmed the Blessing Barn is not running, so its row says CLOSED and it is off Food by day. Web search found SC4S is a doula collective founded by Black women, for Black families and other families of color, with no mention of Spanish services, so it lost the Spanish-first label and the Spanish services filing; its address had been ABIPA's office and is now 50 S French Broad Ave. BeLoved is BIPOC-led with Asheville en Espanol as one program, so two of its rows lost the Latino-led label
- Food flyers shared 19 Nov 2026 (`scripts/apply-food-flyers-2026-11-19.mjs`): YWAM's Friday hot meal is a food truck that runs until the food is gone (its Nov 20 flyer says 12:30pm, the October guide 12pm); Bountiful Cities' free vegetable and fruit Share Markets, a new row with all 35 dates for 2027 on the Events tab and in Food by day (1st Wednesdays at 391 S French Broad Ave, 2nd and 4th Wednesdays at 90 Montford Ave); MANNA's Community Market at Rock Hill Missionary Baptist in Shiloh, a new row (Wednesdays 3-5pm, about monthly: MANNA's January 2026 list and the Nov 18 flyer both fall on third Wednesdays); and Bounty & Soul's one-day move of the ArtSpace market to Black Mountain on Nov 21, noted in Food by day
- SNIFF tags corrected from a search audit, 20 Nov 2026 (`scripts/apply-search-tags-2026-11-20.mjs`): Community Engagement Markets (free produce) moved from Toys or books to Food pantry; the Monday to Thursday food schedules and the Family Resource Center at Emma (its own description lists a pantry) joined Food pantry; the Wednesday schedule lost GED, ESL, job training, college and substance use tags that nothing in it supports
- ABIPA Thanksgiving Sunday Shop and EMOTE Clothing Swap flyers, 22 Nov 2026 (`scripts/apply-abipa-emote-2026-11-22.mjs`): the Sunday Shop on Nov 22 at the Friendship Center, 142 Shiloh Rd, with ABIPA's phone; a new EMOTE Clothing Swap row (444 Haywood Rd, monthly Sundays 12-4pm) and its two remaining 2026 dates
- Cowboy Christmas Toy Giveaway flyer, shared 23 Nov 2026 (`scripts/apply-cowboy-christmas-2026-11-23.mjs`): Blue Ridge Cowboy Church, Fairview, Dec 5, 10am-2pm, as an event
- Review of 23 Nov 2026 (`scripts/apply-review-2026-11-23.mjs`): Babies Need Bottoms supplies partner agencies only, and its listed "diaper line" was NC 211's number, so the row now routes families through 211 and it left the home screen; the Register of Deeds' diapers are tied to birth certificate visits, per the county; November dates that have passed were cleared from 13 rows; Root Cause Farm's impossible 2026 end date came out; new rows for the WNC Free Food & Supplies guide and a public free resource Signal group
- The owner's Google Drive, read 7 Nov 2026 under the Drive merge prompt's rules (metadata first, only family-resource files, no client details; `scripts/apply-drive-merge-2026-11-07.mjs`). The v19 workbook there is the same version this app was built from, and most topic guides predate it, so most of what they name was already here. They added 9 rows (MountainCare adult day, A-B Tech phlebotomy, STEP / More Than a Job NC, Finish Line grants, Trans Lifeline, LGBT National Help Center, National Runaway Safeline, Biltmore Avenue Family Dentistry, Irene Wortham Early Learning Center) and details on 19 others, with every conflict in `note`. Weekend-guide events went in only with a second source: four, checked by web search, and three of those had the venue, time or website wrong in the guide
- A second Drive pass the same day (`scripts/apply-drive-followup-2026-11-07.mjs`) over the family-resource files the first left as candidates: kinship care benefits, the March 2026 caregiver guide, respite options, a caregiver therapy handout and drop-in movement options. Most of it was already here; it added 6 rows (CMARC care management, Botanical Gardens, Folk Art Center, WNC Farmers Market, The Incredible Years, free nature play) and details on 12, including what relatives raising a child in DSS custody can be paid and which therapists are certified in Child-Parent Psychotherapy
- Buncombe County Family Resource Directory, Public Edition, event sheets (`scripts/import-public-edition-calendar.cjs`): its curated family and caregiver calendar of 1,354 occurrences (one, Fire Safety for Kids in Fairview, was already in `events.json`, which kept it and gained the library's details), its recurring series, annual leads and monitored calendars. The full library feed's 74 adult-interest programs stay out, as the Public Edition keeps them out of its family calendar
- Buncombe County Family Resource Directory, Public Edition (workbook checked 7 Nov 2026; `scripts/export-public-edition.py`, then `scripts/import-public-edition-resources.cjs`). 110 of its 169 resources matched rows already here: they filled 37 blank fields and added the Public Edition to `src`. Where it disagrees with a row, the row keeps its own value and `note` names both. The other 59 are new rows. They keep the Public Edition's "confirm current details" status: no `lv`, and "Not stated in the source" where it says nothing about language access
