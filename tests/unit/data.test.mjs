import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const dataSource = readFileSync(join(root, "site/data.js"), "utf8");
const appSource = readFileSync(join(root, "site/app.js"), "utf8");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context, { filename: "site/data.js" });
const data = context.window.GW2;

function objectEntries(source, name) {
  const match = source.match(new RegExp("const " + name + " = \\{([\\s\\S]*?)\\n  \\};"));
  assert.ok(match, name + " block not found");
  const out = new Map();
  for (const entry of match[1].matchAll(/(\w+):\s*"([^"]+)"/g)) out.set(entry[1], entry[2]);
  return out;
}

test("event data has the expected shape", () => {
  assert.ok(data, "window.GW2 was not created");
  assert.equal(data.events.length, 70);
  assert.equal(Object.keys(data.groups).length, 38);
  assert.equal(new Set(data.events.map((event) => event.region)).size, 8);

  const ids = new Set();
  for (const event of data.events) {
    assert.ok(!ids.has(event.id), "duplicate event id " + event.id);
    ids.add(event.id);
    assert.ok(event.name, event.id + " has no name");
    assert.ok(event.map, event.id + " has no map");
    assert.match(event.chat, /^\[&[A-Za-z0-9+/]+=*\]$/, event.id + " has a bad chat code");
    assert.ok(event.kind === "boss" || event.kind === "meta", event.id + " has a bad kind");
    assert.ok(event.region, event.id + " has no region");
    const group = data.groups[event.group];
    assert.ok(group, event.id + " points to a missing group");
    const segments = group.partial.concat(group.pattern).map((step) => step[0]);
    assert.ok(segments.includes(event.segment), event.id + " points to a missing segment");
  }
});

test("boss and prep references point to real events", () => {
  const ids = new Set(data.events.map((event) => event.id));
  const bosses = objectEntries(appSource, "BOSS_EVENT");
  assert.equal(bosses.size, 15);
  for (const eventId of bosses.values()) assert.ok(ids.has(eventId), "missing boss event " + eventId);

  const prepMatch = appSource.match(/const PREP_MIN = \{([\s\S]*?)\n  \};/);
  assert.ok(prepMatch, "PREP_MIN block not found");
  const prepKeys = [...prepMatch[1].matchAll(/"([^"]+)":\s*\d+/g)].map((entry) => entry[1]);
  assert.ok(prepKeys.length > 0);
  for (const eventId of prepKeys) assert.ok(ids.has(eventId), "missing prep event " + eventId);
});
