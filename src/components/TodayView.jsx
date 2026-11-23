import { FOOD } from "../data.js";
import Icon from "./Icon.jsx";

/* Today: food open today, what is open in the directory, and this week's
   events, on one screen. The full week and all events are a tap away. */
export default function TodayView({ date, openCount, onOpenToday, onWeek, onEvents, events, eventsLoading, renderEvent }) {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const food = FOOD.days.find((d) => d.day === dayName);
  return (
    <section className="pane today">
      <h2 className="today-title">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2>
      <button className="today-open" onClick={onOpenToday}>
        <span><strong>{openCount}</strong> programs in the directory list hours for today</span>
        <span className="linkish">See them</span>
      </button>

      <div className="need-block">
        <h2 style={{ color: "#55731F" }}>
          <span className="dot" style={{ background: "#55731F" }} />Food today
          <span className="need-n">{food ? food.sites.length : 0} sites</span>
        </h2>
        <p className="handling">Pantry hours move and most are unverified. Call before you send anyone.</p>
        <div className="cards">
          {(food ? food.sites : []).map((s, i) => (
            <article key={i} className="card compact" style={{ "--sec": "#55731F" }}>
              <div className="card-head" style={{ cursor: "default" }}>
                <span className="card-title">
                  <strong>{s.place}</strong>
                  <span className="card-sub"><Icon name="clock" size={13} />{s.when}</span>
                </span>
              </div>
              {s.goodToKnow && <div className="card-badges"><span className="badge sp">{s.goodToKnow}</span></div>}
            </article>
          ))}
        </div>
        <button className="btn" onClick={onWeek}>See the whole week</button>
      </div>

      <div className="need-block">
        <h2><span className="dot" style={{ background: "var(--accent, #0B5A73)" }} />This week<span className="need-n">{events.length}</span></h2>
        {eventsLoading && <p className="count">Loading the family calendar…</p>}
        <div className="cards">{events.slice(0, 40).map(renderEvent)}</div>
        {!eventsLoading && !events.length && <p className="empty">Nothing listed for the next seven days.</p>}
        <button className="btn" onClick={onEvents}>All events</button>
      </div>
    </section>
  );
}
