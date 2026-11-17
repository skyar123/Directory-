/*
 * Holiday gift help, made clearer, 2026-11-16 (second pass).
 *
 * - The free in-person Christmas shop sign-up Skylar was sent today
 *   (signup.com, "registration only requires a name, email, and age") goes on
 *   Eblen's Saint Nicholas Project row. Eblen's own page says parents sign up
 *   online for an appointment from Monday, November 16, and the store opens
 *   for the 5 days before Christmas; this check could not open the signup.com
 *   page itself, so the row says how the link was matched.
 * - ABCCM: the row linked the sponsor (giving) page. Families apply as
 *   recipients through an ABCCM Crisis Ministry; new row for that.
 * - Holiday assistance rewritten as plain steps.
 * Sources: Eblen's Saint Nicholas Project page and Mountain Xpress (2024), WLOS
 * on ABCCM's Christmas Angel (2025), ABCCM's Christmas Angel Tree and Sponsors
 * pages, via web search 16 Nov 2026; the shared sign-up message. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { const s = JSON.stringify(v); if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 90)}`); return v; };
const WEB = "web search, 16 Nov 2026";
const LINK = "signup.com/mobileweb/2.0/vspot.html?activitykey=3603962089";
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(id); return r; };

const eb = get("eblen-saint-nicholas-project-christmas");
eb.w = LINK;
eb.h = "Sign-up opened Mon Nov 16, 2026; store open the 5 days before Christmas, by appointment";
eb.d = "A free toy store: parents shop in person for new toys for their children, birth through 18, at no cost. "
  + "SIGN UP NOW: online appointments opened Monday, November 16, 2026, and slots fill quickly. The sign-up link "
  + `(${LINK}) asks only for a name, email and each child's age. Eblen's page is `
  + "eblencharities.org/christmas-gift-assistance (its \"Sign Up to Shop\" button). For families in or near poverty "
  + "and Hurricane Helene survivors. In past years Eblen asked for proof of custody or guardianship when picking up "
  + "(for example the children's Social Security cards, Medicaid cards or passports), so tell families to bring one. "
  + "If slots are full, ask Eblen about a waiting list. Help a family sign up if they need it.";
eb.note = "The sign-up link was shared with Skylar on 16 Nov 2026 for a free in-person Christmas shop that opened that "
  + "day; it matches Eblen's own schedule, but the page could not be opened from here, so confirm the organizer when "
  + "you use it.";
eb.src = `${eb.src}; sign-up date and 5-day store from Eblen's Saint Nicholas page, pickup documents and waitlist from Mountain Xpress (2024), via ${WEB}; sign-up link and fields from a message shared with Skylar Belt, 16 Nov 2026`;
clean(eb);

if (list.some((r) => r.id === "abccm-christmas-angel")) throw new Error("exists");
list.push(clean({
  id: "abccm-christmas-angel", n: "ABCCM Christmas Angel: Christmas gifts for children (families apply)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.",
  ph: "828-259-5300 (ABCCM Crisis Ministry) / 828-259-5337 (Christmas Angel Shop, Arden)", em: "",
  w: "abccm.org/christmas-angel-tree/",
  d: "Parents and guardians with children at home apply through an ABCCM Crisis Ministry and make a Christmas wish list "
    + "for each child; sponsors buy the gifts and families pick them up from the Christmas Angel Shop. Children and "
    + "teens are included. In 2025 it took applications up to December 23 and served about 2,300 children. To apply, "
    + "call or visit a Crisis Ministry (Asheville office 828-259-5300). Note: abccm.org/christmas-angel-sponsors/ is "
    + "the page for people who want to GIVE, not for families.",
  a: "ABCCM Crisis Ministry offices (Asheville, Arden and others)", h: "Applications through December (2025: to Dec 23)",
  os: "Holiday help", t: "Free, Kids / 0-5", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:10a", "VIII:12a", "X:*", "X:12"],
  src: `ABCCM Christmas Angel Tree and Sponsors pages, WLOS (2025), via ${WEB}; Christmas Angel Shop phone from a directory listing`,
  note: "ABCCM's 2026 deadline was not published by 16 Nov 2026; ask when you call.", new: true,
}));

const ha = get("holiday-assistance");
ha.w = LINK;
ha.d = "Christmas gifts for children, 2026. Start here, in this order: "
  + "1) EBLEN SAINT NICHOLAS PROJECT, sign up now. Free in-person toy shop for children birth to 18, open the 5 days before "
  + `Christmas. Online sign-up opened November 16 and needs only a name, email and each child's age: ${LINK} (see the `
  + "Eblen Saint Nicholas row). Slots fill fast. "
  + "2) ABCCM CHRISTMAS ANGEL. Parents apply at an ABCCM Crisis Ministry (828-259-5300) and make a wish list for each "
  + "child; gifts are picked up at the Christmas Angel Shop (see the ABCCM Christmas Angel row). "
  + "3) WNC TOYS FOR TOTS. Families sign up through one local partner program, not with Toys for Tots itself (see that row). "
  + "4) Christmas Blessings Event, Saturday November 21, 10am-2pm, Maple Ridge Baptist, 133 Medford Branch Rd, Candler: "
  + "free toys, clothing and food, everyone welcome. "
  + "THANKSGIVING: Eblen's turkey giveaway is Friday, November 20, with advance sign-up (828-255-3066). "
  + "NOT A FIRST REFERRAL: the Salvation Army Angel Tree asks for photo ID, birth certificates or custody papers and proof "
  + "of income, and turns away families who asked anyone else for Christmas help.";
ha.note = "Updated 16 Nov 2026. Eblen sign-up is open now; ABCCM's 2026 deadline and Eblen's store address were not "
  + "published yet.";
ha.src = `${ha.src}; rewritten 16 Nov 2026 from Eblen's and ABCCM's pages via ${WEB} and the sign-up message shared with Skylar Belt`;
clean(ha);

res.file.meta.count = list.length;
res.file.meta.sources.push("Holiday sign-up update, 16 Nov 2026 (see scripts/apply-holiday-signup-2026-11-16.mjs)");
save(res);

const ev = load("events.json");
const add = { id: "eblen-saint-nicholas-signup-2026-11-16", date: "2026-11-16", end: "2026-12-18", kind: "signup",
  what: "Sign up now: Eblen Saint Nicholas Project free Christmas toy shop",
  detail: "Book a free in-person shopping appointment for children birth to 18. Needs only a name, email and each child's age. Slots fill fast.",
  tags: ["Free"], w: LINK, ph: "828-255-3066", rid: "eblen-saint-nicholas-project-christmas",
  note: "Bring proof of custody or guardianship when picking up (asked in past years).",
  src: `Eblen's Saint Nicholas page via ${WEB}; sign-up link shared with Skylar Belt, 16 Nov 2026` };
const prev = ev.file.events.findIndex((x) => x.id === add.id);
if (prev < 0) throw new Error("expected the earlier, unverified sign-up entry");
add.src = `${ev.file.events[prev].src}; confirmed by ${add.src}`;
ev.file.events[prev] = clean(add);
const st = ev.file.events.find((x) => x.id === "eblen-saint-nicholas-store-2026-12-17");
st.date = "2026-12-20"; st.end = "2026-12-24";
st.what = "Eblen Saint Nicholas Project toy store (about Dec 20 to 24)";
st.note = "Eblen says the store is open the 5 days before Christmas; exact 2026 days and address are not published. Families need a booked appointment.";
clean(st);
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026", what: "Holiday gift help made clear: Eblen sign-up link, ABCCM for families",
  detail: "Eblen's Saint Nicholas Project sign-up opened today: the row, Holiday assistance and a calendar entry carry the sign-up link (name, email and ages only). New ABCCM Christmas Angel row for families applying for gifts (the old link was the sponsor page). Holiday assistance rewritten as numbered steps.",
  source: "scripts/apply-holiday-signup-2026-11-16.mjs" }));
save(cl);
console.log("done", list.length);
