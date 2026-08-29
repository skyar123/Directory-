import { useState, useMemo } from "react";
import {
  META, SECTIONS, SECBY, NEEDS, BASE, PEOPLE, PEOPLE_META,
  CRA, CRA_SECTIONS, CHANGELOG, FOOD, TODAY, norm,
} from "./data.js";
import { useStore } from "./storage.js";
import { score } from "./search.js";
import { Chip } from "./components/bits.jsx";
import ResourceCard from "./components/ResourceCard.jsx";
import CraRow from "./components/CraRow.jsx";

const VIEWS = [
  ["find", "Find", "🔍"],
  ["sniff", "By SNIFF question", "📋"],
  ["assessment", "Community assessment", "🧩"],
  ["food", "Food by day", "🥣"],
  ["changed", "What changed", "🚩"],
  ["gaps", "What is missing", "🕳️"],
  ["people", "Point people", "📞"],
  ["data", "Data and repo", "📦"],
];

export default function App() {
  const { state, setState, ready, saving, clear } = useStore();
  const [view, setView] = useState("find");
  const [q, setQ] = useState("");
  const [secFilter, setSecFilter] = useState("");
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [openId, setOpenId] = useState("");
  const [openNeed, setOpenNeed] = useState("");
  const [craSec, setCraSec] = useState("I");
  const [foodDay, setFoodDay] = useState(FOOD.days[0].day);
  const [toast, setToast] = useState("");

  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  const resources = useMemo(() => {
    const all = [...BASE, ...(state.added || [])];
    return all.map((r) => (state.edits[r.id] ? { ...r, ...state.edits[r.id] } : r));
  }, [state]);

  const terms = useMemo(() => norm(q).split(" ").filter(Boolean), [q]);

  const results = useMemo(() => {
    const list = resources
      .map((r) => ({ r, s: score(r, terms) }))
      .filter((x) => x.s > 0)
      .filter((x) => !secFilter || x.r.sec === secFilter)
      .filter((x) => !onlyGaps || !x.r.phone || !x.r.web || !x.r.verified);
    list.sort((a, b) => b.s - a.s || a.r.name.localeCompare(b.r.name));
    return list.map((x) => x.r);
  }, [resources, terms, secFilter, onlyGaps]);

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
    resources: resources.map((r) => ({
      id: r.id, n: r.name, pp: r.point, sp: r.spanish, spd: r.spanishDetail,
      ph: r.phone, em: r.email, w: r.web, d: r.detail, a: r.address, h: r.hours,
      os: r.origSection, t: r.tags, lv: r.verified, vb: r.verifiedBy,
      sec: r.sec, needs: r.needs, src: r.source, note: r.note, new: r.isNew,
    })),
  }, null, 1));

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
      "address", "hours", "spanish", "verified", "verifiedBy", "tags", "detail", "source", "note"];
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

  return (
    <div className="wnc">
      <header className="top">
        <div className="brand">
          <span className="mark">🌈</span>
          <div>
            <h1>WNC Family Resource Directory <span className="internal-tag">Internal use only</span></h1>
            <p>
              {resources.length} resources, in the order the SNIFF asks.{" "}
              {saving && <em>{saving}</em>}
            </p>
          </div>
        </div>
        <div className="searchbar">
          <input value={q} onChange={(e) => { setQ(e.target.value); if (view !== "find") setView("find"); }}
            placeholder="Search: diapers, autism eval, rent, interpreter, Black Mountain"
            aria-label="Search resources" />
          {q && <button className="clear" onClick={() => setQ("")} aria-label="Clear search">×</button>}
        </div>
        <nav className="tabs">
          {VIEWS.map(([id, label, ic]) => (
            <button key={id} className={"tab" + (view === id ? " tab-on" : "")} onClick={() => setView(id)}>
              <span>{ic}</span> {label}
            </button>
          ))}
        </nav>
      </header>

      {!ready && <p className="loading">Opening your saved edits</p>}

      {view === "find" && (
        <section className="pane">
          <div className="filters">
            <Chip bg="#F4EFE6" fg="#2E2740" active={!secFilter} onClick={() => setSecFilter("")}>
              All sections
            </Chip>
            {SECTIONS.map((s) => (
              <Chip key={s.id} bg={s.hue} fg={s.deep} active={secFilter === s.id}
                onClick={() => setSecFilter(secFilter === s.id ? "" : s.id)}>
                {s.icon} {s.id}. {s.name}
              </Chip>
            ))}
            <Chip bg="#FFE9E9" fg="#B0271F" active={onlyGaps} onClick={() => setOnlyGaps((v) => !v)}>
              🕳️ needs work only
            </Chip>
          </div>
          <p className="count">{results.length} showing</p>
          <div className="cards">
            {results.slice(0, 260).map((r) => (
              <ResourceCard key={r.id} r={r} open={openId === r.id}
                onToggle={() => setOpenId(openId === r.id ? "" : r.id)}
                onEdit={(k, v) => edit(r.id, k, v)} onVerify={() => verify(r.id)} />
            ))}
          </div>
          {results.length > 260 && (
            <p className="count">Showing the first 260. Keep typing to narrow it down.</p>
          )}
        </section>
      )}

      {view === "sniff" && (
        <section className="pane">
          <p className="lede">
            The same order the SNIFF asks its questions. Tap a question to see what answers it.
          </p>
          {SECTIONS.filter((s) => needsBySection[s.id]).map((s) => (
            <div key={s.id} className="need-block">
              <h2 style={{ color: s.deep }}>
                <span style={{ background: s.hue }} className="h-ic">{s.icon}</span> {s.id}. {s.name}
              </h2>
              {needsBySection[s.id].map((n) => {
                const hits = resources.filter((r) => r.needs.includes(n.key));
                const isOpen = openNeed === n.key;
                return (
                  <div key={n.key} className="need">
                    <button className="need-head" onClick={() => setOpenNeed(isOpen ? "" : n.key)}
                      style={{ background: isOpen ? s.hue : "transparent" }}>
                      <span className="need-code" style={{ color: s.deep }}>{n.code}</span>
                      <span>{n.label}</span>
                      <span className="need-n" style={{ color: s.deep }}>{hits.length}</span>
                    </button>
                    {isOpen && (
                      <div className="cards inset">
                        {hits.map((r) => (
                          <ResourceCard key={r.id} r={r} open={openId === r.id} compact
                            onToggle={() => setOpenId(openId === r.id ? "" : r.id)}
                            onEdit={(k, v) => edit(r.id, k, v)} onVerify={() => verify(r.id)} />
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
            The {CRA.length} rows of the Child First Community Resource Assessment. Solid tiles are rows
            you have filled. Empty tiles are gaps in the service system here.
          </p>

          <div className="coverage">
            {CRA_SECTIONS.map((cs) => (
              <div key={cs.id} className="cov-band">
                <button className="cov-label" style={{ color: cs.deep }} onClick={() => setCraSec(cs.id)}>
                  {cs.icon} {cs.id}. {cs.name}
                </button>
                <div className="cov-tiles">
                  {CRA.filter((r) => r.section === cs.id).map((r) => {
                    const c = coverage[r.id];
                    return (
                      <button key={r.id} className={c.conf > 0 ? "tile full" : "tile none"}
                        title={r.section + "." + r.num + " " + r.label}
                        style={{ background: c.conf > 0 ? cs.hue : "transparent",
                          borderColor: cs.deep, color: cs.deep }}
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
              <Chip key={cs.id} bg={cs.hue} fg={cs.deep} active={craSec === cs.id}
                onClick={() => setCraSec(cs.id)}>
                {cs.icon} {cs.id}. {cs.name}
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
            ⚠️ Most of these have never been verified, and pantry hours move. Call before you send
            anyone. {FOOD.meta.src}
          </p>
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
                <span className="h-ic" style={{ background: "#DDEFC4" }}>🥣</span> {d.day}
              </h2>
              <div className="cards">
                {d.sites.map((s, i) => (
                  <article key={i} className="card" style={{ borderLeftColor: "#55731F" }}>
                    <div className="card-head" style={{ cursor: "default" }}>
                      <span className="card-icon" style={{ background: "#DDEFC4" }}>🥣</span>
                      <span className="card-title">
                        <strong>{s.place}</strong>
                        <span className="card-sub">{s.when}</span>
                      </span>
                    </div>
                    <div className="card-badges">
                      {s.lv
                        ? <span className="badge ok">✅ {s.lv}</span>
                        : <span className="badge warn">⚠️ never verified</span>}
                      {s.goodToKnow && <span className="badge sp">{s.goodToKnow}</span>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
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
              <h2 style={{ color: g.id === "dead-ends" ? "#B0271F" : "#2E2740" }}>
                {g.id === "dead-ends" ? "🚫" : g.id === "watch" ? "👀" : g.id === "added" ? "✨" : "❓"}{" "}
                {g.label} <span className="need-n">{g.entries.length}</span>
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
              <h2 style={{ color: "#B0271F" }}>
                ⚠️ Copies that disagree <span className="need-n">{CHANGELOG.conflicts.length}</span>
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
                <div key={l} className="stat" style={{ borderColor: c }}>
                  <strong style={{ color: c }}>{v}</strong><span>{l}</span>
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
                <button key={r.id} className="gap-item" style={{ borderColor: cs.deep, color: cs.deep }}
                  onClick={() => { setCraSec(r.section); setView("assessment"); }}>
                  <span className="cra-num" style={{ background: cs.hue }}>{r.id}</span> {r.label}
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
                  {p.n} {p.org ? "· " + p.org : ""}{" "}
                  {p.resp ? "· " + p.resp : "· responsiveness unknown"}
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
            🔒 Includes the Child First team block: {PEOPLE.filter((p) => p.internal).length} personal
            addresses, marked <span className="badge warn">internal</span>. Fine to use here. Strip them
            before any of this goes to someone outside the team.
          </p>
          <div className="people">
            {PEOPLE.map((p, i) => (
              <div key={i} className="person">
                <div className="person-top">
                  <strong>{p.n}</strong>
                  {p.resp && <span className="badge sp">{p.resp}</span>}
                  {p.internal && <span className="badge warn">internal</span>}
                </div>
                <p className="tiny">{[p.role, p.org].filter(Boolean).join(" · ")}</p>
                <div className="card-actions">
                  {p.ph && (
                    <a className="act call" href={"tel:" + p.ph.replace(/[^0-9]/g, "").slice(0, 11)}>
                      📞 {p.ph}
                    </a>
                  )}
                  {p.em && <a className="act link" href={"mailto:" + p.em}>✉️ {p.em}</a>}
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
            🔒 Internal use only. These exports carry point people's direct lines and the team's
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
