import { useState } from "react";
import { askTranslate, explain } from "../ai.js";

/* A message for the family, ready to paste into a text: the picks with
   their phone numbers, hours and addresses as the directory has them, and
   the reason Gemini gave for each. In Spanish only the reasons go to Gemini
   to be translated; names and numbers never do, so they cannot change. */
const WORDS = {
  en: {
    hi: "Hi! Here are some places that may be able to help:",
    call: "Call", soon: "Coming up:",
    end: "Hours can change, so it is a good idea to call first. I am glad to help you call any of these.",
  },
  es: {
    hi: "¡Hola! Estos lugares pueden ayudarle:",
    call: "Llame al", soon: "Próximamente:",
    end: "Los horarios pueden cambiar, así que es buena idea llamar antes. Con gusto le ayudo a llamar a cualquiera de estos.",
  },
};
const firstPhone = (p) => (p || "").split(/[/,]/)[0].trim();
const dayOf = (iso, lang) => new Date(iso + "T12:00:00").toLocaleDateString(lang === "es" ? "es-US" : "en-US",
  { weekday: "short", month: "short", day: "numeric" });

export function familyMessage({ lang, items, events }) {
  const w = WORDS[lang];
  const out = [w.hi, ""];
  for (const { r, why } of items) {
    out.push("• " + r.name);
    if (why) out.push("  " + why);
    const facts = [r.phone && `${w.call} ${firstPhone(r.phone)}`, r.hours, r.address, !r.phone && r.web].filter(Boolean);
    if (facts.length) out.push("  " + facts.join(" · "));
    out.push("");
  }
  if (events.length) {
    out.push(w.soon);
    for (const e of events) {
      out.push("• " + [e.what, dayOf(e.date, lang) + (e.time ? ", " + e.time : ""), e.where].filter(Boolean).join(", "));
    }
    out.push("");
  }
  out.push(w.end);
  return out.join("\n");
}

export default function FamilyMessage({ items, events, code, copyText }) {
  const [lang, setLang] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const make = async (l) => {
    setError("");
    if (l === "en") { setLang(l); setDraft(familyMessage({ lang: l, items, events })); return; }
    setBusy(true);
    try {
      const whys = items.map((x) => x.why).filter(Boolean);
      const out = whys.length ? await askTranslate({ texts: whys, to: "es", code }) : [];
      let k = 0;
      const translated = items.map((x) => ({ ...x, why: x.why ? out[k++] : "" }));
      setLang(l);
      setDraft(familyMessage({ lang: l, items: translated, events }));
    } catch (e) {
      setError(explain(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="family-msg">
      <h3>A message for the family</h3>
      <p className="tiny">Ready to paste into a text. Read it over first and change anything: you know the family.</p>
      <div className="row-btns">
        <button className="btn" onClick={() => make("en")} disabled={busy}>In English</button>
        <button className="btn" onClick={() => make("es")} disabled={busy}>{busy ? "Translating..." : "En español"}</button>
      </div>
      {error && <p className="callout" role="alert">{error}</p>}
      {draft && (
        <>
          <textarea className="family-text" rows={12} value={draft} lang={lang}
            onChange={(e) => setDraft(e.target.value)} aria-label="Message for the family" />
          <div className="row-btns">
            <button className="btn ok-btn" onClick={() => copyText(draft, "Message copied.")}>Copy the message</button>
          </div>
        </>
      )}
    </div>
  );
}
