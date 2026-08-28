/*
 * One-off importer. Reads the v20 single-file app build plus the v19 workbook
 * export and writes the four data files the app now loads at runtime.
 * Kept in the repo so the provenance of data/ is reproducible, not folklore.
 */
import { readFileSync, writeFileSync } from "node:fs";

const UP = process.argv[2];
if (!UP) {
  console.error("usage: node scripts/extract-data.mjs <uploads-dir>");
  process.exit(1);
}

const jsx = readFileSync(`${UP}/9742c4cc-wncresourcedirectory.jsx`, "utf8");
const RAW = JSON.parse(jsx.match(/^const RAW = (\{.*\});$/m)[1]);
const uploaded = JSON.parse(readFileSync(`${UP}/3086be90-resources.json`, "utf8"));

const write = (name, obj) => {
  writeFileSync(`data/${name}`, JSON.stringify(obj, null, 1) + "\n");
  console.log(`data/${name}`);
};

/* resources: the uploaded export is already the expanded canonical shape */
write("resources.json", uploaded);

/* sniff.json: sections and the 119 SNIFF questions, split out so both the app
   and any future script can read the taxonomy without loading 510 resources */
write("sniff.json", {
  meta: { ...RAW.m, note: "Section list and the SNIFF question taxonomy." },
  sections: RAW.sec.map(([id, name, hue]) => ({ id, name, hue })),
  needs: RAW.nd.map(([key, section, code, label]) => ({ key, section, code, label })),
});

/* point-people: RAW.P carries all 106 rows. One of them ("Dr. Mona Venzon") is
   a group-header row from the POINT PEOPLE tab that got parsed as a person --
   its notes are a pediatrician list and the real person is "Dr. Mona Venzon
   Rice" under Healthcare. Drop it. The Child First team block is flagged
   internal in the workbook because those are personal addresses. */
const INTERNAL = "Our team";
const people = RAW.P.filter((p) => p.n !== "Dr. Mona Venzon").map((p) => ({
  ...p,
  internal: p.grp === INTERNAL,
  src: "WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx, POINT PEOPLE tab",
}));
write("point-people.json", {
  meta: {
    file: "point-people.json",
    generated: RAW.m.generated,
    note: "RESPONSIVE? is the column that matters.",
    internalNote:
      "Entries with internal:true are the Child First team's personal addresses. " +
      "The workbook marks this block 'delete before sharing outside the team'. " +
      "The app hides them from exports unless you opt in.",
    count: people.length,
  },
  people,
});

/* community resource assessment: the 84 form rows */
write("community-resource-assessment.json", {
  meta: {
    file: "community-resource-assessment.json",
    form: "Community_Resource_Assessment_Form_2.docx (Child First, Dec 2015)",
    generated: RAW.m.generated,
    note: "84 service-type rows. `needs` crosswalks each row to SNIFF questions; `kw` are fallback keywords.",
  },
  sections: RAW.craS.map(([id, name, band]) => ({ id, name, band })),
  rows: RAW.cra.map(([id, section, num, label, needs, kw]) => ({ id, section, num, label, needs, kw })),
});
