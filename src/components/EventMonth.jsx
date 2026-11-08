import { useState } from "react";

/* One month of events. With the calendar in, a month can hold three hundred
   listings, which is a long scroll and a slow phone, so a month opens a page
   of cards at a time, and only the first opens by itself. */
const PAGE = 30;

export default function EventMonth({ m, startOpen, render }) {
  const [open, setOpen] = useState(startOpen);
  const [shown, setShown] = useState(PAGE);
  const more = Math.min(PAGE * 2, m.items.length - shown);
  return (
    <div className="need-block ev-month">
      <h2>
        <button className="ev-month-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
          {m.label}<span className="need-n">{m.items.length}</span>
          <span className="ev-month-act">{open ? "Hide" : "Show"}</span>
        </button>
      </h2>
      {open && (
        <>
          <div className="cards">{m.items.slice(0, shown).map(render)}</div>
          {more > 0 && (
            <button className="btn ev-more" onClick={() => setShown(shown + more)}>
              Show {more} more ({m.items.length - shown} left in {m.label.split(" ")[0]})
            </button>
          )}
        </>
      )}
    </div>
  );
}
