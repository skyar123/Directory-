import { useEffect, useMemo, useRef, useState } from "react";
import { KEY_STORE, buildPrompt, looksIdentifying, askGemini, parseAnswer, explain, keyProblem } from "../ai.js";

/* localStorage can throw in private windows; the key is a per-browser
   convenience, so failing to save it only means pasting it again */
const loadKey = () => { try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; } };
const storeKey = (k) => {
  try { if (k) localStorage.setItem(KEY_STORE, k); else localStorage.removeItem(KEY_STORE); } catch (e) { /* not saved */ }
};

export default function AskPanel({
  initialText, resources, needs, needBy, events, eventsLoading, today,
  renderResource, renderEvent, copyText, onClose,
}) {
  const [text, setText] = useState(initialText || "");
  const [key, setKey] = useState(loadKey);
  const [draft, setDraft] = useState("");
  const [editingKey, setEditingKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [keyError, setKeyError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const abort = useRef(null);

  /* a count while Gemini works, so a long answer reads as working, not stuck */
  useEffect(() => {
    if (!busy) return undefined;
    const t0 = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [busy]);

  const prompt = useMemo(() => buildPrompt({ resources, needs, events, today }), [resources, needs, events, today]);
  const warn = useMemo(() => looksIdentifying(text), [text]);
  const byId = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);
  const evById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const saveKey = () => {
    const k = draft.trim();
    if (!k) return;
    const problem = keyProblem(k);
    if (problem) { setKeyError(problem); return; }
    storeKey(k); setKey(k); setDraft(""); setEditingKey(false); setError(""); setKeyError("");
  };
  const forgetKey = () => { storeKey(""); setKey(""); setEditingKey(false); };

  const send = async () => {
    if (!key || !text.trim() || busy || eventsLoading) return;
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true); setError(""); setResult(null);
    try {
      const raw = await askGemini({ key, system: prompt.system, text: text.trim(), signal: abort.current.signal });
      setResult(parseAnswer(raw, prompt));
    } catch (e) {
      if (e.name !== "AbortError") setError(explain(e));
    } finally {
      setBusy(false);
    }
  };

  const copyList = () => {
    const lines = result.picks.map((p) => {
      const r = byId.get(p.id);
      return [r.name, r.phone, r.web].filter(Boolean).join(" · ") + (p.why ? "\n  " + p.why : "");
    });
    const ev = result.events.map((x) => {
      const e = evById.get(x.id);
      return [e.what, e.date + (e.end ? " to " + e.end : ""), e.where].filter(Boolean).join(" · ");
    });
    copyText(lines.concat(ev).join("\n"), "Recommendations copied.");
  };

  const needLabel = (k) => (needBy[k] ? needBy[k].label : k);
  const showKeyForm = !key || editingKey;

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
        anything else that could identify a family. What you type is sent to Google's Gemini service, and
        on the free tier Google may keep and review it.
      </p>

      {showKeyForm && (
        <div className="ask-key">
          <p>
            <strong>{key ? "Change your Gemini key." : "One-time setup."}</strong> Ask AI uses your own free
            Gemini key. Get one at{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>{" "}
            with a Google account, then paste the key itself here (it starts with AQ. or AIza). It is saved
            in this browser, for this site's address only, so another phone, computer or address asks once more.
          </p>
          <div className="ask-key-row">
            <input type="password" autoComplete="off" spellCheck="false" value={draft}
              onChange={(e) => { setDraft(e.target.value); setKeyError(""); }} onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="Paste your Gemini API key" aria-label="Gemini API key" />
            <button className="btn ok-btn" onClick={saveKey} disabled={!draft.trim()}>Save key</button>
            {key && <button className="btn" onClick={() => setEditingKey(false)}>Cancel</button>}
          </div>
          {keyError && <p className="ask-warn" role="alert">{keyError}</p>}
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
        <button className="btn ok-btn" onClick={send} disabled={!key || !text.trim() || busy || eventsLoading}>
          {busy ? `Reading the directory... ${elapsed}s` : "Get recommendations"}
        </button>
        {busy && <button className="btn" onClick={() => abort.current?.abort()}>Stop</button>}
        {eventsLoading && <span className="ask-wait">Loading the family calendar…</span>}
        {busy && elapsed >= 20 && <span className="ask-wait">Long answers can take a minute.</span>}
        {key && !editingKey && !busy && (
          <span className="tiny">
            Gemini key saved in this browser.{" "}
            <button className="linkish" onClick={() => setEditingKey(true)}>Change</button>{" · "}
            <button className="linkish" onClick={forgetKey}>Forget</button>
          </span>
        )}
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

          <h3>Recommended from the directory ({result.picks.length})</h3>
          {!result.picks.length && <p className="empty">Gemini found nothing in the directory for this. Try the regular search.</p>}
          <div className="cards">
            {result.picks.map((p) => (
              <div key={p.id} className="ask-pick">
                <p className="ask-why">
                  {p.need && needBy[p.need] && <strong>{needLabel(p.need)}. </strong>}{p.why}
                </p>
                {renderResource(byId.get(p.id))}
              </div>
            ))}
          </div>

          {!!result.events.length && (
            <>
              <h3>Coming up</h3>
              <div className="cards">
                {result.events.map((x) => (
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
            <button className="btn" onClick={copyList} disabled={!result.picks.length && !result.events.length}>Copy the list</button>
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
