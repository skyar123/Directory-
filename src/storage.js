/*
 * Persistence. The v20 build called window.storage, which only exists inside
 * the Claude artifact runtime -- outside it every save threw and every edit was
 * lost on reload. localStorage is the equivalent that works in a real browser.
 *
 * Everything is wrapped in try/catch: private windows and locked-down browsers
 * throw on access rather than returning null, and losing an edit is worse than
 * showing "not saved, export to keep your changes".
 */
import { useState, useEffect, useRef, useCallback } from "react";

export const KEY = "wnc:directory:v1";
export const EMPTY = { edits: {}, cra: {}, added: [], log: [] };

export function useStore() {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch (e) {
      /* first run, or storage unavailable -- fall through to the empty state */
    }
    setReady(true);
  }, []);

  const push = useCallback((next) => {
    setState(next);
    clearTimeout(timer.current);
    setSaving("Saving");
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        setSaving("Saved");
        setTimeout(() => setSaving(""), 1400);
      } catch (e) {
        setSaving("Not saved. Export to keep your changes.");
      }
    }, 600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const clear = useCallback(() => {
    setState({ ...EMPTY });
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing saved */ }
  }, []);

  return { state, setState: push, ready, saving, clear };
}
