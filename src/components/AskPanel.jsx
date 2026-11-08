import { useEffect, useMemo, useRef, useState } from "react";
import { CODE_STORE, LEGACY_KEY_STORE, looksIdentifying, askServer, explain } from "../ai.js";
import { urgentKind } from "../urgent.js";
import CrisisBox from "./CrisisBox.jsx";
import AskContext, { NO_CONTEXT, contextLine } from "./AskContext.jsx";
import FamilyMessage from "./FamilyMessage.jsx";
import AskFeedback from "./AskFeedback.jsx";

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

/* "a phone number and a name" */
const listOf = (items) => (items.length < 2 ? items.join("")
  : items.slice(0, -1).join(", ") + " and " + items[items.length - 1]);

export default function AskPanel({
  initialText, resources, needBy, events, eventsLoading,
  renderResource, renderEvent, copyText, onClose, onShowNeed,
}) {
  const [text, setText] = useState(initialText || "");
  const [ctx, setCtx] = useState(NO_CONTEXT);
  const [code, setCode] = useState(loadCode);
  const [needCode, setNeedCode] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(0);
  const [urgent, setUrgent] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [replyTo, setReplyTo] = useState(-1);
  const [answer, setAnswer] = useState("");
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

  const send = async (withCode = code, t = text) => {
    if (!t.trim() || busy || eventsLoading) return;
    /* what goes to the server: the text, and the taps as one plain line */
    const question = [t.trim(), contextLine(ctx)].filter(Boolean).join("\n\n");
    /* the crisis lines go up now, before Gemini answers, whatever it says */
    setUrgent(urgentKind(question));
    abort.current?.abort();
    abort.current = new AbortController();
    setBusy(true); setError(""); setResult(null); setReplyTo(-1);
    try {
      setResult(await askServer({ text: question, code: withCode, signal: abort.current.signal }));
      setRound((n) => n + 1);
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

  /* an answer to one of Gemini's questions joins the text, so it is there
     to see and edit, and Ask AI looks again */
  const askAgain = () => {
    const a = answer.trim();
    if (!a || replyTo < 0 || !result) return;
    const next = `${text.trim()}\n${result.ask[replyTo]} ${a}`;
    setText(next); setAnswer("");
    send(code, next);
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
  const removed = (result && result.removed) || [];

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
        service, and on the free tier Google may keep and review it. Ask AI also takes out any it finds
        before it asks.
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
      <AskContext ctx={ctx} onChange={setCtx} />

      <div className="row-btns ask-actions">
        <button className="btn ok-btn" onClick={() => send()} disabled={!text.trim() || busy || eventsLoading}>
          {busy ? `Reading the directory... ${elapsed}s` : "Get recommendations"}
        </button>
        {busy && <button className="btn" onClick={() => abort.current?.abort()}>Stop</button>}
        {eventsLoading && <span className="ask-wait">Loading the family calendar…</span>}
        {busy && elapsed >= 10 && <span className="ask-wait">Taking longer than usual. It stops by itself at 25 seconds.</span>}
      </div>

      {urgent && <CrisisBox kind={urgent} byId={byId} />}
      {error && <p className="callout" role="alert">{error}</p>}

      {result && (
        <div className="ask-results">
          {result.summary && <p className="ask-summary">{result.summary}</p>}
          {!!result.needs.length && (
            <>
              <p className="tags ask-needs">
                {result.needs.map((n) => (needBy[n.key] && onShowNeed ? (
                  <button key={n.key} className="need-chip" title={n.why} onClick={() => onShowNeed(n.key)}
                    aria-label={`See everything for ${needLabel(n.key)}`}>
                    {needLabel(n.key)} <span aria-hidden="true">›</span>
                  </button>
                ) : <span key={n.key} title={n.why}>{needLabel(n.key)}</span>))}
              </p>
              {onShowNeed && <p className="tiny">Tap a need to see everything the directory has for it.</p>}
            </>
          )}

          <h3>Recommended from the directory ({picks.length})</h3>
          {!picks.length && <p className="empty">Nothing in the directory matched this yet. Try saying it another way, or use the regular search.</p>}
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
              <p className="tiny">Tap one to answer it, and Ask AI will look again.</p>
              <ul className="plain ask-followups">
                {result.ask.map((q, i) => (
                  <li key={i}>
                    <button className="linkish" aria-expanded={i === replyTo}
                      onClick={() => { setReplyTo(i === replyTo ? -1 : i); setAnswer(""); }}>
                      {q}
                    </button>
                    {i === replyTo && (
                      <div className="ask-key-row ask-reply">
                        <input value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus
                          onKeyDown={(e) => e.key === "Enter" && askAgain()}
                          placeholder="Your answer, without client details" aria-label={"Answer: " + q} />
                        <button className="btn ok-btn" onClick={askAgain} disabled={!answer.trim() || busy}>Ask again</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!!(picks.length || evPicks.length) && (
            <FamilyMessage key={round} code={code} copyText={copyText}
              items={picks.map((p) => ({ r: byId.get(p.id), why: p.why }))}
              events={evPicks.map((x) => evById.get(x.id))} />
          )}

          <div className="row-btns">
            <button className="btn" onClick={copyList} disabled={!picks.length && !evPicks.length}>Copy the list</button>
          </div>
          <AskFeedback key={"f" + round} needs={result.needs.map((n) => n.key)}
            picks={picks.map((p) => p.id)} events={evPicks.map((x) => x.id)} />
          <p className="tiny src">
            Picked by Gemini from this directory
            {result.dropped ? `; ${result.dropped} suggestion${result.dropped === 1 ? " that is" : "s that are"} not in the directory ${result.dropped === 1 ? "was" : "were"} left out` : ""}.
            {!!removed.length && ` Before asking, Ask AI took out ${listOf(removed)}.`}
            {" "}Check each one before you refer.
          </p>
        </div>
      )}
    </section>
  );
}
