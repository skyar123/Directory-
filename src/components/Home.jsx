import { telHref } from "../data.js";
import { shortDate } from "../events.js";
import Icon from "./Icon.jsx";
import NeedStart from "./NeedStart.jsx";
import { summaryOf } from "./ResourceCard.jsx";

/* The programs staff reach for most, on the home screen with a call button */
export const GO_TO = ["wnc-free-food-map", "nc-211", "manna-food-helpline", "code-purple",
  "crisis-intervention-program-cip", "pisgah-legal-services", "buncombe-dss", "eblen-charities"];

/*
 * The home screen: the most-used links first (the food map, food today, this
 * week, the plan), this week's events, the go-to programs, then the need
 * tiles. The crisis lines are one tap away in the header on every screen.
 */
export default function Home({ date, today, resById, foodToday, weekEvents, eventsLoading, planCount, onGo, countOf,
  go, openPage, onEvent, mine }) {
  const map = resById.get("wnc-free-food-map");
  const mapUrl = map && map.web ? "https://" + map.web.replace(/^https?:\/\//, "") : "";
  /* what starts this week, the team's own picks before calendar listings;
     sign-up windows that opened months ago stay on the Events tab */
  const starting = weekEvents.filter((e) => e.date >= today);
  const upcoming = [...starting].sort((a, b) => (a.status ? 1 : 0) - (b.status ? 1 : 0) || (a.date < b.date ? -1 : 1)).slice(0, 10)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const tiles = [
    mapUrl && { key: "map", icon: "pin", label: "Free food map", sub: "Every free food spot on one map", href: mapUrl, tone: 1 },
    { key: "food", icon: "bowl", label: "Food open today", sub: `${foodToday} pantries and meals`, onClick: () => go("today"), tone: 2 },
    { key: "week", icon: "calendar", label: "This week", sub: eventsLoading ? "Loading events" : `${starting.length} events starting`, onClick: () => go("today"), tone: 5 },
    { key: "plan", icon: "clipboard", label: "Visit plan", sub: planCount ? `${planCount} saved for this family` : "Gather places for a family", onClick: () => go("plan"), tone: 4 },
  ].filter(Boolean);
  const goTo = GO_TO.map((id) => resById.get(id)).filter(Boolean);
  return (
    <div className="home">
      <div className="home-hero">
        <p className="home-date">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h2>Find help for a family</h2>
      </div>

      <div className="quick">
        {tiles.map((t) => {
          const inner = (<>
            <span className="quick-ic"><Icon name={t.icon} size={22} /></span>
            <span className="quick-txt"><strong>{t.label}</strong><small>{t.sub}</small></span>
          </>);
          return t.href
            ? <a key={t.key} className={"quick-card tone-" + t.tone} href={t.href} target="_blank" rel="noreferrer">{inner}</a>
            : <button key={t.key} className={"quick-card tone-" + t.tone} onClick={t.onClick}>{inner}</button>;
        })}
      </div>

      <section className="home-sec">
        <div className="home-sec-head">
          <h2>Coming up this week</h2>
          <button className="linkish" onClick={() => go("events")}>All events</button>
        </div>
        {!upcoming.length && <p className="empty">{eventsLoading ? "Loading the family calendar…" : "Nothing listed for the next seven days."}</p>}
        <div className="strip">
          {upcoming.map((e) => (
            <button key={e.id} className="strip-card" onClick={() => onEvent(e)}>
              <span className="strip-date">{shortDate(e.date)}{e.time ? " · " + e.time : ""}</span>
              <strong>{e.what}</strong>
              {e.where && <span className="strip-where">{e.where}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="home-sec">
        <div className="home-sec-head"><h2>Go-to programs</h2></div>
        <div className="goto">
          {goTo.map((r) => {
            const tel = r.phone ? r.phone.split(/[/,]/)[0].trim() : "";
            return (
              <div key={r.id} className="goto-row">
                <button className="goto-main" onClick={() => openPage(r.id)}>
                  <strong>{r.name}</strong><span>{summaryOf(r)}</span>
                </button>
                {tel
                  ? <a className="goto-call" href={telHref(tel)} aria-label={"Call " + r.name}><Icon name="phone" size={18} /></a>
                  : r.web && <a className="goto-call" href={"https://" + r.web.replace(/^https?:\/\//, "")} target="_blank" rel="noreferrer" aria-label={"Open " + r.name}><Icon name="link" size={18} /></a>}
              </div>
            );
          })}
        </div>
      </section>

      {mine}

      <section className="home-sec">
        <NeedStart resById={resById} onGo={onGo} countOf={countOf} crisis={false} />
      </section>
    </div>
  );
}
