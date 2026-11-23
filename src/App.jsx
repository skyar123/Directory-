import { useState, useMemo, useRef, useEffect } from "react";
import {
  META, SECTIONS, SECBY, NEEDS, NEEDBY, BASE, MERGED, PEOPLE, PEOPLE_META,
  CRA, CRA_SECTIONS, CHANGELOG, FOOD, EVENTS, EVENTS_META, TODAY, norm, telHref, loadCalendar,
} from "./data.js";
import { useStore } from "./storage.js";
import { searchResources } from "./search.js";
import { buildIndex, queryStems, norm as fold } from "./shortlist.js";
import { arrange, soon, localToday, AGE_FILTERS, forAge } from "./events.js";
import { Chip } from "./components/bits.jsx";
import Icon, { Logo } from "./components/Icon.jsx";
import ResourceCard from "./components/ResourceCard.jsx";
import CraRow from "./components/CraRow.jsx";
import EventCard from "./components/EventCard.jsx";
import AskPanel from "./components/AskPanel.jsx";
import EventMonth from "./components/EventMonth.jsx";
import CalendarNotes from "./components/CalendarNotes.jsx";
import PlanView from "./components/PlanView.jsx";
import NeedStart from "./components/NeedStart.jsx";
import FilterSheet from "./components/FilterSheet.jsx";
import CrisisSheet from "./components/CrisisSheet.jsx";
import Home from "./components/Home.jsx";
import TodayView from "./components/TodayView.jsx";
import MoreView, { MORE_TITLE } from "./components/MoreView.jsx";
import { factsOf, FACETS, FACET_LABEL } from "./facets.js";

/* Four places, the same on a phone and a computer: the everyday tools,
   and More for the rest (research: 2 to 6 top-level choices). */
const TOP = [
  ["find", "Find", "search"],
  ["today", "Today", "calendar"],
  ["plan", "Plan", "clipboard"],
  ["more", "More", "grid"],
];
/* where each other view lives, for the highlighted tab and the back link */
const PARENT = {
  resource: "find", ask: "find", food: "today", events: "today",
  sniff: "more", assessment: "more", changed: "more", gaps: "more", people: "more", data: "more",
};
const TITLE = { ...MORE_TITLE, food: "Food by day", events: "All events", resource: "Program", ask: "Ask AI" };
const ALL_VIEWS = ["find", "today", "plan", "more", ...Object.keys(PARENT)];
const FACET_KEYS = FACETS.map(([k]) => k);

/* The address bar holds where you are, so Back steps back through searches
   and a program or a search can be shared: #/find?q=food&f=free,today&sec=VIII,
   #/r/<id>, #/today. */
