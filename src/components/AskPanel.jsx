import { useEffect, useMemo, useRef, useState } from "react";
import { CODE_STORE, LEGACY_KEY_STORE, looksIdentifying, askServer, explain } from "../ai.js";

/* The Gemini key is on the server now, so nobody sets anything up. The only
   thing a browser may keep is the team's Ask AI code, and only on a site
   that has turned one on. localStorage can throw in private windows; then
   the code is simply asked for again. */
const loadCode = () => { try { return localStorage.getItem(CODE_STORE) || ""; } catch (e) { return ""; } };
const storeCode = (c) => {
  try { if (c) localStorage.setItem(CODE_STORE, c); else localStorage.removeItem(CODE_STORE); } catch (e) { /* not saved */ }
};
/* a key saved under the old per-browser setup is no longer needed: drop it */
const dropLegacyKey = () => { try { localStorage.removeItem(LEGACY_KEY_STORE); } catch (e) { /* nothing to drop */ } };

export default function AskPanel({
  initialText, resources, needBy, events, eventsLoading,
  renderResource, renderEvent, copyText, onClose,
}) {
  const [text, setText] = useState(initialText || "");
  const [code, setCode] = useState(loadCode);
  const [needCode, setNeedCode] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const abort = useRef(null);

  useEffect(dropLegacyKey, []);

  /* a count while Gemini works, so a long answer reads as working, not stuck */
  useEffect(() => {
    if (!busy) return undefined;
    const t0 = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [busy]);

  const warn = useMemo(() => looksIdentifying(text), [text]);
  const byId = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);
  const evById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const send = async (withCode = code) => {
    if (!text.trim() || busy || eventsLoading) return;
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true); setError(""); setResult(null);
    try {
      setResult(await askServer({ text: text.trim(), code: withCode, signal: abort.current.signal }));
      setNeedCode(false);
    } catch (e) {
      if (e.name === "AbortError") return;
      if (e.kind === "code") {
        setNeedCode(true);
        if (withCode) { storeCode(""); setCode(""); setError("That code was not accepted. Check it with your team."); }
      } else setError(explain(e));
    } finally {
      setBusy(false);
    }
  };

  const saveCode = () => {
    const c = draft.trim();
    if (!c) return;
    storeCode(c); setCode(c); setDraft("");
    send(c);
  };

  const copyList = () => {
    const lines = picks.map((p) => {
      const r = byId.get(p.id);
      return [r.name, r.phone, r.web].filter(Boolean).join(" · ") + (p.why ? "\n  " + p.why : "");
    });
    const ev = evPicks.map((x) => {
      const e = evById.get(x.id);
      return [e.what, e.date + (e.end ? " to " + e.end : ""), e.where].filter(Boolean).join(" · ");
    });
    copyText(lines.concat(ev).join("\n"), "Recommendations copied.");
  };

  const needLabel = (k) => (needBy[k] ? needBy[k].label : k);
  /* a pick this copy of the page cannot show (say the calendar failed to
     load) is left out rather than rendered empty */
  const picks = result ? result.picks.filter((p) => byId.has(p.id)) : [];
  const evPicks = result ? result.events.filter((x) => evById.has(x.id)) : [];

  return (
    <section className="pane ask">
      <div className="ask-head">
        <h2>Ask AI</h2>
        <button className="btn" onClick={onClose}>Back to search</button>
      </div>
      <p className="lede">
        Ask a question, describe a family's situation, or paste a whole SNIFF. Gemini reads this
        directory and picks what fits, with a reason for each. It only recommends what is listed here.
      </p>
      <p className="handling ask-privacy">
        <strong>No client details.</strong> Leave out names, dates of birth, addresses, phone numbers and
        anything else that could identify a family. What you type goes through this site to Google's Gemini
        service, and on the free tier Google may keep and review it.
      </p>

      {needCode && (
        <div className="ask-key">
          <p>
            <strong>This site asks for the team's Ask AI code.</strong> Ask your team lead for it. It is
            saved in this browser so you only enter it once.
          </p>
          <div className="ask-key-row">
            <input type="password" autoComplete="off" spellCheck="false" value={draft}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveCode()}
              placeholder="Team code" aria-label="Ask AI team code" />
            <button className="btn ok-btn" onClick={saveCode} disabled={!draft.trim() || busy}>Save and ask</button>
          </div>
        </div>
      )}

      <label className="field ask-field">
        <span>Your question, the situation, or a SNIFF</span>
        <textarea className="ask-input" rows={7} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && send()}
          placeholder="For example: Spanish-speaking mom in Black Mountain with a newborn and a 2-year-old, behind on rent, needs diapers, no car." />
      </label>
      {!!warn.length && (
        <p className="ask-warn" role="status">
          This looks like it includes {warn.join(", ")}. Take client details out before you send.
        </p>
      )}

      <div className="row-btns ask-actions">
        <button className="btn ok-btn" onClick={() => send()} disabled={!text.trim() || busy || eventsLoading}>
          {busy ? `Reading the directory... ${elapsed}s` : "Get recommendations"}
        </button>
        {busy && <button className="btn" onClick={() => abort.current?.abort()}>Stop</button>}
        {eventsLoading && <span className="ask-wait">Loading the family calendar…</span>}
        {busy && elapsed >= 20 && <span className="ask-wait">Long answers can take a minute.</span>}
      </div>

      {error && <p className="callout" role="alert">{error}</p>}

      {result && (
        <div className="ask-results">
          {result.summary && <p className="ask-summary">{result.summary}</p>}
          {!!result.needs.length && (
            <p className="tags ask-needs">
              {result.needs.map((n) => <span key={n.key} title={n.why}>{needLabel(n.key)}</span>)}
            </p>
          )}

          <h3>Recommended from the directory ({picks.length})</h3>
          {!picks.length && <p className="empty">Gemini found nothing in the directory for this. Try the regular search.</p>}
          <div className="cards">
            {picks.map((p) => (
              <div key={p.id} className="ask-pick">
                <p className="ask-why">
                  {p.need && needBy[p.need] && <strong>{needLabel(p.need)}. </strong>}{p.why}
                </p>
                {renderResource(byId.get(p.id))}
              </div>
            ))}
          </div>

          {!!evPicks.length && (
            <>
              <h3>Coming up</h3>
              <div className="cards">
                {evPicks.map((x) => (
                  <div key={x.id} className="ask-pick">
                    {x.why && <p className="ask-why">{x.why}</p>}
                    {renderEvent(evById.get(x.id))}
                  </div>
                ))}
              </div>
            </>
          )}

          {!!result.ask.length && (
            <>
              <h3>Questions that would narrow it down</h3>
              <ul className="plain">{result.ask.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </>
          )}

          <div className="row-btns">
            <button className="btn" onClick={copyList} disabled={!picks.length && !evPicks.length}>Copy the list</button>
          </div>
          <p className="tiny src">
            Picked by Gemini from this directory
            {result.dropped ? `; ${result.dropped} suggestion${result.dropped === 1 ? " that is" : "s that are"} not in the directory ${result.dropped === 1 ? "was" : "were"} left out` : ""}.
            Check each one before you refer.
          </p>
        </div>
      )}
    </section>
  );
}
