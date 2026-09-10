/*
 * Loads the four data files and expands them into the shapes the UI uses.
 * The JSON on disk stays close to what the workbook exports, so a diff of
 * data/ still reads like a list of facts that changed.
 */
import resourcesFile from "../data/resources.json";
import sniffFile from "../data/sniff.json";
import peopleFile from "../data/point-people.json";
import craFile from "../data/community-resource-assessment.json";
import changelogFile from "../data/changelog.json";
import foodFile from "../data/food-by-day.json";

const DEEP = {
  I: "#B4552B", II: "#8F6A05", III: "#1E7A55", IV: "#1F5F9E", V: "#4A4BA8",
  VI: "#7038A8", VII: "#A83A6B", VIII: "#55731F", IX: "#157C86", X: "#9A6410",
  CRISIS: "#B0271F", RESPITE: "#6242A8", ESPANOL: "#157A6B",
};
const ICON = {
  I: "\u{1F331}", II: "\u{1F49B}", III: "\u{1FA7A}", IV: "\u{1F91D}", V: "\u{1F4DA}",
  VI: "\u{1F3E5}", VII: "\u{1F9E0}", VIII: "\u{1F9FA}", IX: "\u{1F308}", X: "✨",
  CRISIS: "\u{1F6A8}", RESPITE: "\u{1F319}", ESPANOL: "\u{1F5E3}️",
};

export const META = resourcesFile.meta;

export const SECTIONS = sniffFile.sections.map((s) => ({
  ...s, deep: DEEP[s.id], icon: ICON[s.id],
}));
export const SECBY = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

export const NEEDS = sniffFile.needs;
export const NEEDBY = Object.fromEntries(NEEDS.map((n) => [n.key, n]));

/* the on-disk field names are short because the workbook's are; the UI reads
   better with full ones, so rename once here rather than at every use site */
export const BASE = resourcesFile.resources.map((r) => ({
  id: r.id, name: r.n, sec: r.sec, needs: r.needs || [],
  spanish: r.sp || "", spanishDetail: r.spd || "",
  origSection: r.os || "", source: r.src || "",
  phone: r.ph || "", email: r.em || "", web: r.w || "", detail: r.d || "",
  address: r.a || "", hours: r.h || "", tags: r.t || "",
  verified: r.lv || "", verifiedBy: r.vb || "", point: r.pp || "",
  note: r.note || "", isNew: !!r.new,
  startHere: !!r.start, readFirst: !!r.readFirst,
}));

export const PEOPLE = peopleFile.people;
export const PEOPLE_META = peopleFile.meta;

export const CRA_SECTIONS = craFile.sections.map((c) => ({
  ...c, deep: DEEP[c.id], hue: SECBY[c.id].hue, icon: ICON[c.id],
}));
export const CRA = craFile.rows;

export const CHANGELOG = changelogFile;
export const FOOD = foodFile;

export const TODAY = new Date().toISOString().slice(0, 10);
export const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ");

/* fields the editor exposes, in the order they appear on a card */
export const FIELDS = [
  ["phone", "Phone"], ["web", "Website"], ["email", "Email"], ["address", "Address"],
  ["hours", "Hours"], ["point", "Point person"], ["detail", "What it is"], ["tags", "Tags"],
];