export function parseHash(hash) {
  const h = String(hash || "").replace(/^#\/?/, "");
  const [path, qs] = h.split("?");
  const p = new URLSearchParams(qs || "");
  const [v, id] = path.split("/");
  const view = v === "r" ? "resource" : ALL_VIEWS.includes(v) ? v : "find";
  return {
    view, id: v === "r" ? decodeURIComponent(id || "") : "",
    q: p.get("q") || "", sec: p.get("sec") || "", gaps: p.get("gaps") === "1",
    f: (p.get("f") || "").split(",").filter((k) => FACET_KEYS.includes(k)),
  };
}
export function buildHash({ view, id, q, sec, gaps, f }) {
  if (view === "resource") return "#/r/" + encodeURIComponent(id || "");
  if (view !== "find") return "#/" + view;
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (f.length) p.set("f", f.join(","));
  if (sec) p.set("sec", sec);
  if (gaps) p.set("gaps", "1");
  const qs = p.toString();
  return "#/find" + (qs ? "?" + qs : "");
}

/* "RESPONSIVE? is the column that matters", per the file's own note */
const RESP = {
  "⚡ Very responsive": ["Very responsive", "resp-fast"],
  "👍 Responsive": ["Responsive", "resp-ok"],
  "⚪ Not tried yet": ["Not tried yet", "resp-none"],
};

const EVENT_KINDS = [["all", "Everything"], ["event", "Events"], ["due", "Deadlines and sign-ups"]];
function RespBadge({ value }) {
  if (!value) return <span className="badge resp-unknown">Responsiveness unknown</span>;
  const [label, cls] = RESP[value] || [value.replace(/^[^\w]+/, ""), "resp-ok"];
  return <span className={"badge " + cls}>{label}</span>;
}

export default function App() {
  const { state, setState, ready, saving, clear } = useStore();
  const start = useMemo(() => parseHash(typeof window === "undefined" ? "" : window.location.hash), []);
  const [view, setView] = useState(start.view);
  const [q, setQ] = useState(start.q);
  const [secFilter, setSecFilter] = useState(start.sec);
  const [onlyGaps, setOnlyGaps] = useState(start.gaps);
  /* the Filter panel's choices, and the program shown on its own page */
  const [facets, setFacets] = useState(start.f);
  const [pageId, setPageId] = useState(start.id);
  const [filterOpen, setFilterOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  /* result groups opened past their first few ("See all 23") */
  const [moreOf, setMoreOf] = useState([]);
  const [openId, setOpenId] = useState("");
  const [openNeed, setOpenNeed] = useState("");
  const [craSec, setCraSec] = useState("I");
  const [foodDay, setFoodDay] = useState(FOOD.days[0].day);
  const [evKind, setEvKind] = useState("all");
  const [evAge, setEvAge] = useState("any");
  const [evOrg, setEvOrg] = useState("");
  const [evQ, setEvQ] = useState("");
  /* the home screen shows the need tiles; the full list waits for a search, a section or this */
  const [browseAll, setBrowseAll] = useState(false);
  const [cal, setCal] = useState(null);
  const [ask, setAsk] = useState({ text: "", n: 0 });

  /* Ask AI opens with whatever is in the search box, or with pasted text;
     the counter gives the panel a fresh start each time it is opened */
  const openAsk = (text) => {
    setAsk((a) => ({ text, n: a.n + 1 }));
    setView("ask");
    window.scrollTo(0, 0);
  };
  const [toast, setToast] = useState("");
  const tabsRef = useRef(null);

  /* a need tapped in an Ask AI answer opens its SNIFF question, with
     everything the directory files under it */
  const needScroll = useRef("");
  const showNeed = (key) => {
    needScroll.current = key;
    setOpenNeed(key);
    setView("sniff");
  };
  useEffect(() => {
    if (view !== "sniff" || !needScroll.current) return;
    const el = document.getElementById("need-" + needScroll.current);
    needScroll.current = "";
    if (el) el.scrollIntoView({ block: "start" });
  }, [view, openNeed]);

  useEffect(() => {
    const el = tabsRef.current?.querySelector(".tab-on");
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [view]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  /* the Public Edition calendar, fetched once, the first time it is needed */
  useEffect(() => {
    if (cal || !["events", "ask", "today", "find"].includes(view)) return undefined;
    let live = true;
    loadCalendar()
      .then((c) => live && setCal(c))
      .catch(() => live && setCal({ failed: true, events: [], series: [], watch: [], calendars: [] }));
    return () => { live = false; };
  }, [view, cal]);

  const resources = useMemo(() => {
    const all = [...BASE, ...(state.added || [])];
    /* edits saved under a merged-away id carry over to the kept row */
    const edits = { ...state.edits };
    for (const [old, kept] of Object.entries(MERGED)) if (edits[old] && !edits[kept]) edits[kept] = edits[old];
    return all.map((r) => (edits[r.id] ? { ...r, ...edits[r.id] } : r));
  }, [state]);

  const terms = useMemo(() => norm(q).split(" ").filter(Boolean), [q]);

  /* the same search engine Ask AI uses on the server, built once per change */
  const index = useMemo(() => buildIndex(resources, NEEDS), [resources]);
  const home = !q.trim() && !secFilter && !onlyGaps && !facets.length;
  /* each program's filter facts, worked out once a day */
  const dayKey = new Date().toDateString();
  const facts = useMemo(() => {
    const d = new Date();
    return new Map(resources.map((r) => [r.id, factsOf(r, d)]));
  }, [resources, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  /* the search and the gaps switch; the section and the Filter panel's
     choices come after, so each choice can say how many it would leave */
  const searched = useMemo(() => {
    const list = searchResources(resources, q, index.rank)
      .filter((x) => !onlyGaps || !x.r.phone || !x.r.web || !x.r.verified);
    list.sort((a, b) =>
      b.s - a.s
      || (b.r.startHere ? 1 : 0) - (a.r.startHere ? 1 : 0)
      || a.r.name.localeCompare(b.r.name));
    return list.map((x) => x.r);
  }, [resources, q, index, onlyGaps]);
  const inSec = (r, sec) => !sec || r.sec === sec || (r.secs || []).includes(sec);
  const passes = (r, fs) => fs.every((k) => facts.get(r.id)?.[k]);
  const results = useMemo(() => searched.filter((r) => inSec(r, secFilter) && passes(r, facets)),
    [searched, secFilter, facets, facts]); // eslint-disable-line react-hooks/exhaustive-deps
  const facetCounts = useMemo(() => {
    const base = searched.filter((r) => inSec(r, secFilter));
    return Object.fromEntries(FACET_KEYS.map((k) => [k,
      base.filter((r) => passes(r, facets.includes(k) ? facets : [...facets, k])).length]));
  }, [searched, secFilter, facets, facts]); // eslint-disable-line react-hooks/exhaustive-deps
  const secCounts = useMemo(() => {
    const base = searched.filter((r) => passes(r, facets));
    return Object.fromEntries(SECTIONS.map((sct) => [sct.id, base.filter((r) => inSec(r, sct.id)).length]));
  }, [searched, facets, facts]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleFacet = (k) => setFacets((fs) => (fs.includes(k) ? fs.filter((x) => x !== k) : [...fs, k]));
  const clearFilters = () => { setFacets([]); setSecFilter(""); setOnlyGaps(false); };

  /* A broad search is grouped by the SNIFF needs it raises ("Food pantry 23,
     see all"), each need's best few first, so it is not one long scroll. A
     name, a phone number or a narrow search stays one list. */
  const groups = useMemo(() => {
    if (!q.trim() || secFilter || results.length <= 12) return null;
    const keys = (index(q).needs || []).filter((k) => /^(I|II|III|IV|V|VI|VII|VIII|IX|X):/.test(k) && NEEDBY[k]);
    if (!keys.length) return null;
    const taken = new Set();
    const out = keys.map((k) => {
      const items = results.filter((r) => !taken.has(r.id) && r.needs.includes(k));
      items.forEach((r) => taken.add(r.id));
      return { key: k, label: NEEDBY[k].label, items };
    }).filter((g) => g.items.length);
    const rest = results.filter((r) => !taken.has(r.id));
    if (rest.length) out.push({ key: "other", label: "Other matches", items: rest });
    return out.length > 1 ? out : null;
  }, [q, secFilter, results, index]);
  useEffect(() => { setMoreOf([]); }, [q, secFilter, facets]);

  /* saved programs and recently opened ones, kept in this browser */
  const stars = state.stars || [];
  const recent = state.recent || [];
  const toggleStar = (id) => setState({ ...state, stars: stars.includes(id) ? stars.filter((x) => x !== id) : [id, ...stars] });
  const noteRecent = (id) => {
    if (recent[0] === id) return;
    setState({ ...state, recent: [id, ...recent.filter((x) => x !== id)].slice(0, 8) });
  };

  /* keep the address bar in step: a new place is a new history entry (so Back
     returns to it); typing in the search box only updates the current one */
  const route = { view, id: pageId, q, sec: secFilter, gaps: onlyGaps, f: facets };
  const fromHistory = useRef(false);
  const lastRoute = useRef(route);
  useEffect(() => {
    const h = buildHash(route);
    const prev = lastRoute.current;
    lastRoute.current = route;
    if (fromHistory.current) { fromHistory.current = false; return; }
    if (h === window.location.hash) return;
    const onlyTyping = prev.view === route.view && prev.id === route.id && prev.sec === route.sec
      && prev.gaps === route.gaps && prev.f.join() === route.f.join();
    if (onlyTyping) { window.history.replaceState(window.history.state, "", h); return; }
    window.history.replaceState({ ...(window.history.state || {}), y: window.scrollY }, "", window.location.hash || "#/find");
    window.history.pushState({ y: 0 }, "", h);
  }, [view, pageId, q, secFilter, onlyGaps, facets.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onPop = (e) => {
      const r = parseHash(window.location.hash);
      if (buildHash(r) !== buildHash(lastRoute.current)) fromHistory.current = true;
      setView(r.view); setPageId(r.id); setQ(r.q); setSecFilter(r.sec); setOnlyGaps(r.gaps); setFacets(r.f);
      setFilterOpen(false);
      const y = (e.state && e.state.y) || 0;
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  /* go somewhere new, at the top of the page */
  const go = (v) => { setView(v); setFilterOpen(false); window.scrollTo(0, 0); };
  const openPage = (id) => { setPageId(id); noteRecent(id); go("resource"); };

  const edit = (id, key, value) => {
    const prev = state.edits[id] || {};
    setState({
      ...state,
      edits: { ...state.edits, [id]: { ...prev, [key]: value } },
      log: [{ t: new Date().toISOString(), id, key }, ...(state.log || [])].slice(0, 400),
    });
  };

  const verify = (id) => {
    const prev = state.edits[id] || {};
    setState({
      ...state,
      edits: { ...state.edits, [id]: { ...prev, verified: TODAY, verifiedBy: "SB" } },
      log: [{ t: new Date().toISOString(), id, key: "verified" }, ...(state.log || [])].slice(0, 400),
    });
    say("Marked verified " + TODAY);
  };

  const craEntry = (id) => (state.cra || {})[id] || {};
  const setCra = (id, entry) => setState({ ...state, cra: { ...(state.cra || {}), [id]: entry } });

  const copyText = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); say(msg); }
    catch (e) { say("Copy blocked by the browser. Select the text instead."); }
  };

  /* The visit plan: a few resources and dated events for one family, kept in
     this browser only. A resource is kept by id; an event keeps its own facts,
     because calendar listings load only when the Events tab opens. */
  const plan = state.plan || { items: [], asks: [] };
  const inPlan = (t, id) => plan.items.some((x) => x.t === t && x.id === id);
  const setPlan = (next) => setState({ ...state, plan: { ...plan, ...next } });
  const removeFromPlan = (t, id) => setPlan({ items: plan.items.filter((x) => !(x.t === t && x.id === id)) });
  const togglePlanResource = (r) => {
    if (inPlan("r", r.id)) { removeFromPlan("r", r.id); say("Removed from the visit plan"); return; }
    setPlan({ items: [...plan.items, { t: "r", id: r.id }] });
    say("Added to the visit plan");
  };
  const togglePlanEvent = (e) => {
    if (inPlan("e", e.id)) { removeFromPlan("e", e.id); say("Removed from the visit plan"); return; }
    const { id, what, date, end, time, where, w, ph } = e;
    setPlan({ items: [...plan.items, { t: "e", id, what, date, end, time, where, w, ph }] });
    say("Added to the visit plan");
  };
  const toggleAsk = (a) => setPlan({ asks: plan.asks.includes(a) ? plan.asks.filter((x) => x !== a) : [...plan.asks, a] });

  /* a need tapped on the Find view's start panel */
  const goNeed = (go) => { /* eslint-disable-line no-shadow */
    if (go.food) {
      setView("today");
    } else if (go.need) {
      showNeed(go.need);
    } else if (go.q) {
      setQ(go.q); setSecFilter(""); setOnlyGaps(false); setView("find");
    }
    window.scrollTo(0, 0);
  };

  const copyCraRow = (row, confirmed, entry) => {
    const agencies = confirmed
      .map((r) => [r.name, r.address, r.email, r.phone].filter(Boolean).join(", "))
      .join("\n") || "GAP: nothing found in the WNC directory";
    copyText(
      [row.section + "." + row.num + " " + row.label, agencies, entry.pop || "",
        entry.collab || "Unknown", entry.rel || "Unknown"].join("\t"),
      "Row copied. Paste into the Word table."
    );
  };

  const download = (name, text, type) => {
    const blob = new Blob([text], { type: type || "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    say("Downloaded " + name);
  };

  /* exports write the same shape data/ holds, so a download can be committed
     straight back over the file it came from */
  const exportJson = () => download("resources.json", JSON.stringify({
    meta: { ...META, exported: new Date().toISOString(), count: resources.length },
    /* data/resources.json keeps its own copy of the sniff.json taxonomy; write
       it back so committing an export over the file does not delete it */
    sections: SECTIONS.map(({ id, name, hue }) => ({ id, name, hue })),
    needs: NEEDS,
    resources: resources.map((r) => ({
      id: r.id, n: r.name, pp: r.point, sp: r.spanish, spd: r.spanishDetail,
      ph: r.phone, em: r.email, w: r.web, d: r.detail, a: r.address, h: r.hours,
      os: r.origSection, t: r.tags, lv: r.verified, vb: r.verifiedBy,
      sec: r.sec, needs: r.needs, src: r.source, note: r.note, new: r.isNew,
      /* data/ has these keys only on flagged rows. They drive the "Start
         here" and "Read the note first" badges, which an export must keep */
      ...(r.startHere && { start: true }),
      ...(r.readFirst && { readFirst: true }),
      ...(r.backup && { alt: r.backup }),
      ...(r.secs && r.secs.length > 1 && { secs: r.secs }),
    })),
  }, null, 1) + "\n"); /* data/resources.json ends with a newline too */

  const exportCra = () => download("community-resource-assessment.json", JSON.stringify({
    meta: {
      form: "Community_Resource_Assessment_Form_2.docx (Child First, Dec 2015)",
      exported: new Date().toISOString(),
    },
    sections: CRA_SECTIONS.map(({ id, name, band }) => ({ id, name, band })),
    rows: CRA.map((row) => {
      const e = craEntry(row.id);
      const conf = resources.filter((r) => (e.attach || []).includes(r.id));
      return {
        id: row.id, label: row.label,
        agencies: conf.map((r) => ({
          name: r.name, address: r.address, email: r.email, phone: r.phone, web: r.web,
        })),
        targetPopulations: e.pop || "",
        collaborativeMember: e.collab || "Unknown",
        existingRelationship: e.rel || "Unknown",
        gap: conf.length === 0,
      };
    }),
  }, null, 1));

  const exportPeople = () => download("point-people.json", JSON.stringify({
    meta: {
      ...PEOPLE_META, exported: new Date().toISOString(), count: PEOPLE.length,
      internalUseOnly: true,
      handling: "Contains the Child First team's personal addresses. Internal use only.",
    },
    people: PEOPLE,
  }, null, 1));

  const exportCsv = () => {
    const cols = ["id", "name", "sec", "origSection", "point", "phone", "email", "web",
      "address", "hours", "spanish", "verified", "verifiedBy", "tags", "detail", "backup", "source", "note"];
    const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const rows = [cols.join(",")].concat(resources.map((r) => cols.map((c) => esc(r[c])).join(",")));
    download("resources.csv", rows.join("\n"), "text/csv");
  };

  const coverage = useMemo(() => {
    const map = {};
    for (const row of CRA) {
      const e = (state.cra || {})[row.id] || {};
      map[row.id] = { conf: (e.attach || []).length, filled: !!(e.pop || e.collab || e.rel) };
    }
    return map;
  }, [state]);

  const gapStats = useMemo(() => {
    const g = { phone: 0, web: 0, address: 0, hours: 0, point: 0, unverified: 0 };
    for (const r of resources) {
      if (!r.phone) g.phone++;
      if (!r.web) g.web++;
      if (!r.address) g.address++;
      if (!r.hours) g.hours++;
      if (!r.point) g.point++;
      if (!r.verified) g.unverified++;
    }
    return g;
  }, [resources]);

  const needsBySection = useMemo(() => {
    const m = {};
    for (const n of NEEDS) (m[n.section] = m[n.section] || []).push(n);
    return m;
  }, []);

  const deadEnds = CHANGELOG.groups.find((g) => g.id === "dead-ends");

  /* not memoised: the date has to be read on every render, or a tab left
     open overnight would keep calling yesterday's events "Today" */
  const evToday = localToday();
  const allEvents = useMemo(() => (cal ? EVENTS.concat(cal.events) : EVENTS), [cal]);
  /* accents folded and word stems matched, so "markets" finds "market",
     "storytimes" finds "Story Time" and "espanol" finds "Español" */
  const joinWords = (t) => t.replace(/\b(story|play|day|child) (time|group|date|care)s?\b/g, "$1$2");
  const evIndex = useMemo(() => new Map(allEvents.map((e) => [e.id,
    joinWords(fold([e.what, e.where, e.org, e.detail, (e.tags || []).join(" ")].join(" ")))])), [allEvents]);
  /* "events" and "things to do" describe the whole tab, so they filter nothing */
  const evTerms = queryStems(joinWords(fold(evQ))).filter((t) => !["event", "happen", "activit", "thing"].includes(t));
  const kindOk = (e, k) => k === "all" || (k === "due") === (e.kind !== "event");
  /* every filter but the one being counted, so each chip says what tapping it would show */
  const evMatch = (e, skip) =>
    (skip === "kind" || kindOk(e, evKind)) &&
    (skip === "age" || forAge(e, evAge)) &&
    (!evOrg || (evOrg === "team" ? !e.status : e.org === evOrg)) &&
    evTerms.every((t) => evIndex.get(e.id).includes(t));
  const evUpcoming = allEvents.filter((e) => (e.end || e.date) >= evToday);
  const evCounts = Object.fromEntries(EVENT_KINDS.map(([k]) => [k,
    evUpcoming.filter((e) => evMatch(e, "kind") && kindOk(e, k)).length]));
  const evAgeCounts = Object.fromEntries(AGE_FILTERS.map(([k]) => [k,
    evUpcoming.filter((e) => evMatch(e, "age") && forAge(e, k)).length]));
  const evOrgs = Object.entries(evUpcoming.reduce((m, e) => {
    if (e.org) m[e.org] = (m[e.org] || 0) + 1;
    return m;
  }, {})).sort((a, b) => b[1] - a[1]);
  const evFiltered = evKind !== "all" || evAge !== "any" || !!evOrg || !!evTerms.length;
  const evPlan = arrange(allEvents.filter((e) => evMatch(e)), evToday);
  /* a past calendar listing is just yesterday's story time; only the team's
     own picks are worth keeping under "Already happened" */
  const evPast = evPlan.past.filter((e) => !e.status);
  const evShown = evPlan.months.reduce((n, m) => n + m.items.length, 0);
  const evSig = [evKind, evAge, evOrg, evTerms.join(" ")].join("|");
  const resById = useMemo(() => {
    const m = new Map(resources.map((r) => [r.id, r]));
    for (const [old, kept] of Object.entries(MERGED)) if (!m.has(old) && m.has(kept)) m.set(old, m.get(kept));
    return m;
  }, [resources]);

  /* an event's "Open in the directory": the resource it links, found and
     opened in the Find view with nothing else filtering it out */
  const openResource = (r) => {
    if (r) openPage(r.id);
  };

  /* a program card in a result list: opening it also counts as recently opened */
  const card = (r) => (
    <ResourceCard key={r.id} r={r} open={openId === r.id} showGaps={onlyGaps} today={facts.get(r.id)?.today}
      onToggle={() => { if (openId !== r.id) noteRecent(r.id); setOpenId(openId === r.id ? "" : r.id); }}
      onEdit={(k, v) => edit(r.id, k, v)} onVerify={() => verify(r.id)} onCopy={copyText}
      inPlan={inPlan("r", r.id)} onPlan={() => togglePlanResource(r)}
      starred={stars.includes(r.id)} onStar={() => toggleStar(r.id)} onPage={() => openPage(r.id)} />
  );
  const todayCount = useMemo(() => [...facts.values()].filter((f) => f.today).length, [facts]);
  /* the next seven days of events, for Today */
  const weekEnd = (() => { const d = new Date(evToday + "T12:00:00"); d.setDate(d.getDate() + 6); return d.toISOString().slice(0, 10); })();
  const weekEvents = allEvents.filter((e) => e.date <= weekEnd && (e.end || e.date) >= evToday)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  /* how many each need tile on Find leads to */
  const tileCount = (g) => {
    if (g.food) { const t = new Date().toLocaleDateString("en-US", { weekday: "long" }); return FOOD.days.find((d) => d.day === t)?.sites.length || 0; }
    if (g.need) return resources.filter((r) => r.needs.includes(g.need)).length;
    if (g.q) return index.rank(g.q).size;
    return 0;
  };

  return (
    <div className="wnc">
      <header className="top">
        <div className="brand">
          <button className="crisis-btn" onClick={() => setCrisisOpen(true)} aria-haspopup="dialog">Crisis lines</button>
          <span className="mark"><Logo /></span>
          <div>
            <h1>WNC Family Resource Directory <span className="internal-tag">Internal use only</span></h1>
            <p>
              {resources.length} resources, in the order the SNIFF asks.{" "}
              {saving && <em>{saving}</em>}
            </p>
          </div>
        </div>
        <div className="searchbar">
          <div className="search-field">
            <Icon name="search" className="search-ic" size={16} />
            <input value={q} onChange={(e) => { setQ(e.target.value); if (view !== "find") setView("find"); }}
              onPaste={(e) => {
                /* a pasted case or SNIFF is a question for Ask AI, and a
                   one-line search box would flatten its line breaks */
                const t = e.clipboardData.getData("text");
                if (/\n/.test(t.trim()) || t.length > 160) { e.preventDefault(); openAsk(t); }
              }}
              placeholder="Search: diapers, autism eval, rent, interpreter, Black Mountain"
              aria-label="Search resources" />
            {q && <button className="clear" onClick={() => setQ("")} aria-label="Clear search">×</button>}
          </div>
          <button className={"ask-btn" + (view === "ask" ? " ask-on" : "")}
            onClick={() => (view === "ask" ? window.scrollTo(0, 0) : openAsk(q))}
            title="Ask a question, describe a situation, or paste a SNIFF">
            <Icon name="spark" size={15} />Ask AI
          </button>
        </div>
        <nav className="tabs" ref={tabsRef} aria-label="Main">
          {TOP.map(([id, label]) => {
            const on = view === id || PARENT[view] === id;
            return (
              <button key={id} className={"tab" + (on ? " tab-on" : "")} onClick={() => go(id)}
                aria-current={on ? "page" : undefined}>
                {label}{id === "plan" && plan.items.length ? ` (${plan.items.length})` : ""}
              </button>
            );
          })}
        </nav>
      </header>

      {/* phones: the same four places along the bottom */}
      <nav className="bottom-nav" aria-label="Main">
        {TOP.map(([id, label, icon]) => {
          const on = view === id || PARENT[view] === id;
          return (
            <button key={id} className={"bn" + (on ? " bn-on" : "")} aria-current={on ? "page" : undefined}
              onClick={() => go(id)}>
              <Icon name={icon} size={20} />
              <span>{label}{id === "plan" && plan.items.length ? ` (${plan.items.length})` : ""}</span>
            </button>
          );
        })}
      </nav>

      {/* where you are, and the way back up, for anything below the four places */}
      {PARENT[view] && view !== "ask" && (
        <nav className="crumbs" aria-label="You are here">
          <button className="linkish" onClick={() => (view === "resource" && window.history.length > 1 ? window.history.back() : go(PARENT[view]))}>
            ‹ {view === "resource" ? "Back" : TOP.find(([id]) => id === PARENT[view])[1]}
          </button>
          <span aria-current="page">{view === "resource" ? (resById.get(pageId)?.name || "Program") : TITLE[view]}</span>
        </nav>
      )}

      {!ready && <p className="loading">Opening your saved edits</p>}

      {view === "find" && (
        <section className="pane find">
          {home && (
            <Home date={new Date()} today={evToday} resById={resById} foodToday={tileCount({ food: true })} weekEvents={weekEvents}
              eventsLoading={!cal} planCount={plan.items.length} onGo={goNeed} countOf={tileCount} go={go}
              openPage={openPage} onEvent={(e) => { setEvQ(e.what); go("events"); }}
              mine={(<>
            {(!!stars.length || !!recent.length) && (
            <div className="mine">
              {[["Saved", stars], ["Recently opened", recent]].filter(([, ids]) => ids.length).map(([label, ids]) => (
                <div key={label} className="mine-row">
                  <h2 className="mine-title">{label}</h2>
                  <div className="mine-list">
                    {ids.map((id) => resById.get(id)).filter(Boolean).slice(0, 8).map((r) => (
                      <button key={r.id} className="mine-item" onClick={() => openPage(r.id)}>{r.name}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
              </>)} />
          )}
          {home && <h2 className="browse-title">Browse the whole directory</h2>}

          <div className="find-tools">
            <button className={"btn filter-btn" + (facets.length || secFilter || onlyGaps ? " on" : "")}
              onClick={() => setFilterOpen(true)} aria-haspopup="dialog">
              <Icon name="grid" size={15} />Filters
              {(facets.length + (secFilter ? 1 : 0) + (onlyGaps ? 1 : 0)) > 0
                && <span className="filter-n">{facets.length + (secFilter ? 1 : 0) + (onlyGaps ? 1 : 0)}</span>}
            </button>
            {[["today", "Open today"], ["free", "Free"], ["spanish", "Spanish"]].map(([k, label]) => (
              <Chip key={k} active={facets.includes(k)} onClick={() => toggleFacet(k)}>{label}</Chip>
            ))}
          </div>
          {(facets.length > 0 || secFilter || onlyGaps) && (
            <div className="active-filters" aria-label="Filters on">
              {facets.map((k) => (
                <button key={k} className="af" onClick={() => toggleFacet(k)} aria-label={"Remove " + FACET_LABEL[k]}>
                  {FACET_LABEL[k]} <span aria-hidden="true">×</span>
                </button>
              ))}
              {secFilter && (
                <button className="af" onClick={() => setSecFilter("")}>
                  {secFilter}. {SECBY[secFilter]?.name} <span aria-hidden="true">×</span>
                </button>
              )}
              {onlyGaps && <button className="af" onClick={() => setOnlyGaps(false)}>Needs work only <span aria-hidden="true">×</span></button>}
              <button className="linkish" onClick={clearFilters}>Clear all</button>
            </div>
          )}

          {home && !browseAll ? (
            <button className="btn browse-all" onClick={() => setBrowseAll(true)}>
              Show all {resources.length} resources
            </button>
          ) : (<>
          <p className="count">{results.length} {results.length === 1 ? "result" : "results"}</p>
          {terms.length >= 4 && (
            <button className="ask-hint" onClick={() => openAsk(q)}>
              <Icon name="spark" size={14} />Ask AI about “{q.trim()}”
            </button>
          )}
          {groups ? groups.map((g) => {
            const all = moreOf.includes(g.key);
            const shown = all ? g.items : g.items.slice(0, 4);
            return (
              <div key={g.key} className="result-group">
                <h2 className="group-title">{g.label} <span className="need-n">{g.items.length}</span></h2>
                <div className="cards">{shown.map(card)}</div>
                {g.items.length > shown.length && (
                  <button className="btn see-all" onClick={() => setMoreOf((m) => [...m, g.key])}>
                    See all {g.items.length} for {g.label.toLowerCase()}
                  </button>
                )}
              </div>
            );
          }) : (
            <div className="cards">{results.slice(0, 260).map(card)}</div>
          )}
          {!groups && results.length > 260 && (
            <p className="count">Showing the first 260. Keep typing or add a filter to narrow it down.</p>
          )}
          {!results.length && (
            <p className="empty">
              Nothing matches{facets.length || secFilter || onlyGaps ? " with these filters" : ""}.
              {(facets.length > 0 || secFilter || onlyGaps) && <> <button className="linkish" onClick={clearFilters}>Clear the filters</button></>}
              {" "}Or <button className="linkish" onClick={() => openAsk(q)}>ask Ask AI</button>.
            </p>
          )}
          </>)}
          <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} facets={facets} toggle={toggleFacet}
            counts={facetCounts} total={results.length} sections={SECTIONS} sec={secFilter} setSec={setSecFilter}
            secCounts={secCounts} gaps={onlyGaps} setGaps={setOnlyGaps} onClear={clearFilters} />
        </section>
      )}

      {view === "today" && (
        <TodayView date={new Date()} openCount={todayCount}
          onOpenToday={() => { setQ(""); setSecFilter(""); setOnlyGaps(false); setFacets(["today"]); setBrowseAll(true); go("find"); }}
          onWeek={() => {
            const t = new Date().toLocaleDateString("en-US", { weekday: "long" });
            if (FOOD.days.some((d) => d.day === t)) setFoodDay(t);
            go("food");
          }}
          onEvents={() => go("events")} events={weekEvents} eventsLoading={!cal}
          renderEvent={(e) => (
            <EventCard key={e.id} e={e} soon={soon(e, evToday)} resource={resById.get(e.rid)}
              onOpen={() => openResource(resById.get(e.rid))}
              inPlan={inPlan("e", e.id)} onPlan={() => togglePlanEvent(e)} />
          )} />
      )}

      {view === "more" && <MoreView go={go} />}

      {view === "resource" && (
        <section className="pane resource-page">
          {resById.get(pageId) ? (
            <>
              <ResourceCard r={resById.get(pageId)} page open today={facts.get(resById.get(pageId).id)?.today}
                starred={stars.includes(resById.get(pageId).id)} onStar={() => toggleStar(resById.get(pageId).id)}
                onEdit={(k, v) => edit(resById.get(pageId).id, k, v)} onVerify={() => verify(resById.get(pageId).id)}
                onCopy={copyText} inPlan={inPlan("r", resById.get(pageId).id)}
                onPlan={() => togglePlanResource(resById.get(pageId))} onToggle={() => {}} />
              <div className="row-btns">
                <button className="btn" onClick={() => copyText(window.location.href, "Link copied. It opens this program for anyone on the team.")}>
                  Copy a link to this page
                </button>
              </div>
            </>
          ) : (
            <p className="empty">That program is not in the directory any more. <button className="linkish" onClick={() => go("find")}>Go to Find</button></p>
          )}
        </section>
      )}

      {view === "plan" && (
        <PlanView plan={plan} resById={resById} onRemove={removeFromPlan} onToggleAsk={toggleAsk}
          onClear={() => setPlan({ items: [], asks: [] })} copyText={copyText}
          onFind={() => { setQ(""); setView("find"); }} onEvents={() => setView("events")} />
      )}

      {view === "ask" && (
        <AskPanel key={ask.n} initialText={ask.text} resources={resources} needBy={NEEDBY}
          events={allEvents} eventsLoading={!cal} copyText={copyText} onClose={() => setView("find")}
          onShowNeed={showNeed} onFoodDay={() => goNeed({ food: true })}
          renderResource={(r) => (
            <ResourceCard r={r} open={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? "" : r.id)}
              onEdit={(k, v) => edit(r.id, k, v)} onVerify={() => verify(r.id)} onCopy={copyText}
                inPlan={inPlan("r", r.id)} onPlan={() => togglePlanResource(r)} />
          )}
          renderEvent={(e) => (
            <EventCard e={e} soon={soon(e, evToday)} resource={resById.get(e.rid)}
              onOpen={() => openResource(resById.get(e.rid))}
              inPlan={inPlan("e", e.id)} onPlan={() => togglePlanEvent(e)} />
          )} />
      )}

      {view === "sniff" && (
        <section className="pane">
          <p className="lede">
            The same order the SNIFF asks its questions. Tap a question to see what answers it.
          </p>
          {SECTIONS.filter((s) => needsBySection[s.id]).map((s) => (
            <div key={s.id} className="need-block">
              <h2>
                <span className="dot" style={{ background: s.deep }} />
                {s.id}. {s.name}
                <span className="need-n">{needsBySection[s.id].length} questions</span>
              </h2>
              {needsBySection[s.id].map((n) => {
                const hits = resources.filter((r) => r.needs.includes(n.key));
                const isOpen = openNeed === n.key;
                return (
                  <div key={n.key} className="need" id={"need-" + n.key}>
                    <button className="need-head" onClick={() => setOpenNeed(isOpen ? "" : n.key)}
                      aria-expanded={isOpen ? "true" : "false"}>
                      <span className="need-code">{n.code}</span>
                      <span className="need-label">{n.label}</span>
                      <span className="need-n">{hits.length}</span>
                    </button>
                    {isOpen && (
                      <div className="cards inset">
                        {hits.map((r) => (
                          <ResourceCard key={r.id} r={r} open={openId === r.id}
                            onToggle={() => setOpenId(openId === r.id ? "" : r.id)}
                            onEdit={(k, v) => edit(r.id, k, v)} onVerify={() => verify(r.id)} onCopy={copyText}
                inPlan={inPlan("r", r.id)} onPlan={() => togglePlanResource(r)} />
                        ))}
                        {!hits.length && <p className="empty">Nothing filed under this question yet.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      )}

      {view === "assessment" && (
        <section className="pane">
          <p className="lede">
            The {CRA.length} rows of the Child First Community Resource Assessment. The summary below
            counts the rows you have filled in each section. The rest are gaps in the service system here.
          </p>

          <div className="coverage">
            {CRA_SECTIONS.map((cs) => (
              <div key={cs.id} className="cov-band">
                <button className="cov-label" onClick={() => setCraSec(cs.id)}>
                  <span className="dot" style={{ background: cs.deep }} />
                  {cs.id}. {cs.name}
                  <span className="cov-count">
                    {CRA.filter((r) => r.section === cs.id && coverage[r.id].conf > 0).length}
                    {" of "}
                    {CRA.filter((r) => r.section === cs.id).length}
                  </span>
                </button>
                <div className="cov-tiles">
                  {CRA.filter((r) => r.section === cs.id).map((r) => {
                    const c = coverage[r.id];
                    return (
                      <button key={r.id} className={c.conf > 0 ? "tile full" : "tile none"}
                        title={r.section + "." + r.num + " " + r.label}
                        style={c.conf > 0 ? { background: cs.deep } : undefined}
                        onClick={() => setCraSec(cs.id)}>
                        {r.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="filters">
            {CRA_SECTIONS.map((cs) => (
              <Chip key={cs.id} dot={cs.deep} active={craSec === cs.id}
                onClick={() => setCraSec(cs.id)}>
                {cs.id}. {cs.name}
              </Chip>
            ))}
          </div>

          <div className="row-btns">
            <button className="btn" onClick={() => {
              const rows = CRA.filter((r) => r.section === craSec).map((row) => {
                const e = craEntry(row.id);
                const conf = resources.filter((r) => (e.attach || []).includes(r.id));
                const ag = conf
                  .map((r) => [r.name, r.address, r.email, r.phone].filter(Boolean).join(", "))
                  .join(" | ") || "GAP";
                return [row.section + "." + row.num + " " + row.label, ag, e.pop || "",
                  e.collab || "Unknown", e.rel || "Unknown"].join("\t");
              });
              copyText(rows.join("\n"), "Section copied. Paste into the Word table.");
            }}>Copy the whole {craSec} section</button>
          </div>

          {CRA.filter((r) => r.section === craSec).map((row) => (
            <CraRow key={row.id} row={row} resources={resources} entry={craEntry(row.id)}
              onEntry={(e) => setCra(row.id, e)} onCopy={copyCraRow} />
          ))}
        </section>
      )}

      {view === "food" && (
        <section className="pane">
          <p className="lede">
            Where a family can eat today. A site shows up on every day it serves, so the same
            name repeats down the week.
          </p>
          <p className="handling">
            Most of these have never been verified, and pantry hours move. Call before you send
            anyone.
          </p>
          <details className="src-details">
            <summary>Where this list comes from</summary>
            <p className="tiny">{FOOD.meta.src}</p>
          </details>
          {resById.get("wnc-free-food-map") && (
            <p>
              <a className="act link" href={"https://" + resById.get("wnc-free-food-map").web.replace(/^https?:\/\//, "")}
                target="_blank" rel="noreferrer">
                <Icon name="pin" size={14} />Skylar's free food map: every spot on one map
              </a>
            </p>
          )}
          <div className="filters">
            {FOOD.days.map((d) => (
              <Chip key={d.day} bg="#DDEFC4" fg="#55731F" active={foodDay === d.day}
                onClick={() => setFoodDay(d.day)}>
                {d.day} <strong>{d.sites.length}</strong>
              </Chip>
            ))}
          </div>
          {FOOD.days.filter((d) => d.day === foodDay).map((d) => (
            <div key={d.day} className="need-block">
              <h2 style={{ color: "#55731F" }}>
                <span className="dot" style={{ background: "#55731F" }} />
                {d.day}
                <span className="need-n">{d.sites.length} sites</span>
              </h2>
              <div className="cards">
                {d.sites.map((s, i) => (
                  <article key={i} className="card" style={{ "--sec": "#55731F" }}>
                    <div className="card-head" style={{ cursor: "default" }}>
                      <span className="card-title">
                        <strong>{s.place}</strong>
                        <span className="card-sub">
                          <Icon name="clock" size={13} />{s.when}
                        </span>
                      </span>
                    </div>
                    <div className="card-badges">
                      {s.lv
                        ? <span className="badge ok">Verified {s.lv}</span>
                        : <span className="badge muted">Not verified yet</span>}
                      {s.goodToKnow && <span className="badge sp">{s.goodToKnow}</span>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {view === "events" && (
        <section className="pane">
          <p className="lede">
            Events, deadlines and sign-ups for families, soonest first: the team's own picks, and the
            Public Edition's family calendar of library programs, Bounty &amp; Soul markets, museums and more.
          </p>
          <p className="handling">
            Almost none of these has been verified by the team, and dates and places move. Call or check the
            listing before you send anyone. Organizers publish a few months ahead, so a thin later month
            means not published yet.
          </p>
          <div className="filters">
            {EVENT_KINDS.map(([id, label]) => (
              <Chip key={id} active={evKind === id} onClick={() => setEvKind(id)}>
                {label} <strong>{evCounts[id]}</strong>
              </Chip>
            ))}
          </div>
          <div className="filters">
            {AGE_FILTERS.map(([id, label]) => (
              <Chip key={id} active={evAge === id} onClick={() => setEvAge(id)}>
                {label} <strong>{evAgeCounts[id]}</strong>
              </Chip>
            ))}
          </div>
          <div className="ev-tools">
            <label className="field ev-search">
              <span>Search events</span>
              <input type="search" value={evQ} onChange={(e) => setEvQ(e.target.value)}
                placeholder="story time, Spanish, Leicester, market" />
            </label>
            <label className="field ev-org-pick">
              <span>From</span>
              <select value={evOrg} onChange={(e) => setEvOrg(e.target.value)}>
                <option value="">Everyone</option>
                <option value="team">The team's own picks</option>
                {evOrgs.map(([o, n]) => <option key={o} value={o}>{o} ({n})</option>)}
              </select>
            </label>
          </div>
          {!cal && <p className="count">Loading the family calendar…</p>}
          {cal?.failed && (
            <p className="callout">The family calendar did not load. The team's own picks are below; try again later.</p>
          )}
          {cal && !cal.failed && (
            <p className="count">
              {evShown} coming up{evFiltered ? " with these filters" : ""}
              {evFiltered && (
                <> · <button className="linkish" onClick={() => { setEvKind("all"); setEvAge("any"); setEvOrg(""); setEvQ(""); }}>
                  Clear filters</button></>
              )}
            </p>
          )}
          {evPlan.months.map((m, i) => (
            <EventMonth key={m.key + evSig} m={m} startOpen={i === 0 || (evFiltered && evShown <= 90)}
              render={(e) => (
                <EventCard key={e.id} e={e} soon={soon(e, evToday)} resource={resById.get(e.rid)}
                  onOpen={() => openResource(resById.get(e.rid))}
                  inPlan={inPlan("e", e.id)} onPlan={() => togglePlanEvent(e)} />
              )} />
          ))}
          {!evPlan.months.length && (
            <p className="empty">
              {evFiltered ? "Nothing coming up matches these filters." : "Nothing coming up in this list. New dates go in data/events.json."}
            </p>
          )}
          {!!evPast.length && (
            <details className="past">
              <summary>Already happened <span className="need-n">{evPast.length}</span></summary>
              <div className="cards">
                {evPast.map((e) => (
                  <EventCard key={e.id} e={e} soon="" resource={resById.get(e.rid)}
                    onOpen={() => openResource(resById.get(e.rid))} />
                ))}
              </div>
            </details>
          )}
          {cal && !cal.failed && <CalendarNotes cal={cal} resById={resById} onOpen={openResource} />}
          <p className="tiny src">{EVENTS_META.src}</p>
          {cal?.meta && <p className="tiny src">{cal.meta.src}</p>}
        </section>
      )}

      {view === "changed" && (
        <section className="pane">
          <p className="lede">
            From the WHAT CHANGED tab of the workbook. Read the dead ends before you refer anyone:
            aggregators still list some of these with working phone numbers.
          </p>
          {CHANGELOG.groups.map((g) => (
            <div key={g.id} className="need-block">
              <h2 style={g.id === "dead-ends" ? { color: "var(--alert)" } : undefined}>
                {g.label}
                <span className="need-n">{g.entries.length}</span>
              </h2>
              <ul className="plain">
                {g.entries.map((e, i) => (
                  <li key={i} className={g.id === "dead-ends" ? "dead" : ""}>
                    {e.date && <span className="badge sp">{e.date}</span>}{" "}
                    <strong>{e.what}</strong>
                    {e.detail && <span className="detail"> {e.detail}</span>}
                    {e.source && <span className="tiny src"> Source: {e.source}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {!!CHANGELOG.conflicts.length && (
            <div className="need-block">
              <h2 style={{ color: "var(--alert)" }}>
                Copies that disagree
                <span className="need-n">{CHANGELOG.conflicts.length}</span>
              </h2>
              <ul className="plain">
                {CHANGELOG.conflicts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.resource}</strong> · {c.field} · the {c.tab} tab says{" "}
                    <em>{c.sectionTabSays}</em>, the master says <em>{c.masterSays}</em>. Somebody has to
                    call both.
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="tiny src">{CHANGELOG.meta.src}</p>
        </section>
      )}

      {view === "gaps" && (
        <section className="pane">
          <p className="lede">
            Two kinds of missing. Fields you still need to fill in, and services this community may not have.
          </p>
          <div className="stat-grid">
            {[["Never verified", gapStats.unverified, "#B0271F"], ["No phone", gapStats.phone, "#B4552B"],
              ["No website", gapStats.web, "#9A6410"], ["No address", gapStats.address, "#1F5F9E"],
              ["No hours", gapStats.hours, "#7038A8"], ["No point person", gapStats.point, "#157C86"]]
              .map(([l, v, c]) => (
                <div key={l} className="stat" style={{ "--stat": c }}>
                  <strong>{v}</strong><span>{l}</span>
                </div>
              ))}
          </div>

          {!!deadEnds && (
            <>
              <h3>Do not refer ({deadEnds.entries.length})</h3>
              <ul className="plain">
                {deadEnds.entries.map((e, i) => (
                  <li key={i} className="dead"><strong>{e.what}</strong> <span className="detail">{e.detail}</span></li>
                ))}
              </ul>
            </>
          )}

          <h3>Assessment rows with nothing on them</h3>
          <div className="gap-list">
            {CRA.filter((r) => coverage[r.id].conf === 0).map((r) => {
              const cs = CRA_SECTIONS.find((c) => c.id === r.section);
              return (
                <button key={r.id} className="gap-item"
                  onClick={() => { setCraSec(r.section); setView("assessment"); }}>
                  <span className="cra-num" style={{ color: cs.deep }}>{r.id}</span> {r.label}
                </button>
              );
            })}
          </div>

          <h3>Point people you have never heard back from</h3>
          <ul className="plain">
            {PEOPLE
              .filter((p) => /No response|Slow|Unknown|never|Not tried/i.test(p.resp || "") || !p.resp)
              .map((p, i) => (
                <li key={i}>
                  <RespBadge value={p.resp} /> <strong>{p.n}</strong>
                  {p.org ? " · " + p.org : ""}
                </li>
              ))}
          </ul>
        </section>
      )}

      {view === "people" && (
        <section className="pane">
          <p className="lede">
            A named person answers faster than a general line. Responsiveness is the whole value of this list.
          </p>
          <p className="handling">
            Includes the Child First team block: {PEOPLE.filter((p) => p.internal).length} personal
            addresses, marked <span className="badge warn">internal</span>. Fine to use here. Strip them
            before any of this goes to someone outside the team.
          </p>
          <div className="people">
            {PEOPLE.map((p, i) => (
              <div key={i} className="person">
                <div className="person-top">
                  <strong>{p.n}</strong>
                  <RespBadge value={p.resp} />
                  {p.internal && <span className="badge warn">internal</span>}
                </div>
                <p className="tiny">{[p.role, p.org].filter(Boolean).join(" · ")}</p>
                <div className="card-actions">
                  {p.ph && (
                    <a className="act call" href={telHref(p.ph)}>
                      <Icon name="phone" size={14} />{p.ph}
                    </a>
                  )}
                  {p.em && (
                    <a className="act link" href={"mailto:" + p.em}>
                      <Icon name="mail" size={14} />{p.em}
                    </a>
                  )}
                </div>
                {p.notes && <p className="detail">{p.notes}</p>}
                <p className="tiny src">{p.grp}{p.lv ? " · verified " + p.lv : ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "data" && (
        <section className="pane">
          <p className="lede">
            Your edits live in this browser. Export before you rely on them anywhere else.
          </p>
          <p className="handling">
            <strong>Internal use only.</strong> These exports carry point people's direct lines and the team's
            personal addresses, and the notes say who is slow to answer and who to route around.
            That is staff information, not a public directory.
          </p>
          <div className="row-btns">
            <button className="btn ok-btn" onClick={exportJson}>Download resources.json</button>
            <button className="btn ok-btn" onClick={exportCra}>Download the assessment</button>
            <button className="btn ok-btn" onClick={exportPeople}>Download point-people.json</button>
            <button className="btn" onClick={exportCsv}>Download resources.csv</button>
          </div>

          <h3>How a change gets in</h3>
          <pre className="repo">{`1. Edit here, or mark a resource verified.
2. Download resources.json from this tab.
3. Replace data/resources.json in the repo.
4. Commit with what you confirmed and how.`}</pre>
          <p className="tiny">
            Every resource carries a source field, so a diff shows where a fact came from. Commit after
            each verification pass and the log becomes the audit trail the directory has been missing.
          </p>

          <h3>Sources behind this build</h3>
          <ul className="plain">{META.sources.map((s, i) => <li key={i}>{s}</li>)}</ul>

          <h3>Recent edits ({(state.log || []).length})</h3>
          <ul className="plain">
            {(state.log || []).slice(0, 25).map((l, i) => (
              <li key={i}>{l.t.slice(0, 16).replace("T", " ") + " · " + l.id + " · " + l.key}</li>
            ))}
            {!(state.log || []).length && <li className="empty">No edits yet.</li>}
          </ul>

          <h3>Start over</h3>
          <button className="btn danger" onClick={() => {
            clear();
            say("Cleared. The original " + BASE.length + " entries are untouched.");
          }}>Clear my edits</button>
        </section>
      )}

      <CrisisSheet open={crisisOpen} onClose={() => setCrisisOpen(false)} resById={resById} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
