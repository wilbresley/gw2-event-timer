/* Account reads go from this browser straight to ArenaNet.
   The only network host used here is https://api.guildwars2.com.
   The API key stays in localStorage under "gw2-token" and is never sent anywhere else. */
(function () {
  const API = "https://api.guildwars2.com";
  const TOKEN_KEY = "gw2-token";
  const NIL = "00000000-0000-0000-0000-000000000000";
  const NEED = ["account", "inventories", "characters", "builds", "wallet", "unlocks", "tradingpost", "pvp", "wvw", "progression", "guilds"];
  const PROFS = ["Guardian", "Revenant", "Warrior", "Engineer", "Ranger", "Thief", "Elementalist", "Mesmer", "Necromancer"];
  const PROF_COLOR = {
    Guardian: "#72c6e5",
    Revenant: "#d24e45",
    Warrior: "#e6b422",
    Engineer: "#d08a3a",
    Ranger: "#7dce63",
    Thief: "#d23a3a",
    Elementalist: "#f07a7a",
    Mesmer: "#c58be0",
    Necromancer: "#3caf62"
  };
  const SLOT_ORDER = ["Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots", "WeaponA1", "WeaponA2", "WeaponB1", "WeaponB2", "Backpack", "Accessory1", "Accessory2", "Amulet", "Ring1", "Ring2", "Relic", "HelmAquatic", "WeaponAquaticA", "WeaponAquaticB", "Sickle", "Axe", "Pick"];

  const COPY = {
    en: {
      account: "Account",
      summary: "Summary",
      legendary: "Legendary",
      ascended: "Ascended",
      inventory: "Inventory",
      characters: "Characters",
      bosses: "Bosses",
      wallet: "Wallet",
      unlocks: "Unlocks",
      trade: "Auction House",
      pvp: "PvP",
      wvw: "WvW",
      progress: "Progress",
      guilds: "Guilds",
      save: "Save key",
      refresh: "Update this menu from the API",
      refreshAll: "Update all menus from the API",
      resetMenu: "Clear this menu's filters",
      resetAll: "Clear filters on all menus",
      forget: "Forget Account",
      forgetAsk: "Forget this account on this browser? The key is deleted only here. You will have to paste it again.",
      cancel: "Cancel",
      reading: "Reading the account…",
      chars: "Reading characters…",
      bank: "Reading bank and bags…",
      items: "Reading items…",
      extra: "Reading the rest of the account…",
      keyTitle: "API key",
      keyLead: "The key stays in this browser only. This page's server never receives or stores it. Clear the cache and you will paste it again.",
      keyPh: "Paste the account key",
      keyLink: "Create a key at account.arena.net",
      keyBad: "ArenaNet rejected that key.",
      keyNet: "The API did not answer. Try again.",
      perms: "Enable these permissions on the key:",
      missing: "Missing permissions:",
      saved: "Saved in this browser",
      updating: "Refreshing…",
      names: "Item names stay in English. The game API has no Portuguese.",
      empty: "Nothing matches this filter.",
      bankL: "Bank",
      shared: "Shared Slot",
      materials: "Materials",
      armory: "Legendary Armory",
      bag: "Inventory",
      equipped: "Equipped",
      onChar: "on the character",
      tab: "Tab",
      active: "active",
      weapons: "Weapons",
      accessories: "Accessories",
      stuff: "Items",
      armor: "Armor",
      upgrades: "Upgrades and infusions",
      other: "Other",
      all: "All",
      search: "Search by name",
      where: "Where",
      anywhere: "Anywhere",
      count: "showing",
      of: "of",
      refine: "Tighten the filter or search by name to see the rest.",
      noCache: "This browser did not keep the cache. The page still works; each visit reads the account again.",
      level: "level",
      race: "Race",
      gender: "Gender",
      age: "Time played",
      deaths: "Deaths",
      created: "Created",
      crafting: "Crafting",
      guild: "Guild",
      years: "years",
      days: "days",
      yes: "Yes",
      no: "No",
      none: "none",
      killed: "done today",
      open: "not yet",
      bossNote: "Bosses killed since the daily reset are marked done on the timer. That mark refreshes from the API about once an hour, or when you press Refresh.",
      buys: "Current buys",
      sells: "Current sells",
      buyH: "Buy history",
      sellH: "Sell history",
      qty: "qty",
      rank: "Rank",
      wins: "Wins",
      losses: "Losses",
      games: "Recent games",
      team: "Team",
      wvwGuild: "WvW guild",
      achievements: "Achievements",
      raids: "Raids",
      dungeons: "Dungeons",
      masteries: "Masteries",
      points: "Mastery points",
      done: "done",
      roster: "Roster",
      motd: "Message of the day",
      log: "Recent history",
      members: "members",
      visual: "skin",
      loadNames: "Loading names…",
      recipesNote: "Search to narrow the list. Names are the item the recipe makes.",
      commander: "Commander Tag",
      fractal: "Fractal Level",
      world: "Home World",
      worldHint: "The server this account plays on.",
      fractalHint: "Personal fractal level.",
      ap: "Daily Achievement Points",
      apHint: "Achievement points earned since the daily reset.",
      map: "Monthly Achievement Points",
      mapHint: "Achievement points earned this month.",
      tools: "Tools",
      close: "Close",
      infinite: "Infinite",
      limited: "Limited",
      track: "Track one infinite tool of each type",
      clearTrack: "Clear tracked tools",
      glyphs: "Tool glyphs",
      pickTool: "Choose an infinite tool",
      wizard: "Wizard's Vault",
      levelWord: "Level",
      raidNote: "These numbers are lifetime clears for the whole account. They are not today, and they are not this week. A raid shows how many of its encounters this account has ever defeated. 0/11 means this account has never defeated any of that raid's 11 encounters. A dungeon shows how many of its paths this account has ever finished. 0/4 means this account has never finished any of that dungeon's 4 paths.",
      whereFind: "Where to find?",
      separateBags: "Separate bags",
      unifiedBags: "Unified bags",
      allBags: "All in one",
      relics: "Relics",
      sets: "Sets",
      catsNote: "Cats are unlocked inside the home instance. The API only sends a hint word, and it does not send an icon.",
      nodesNote: "Home nodes are gathering nodes in the home instance. The API sends an id and does not send an icon.",
      emotesNote: "The icon is the item that unlocks the emote, when the API has one.",
      toolNote: "Update this menu from the API asks ArenaNet immediately. This page adds no extra wait. ArenaNet keeps its own copy of a character, usually for about 5 minutes, and a tool you just moved can take longer if that character has not changed maps or logged out. There is no call that returns only tools, so this button reads characters, the bank, and shared slots.",
      charsN: "Characters",
      home: "Home",
      access: "Expansions"
    }
  };

  const WORD = {
    Guardian: "Guardian",
    Revenant: "Revenant",
    Warrior: "Warrior",
    Engineer: "Engineer",
    Ranger: "Ranger",
    Thief: "Thief",
    Elementalist: "Elementalist",
    Mesmer: "Mesmer",
    Necromancer: "Necromancer",
    Human: "Human",
    Charr: "Charr",
    Norn: "Norn",
    Asura: "Asura",
    Sylvari: "Sylvari",
    Male: "Male",
    Female: "Female",
    Weaponsmith: "Weaponsmith",
    Armorsmith: "Armorsmith",
    Artificer: "Artificer",
    Chef: "Chef",
    Huntsman: "Huntsman",
    Jeweler: "Jeweler",
    Leatherworker: "Leatherworker",
    Tailor: "Tailor",
    Scribe: "Scribe",
    Helm: "Head Armor",
    Shoulders: "Shoulder Armor",
    Coat: "Chest Armor",
    Gloves: "Hand Armor",
    Leggings: "Leg Armor",
    Boots: "Foot Armor",
    WeaponA1: "Main-Hand",
    WeaponA2: "Off-Hand",
    WeaponB1: "Alternate Main-Hand",
    WeaponB2: "Alternate Off-Hand",
    Backpack: "Back Item",
    Accessory1: "Accessory",
    Accessory2: "Accessory",
    Amulet: "Amulet",
    Ring1: "Ring",
    Ring2: "Ring",
    Relic: "Relic",
    HelmAquatic: "Aquatic Headgear",
    WeaponAquaticA: "Aquatic Weapon",
    WeaponAquaticB: "Alternate Aquatic Weapon",
    Sickle: "Foraging",
    Axe: "Logging",
    Pick: "Mining",
    PlayForFree: "Free",
    GuildWars2: "Core",
    HeartOfThorns: "Heart of Thorns",
    PathOfFire: "Path of Fire",
    EndOfDragons: "End of Dragons",
    SecretsOfTheObscure: "Secrets of the Obscure",
    JanthirWilds: "Janthir Wilds",
    IcebroodSaga: "Icebrood Saga",
    VisionsOfEternity: "Visions of Eternity",
  };
  const ACCESS_ORDER = [
    ["GuildWars2", ""],
    ["PlayForFree", ""],
    ["HeartOfThorns", "Heart of Thorns"],
    ["PathOfFire", "Path of Fire"],
    ["IcebroodSaga", "Icebrood Saga"],
    ["EndOfDragons", "End of Dragons"],
    ["SecretsOfTheObscure", "Secrets of the Obscure"],
    ["JanthirWilds", "Janthir Wilds"],
    ["VisionsOfEternity", "Visions of Eternity"]
  ];

  const NAV = [
    ["home", "summary"],
    ["legend", "legendary"],
    ["gear", "ascended"],
    ["bags", "inventory"],
    ["people", "characters"],
    ["tools", "tools"],
    ["bosses", "bosses"],
    ["wallet", "wallet"],
    ["unlocks", "unlocks"],
    ["trade", "trade"],
    ["pvp", "pvp"],
    ["wvw", "wvw"],
    ["progress", "progress"],
    ["guilds", "guilds"]
  ];

  const UNLOCKS = [
    { id: "skins", path: "/v2/skins", account: "/v2/account/skins", label: "Skins" },
    { id: "dyes", path: "/v2/colors", account: "/v2/account/dyes", label: "Dyes" },
    { id: "minis", path: "/v2/minis", account: "/v2/account/minis", label: "Minis" },
    { id: "finishers", path: "/v2/finishers", account: "/v2/account/finishers", label: "Finishers" },
    { id: "outfits", path: "/v2/outfits", account: "/v2/account/outfits", label: "Outfits" },
    { id: "titles", path: "/v2/titles", account: "/v2/account/titles", label: "Titles" },
    { id: "gliders", path: "/v2/gliders", account: "/v2/account/gliders", label: "Gliders" },
    { id: "mail", path: "/v2/mailcarriers", account: "/v2/account/mailcarriers", label: "Mail" },
    { id: "novelties", path: "/v2/novelties", account: "/v2/account/novelties", label: "Novelties" },
    { id: "jadebots", path: "/v2/jadebots", account: "/v2/account/jadebots", label: "Jade bots" },
    { id: "skiffs", path: "/v2/skiffs", account: "/v2/account/skiffs", label: "Skiffs" },
    { id: "emotes", path: "/v2/emotes", account: "/v2/account/emotes", label: "Emotes" },
    { id: "mounts", path: "/v2/mounts/types", account: "/v2/account/mounts/types", label: "Mounts" },
    { id: "mountskins", path: "/v2/mounts/skins", account: "/v2/account/mounts/skins", label: "Mount skins" },
    { id: "recipes", path: "/v2/recipes", account: "/v2/account/recipes", label: "Recipes" },
    { id: "nodes", path: "/v2/home/nodes", account: "/v2/account/home/nodes", label: "Home nodes" },
    { id: "cats", path: "/v2/cats", account: "/v2/account/home/cats", label: "Cats" }
  ];

  const view = document.getElementById("account-view");
  const btn = document.getElementById("account");
  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : raw;
    } catch (err) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (err) { return false; }
  }
  function dropStore(key) {
    try { localStorage.removeItem(key); } catch (err) { /* modo privado */ }
  }
  let token = readStore(TOKEN_KEY, "") || "";
  let open = false;
  let snap = null;
  let rows = [];
  let section = "home";
  let loading = false;
  let status = "";
  let loadError = "";
  let forgetAsk = false;
  const gearState = { pick: "", sub: "", query: "", weight: "" };
  const legendState = { pick: "", sub: "", query: "", weight: "" };
  let bagQuery = "";
  let bagRarity = new Set();
  let bagPlace = "";
  let bagType = new Set();
  let bagLayout = "separate";
  let bankLayout = "separate";
  let skinWeight = "";
  let materialCats = null;
  let materialCatJob = false;
  const BAG_COLS_MIN = 4;
  const BAG_COLS_MAX = 32;
  let bagColsOn = readStore("gw2-bag-cols-on", "") === "1";
  let bagCols = Math.min(BAG_COLS_MAX, Math.max(BAG_COLS_MIN, Number(readStore("gw2-bag-cols", "")) || 10));
  let skinSlot = "";
  let skinSets = "";
  let apiDown = false;
  let refreshAllAt = 0;
  let storageAt = 0;
  let mountPick = "";
  let recipePick = "";
  let lastApiAge = null;
  let person = "";
  let personQuery = "";
  let guildQuery = "";
  let homeQuery = "";
  let unlockCat = "skins";
  let unlockQuery = "";
  let dyePick = "";
  let noveltyPick = "";
  let unlockLoading = "";
  let bossQuery = "";
  let pvpQuery = "";
  let wvwQuery = "";
  let walletQuery = "";
  let walletPick = new Set();
  let tradePick = "all";
  let tradeQuery = "";
  let progressMode = "raids";
  let masteryPick = new Set();
  let progressQuery = "";
  let toolQuery = "";
  let toolPick = "";
  let focusSearch = false;
  const equipShown = {};
  let detail = null;
  const items = new Map();
  const stats = new Map();
  const specs = new Map();
  const skins = new Map();
  const unlockCache = new Map();

  function t() { return COPY.en; }
  function word(key) {
    return WORD[key] || key || "";
  }
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  }
  function chunks(list, size) {
    const out = [];
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
  }
  function asIds(value) {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => {
      if (typeof entry === "number" || typeof entry === "string") return entry;
      if (entry && entry.id != null) return entry.id;
      return null;
    }).filter((entry) => entry != null);
  }
  function finisherRecords(value) {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => {
      if (typeof entry === "number" || typeof entry === "string") return { id: entry, permanent: true, quantity: 0 };
      if (!entry || entry.id == null) return null;
      const permanent = entry.permanent !== false;
      return { id: entry.id, permanent: permanent, quantity: permanent ? 0 : (Number(entry.quantity) || 0) };
    }).filter(Boolean);
  }
  function unlockIdList(cat) {
    return ((snap && snap.unlocks && snap.unlocks[cat]) || []).map((entry) => (
      entry && typeof entry === "object" ? entry.id : entry
    )).filter((id) => id != null);
  }
  function problemText() {
    const L = t();
    if (loadError === "auth") return L.keyBad;
    if (loadError === "halt") return "API calls were stopped so this page cannot flood ArenaNet. Reload the page before trying again.";
    return L.keyNet;
  }
  function coins(copper) {
    const n = Math.max(0, Math.round(Number(copper) || 0));
    const g = Math.floor(n / 10000);
    const s = Math.floor((n % 10000) / 100);
    const c = n % 100;
    return (g ? g + "g " : "") + (g || s ? s + "s " : "") + c + "c";
  }
  function when(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-GB");
  }
  function age(sec) {
    const days = Math.floor((Number(sec) || 0) / 86400);
    const years = Math.floor(days / 365);
    const L = t();
    if (years >= 1) return years + " " + L.years;
    return days + " " + L.days;
  }
  function slotLabel(slot) { return word(slot) || slot || ""; }

  let dbp;
  function db() {
    if (!dbp) {
      dbp = new Promise((resolve, reject) => {
        const req = indexedDB.open("gw2acct", 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains("kv")) req.result.createObjectStore("kv");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbp;
  }
  let cacheFailed = false;
  function idbGet(key) {
    return db().then((store) => new Promise((resolve) => {
      const tx = store.transaction("kv", "readonly");
      const req = tx.objectStore("kv").get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    })).catch(() => null);
  }
  function idbSet(key, value) {
    return db().then((store) => new Promise((resolve) => {
      const tx = store.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => { cacheFailed = true; resolve(false); };
      tx.onabort = () => { cacheFailed = true; resolve(false); };
    })).catch(() => { cacheFailed = true; return false; });
  }
  function idbDel(key) {
    return db().then((store) => new Promise((resolve) => {
      const tx = store.transaction("kv", "readwrite");
      tx.objectStore("kv").delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    })).catch(() => {});
  }

  const CATALOG_SCHEMA = 2;
  function catalogBlob() {
    const blob = { schema: CATALOG_SCHEMA, items: {}, stats: {}, specs: {}, skins: {}, unlocks: {} };
    items.forEach((value, key) => { blob.items[key] = value; });
    stats.forEach((value, key) => { blob.stats[key] = value; });
    specs.forEach((value, key) => { blob.specs[key] = value; });
    skins.forEach((value, key) => { blob.skins[key] = value; });
    unlockCache.forEach((value, key) => { blob.unlocks[key] = value; });
    return blob;
  }
  async function saveCatalog() { await idbSet("catalog", catalogBlob()); }
  async function loadCatalog() {
    const blob = await idbGet("catalog");
    if (!blob) return;
    if (blob.schema !== CATALOG_SCHEMA) {
      await idbDel("catalog");
      await idbDel("prof-bars");
      return;
    }
    Object.values(blob.items || {}).forEach((item) => items.set(item.id, item));
    Object.entries(blob.stats || {}).forEach(([key, value]) => stats.set(Number(key), value));
    Object.entries(blob.specs || {}).forEach(([key, value]) => specs.set(Number(key), value));
    Object.entries(blob.skins || {}).forEach(([key, value]) => skins.set(Number(key), value));
    Object.entries(blob.unlocks || {}).forEach(([key, value]) => unlockCache.set(key, value));
  }

  const rateTimes = [];
  let rateWaiters = 0;
  let rateHalted = false;
  const inflightApi = new Map();
  function haltError() {
    rateHalted = true;
    const error = new Error("halt");
    error.halt = true;
    error.status = 0;
    return error;
  }
  async function takeRateSlot() {
    if (rateHalted) throw haltError();
    if (rateWaiters >= 40) throw haltError();
    rateWaiters += 1;
    let waits = 0;
    try {
      for (;;) {
        if (rateHalted) throw haltError();
        const now = Date.now();
        while (rateTimes.length && now - rateTimes[0] >= 60000) rateTimes.shift();
        if (rateTimes.length < 600) {
          rateTimes.push(now);
          return;
        }
        waits += 1;
        if (waits > 30) throw haltError();
        const delay = Math.min(5000, Math.max(200, 60000 - (now - rateTimes[0]) + 25));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } finally {
      rateWaiters -= 1;
    }
  }
  async function apiCall(path) {
    await takeRateSlot();
    const url = new URL(API + path);
    url.searchParams.set("v", "latest");
    if (token) url.searchParams.set("access_token", token);
    let res = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt) await takeRateSlot();
      url.searchParams.set("_", String(Date.now()));
      res = await fetch(url, { cache: "no-store", headers: { "Accept-Language": "en" } });
      const ageHeader = res.headers.get("age");
      if (ageHeader != null && ageHeader !== "" && !Number.isNaN(Number(ageHeader))) lastApiAge = Number(ageHeader);
      if (res.status !== 429) break;
      const wait = Math.min(8, Number(res.headers.get("Retry-After")) || 1);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    }
    if (!res.ok) {
      const error = new Error(String(res.status));
      error.status = res.status;
      throw error;
    }
    return res.json();
  }
  function api(path) {
    if (rateHalted) return Promise.reject(haltError());
    if (inflightApi.has(path)) return inflightApi.get(path);
    const job = apiCall(path).finally(() => inflightApi.delete(path));
    inflightApi.set(path, job);
    return job;
  }
  async function opt(path) {
    try { return await api(path); } catch (error) {
      if (error.status === 403 || error.status === 404 || error.status === 400) return null;
      throw error;
    }
  }
  async function byIds(path, ids) {
    const uniq = [...new Set(ids.filter((id) => id != null && id !== ""))];
    const out = [];
    async function part(list) {
      if (!list.length) return;
      try {
        const data = await api(path + "?ids=" + list.map(encodeURIComponent).join(","));
        if (Array.isArray(data)) out.push(...data);
        else if (data) out.push(data);
      } catch (error) {
        if (error.status === 404 && list.length > 1) {
          const mid = Math.ceil(list.length / 2);
          await part(list.slice(0, mid));
          await part(list.slice(mid));
          return;
        }
        if (error.status === 404 || error.status === 400) return;
        throw error;
      }
    }
    for (const piece of chunks(uniq, 200)) await part(piece);
    return out;
  }

  function slimItem(item) {
    const details = item.details || {};
    return {
      id: item.id,
      name: item.name || ("#" + item.id),
      icon: item.icon || "",
      rarity: item.rarity || "",
      type: item.type || "",
      sub: details.type || "",
      weight: details.weight_class || "",
      weightKnown: true
    };
  }
  let itemWeightJob = false;
  function requestItemWeights(ids, stillHere) {
    const missing = [...new Set(ids)].filter((id) => {
      const item = items.get(id);
      return item && item.type === "Armor" && !item.weightKnown;
    });
    if (!missing.length || itemWeightJob) return;
    itemWeightJob = true;
    byIds("/v2/items", missing).then((list) => {
      const got = new Set();
      (list || []).forEach((item) => {
        items.set(item.id, slimItem(item));
        got.add(item.id);
      });
      missing.forEach((id) => {
        if (got.has(id)) return;
        const item = items.get(id);
        if (item) item.weightKnown = true;
      });
      return saveCatalog();
    }).catch(() => {}).finally(() => {
      itemWeightJob = false;
      if (stillHere()) renderBody();
    });
  }
  function sigOf(stack) {
    const ups = (stack.upgrades || []).slice().sort((a, b) => a - b).join(".");
    const inf = (stack.infusions || []).slice().sort((a, b) => a - b).join(".");
    const stat = stack.stats && stack.stats.id ? stack.stats.id : 0;
    return stack.id + "|" + stat + "|" + ups + "|" + inf;
  }
  function indexRows(data) {
    const armory = new Set((data.armory || []).map((entry) => entry.id));
    const map = new Map();
    function touch(stack) {
      const sig = sigOf(stack);
      if (map.has(sig)) return map.get(sig);
      const row = {
        id: stack.id,
        stats: stack.stats && stack.stats.id ? stack.stats.id : 0,
        attributes: (stack.stats && stack.stats.attributes) || null,
        upgrades: stack.upgrades || [],
        infusions: stack.infusions || [],
        count: 0,
        locs: []
      };
      map.set(sig, row);
      return row;
    }
    function add(stack, loc, countIt) {
      if (!stack || !stack.id) return;
      const row = touch(stack);
      const n = stack.count || 1;
      if (countIt) row.count += n;
      if (stack.stats && stack.stats.attributes && !row.attributes) row.attributes = stack.stats.attributes;
      const key = loc.kind + "|" + (loc.who || "") + "|" + (loc.slot || "");
      let found = row.locs.find((entry) => entry.key === key);
      if (!found) {
        found = Object.assign({ key: key, count: 0, tabs: [] }, loc);
        row.locs.push(found);
      }
      found.count += n;
      if (stack.skin) found.skin = stack.skin;
    }
    (data.bank || []).forEach((stack) => add(stack, { kind: "bank" }, true));
    (data.shared || []).forEach((stack) => add(stack, { kind: "shared" }, true));
    (data.materials || []).forEach((stack) => add(stack, { kind: "materials" }, true));
    (data.armory || []).forEach((stack) => add({ id: stack.id, count: stack.count || 1 }, { kind: "armory" }, true));
    (data.characters || []).forEach((ch) => {
      (ch.bags || []).forEach((bag) => {
        ((bag && bag.inventory) || []).forEach((stack) => add(stack, { kind: "bag", who: ch.name }, true));
      });
      (ch.equipment || []).forEach((stack) => {
        add(stack, { kind: "equipped", who: ch.name, slot: stack.slot }, !armory.has(stack.id));
      });
      (ch.equipment_tabs || []).forEach((tab) => {
        (tab.equipment || []).forEach((piece) => {
          if (!piece || !piece.id) return;
          let row = map.get(sigOf(piece));
          if (!row) {
            const ups = (piece.upgrades || []).slice().sort((a, b) => a - b).join(".");
            const inf = (piece.infusions || []).slice().sort((a, b) => a - b).join(".");
            const candidates = [...map.values()].filter((entry) => {
              if (entry.id !== piece.id) return false;
              const entryUps = entry.upgrades.slice().sort((a, b) => a - b).join(".");
              const entryInf = entry.infusions.slice().sort((a, b) => a - b).join(".");
              return entryUps === ups && entryInf === inf;
            });
            row = candidates.find((entry) => entry.locs.some((loc) => loc.kind === "equipped" && loc.who === ch.name && loc.slot === piece.slot))
              || (candidates.length === 1 ? candidates[0] : null);
          }
          if (!row) return;
          const loc = row.locs.find((entry) => entry.kind === "equipped" && entry.who === ch.name && entry.slot === piece.slot)
            || row.locs.find((entry) => entry.who === ch.name && (entry.kind === "bag" || entry.kind === "equipped"));
          if (!loc) return;
          if (!loc.tabs.some((entry) => entry.tab === tab.tab)) {
            loc.tabs.push({ tab: tab.tab, name: tab.name || "", active: !!tab.is_active });
          }
        });
      });
    });
    return [...map.values()];
  }

  function itemOf(id) { return items.get(id) || null; }
  function itemName(id) {
    const item = itemOf(id);
    return item ? item.name : "#" + id;
  }
  function groupOf(item) {
    if (!item) return "item";
    if (item.type === "Weapon") return "weapon";
    if (item.type === "Armor") return "armor";
    if (item.type === "Trinket" || item.type === "Back") return "accessory";
    if (item.type === "Relic") return "relic";
    if (item.type === "CraftingMaterial" || item.type === "Trophy") return "material";
    return "item";
  }
  function subOf(item) {
    if (!item) return "other";
    if (item.type === "Armor") return "armor";
    if (item.type === "UpgradeComponent" || item.type === "Gizmo") return "upgrade";
    if (item.type === "CraftingMaterial" || item.type === "Trophy") return "material";
    return "other";
  }
  function prefix(row) {
    if (!row.stats) return "";
    return stats.get(row.stats) || "";
  }
  function locText(loc) {
    const L = t();
    let base = loc.kind;
    if (loc.kind === "bank") base = L.bankL;
    else if (loc.kind === "shared") base = L.shared;
    else if (loc.kind === "materials") base = L.materials;
    else if (loc.kind === "armory") base = L.armory;
    else if (loc.kind === "bag") base = loc.who + " · " + L.bag;
    else if (loc.kind === "equipped") base = loc.who + " · " + (loc.slot ? L.equipped + " · " + slotLabel(loc.slot) : L.onChar);
    if (loc.count > 1) base += " ×" + loc.count;
    if (loc.tabs && loc.tabs.length) {
      const names = loc.tabs.slice().sort((a, b) => a.tab - b.tab).map((tab) => {
        const label = tab.name || ("Equipment template " + tab.tab);
        return label + (tab.active ? " (active)" : "");
      });
      base += " · " + names.join(", ");
    }
    return base;
  }
  function rowHay(row) {
    const item = itemOf(row.id);
    const bits = [itemName(row.id), prefix(row), item && item.sub, item && item.type];
    row.upgrades.forEach((id) => bits.push(itemName(id)));
    row.infusions.forEach((id) => bits.push(itemName(id)));
    row.locs.forEach((loc) => bits.push(loc.who, locText(loc)));
    return bits.filter(Boolean).join(" ").toLowerCase();
  }
  function paintBtn() {
    btn.textContent = "Account";
    btn.setAttribute("aria-pressed", open ? "true" : "false");
  }
  function setStatus(text) {
    status = text;
    const node = document.getElementById("acct-status");
    if (node) node.textContent = text;
  }
  function applyBosses() {
    if (window.GW2Timer && snap && snap.bosses) window.GW2Timer.applyBosses(snap.bosses);
  }

  function collectIds(data) {
    const ids = new Set();
    const skinsIds = new Set();
    const specIds = new Set();
    function take(stack) {
      if (!stack || !stack.id) return;
      ids.add(stack.id);
      (stack.upgrades || []).forEach((id) => ids.add(id));
      (stack.infusions || []).forEach((id) => ids.add(id));
      if (stack.skin) skinsIds.add(stack.skin);
      if (stack.stats && stack.stats.id) stats.set(stack.stats.id, stats.get(stack.stats.id) || "");
    }
    (data.bank || []).forEach(take);
    (data.shared || []).forEach(take);
    (data.materials || []).forEach(take);
    (data.armory || []).forEach((entry) => ids.add(entry.id));
    ["buys", "sells", "buyHist", "sellHist"].forEach((key) => {
      ((data.tp && data.tp[key]) || []).forEach((entry) => ids.add(entry.item_id));
    });
    (data.characters || []).forEach((ch) => {
      (ch.bags || []).forEach((bag) => {
        if (bag && bag.id) ids.add(bag.id);
        ((bag && bag.inventory) || []).forEach(take);
      });
      (ch.equipment || []).forEach(take);
      (ch.equipment_tabs || []).forEach((tab) => (tab.equipment || []).forEach(take));
      (ch.build_tabs || []).forEach((tab) => {
        const build = tab.build || {};
        (build.specializations || []).forEach((spec) => {
          if (spec && spec.id) specIds.add(spec.id);
        });
      });
    });
    return { ids: [...ids], skinsIds: [...skinsIds], specIds: [...specIds] };
  }

  async function fetchAll() {
    setStatus(t().reading);
    const tokeninfo = await api("/v2/tokeninfo");
    const account = await api("/v2/account");
    const world = await opt("/v2/worlds?ids=" + account.world);
    setStatus(t().chars);
    const characters = [];
    for (let page = 0; page < 20; page += 1) {
      const chunk = await api("/v2/characters?page=" + page + "&page_size=200");
      characters.push(...chunk);
      if (!Array.isArray(chunk) || chunk.length < 200) break;
    }
    characters.forEach((ch) => {
      delete ch.recipes;
      delete ch.training;
      delete ch.skills;
    });
    setStatus(t().bank);
    const [bank, shared, materials, armory, bosses, wallet, wvw] = await Promise.all([
      opt("/v2/account/bank"),
      opt("/v2/account/inventory"),
      opt("/v2/account/materials"),
      opt("/v2/account/legendaryarmory"),
      opt("/v2/account/worldbosses"),
      opt("/v2/account/wallet"),
      opt("/v2/account/wvw")
    ]);
    const walletList = wallet || [];
    if (!walletList.some((entry) => entry.id === 63)) walletList.push({ id: 63, value: 0 });
    const currencies = await byIds("/v2/currencies", walletList.map((entry) => entry.id));
    const unlocks = {};
    await Promise.all(UNLOCKS.map(async (spec) => {
      const raw = await opt(spec.account);
      unlocks[spec.id] = spec.id === "finishers" ? finisherRecords(raw) : asIds(raw);
    }));
    const [buys, sells, buyHist, sellHist] = await Promise.all([
      opt("/v2/commerce/transactions/current/buys?page_size=50"),
      opt("/v2/commerce/transactions/current/sells?page_size=50"),
      opt("/v2/commerce/transactions/history/buys?page_size=50"),
      opt("/v2/commerce/transactions/history/sells?page_size=50")
    ]);
    const pvp = await opt("/v2/pvp/stats");
    const gamesIds = await opt("/v2/pvp/games");
    const games = Array.isArray(gamesIds) && gamesIds.length
      ? await byIds("/v2/pvp/games", gamesIds.slice(-8))
      : [];
    const mapIds = games.map((game) => game.map_id).filter(Boolean);
    const maps = mapIds.length ? await byIds("/v2/maps", mapIds) : [];
    setStatus(t().extra);
    const ach = await opt("/v2/account/achievements");
    const raidDone = await opt("/v2/account/raids");
    const raidIds = await opt("/v2/raids");
    const raidDefs = [];
    for (const id of raidIds || []) {
      const raid = await opt("/v2/raids/" + id);
      if (raid) raidDefs.push(raid);
    }
    const dungeonDone = asIds(await opt("/v2/account/dungeons"));
    const dungeonIds = await opt("/v2/dungeons");
    const dungeonDefs = dungeonIds ? await byIds("/v2/dungeons", dungeonIds) : [];
    const masteryRows = await opt("/v2/account/masteries");
    const masteryDefs = masteryRows ? await byIds("/v2/masteries", masteryRows.map((entry) => entry.id)) : [];
    const masteryPoints = await opt("/v2/account/mastery/points");
    const guilds = [];
    for (const id of account.guilds || []) {
      const guild = await readGuild(id);
      if (guild) guilds.push(guild);
    }
    const professions = await byIds("/v2/professions", PROFS);
    const data = {
      saved: Date.now(),
      bossesSaved: Date.now(),
      tokeninfo: { name: tokeninfo.name, permissions: tokeninfo.permissions || [] },
      account: account,
      world: Array.isArray(world) ? world[0] : world,
      characters: characters,
      bank: bank || [],
      shared: shared || [],
      materials: materials || [],
      armory: armory || [],
      bosses: bosses || [],
      wallet: walletList,
      currencies: currencies,
      unlocks: unlocks,
      tp: { buys: buys || [], sells: sells || [], buyHist: buyHist || [], sellHist: sellHist || [] },
      pvp: pvp || null,
      games: games,
      maps: maps,
      wvw: wvw || null,
      progress: {
        achievements: {
          total: Array.isArray(ach) ? ach.length : 0,
          done: Array.isArray(ach) ? ach.filter((entry) => entry.done).length : 0
        },
        raidDone: raidDone || [],
        raids: raidDefs,
        dungeonDone: dungeonDone,
        dungeons: dungeonDefs,
        masteries: masteryRows || [],
        masteryDefs: masteryDefs,
        masteryPoints: masteryPoints || null
      },
      guilds: guilds,
      professions: (professions || []).map((entry) => ({ id: entry.id, name: entry.name, icon: entry.icon || "" }))
    };
    setStatus(t().items);
    await hydrate(data);
    return data;
  }
  async function hydrate(data) {
    const bag = collectIds(data);
    const missingItems = bag.ids.filter((id) => !items.has(id));
    (await byIds("/v2/items", missingItems)).forEach((item) => items.set(item.id, slimItem(item)));
    const statIds = [...stats.keys()].filter((id) => !stats.get(id));
    if (![...stats.values()].some(Boolean)) {
      const all = await opt("/v2/itemstats");
      (await byIds("/v2/itemstats", all || statIds)).forEach((entry) => stats.set(entry.id, entry.name));
    } else {
      (await byIds("/v2/itemstats", statIds)).forEach((entry) => stats.set(entry.id, entry.name));
    }
    (await byIds("/v2/specializations", bag.specIds.filter((id) => !specs.has(id)))).forEach((entry) => {
      specs.set(entry.id, { id: entry.id, name: entry.name, icon: entry.icon || "", elite: !!entry.elite });
    });
    (await byIds("/v2/skins", bag.skinsIds.filter((id) => !skins.has(id)))).forEach((entry) => {
      skins.set(entry.id, { id: entry.id, name: entry.name, icon: entry.icon || "" });
    });
    await saveCatalog();
  }
  async function readCharacters() {
    const characters = [];
    for (let page = 0; page < 20; page += 1) {
      const chunk = await api("/v2/characters?page=" + page + "&page_size=200");
      characters.push(...(chunk || []));
      if (!Array.isArray(chunk) || chunk.length < 200) break;
    }
    characters.forEach((ch) => {
      delete ch.recipes;
      delete ch.training;
      delete ch.skills;
    });
    return characters;
  }
  async function refreshStorage() {
    setStatus("Reading characters, bank, and shared slots…");
    snap.characters = await readCharacters();
    const [bank, shared, materials, armory] = await Promise.all([
      opt("/v2/account/bank"),
      opt("/v2/account/inventory"),
      opt("/v2/account/materials"),
      opt("/v2/account/legendaryarmory")
    ]);
    snap.bank = bank || [];
    snap.shared = shared || [];
    snap.materials = materials || [];
    snap.armory = armory || [];
    rows = indexRows(snap);
    await hydrate(snap);
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function refreshWallet() {
    setStatus("Reading the wallet…");
    const wallet = await opt("/v2/account/wallet");
    const walletList = wallet || [];
    if (!walletList.some((entry) => entry.id === 63)) walletList.push({ id: 63, value: 0 });
    snap.wallet = walletList;
    snap.currencies = await byIds("/v2/currencies", walletList.map((entry) => entry.id));
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function refreshUnlockCat() {
    const spec = UNLOCKS.find((entry) => entry.id === unlockCat) || UNLOCKS[0];
    setStatus("Reading " + spec.label + "…");
    if (!snap.unlocks) snap.unlocks = {};
    const rawUnlock = await opt(spec.account);
    snap.unlocks[spec.id] = spec.id === "finishers" ? finisherRecords(rawUnlock) : asIds(rawUnlock);
    unlockCache.delete(spec.id);
    unlockFailed.delete(spec.id);
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    await ensureUnlock(spec.id);
    showAccount();
  }
  async function refreshTrade() {
    setStatus("Reading the trading post…");
    const [buys, sells, buyHist, sellHist] = await Promise.all([
      opt("/v2/commerce/transactions/current/buys?page_size=50"),
      opt("/v2/commerce/transactions/current/sells?page_size=50"),
      opt("/v2/commerce/transactions/history/buys?page_size=50"),
      opt("/v2/commerce/transactions/history/sells?page_size=50")
    ]);
    snap.tp = { buys: buys || [], sells: sells || [], buyHist: buyHist || [], sellHist: sellHist || [] };
    await hydrate(snap);
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function refreshPvp() {
    setStatus("Reading PvP…");
    snap.pvp = await opt("/v2/pvp/stats");
    const gamesIds = await opt("/v2/pvp/games");
    snap.games = Array.isArray(gamesIds) && gamesIds.length ? await byIds("/v2/pvp/games", gamesIds.slice(-8)) : [];
    const mapIds = (snap.games || []).map((game) => game.map_id).filter(Boolean);
    snap.maps = mapIds.length ? await byIds("/v2/maps", mapIds) : [];
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function refreshWvw() {
    setStatus("Reading WvW…");
    snap.wvw = await opt("/v2/account/wvw");
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function refreshProgress() {
    setStatus("Reading progress…");
    const ach = await opt("/v2/account/achievements");
    const raidDone = await opt("/v2/account/raids");
    const raidIds = await opt("/v2/raids");
    const raidDefs = [];
    for (const id of raidIds || []) {
      const raid = await opt("/v2/raids/" + id);
      if (raid) raidDefs.push(raid);
    }
    const dungeonDone = asIds(await opt("/v2/account/dungeons"));
    const dungeonIds = await opt("/v2/dungeons");
    const masteryRows = await opt("/v2/account/masteries");
    snap.progress = {
      achievements: {
        total: Array.isArray(ach) ? ach.length : 0,
        done: Array.isArray(ach) ? ach.filter((entry) => entry.done).length : 0
      },
      raidDone: raidDone || [],
      raids: raidDefs,
      dungeonDone: dungeonDone,
      dungeons: dungeonIds ? await byIds("/v2/dungeons", dungeonIds) : [],
      masteries: masteryRows || [],
      masteryDefs: masteryRows ? await byIds("/v2/masteries", masteryRows.map((entry) => entry.id)) : [],
      masteryPoints: await opt("/v2/account/mastery/points")
    };
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  async function readGuild(id) {
    const info = await opt("/v2/guild/" + id);
    if (!info) return null;
    return { info: info };
  }
  async function refreshGuilds() {
    setStatus("Reading guilds…");
    const guilds = [];
    for (const id of (snap.account && snap.account.guilds) || []) {
      const guild = await readGuild(id);
      if (guild) guilds.push(guild);
    }
    snap.guilds = guilds;
    snap.saved = Date.now();
    await idbSet("snap:" + hash(token), snap);
    showAccount();
  }
  function showAccount() {
    if (!open || view.hidden || !snap) return;
    if (!loading) {
      const node = document.getElementById("acct-status");
      if (node) node.textContent = loadError ? problemText() : (cacheFailed ? t().noCache : (t().saved + " · " + when(snap.saved)));
    }
    renderBody();
    paintToolShelf();
  }
  async function pullSection() {
    if (!token || loading) return;
    if (rateHalted) { loadError = "halt"; render(); return; }
    if (!snap) return pull();
    beginSync();
    loading = true;
    loadError = "";
    let syncResult = "ok";
    let wrote = false;
    render();
    try {
      if (section === "wallet") await refreshWallet();
      else if (section === "bosses") {
        const bosses = await opt("/v2/account/worldbosses");
        if (Array.isArray(bosses)) {
          snap.bosses = bosses;
          snap.bossesSaved = Date.now();
          snap.saved = Date.now();
          await idbSet("snap:" + hash(token), snap);
          applyBosses();
        } else syncResult = "fail";
      } else if (section === "unlocks") await refreshUnlockCat();
      else if (section === "trade") await refreshTrade();
      else if (section === "pvp") await refreshPvp();
      else if (section === "wvw") await refreshWvw();
      else if (section === "progress") await refreshProgress();
      else if (section === "guilds") await refreshGuilds();
      else {
        await refreshStorage();
        wrote = true;
        if (section === "home") {
          const account = await api("/v2/account");
          snap.account = account;
          const world = await opt("/v2/worlds?ids=" + account.world);
          snap.world = Array.isArray(world) ? world[0] : world;
          snap.saved = Date.now();
          await idbSet("snap:" + hash(token), snap);
        }
      }
      noteApiOk();
    } catch (error) {
      syncResult = wrote ? "partial" : "fail";
      loadError = error.halt ? "halt" : error.status === 401 ? "auth" : "net";
      if (loadError === "net") noteApiError(error);
      else noteApiOk();
    } finally {
      loading = false;
      endSync(syncResult);
      paintToolShelf();
      render();
      paintApiDown();
    }
  }

  function paintApiDown() {
    const box = document.getElementById("api-down");
    if (box) box.hidden = !apiDown;
  }
  let syncBusy = 0;
  let syncWorst = "ok";
  let syncShown = "ok";
  function paintSync() {
    const dot = document.getElementById("api-sync");
    if (!dot) return;
    if (!token) {
      dot.hidden = true;
      return;
    }
    dot.hidden = false;
    const mode = syncBusy > 0 ? "busy" : syncShown;
    dot.className = "api-sync " + mode;
    const label = {
      busy: "Updating from the API",
      ok: "API update succeeded",
      fail: "API update failed",
      partial: "API update was incomplete"
    }[mode] || "API update succeeded";
    dot.title = label;
    dot.setAttribute("aria-label", label);
  }
  function beginSync() {
    if (syncBusy === 0) syncWorst = "ok";
    syncBusy += 1;
    paintSync();
  }
  function endSync(result) {
    const rank = { ok: 0, partial: 1, fail: 2 };
    const next = rank[result] == null ? "ok" : result;
    if (rank[next] > rank[syncWorst]) syncWorst = next;
    syncBusy = Math.max(0, syncBusy - 1);
    if (syncBusy === 0) syncShown = syncWorst;
    paintSync();
  }
  function noteApiOk() {
    if (!apiDown) return;
    apiDown = false;
    paintApiDown();
    startCatalogs();
  }
  function noteApiError(error) {
    if (!error || error.status === 401 || error.halt) return;
    apiDown = true;
    if (open) {
      open = false;
      detail = null;
      document.body.classList.remove("mode-account");
      view.hidden = true;
      paintBtn();
    }
    paintApiDown();
  }
  function paintRefreshAll() {
    const button = document.querySelector("[data-refresh-all]");
    if (!button) return;
    const left = Math.ceil((refreshAllAt + 60000 - Date.now()) / 1000);
    if (left > 0) {
      button.disabled = true;
      button.textContent = "Update all menus from the API · " + left + "s";
    } else if (!loading) {
      button.disabled = false;
      button.textContent = t().refreshAll;
    }
  }
  async function pull() {
    if (loading) return;
    if (rateHalted) { loadError = "halt"; render(); return; }
    await syncGameBuild();
    beginSync();
    loading = true;
    loadError = "";
    let syncResult = "ok";
    render();
    try {
      const next = await fetchAll();
      snap = next;
      rows = indexRows(snap);
      await idbSet("snap:" + hash(token), snap);
      applyBosses();
      noteApiOk();
      storageAt = Date.now();
      startCatalogs();
    } catch (error) {
      syncResult = "fail";
      loadError = error.halt ? "halt" : error.status === 401 ? "auth" : "net";
      if (loadError === "net") noteApiError(error);
    } finally {
      loading = false;
      endSync(syncResult);
      paintToolShelf();
      render();
      paintApiDown();
    }
  }

  function icon(src, cls) {
    const img = el("img", cls || "acct-icon");
    img.alt = "";
    if (src) img.src = src;
    else img.hidden = true;
    return img;
  }
  function searchBox(value, placeholder, onInput) {
    const input = el("input", "search");
    input.type = "search";
    input.placeholder = placeholder;
    input.value = value;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("data-search", "1");
    input.addEventListener("input", () => {
      focusSearch = true;
      onInput(input.value);
    });
    return input;
  }
  function chip(label, pressed, onClick) {
    const button = el("button", "chip", label);
    button.type = "button";
    button.setAttribute("aria-pressed", pressed ? "true" : "false");
    button.addEventListener("click", onClick);
    return button;
  }
  function note(text) { return el("p", "acct-note", text); }
  function card(title) {
    const box = el("section", "acct-card");
    if (title) box.append(el("h3", "", title));
    return box;
  }
  function kv(pairs) {
    const box = el("div", "acct-kv");
    pairs.forEach((pair) => {
      if (!pair || pair[1] == null || pair[1] === "") return;
      box.append(el("span", "", pair[0]), el("b", "", String(pair[1])));
    });
    return box;
  }
  function restoreFocus() {
    if (!focusSearch) return;
    const input = view.querySelector("[data-search]");
    if (input) {
      input.focus();
      const end = input.value.length;
      if (input.setSelectionRange) input.setSelectionRange(end, end);
    }
    focusSearch = false;
  }

  function rowNode(row) {
    const item = itemOf(row.id);
    const box = el("article", "acct-row" + (item && item.rarity ? " r-" + item.rarity : ""));
    box.append(icon(item && item.icon));
    const body = el("div");
    const title = el("div", "acct-title");
    title.append(el("strong", "", itemName(row.id)));
    const meta = [prefix(row), item && item.sub, item && item.rarity].filter(Boolean).join(" · ");
    if (meta) title.append(el("span", "acct-muted", meta));
    title.append(el("span", "acct-count", "×" + row.count));
    body.append(title);
    const ups = row.upgrades.map(itemName).concat(row.infusions.map(itemName)).filter((name) => !name.startsWith("#"));
    if (ups.length) body.append(el("div", "acct-muted", ups.join(" · ")));
    const locs = el("div", "acct-locs");
    row.locs.forEach((loc) => {
      const button = el("button", "", locText(loc));
      button.type = "button";
      if (loc.who) button.addEventListener("click", () => jumpPerson(loc.who));
      locs.append(button);
    });
    body.append(locs);
    box.append(body);
    return box;
  }

  const GEAR_ORDER = [
    ["weapon", "Weapons"],
    ["armor", "Armor"],
    ["accessory", "Accessories"],
    ["item", "Items"]
  ];
  const LEGEND_ORDER = [
    ["weapon", "Weapons"],
    ["armor", "Armor"],
    ["accessory", "Accessories"],
    ["relic", "Relics"],
    ["item", "Items"]
  ];
  const WALLET_GROUP = {
    1: "Account", 2: "Account", 3: "Account", 4: "Account", 16: "Account", 18: "Account", 23: "Account", 50: "Account", 63: "Account",
    5: "Core Tyria", 6: "Core Tyria", 7: "Core Tyria", 9: "Core Tyria", 10: "Core Tyria", 11: "Core Tyria", 12: "Core Tyria",
    13: "Core Tyria", 14: "Core Tyria", 24: "Core Tyria", 59: "Core Tyria", 69: "Core Tyria",
    25: "Living World Season 2", 27: "Living World Season 2", 40: "Living World Season 2", 43: "Living World Season 2",
    19: "Heart of Thorns", 20: "Heart of Thorns", 22: "Heart of Thorns", 28: "Heart of Thorns", 37: "Heart of Thorns",
    38: "Heart of Thorns", 41: "Heart of Thorns", 42: "Heart of Thorns",
    32: "Living World Season 3",
    29: "Path of Fire", 34: "Path of Fire", 35: "Path of Fire", 36: "Path of Fire", 39: "Path of Fire", 44: "Path of Fire",
    45: "Living World Season 4", 47: "Living World Season 4", 49: "Living World Season 4",
    51: "Icebrood Saga", 54: "Icebrood Saga", 57: "Icebrood Saga", 58: "Icebrood Saga", 60: "Icebrood Saga",
    53: "End of Dragons", 55: "End of Dragons", 61: "End of Dragons", 64: "End of Dragons", 65: "End of Dragons",
    67: "End of Dragons", 68: "End of Dragons", 71: "End of Dragons",
    52: "Secrets of the Obscure", 56: "Secrets of the Obscure", 66: "Secrets of the Obscure", 72: "Secrets of the Obscure",
    73: "Secrets of the Obscure", 75: "Secrets of the Obscure", 78: "Secrets of the Obscure", 79: "Secrets of the Obscure", 80: "Secrets of the Obscure",
    76: "Janthir Wilds", 77: "Janthir Wilds",
    62: "Visions of Eternity", 81: "Visions of Eternity", 82: "Visions of Eternity", 83: "Visions of Eternity",
    15: "World vs World", 26: "World vs World", 31: "World vs World",
    30: "Player vs Player", 33: "Player vs Player", 46: "Player vs Player",
    70: "Raids and Strikes"
  };
  const WALLET_ORDER = ["Account", "Core Tyria", "Living World Season 2", "Heart of Thorns", "Living World Season 3", "Path of Fire", "Living World Season 4", "Icebrood Saga", "End of Dragons", "Secrets of the Obscure", "Janthir Wilds", "Visions of Eternity", "World vs World", "Player vs Player", "Raids and Strikes", "Other"];
  const WALLET_COLOR = {
    "Account": "exp-account",
    "Core Tyria": "exp-core",
    "Living World Season 2": "exp-ls2",
    "Heart of Thorns": "exp-hot",
    "Living World Season 3": "exp-ls3",
    "Path of Fire": "exp-pof",
    "Living World Season 4": "exp-ls4",
    "Icebrood Saga": "exp-ibs",
    "End of Dragons": "exp-eod",
    "Secrets of the Obscure": "exp-soto",
    "Janthir Wilds": "exp-jw",
    "Visions of Eternity": "exp-voe",
    "World vs World": "exp-wvw",
    "Player vs Player": "exp-pvp",
    "Raids and Strikes": "exp-raid",
    "Other": "exp-other"
  };
  const MASTERY_TOTALS = [
    ["Central Tyria", 84],
    ["Heart of Thorns", 198],
    ["Path of Fire", 130],
    ["Icebrood Saga", 76],
    ["End of Dragons", 115],
    ["Secrets of the Obscure", 103],
    ["Janthir Wilds", 115],
    ["Visions of Eternity", 78]
  ];
  const LIMITED_TOOL = /^(copper|iron|steel|darksteel|mithril|platinum|orichalcum)\b/i;
  const DYE_RARITY = ["Starter", "Common", "Uncommon", "Rare", "Exclusive"];

  function itemCell(row) {
    const item = itemOf(row.id);
    const button = el("button", "acct-cell" + (item && item.rarity ? " r-" + item.rarity : ""));
    button.type = "button";
    button.append(icon(item && item.icon));
    button.append(el("span", "", itemName(row.id)));
    if (row.count > 1) button.append(el("small", "", "×" + row.count));
    button.addEventListener("click", () => openDetail({ kind: "item", row: row }));
    return button;
  }
  function gwPlain(text) {
    return String(text || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?c[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim();
  }
  function wikiAnchor(name) {
    const label = String(name || "").trim();
    if (!label) return null;
    const link = el("a", "detail-wiki", "Official wiki");
    link.href = "https://wiki.guildwars2.com/wiki/Special:Search?search=" + encodeURIComponent(label) + "&go=1";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  function detailHead(card, face, title, wikiName) {
    const close = el("button", "tool detail-close", t().close);
    close.type = "button";
    close.addEventListener("click", closeDetail);
    card.append(close);
    const head = el("div", "detail-head");
    if (face) head.append(face);
    const text = el("div", "detail-name");
    text.append(el("h2", "", title || "—"));
    const link = wikiAnchor(wikiName || "");
    if (link) text.append(link);
    head.append(text);
    card.append(head);
  }
  function factLine(fact) {
    if (!fact) return "";
    const bits = [];
    if (fact.text) bits.push(fact.text);
    if (fact.status) bits.push(fact.status);
    if (fact.value != null) bits.push(String(fact.value));
    if (fact.percent != null) bits.push(fact.percent + "%");
    if (fact.duration != null) bits.push(fact.duration + "s");
    if (fact.hit_count) bits.push("×" + fact.hit_count);
    if (fact.target) bits.push(String(fact.target));
    if (fact.description && (fact.type === "Buff" || fact.type === "PrefixedBuff")) bits.push(fact.description);
    return gwPlain(bits.filter(Boolean).join(" · "));
  }
  function paintFacts(card, facts) {
    const box = el("div", "detail-facts");
    (facts || []).forEach((fact) => {
      const text = factLine(fact);
      if (!text) return;
      const row = el("div", "detail-fact");
      if (fact.icon) row.append(icon(fact.icon, "detail-fact-icon"));
      row.append(el("span", "", text));
      box.append(row);
    });
    if (box.childNodes.length) card.append(box);
  }
  function paintBlurb(card, text) {
    const plain = gwPlain(text);
    if (plain) card.append(el("p", "detail-copy", plain));
  }
  function paintDetail() {
    const old = document.getElementById("acct-detail");
    if (!detail) {
      if (old) old.remove();
      return;
    }
    const wrap = el("div", "acct-detail");
    wrap.id = "acct-detail";
    wrap.addEventListener("click", (event) => { if (event.target === wrap) closeDetail(); });
    const card = el("div", "acct-detail-card");
    if (detail.kind === "item") fillItemDetail(card, detail.row);
    else if (detail.kind === "dye") {
      const swatch = el("div", "acct-swatch");
      const rgb = detail.dye.rgb || [80, 80, 80];
      swatch.style.background = "rgb(" + rgb.join(",") + ")";
      detailHead(card, swatch, detail.dye.name, detail.dye.name);
      if (detail.dye.rarity) card.append(el("p", "acct-muted", detail.dye.rarity));
    } else if (detail.kind === "unlock") {
      const name = detail.entry.name || String(detail.entry.id);
      detailHead(card, icon(detail.entry.icon, "detail-icon"), name, detail.entry.name || "");
    }
    wrap.append(card);
    if (old) old.replaceWith(wrap);
    else document.body.append(wrap);
  }
  function closeDetail() {
    detail = null;
    paintDetail();
  }
  function openDetail(payload) {
    detail = payload;
    paintDetail();
  }
  function usefulText(text) {
    return gwPlain(text).split("\n").map((line) => line.trim()).filter((line) => line && !/^Double-click to apply/i.test(line)).join("\n");
  }
  function applyItemText(item, full) {
    item.description = full.description || "";
    item.bonuses = (full.details && full.details.bonuses) || [];
    const infix = full.details && full.details.infix_upgrade;
    const attributes = {};
    ((infix && infix.attributes) || []).forEach((entry) => { attributes[entry.attribute] = entry.modifier; });
    const buff = (infix && infix.buff && infix.buff.description) || "";
    if (Object.keys(attributes).length || buff) item.infix = { attributes: attributes, buff: buff };
    item.textKnown = true;
    item.textPending = false;
  }
  function ensureItemText(ids, row) {
    const need = [...new Set(ids.filter((id) => {
      const known = itemOf(id);
      return known && !known.textKnown && !known.textPending;
    }))];
    if (!need.length) return;
    need.forEach((id) => { itemOf(id).textPending = true; });
    byIds("/v2/items", need).then((list) => {
      const got = new Set((list || []).map((entry) => entry.id));
      (list || []).forEach((full) => {
        const known = items.get(full.id);
        if (known) applyItemText(known, full);
      });
      need.forEach((id) => {
        const known = items.get(id);
        if (!known) return;
        if (!got.has(id)) known.textKnown = true;
        known.textPending = false;
      });
      saveCatalog();
      if (detail && detail.kind === "item" && detail.row === row) paintDetail();
    }).catch(() => {
      need.forEach((id) => {
        const known = items.get(id);
        if (known) known.textPending = false;
      });
    });
  }
  function paintUpgrade(card, id) {
    const item = itemOf(id);
    const block = el("div", "upgrade-block");
    block.append(icon(item && item.icon, "upgrade-icon"));
    const text = el("div");
    text.append(el("strong", "", itemName(id)));
    const buff = item && item.infix && item.infix.buff;
    if (buff) text.append(el("p", "detail-copy", gwPlain(buff)));
    ((item && item.bonuses) || []).forEach((line, index) => {
      text.append(el("p", "acct-muted", "(" + (index + 1) + ") " + gwPlain(line)));
    });
    if (!buff) {
      const extra = usefulText(item && item.description);
      if (extra) text.append(el("p", "detail-copy", extra));
    }
    if (!item || !item.textKnown) text.append(el("p", "acct-muted", "Reading this from ArenaNet…"));
    block.append(text);
    card.append(block);
  }
  function fillItemDetail(card, row) {
    const item = itemOf(row.id);
    const skinLoc = (row.locs || []).find((loc) => loc.skin && skins.get(loc.skin));
    const skin = skinLoc && skins.get(skinLoc.skin);
    const name = itemName(row.id);
    detailHead(card, icon((skin && skin.icon) || (item && item.icon), "detail-icon"), name, name);
    card.append(el("p", "acct-muted", [prefix(row), item && item.sub, item && item.type, item && item.rarity, "×" + row.count].filter(Boolean).join(" · ")));
    if (skin) card.append(el("p", "acct-muted", t().visual + ": " + skin.name));
    const attrs = row.attributes || (item && item.infix && item.infix.attributes);
    if (attrs && Object.keys(attrs).length) {
      card.append(kv(Object.entries(attrs).map((pair) => [String(pair[0]).replace(/([A-Z])/g, " $1").trim(), pair[1]])));
    }
    if (item && item.infix && item.infix.buff) card.append(el("p", "detail-copy", gwPlain(item.infix.buff)));
    const own = usefulText(item && item.description);
    if (own) card.append(el("p", "detail-copy", own));
    (row.upgrades || []).forEach((id) => paintUpgrade(card, id));
    (row.infusions || []).forEach((id) => paintUpgrade(card, id));
    ensureItemText([row.id].concat(row.upgrades || []).concat(row.infusions || []), row);
    const found = el("div", "where-box");
    found.append(el("h3", "", t().whereFind));
    const locs = el("div", "acct-locs");
    (row.locs || []).forEach((loc) => {
      const button = el("button", "", locText(loc));
      button.type = "button";
      if (loc.who) button.addEventListener("click", () => { closeDetail(); jumpPerson(loc.who); });
      locs.append(button);
    });
    if (!(row.locs || []).length) locs.append(el("p", "", t().none));
    found.append(locs);
    card.append(found);
  }
  function jumpPerson(name) {
    section = "people";
    person = name;
    personQuery = "";
    detail = null;
    render();
  }
  function togglePick(set, key) {
    if (set.has(key)) set.delete(key);
    else set.add(key);
    renderBody();
  }

  const ARMOR_RANK = { Helm: 0, Shoulders: 1, Coat: 2, Gloves: 3, Leggings: 4, Boots: 5 };
  const ARMOR_WEIGHTS = ["Light", "Medium", "Heavy"];
  const BANK_SLOTS = 30;
  const FIXED_COLS = 10;
  const WEAPON_TYPES = ["Axe", "Dagger", "Mace", "Pistol", "Sword", "Scepter", "Focus", "Shield", "Torch", "Warhorn", "Greatsword", "Hammer", "Longbow", "Shortbow", "Rifle", "Staff", "Spear", "Harpoon", "Trident", "Speargun"];
  const ARMOR_PIECES = [
    ["Helm", "Head Armor"],
    ["Shoulders", "Shoulder Armor"],
    ["Coat", "Chest Armor"],
    ["Gloves", "Hand Armor"],
    ["Leggings", "Leg Armor"],
    ["Boots", "Foot Armor"]
  ];
  const ACCESSORY_KINDS = [["Back", "Back item"], ["Accessory", "Accessory"], ["Ring", "Ring"], ["Amulet", "Amulet"]];
  function weaponKind(type) {
    if (type === "LongBow") return "Longbow";
    if (type === "ShortBow") return "Shortbow";
    return type || "";
  }
  function gearKind(item) {
    if (!item) return "";
    if (item.type === "Weapon") return weaponKind(item.sub);
    if (item.type === "Armor") return item.sub || "";
    if (item.type === "Back") return "Back";
    if (item.type === "Trinket") return item.sub || "";
    return "";
  }
  function isArmorPiece(item) {
    return !!(item && item.type === "Armor" && Object.prototype.hasOwnProperty.call(ARMOR_RANK, item.sub));
  }
  function kindIsArmor(kind) {
    return !kind || Object.prototype.hasOwnProperty.call(ARMOR_RANK, kind);
  }
  function weightAllows(item, weight, kind) {
    if (!weight) return true;
    if (!kindIsArmor(kind)) return true;
    if (!isArmorPiece(item)) return false;
    if (!item.weightKnown) return false;
    return item.weight === weight;
  }
  function sortLabel(row) {
    const item = itemOf(row.id);
    if (item && item.type === "Armor") return (setKey(item.name) || item.name || "").toLowerCase();
    return itemName(row.id).toLowerCase();
  }
  function compareRows(a, b) {
    const ka = sortLabel(a);
    const kb = sortLabel(b);
    if (ka !== kb) return ka.localeCompare(kb);
    const ia = itemOf(a.id) || {};
    const ib = itemOf(b.id) || {};
    const ra = ia.type === "Armor" ? (ARMOR_RANK[ia.sub] == null ? 9 : ARMOR_RANK[ia.sub]) : 0;
    const rb = ib.type === "Armor" ? (ARMOR_RANK[ib.sub] == null ? 9 : ARMOR_RANK[ib.sub]) : 0;
    if (ra !== rb) return ra - rb;
    return itemName(a.id).localeCompare(itemName(b.id));
  }
  function tierSubs(pick) {
    if (pick === "armor") return ARMOR_PIECES;
    if (pick === "weapon") return WEAPON_TYPES.map((name) => [name, name]);
    if (pick === "accessory") return ACCESSORY_KINDS;
    return null;
  }
  function renderTier(rarity, order, state, sectionName) {
    const L = t();
    if (state.pick && !order.some((entry) => entry[0] === state.pick)) {
      state.pick = "";
      state.sub = "";
      state.weight = "";
    }
    const root = el("div", "acct-body");
    const filters = el("div", "filters");
    filters.append(chip(L.all, state.pick === "", () => {
      state.pick = "";
      state.sub = "";
      renderBody();
    }));
    order.forEach((entry) => {
      filters.append(chip(entry[1], state.pick === entry[0], () => {
        state.pick = entry[0];
        state.sub = "";
        renderBody();
      }));
    });
    root.append(filters);
    root.append(searchBox(state.query, L.search, (value) => { state.query = value; renderBody(); }));
    const subs = tierSubs(state.pick);
    if (subs) {
      const sub = el("div", "filters");
      sub.append(chip(L.all, state.sub === "", () => { state.sub = ""; renderBody(); }));
      subs.forEach((entry) => sub.append(chip(entry[1], state.sub === entry[0], () => {
        state.sub = entry[0];
        renderBody();
      })));
      root.append(sub);
    }
    const activeWeight = state.pick === "armor" ? state.weight : "";
    if (state.pick === "armor") {
      root.append(weightRow(state.weight, false, (value) => { state.weight = value; renderBody(); }));
    }
    const armorIds = rows.filter((row) => {
      const item = itemOf(row.id);
      return item && item.rarity === rarity && isArmorPiece(item) && row.count > 0;
    }).map((row) => row.id);
    const weightsReady = armorIds.every((id) => {
      const item = itemOf(id);
      return item && item.weightKnown;
    });
    if (!weightsReady) requestItemWeights(armorIds, () => open && section === sectionName);
    if (activeWeight && !weightsReady) root.append(note("Reading armor weights…"));
    const query = state.query.trim().toLowerCase();
    let shown = 0;
    order.forEach((entry) => {
      if (state.pick && state.pick !== entry[0]) return;
      if (activeWeight && entry[0] !== "armor") return;
      const list = rows.filter((row) => {
        const item = itemOf(row.id);
        if (!item || item.rarity !== rarity) return false;
        if (groupOf(item) !== entry[0]) return false;
        if (state.sub && gearKind(item) !== state.sub) return false;
        if (!weightAllows(item, activeWeight, state.pick === "armor" ? state.sub : "")) return false;
        if (query && !rowHay(row).includes(query)) return false;
        return row.count > 0;
      }).sort(compareRows);
      if (!list.length) return;
      root.append(el("h3", "acct-cat", entry[1] + " · " + list.length));
      const grid = el("div", "acct-grid");
      list.forEach((row) => grid.append(itemCell(row)));
      root.append(grid);
      shown += list.length;
    });
    if (!shown) root.append(note(L.empty));
    return root;
  }
  function renderGear() {
    return renderTier("Ascended", GEAR_ORDER, gearState, "gear");
  }
  function renderLegend() {
    return renderTier("Legendary", LEGEND_ORDER, legendState, "legend");
  }

  function bagFiltering() {
    return bagRarity.size > 0 || bagType.size > 0 || !!bagQuery.trim();
  }
  function stackMatches(stack) {
    if (!stack || !stack.id) return false;
    const item = itemOf(stack.id);
    if (bagRarity.size && (!item || !bagRarity.has(item.rarity))) return false;
    if (bagType.size && (!item || !bagType.has(groupOf(item)))) return false;
    const query = bagQuery.trim().toLowerCase();
    if (query && !(itemName(stack.id) + " " + ((item && item.type) || "")).toLowerCase().includes(query)) return false;
    return true;
  }
  function stackRow(stack, loc) {
    return {
      id: stack.id,
      stats: stack.stats && stack.stats.id ? stack.stats.id : 0,
      attributes: (stack.stats && stack.stats.attributes) || null,
      upgrades: stack.upgrades || [],
      infusions: stack.infusions || [],
      count: stack.count || 1,
      locs: [Object.assign({ count: stack.count || 1, tabs: [], skin: stack.skin || 0 }, loc)]
    };
  }
  function slotButton(stack, loc) {
    const item = stack && itemOf(stack.id);
    const button = el("button", "inv-slot" + (!stack ? " slot-empty" : "") + (item && item.rarity ? " r-" + item.rarity : ""));
    button.type = "button";
    if (!stack) {
      button.disabled = true;
      return button;
    }
    const skin = stack.skin && skins.get(stack.skin);
    button.append(icon((skin && skin.icon) || (item && item.icon)));
    if ((stack.count || 1) > 1) button.append(el("small", "", String(stack.count)));
    button.addEventListener("click", () => openDetail({ kind: "item", row: stackRow(stack, loc) }));
    return button;
  }
  function paintSlotGrid(parts, columns, lock) {
    const grid = el("div", "slot-grid" + (columns ? (lock ? " locked-cols" : " fixed-cols") : ""));
    if (columns) grid.style.gridTemplateColumns = "repeat(" + columns + ", 54px)";
    const keepEmpty = !bagFiltering();
    parts.forEach((part) => {
      (part.slots || []).forEach((stack, index) => {
        if (!stack || !stack.id) {
          if (keepEmpty) grid.append(slotButton(null));
          return;
        }
        if (!stackMatches(stack)) return;
        grid.append(slotButton(stack, Object.assign({ slotIndex: index }, part.loc)));
      });
    });
    return grid;
  }
  function bagHead(bag, index) {
    const named = bag && bag.id && itemOf(bag.id);
    const slots = (bag && bag.inventory) || [];
    const size = (bag && (bag.size || slots.length)) || 0;
    const used = slots.filter((stack) => stack && stack.id).length;
    const head = el("div", "bag-head");
    if (named && named.icon) head.append(icon(named.icon, "bag-icon"));
    const text = el("div", "");
    text.append(el("strong", "", named ? named.name : ("Bag " + (index + 1))));
    text.append(el("span", "", used + "/" + size + " slots"));
    head.append(text);
    return head;
  }
  function rememberBagNames(ch) {
    const missing = (ch.bags || []).map((bag) => bag && bag.id).filter((id) => id && !items.has(id));
    if (!missing.length) return;
    byIds("/v2/items", missing).then((list) => {
      (list || []).forEach((item) => items.set(item.id, slimItem(item)));
      saveCatalog();
      if (open && section === "bags" && bagPlace === ch.name) renderBody();
    });
  }
  const BAG_COL_STEP_MS = Math.round(5000 / (BAG_COLS_MAX - BAG_COLS_MIN));
  let bagHoldTimer = 0;
  let bagHoldFromPointer = false;
  function stopBagHold() {
    clearTimeout(bagHoldTimer);
    clearInterval(bagHoldTimer);
    bagHoldTimer = 0;
  }
  function changeBagCols(delta) {
    const next = Math.min(BAG_COLS_MAX, Math.max(BAG_COLS_MIN, bagCols + delta));
    if (next === bagCols) return false;
    bagCols = next;
    writeStore("gw2-bag-cols", String(bagCols));
    const label = view.querySelector(".bag-cols strong");
    if (label) label.textContent = String(bagCols);
    view.querySelectorAll(".bag-step").forEach((button) => {
      if (button.textContent === "Down") button.disabled = !bagColsOn || bagCols <= BAG_COLS_MIN;
      if (button.textContent === "Up") button.disabled = !bagColsOn || bagCols >= BAG_COLS_MAX;
    });
    view.querySelectorAll(".slot-grid.fixed-cols").forEach((grid) => {
      grid.style.gridTemplateColumns = "repeat(" + bagCols + ", 54px)";
    });
    return true;
  }
  function bindBagStep(button, delta) {
    button.addEventListener("pointerdown", (event) => {
      if (button.disabled || event.button !== 0) return;
      bagHoldFromPointer = true;
      if (event.pointerId != null && button.setPointerCapture) button.setPointerCapture(event.pointerId);
      changeBagCols(delta);
      stopBagHold();
      bagHoldTimer = setTimeout(() => {
        bagHoldTimer = setInterval(() => {
          if (!changeBagCols(delta)) stopBagHold();
        }, BAG_COL_STEP_MS);
      }, BAG_COL_STEP_MS);
    });
    button.addEventListener("click", () => {
      if (bagHoldFromPointer) {
        bagHoldFromPointer = false;
        return;
      }
      changeBagCols(delta);
    });
  }
  function endBagHold() {
    stopBagHold();
    setTimeout(() => { bagHoldFromPointer = false; }, 0);
  }
  document.addEventListener("pointerup", endBagHold);
  document.addEventListener("pointercancel", endBagHold);
  function bagBlock(head, grid, columns) {
    const block = el("div", "bag-block" + (columns ? " fixed" : ""));
    if (head) block.append(head);
    block.append(grid);
    return block;
  }
  function sharedHead() {
    const slots = snap.shared || [];
    const used = slots.filter((stack) => stack && stack.id).length;
    const head = el("div", "bag-head");
    head.append(icon("assets/shared-slot.png?v=1", "bag-icon"));
    const text = el("div", "");
    text.append(el("strong", "", t().shared));
    text.append(el("span", "", used + "/" + slots.length + " slots"));
    head.append(text);
    return head;
  }
  function bankHead(title, slots) {
    const used = slots.filter((stack) => stack && stack.id).length;
    const head = el("div", "bag-head");
    const text = el("div", "");
    text.append(el("strong", "", title));
    text.append(el("span", "", used + "/" + slots.length + " slots"));
    head.append(text);
    return head;
  }
  function paintLocked(slots, loc) {
    return paintSlotGrid([{ slots: slots, loc: loc }], FIXED_COLS, true);
  }
  function weightRow(current, idle, onPick) {
    const row = el("div", "filters");
    row.append(chip("All weights", current === "", () => onPick("")));
    ARMOR_WEIGHTS.forEach((name) => {
      const button = chip(name, current === name, () => onPick(current === name ? "" : name));
      if (idle) {
        button.classList.add("chip-idle");
        button.title = "Weight applies to armor only";
      }
      row.append(button);
    });
    return row;
  }
  function loadMaterialCats() {
    if (materialCats || materialCatJob) return;
    materialCatJob = true;
    api("/v2/materials?ids=all").then((list) => {
      materialCats = (Array.isArray(list) ? list : []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    }).catch(() => {
      materialCats = [];
    }).finally(() => {
      materialCatJob = false;
      if (open && section === "bags" && bagPlace === "materials") renderBody();
    });
  }
  function renderMaterials(root) {
    const stored = (snap.materials || []).filter((entry) => entry && entry.count > 0);
    root.append(el("h3", "acct-cat", "Stored types: " + stored.length));
    root.append(note("Unlocked storage size is not reported by the API."));
    if (!materialCats) {
      root.append(note("Reading material categories…"));
      loadMaterialCats();
      return;
    }
    if (!materialCats.length) {
      root.append(note("Material categories did not load."));
      return;
    }
    const byId = new Map((snap.materials || []).map((entry) => [entry.id, entry]));
    let shown = 0;
    materialCats.forEach((cat) => {
      const ids = cat.items || [];
      const stacks = ids.map((id) => byId.get(id)).filter((entry) => entry && entry.count > 0);
      const visible = stacks.filter((entry) => stackMatches(entry));
      if (bagFiltering() && !visible.length) return;
      shown += 1;
      const title = el("div", "bag-head");
      const text = el("div", "");
      text.append(el("strong", "", cat.name || "Materials"));
      text.append(el("span", "", stacks.length + " of " + ids.length + " types"));
      title.append(text);
      if (!visible.length) {
        const block = el("div", "bag-block fixed cat-empty");
        block.append(title);
        root.append(block);
        return;
      }
      root.append(bagBlock(title, paintLocked(visible, { kind: "materials" }), FIXED_COLS));
    });
    if (!shown) root.append(note(t().empty));
  }
  function renderBags() {
    const L = t();
    const root = el("div", "acct-body");
    const rarities = ["Legendary", "Ascended", "Exotic", "Rare", "Masterwork", "Fine"];
    const rarityRow = el("div", "filters");
    rarityRow.append(chip(L.all, bagRarity.size === 0, () => { bagRarity.clear(); renderBody(); }));
    rarities.forEach((rarity) => rarityRow.append(chip(rarity, bagRarity.has(rarity), () => togglePick(bagRarity, rarity))));
    root.append(rarityRow);
    const typeRow = el("div", "filters");
    typeRow.append(chip(L.all, bagType.size === 0, () => { bagType.clear(); renderBody(); }));
    [["weapon", "Weapons"], ["armor", "Armor"], ["accessory", "Accessories"], ["relic", "Relics"]].forEach((entry) => {
      typeRow.append(chip(entry[1], bagType.has(entry[0]), () => togglePick(bagType, entry[0])));
    });
    root.append(typeRow);
    const places = el("div", "filters");
    if (bagPlace === "armory") bagPlace = "";
    const where = [["bank", L.bankL], ["shared", L.shared], ["materials", L.materials]];
    (snap.characters || []).forEach((ch) => where.push([ch.name, ch.name]));
    places.append(chip(L.all, bagPlace === "", () => { bagPlace = ""; renderBody(); }));
    const byName = new Map((snap.characters || []).map((ch) => [ch.name, ch]));
    where.forEach((entry) => {
      const button = chip(entry[1], bagPlace === entry[0], () => {
        bagPlace = bagPlace === entry[0] ? "" : entry[0];
        renderBody();
      });
      const ch = byName.get(entry[0]);
      const color = ch && PROF_COLOR[ch.profession];
      if (color) {
        button.classList.add("char-chip");
        button.style.setProperty("--char-color", color);
      }
      places.append(button);
    });
    root.append(places);
    root.append(searchBox(bagQuery, L.search, (value) => { bagQuery = value; renderBody(); }));
    const character = (snap.characters || []).find((ch) => ch.name === bagPlace);
    if (character) {
      rememberBagNames(character);
      const modes = el("div", "filters");
      [["separate", L.separateBags], ["unified", L.unifiedBags], ["all", L.allBags]].forEach((entry) => {
        modes.append(chip(entry[1], bagLayout === entry[0], () => { bagLayout = entry[0]; renderBody(); }));
      });
      const cols = el("div", "bag-cols");
      cols.append(chip("Columns", bagColsOn, () => {
        bagColsOn = !bagColsOn;
        writeStore("gw2-bag-cols-on", bagColsOn ? "1" : "0");
        renderBody();
      }));
      const down = el("button", "bag-step", "Down");
      down.type = "button";
      down.disabled = !bagColsOn || bagCols <= BAG_COLS_MIN;
      bindBagStep(down, -1);
      const up = el("button", "bag-step", "Up");
      up.type = "button";
      up.disabled = !bagColsOn || bagCols >= BAG_COLS_MAX;
      bindBagStep(up, 1);
      cols.append(down, el("strong", "", String(bagCols)), up);
      modes.append(cols);
      root.append(modes);
      const columns = bagColsOn ? bagCols : 0;
      const sharedSlots = snap.shared || [];
      const bags = character.bags || [];
      const bagSlots = bags.reduce((list, bag) => list.concat((bag && bag.inventory) || []), []);
      if (bagLayout === "all") {
        root.append(bagBlock(el("h3", "acct-cat", character.name), paintSlotGrid([
          { slots: sharedSlots, loc: { kind: "shared" } },
          { slots: bagSlots, loc: { kind: "bag", who: character.name } }
        ], columns), columns));
        return root;
      }
      root.append(bagBlock(sharedHead(), paintSlotGrid([{ slots: sharedSlots, loc: { kind: "shared" } }], FIXED_COLS, true), FIXED_COLS));
      if (bagLayout === "unified") {
        root.append(bagBlock(el("h3", "acct-cat", character.name), paintSlotGrid([{ slots: bagSlots, loc: { kind: "bag", who: character.name } }], columns), columns));
        return root;
      }
      bags.forEach((bag, index) => {
        root.append(bagBlock(bagHead(bag, index), paintSlotGrid([{ slots: (bag && bag.inventory) || [], loc: { kind: "bag", who: character.name } }], columns), columns));
      });
      if (!bags.length) root.append(note(L.empty));
      return root;
    }
    if (bagPlace === "bank") {
      const modes = el("div", "filters");
      [["separate", "Separate"], ["unified", "Grouped"]].forEach((entry) => {
        modes.append(chip(entry[1], bankLayout === entry[0], () => { bankLayout = entry[0]; renderBody(); }));
      });
      root.append(modes);
      const slots = snap.bank || [];
      if (!slots.length) {
        root.append(note(L.empty));
        return root;
      }
      if (bankLayout === "unified") {
        root.append(bagBlock(bankHead(L.bankL, slots), paintLocked(slots, { kind: "bank" }), FIXED_COLS));
        return root;
      }
      const tabs = Math.ceil(slots.length / BANK_SLOTS);
      for (let i = 0; i < tabs; i += 1) {
        const tab = slots.slice(i * BANK_SLOTS, (i + 1) * BANK_SLOTS);
        root.append(bagBlock(bankHead(L.bankL + " " + (i + 1), tab), paintLocked(tab, { kind: "bank" }), FIXED_COLS));
      }
      return root;
    }
    if (bagPlace === "shared") {
      const slots = snap.shared || [];
      root.append(bagBlock(sharedHead(), paintLocked(slots, { kind: "shared" }), FIXED_COLS));
      return root;
    }
    if (bagPlace === "materials") {
      renderMaterials(root);
      return root;
    }
    const query = bagQuery.trim().toLowerCase();
    const picked = rows.filter((row) => {
      const item = itemOf(row.id);
      if (bagRarity.size && (!item || !bagRarity.has(item.rarity))) return false;
      if (bagType.size && (!item || !bagType.has(groupOf(item)))) return false;
      if (bagPlace === "materials" && !row.locs.some((loc) => loc.kind === "materials")) return false;
      if (query && !rowHay(row).includes(query)) return false;
      return row.count > 0;
    }).sort(compareRows);
    root.append(note(L.count + " " + Math.min(360, picked.length) + " " + L.of + " " + picked.length + (picked.length > 360 ? ". " + L.refine : "")));
    const grid = el("div", "acct-grid");
    picked.slice(0, 360).forEach((row) => grid.append(itemCell(row)));
    root.append(grid);
    if (!picked.length) root.append(note(L.empty));
    return root;
  }

  function toolKind(item) {
    if (!item || item.type !== "Gathering") return "";
    if (item.sub === "Foraging") return "sickle";
    if (item.sub === "Logging") return "axe";
    if (item.sub === "Mining") return "pick";
    return "";
  }
  function isInfiniteTool(item) {
    return !!toolKind(item) && !LIMITED_TOOL.test(item.name || "");
  }
  function toolRows() {
    return rows.filter((row) => toolKind(itemOf(row.id)) && row.count > 0);
  }
  function toolFace(row) {
    const loc = (row.locs || []).find((entry) => entry.skin && skins.get(entry.skin)) || (row.locs || [])[0];
    const skin = loc && skins.get(loc.skin);
    return (skin && skin.icon) || ((itemOf(row.id) || {}).icon || "");
  }
  function toolWhere(row) {
    const loc = (row.locs || []).find((entry) => entry.kind === "equipped")
      || (row.locs || []).find((entry) => entry.kind === "bag")
      || (row.locs || [])[0];
    if (!loc) return "";
    if (loc.kind === "equipped") return loc.who + ", Equipped";
    if (loc.kind === "bag") return loc.who + ", Inventory";
    if (loc.kind === "shared") return "Shared Slot";
    if (loc.kind === "bank") return "Bank";
    return locText(loc);
  }
  function loadTrack() {
    try { return JSON.parse(readStore("gw2-tool-track", "{}") || "{}"); }
    catch (error) { return {}; }
  }
  function toolAtShared(row) {
    const locs = (row && row.locs) || [];
    return locs.length > 0 && locs.every((loc) => loc.kind === "shared");
  }
  function paintToolShelf() {
    const shelf = document.getElementById("tool-shelf");
    if (!shelf) return;
    shelf.replaceChildren();
    if (!token || !snap) return;
    const track = loadTrack();
    ["sickle", "axe", "pick"].forEach((kind) => {
      const id = track[kind];
      if (!id) return;
      const row = rows.find((entry) => entry.id === id);
      if (!row) return;
      const button = el("button", "shelf-tool " + (toolAtShared(row) ? "at-shared" : "at-away"));
      button.type = "button";
      button.append(icon(toolFace(row)));
      button.addEventListener("click", () => openDetail({ kind: "item", row: row }));
      shelf.append(button);
    });
  }
  function isToolGlyph(item) {
    return !!(item && item.type === "UpgradeComponent" && /^Glyph\b/i.test(item.name || ""));
  }
  let glyphJob = false;
  const glyphMiss = new Set();
  function glyphRows() {
    const map = new Map();
    const missing = [];
    function add(id, loc) {
      if (!id) return;
      const item = itemOf(id);
      if (!item) {
        if (!glyphMiss.has(id)) missing.push(id);
        return;
      }
      if (!isToolGlyph(item)) return;
      if (!map.has(id)) {
        map.set(id, {
          id: id,
          stats: 0,
          attributes: null,
          upgrades: [],
          infusions: [],
          count: 0,
          locs: []
        });
      }
      const row = map.get(id);
      const count = loc.count || 1;
      row.count += count;
      row.locs.push(Object.assign({ count: count }, loc));
    }
    rows.forEach((row) => {
      const item = itemOf(row.id);
      if (isToolGlyph(item)) (row.locs || []).forEach((loc) => add(row.id, loc));
      if (!toolKind(item)) return;
      (row.upgrades || []).forEach((id) => {
        (row.locs || []).forEach((loc) => add(id, loc));
      });
    });
    if (missing.length && !glyphJob) {
      glyphJob = true;
      missing.forEach((id) => glyphMiss.add(id));
      byIds("/v2/items", missing).then((list) => {
        (list || []).forEach((item) => items.set(item.id, slimItem(item)));
        return saveCatalog();
      }).catch(() => {}).finally(() => {
        glyphJob = false;
        if (open && section === "tools") renderBody();
      });
    }
    return [...map.values()];
  }
  function renderTools() {
    const L = t();
    const root = el("div", "acct-body");
    const ageNote = L.toolNote + (lastApiAge != null ? " The last response said ArenaNet's copy was " + lastApiAge + " seconds old." : "");
    root.append(note(ageNote));
    root.append(searchBox(toolQuery, L.search, (value) => { toolQuery = value; renderBody(); }));
    const query = toolQuery.trim().toLowerCase();
    const all = toolRows().filter((row) => !query || rowHay(row).includes(query));
    const infinite = all.filter((row) => isInfiniteTool(itemOf(row.id)));
    const limited = all.filter((row) => !isInfiniteTool(itemOf(row.id)));
    const track = loadTrack();
    const known = toolRows();
    const trackHead = el("div", "track-head");
    trackHead.append(el("h3", "acct-cat", L.track));
    const clearTrack = el("button", "tool", L.clearTrack);
    clearTrack.type = "button";
    clearTrack.disabled = !["sickle", "axe", "pick"].some((kind) => track[kind]);
    clearTrack.addEventListener("click", () => {
      dropStore("gw2-tool-track");
      toolPick = "";
      renderBody();
      paintToolShelf();
    });
    trackHead.append(clearTrack);
    root.append(trackHead);
    const boxes = el("div", "track-row");
    [["sickle", "Sickle"], ["axe", "Axe"], ["pick", "Pick"]].forEach((entry) => {
      const row = known.find((item) => item.id === track[entry[0]]);
      const button = el("button", "track-box" + (row ? (toolAtShared(row) ? " at-shared" : " at-away") : ""));
      button.type = "button";
      if (row) {
        button.append(icon(toolFace(row), "acct-icon"));
        const text = el("span");
        text.append(el("b", "", itemName(row.id)));
        text.append(el("small", "", toolWhere(row)));
        button.append(text);
      } else button.append(el("span", "", entry[1]));
      button.addEventListener("click", () => { toolPick = toolPick === entry[0] ? "" : entry[0]; renderBody(); });
      boxes.append(button);
    });
    root.append(boxes);
    if (toolPick) {
      root.append(el("h3", "acct-cat", L.pickTool + " · " + toolPick));
      const choices = el("div", "acct-grid");
      infinite.filter((row) => toolKind(itemOf(row.id)) === toolPick).forEach((row) => {
        const button = itemCell(row);
          button.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            const next = loadTrack();
            next[toolPick] = row.id;
            writeStore("gw2-tool-track", JSON.stringify(next));
            toolPick = "";
            renderBody();
            paintToolShelf();
          }, true);
        choices.append(button);
      });
      root.append(choices);
    }
    const glyphs = glyphRows().filter((row) => !query || rowHay(row).includes(query)).sort((a, b) => itemName(a.id).localeCompare(itemName(b.id)));
    if (infinite.length) {
      root.append(el("h3", "acct-cat", L.infinite + " · " + infinite.length));
      const grid = el("div", "acct-grid");
      infinite.sort((a, b) => itemName(a.id).localeCompare(itemName(b.id))).forEach((row) => {
        const cell = itemCell(row);
        const face = toolFace(row);
        const img = cell.querySelector("img");
        if (img && face) img.src = face;
        grid.append(cell);
      });
      root.append(grid);
    }
    if (glyphs.length) {
      root.append(el("h3", "acct-cat", L.glyphs + " · " + glyphs.length));
      const grid = el("div", "acct-grid");
      glyphs.forEach((row) => grid.append(itemCell(row)));
      root.append(grid);
    }
    if (limited.length) {
      root.append(el("h3", "acct-cat", L.limited + " · " + limited.length));
      const grid = el("div", "acct-grid");
      limited.sort((a, b) => itemName(a.id).localeCompare(itemName(b.id))).forEach((row) => {
        const cell = itemCell(row);
        const face = toolFace(row);
        const img = cell.querySelector("img");
        if (img && face) img.src = face;
        grid.append(cell);
      });
      root.append(grid);
    }
    if (!all.length && !glyphs.length) root.append(note(L.empty));
    return root;
  }

  function eliteOf(ch) {
    const tab = (ch.build_tabs || []).find((entry) => entry.is_active) || (ch.build_tabs || [])[0];
    const specsOn = (tab && tab.build && tab.build.specializations) || [];
    for (const spec of specsOn) {
      const known = spec && specs.get(spec.id);
      if (known && known.elite) return known.name;
    }
    return "";
  }
  function gearSlots(ch) {
    const gearTabs = ch.equipment_tabs || [];
    const source = gearTabs.length ? ((gearTabs[equipShown[ch.name]] || gearTabs[0]).equipment || []) : (ch.equipment || []);
    const bySlot = {};
    (ch.equipment || []).forEach((piece) => {
      if (piece && piece.slot) bySlot[piece.slot] = piece;
    });
    source.forEach((piece) => {
      if (piece && piece.slot) bySlot[piece.slot] = pieceStats(ch, piece);
    });
    return bySlot;
  }
  function pieceStats(ch, piece) {
    if (!piece) return piece;
    const live = (ch.equipment || []).find((entry) => entry && entry.id === piece.id && entry.slot === piece.slot);
    if (!live) return piece;
    return Object.assign({}, piece, {
      stats: piece.stats || live.stats,
      upgrades: piece.upgrades || live.upgrades,
      infusions: piece.infusions || live.infusions,
      skin: piece.skin || live.skin
    });
  }
  function pieceAsRow(ch, piece) {
    const gearTabs = ch.equipment_tabs || [];
    const shown = gearTabs[equipShown[ch.name]] || gearTabs.find((tab) => tab.is_active);
    const onTab = shown && (shown.equipment || []).some((entry) => entry && entry.slot === piece.slot && entry.id === piece.id);
    const tabs = onTab ? [{ tab: shown.tab, name: shown.name || "", active: !!shown.is_active }] : [];
    return {
      id: piece.id,
      stats: piece.stats && piece.stats.id ? piece.stats.id : 0,
      attributes: (piece.stats && piece.stats.attributes) || null,
      upgrades: piece.upgrades || [],
      infusions: piece.infusions || [],
      count: 1,
      locs: [{ kind: "equipped", who: ch.name, slot: piece.slot, count: 1, tabs: tabs, skin: piece.skin || 0 }]
    };
  }
  function dollSlot(ch, piece, slot) {
    const button = el("button", "acct-slot" + (piece ? "" : " empty"));
    button.type = "button";
    button.append(el("span", "", slotLabel(slot)));
    if (!piece) {
      button.disabled = true;
      return button;
    }
    const item = itemOf(piece.id);
    const skin = skins.get(piece.skin);
    const img = icon((skin && skin.icon) || (item && item.icon), "acct-icon");
    button.insertBefore(img, button.firstChild);
    button.addEventListener("click", () => openDetail({ kind: "item", row: pieceAsRow(ch, piece) }));
    return button;
  }
  function renderPerson(ch) {
    const L = t();
    const guild = (snap.guilds || []).find((entry) => entry.info && entry.info.id === ch.guild);
    const box = el("div");
    const facts = el("div", "fact-row");
    [
      word(ch.profession) + " " + ch.level + (eliteOf(ch) ? " · " + eliteOf(ch) : ""),
      word(ch.race),
      word(ch.gender),
      L.age + " " + age(ch.age),
      L.deaths + " " + ch.deaths,
      L.created + " " + when(ch.created),
      guild ? guild.info.name + " [" + guild.info.tag + "]" : "",
      (ch.crafting || []).map((job) => word(job.discipline) + " " + job.rating).join(", ")
    ].filter(Boolean).forEach((text) => facts.append(el("span", "acct-fact", text)));
    box.append(facts);
    const gearTabs = ch.equipment_tabs || [];
    if (!(ch.name in equipShown)) equipShown[ch.name] = Math.max(0, gearTabs.findIndex((tab) => tab.is_active));
    const worn = gearSlots(ch);
    box.append(el("h3", "acct-cat", "Equipment templates · " + gearTabs.length + " unlocked"));
    if (gearTabs.length) {
      const tabs = el("div", "filters");
      gearTabs.forEach((tab, index) => {
        tabs.append(chip((tab.name || ("Equipment template " + tab.tab)) + (tab.is_active ? " · " + L.active : ""), equipShown[ch.name] === index, () => {
          equipShown[ch.name] = index;
          renderBody();
        }));
      });
      box.append(tabs);
    }
    const board = el("div", "equip-board");
    const left = el("div", "equip-list");
    ["Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots", "WeaponA1", "WeaponA2", "WeaponB1", "WeaponB2"].forEach((slot) => left.append(dollSlot(ch, worn[slot], slot)));
    const right = el("div", "equip-side");
    [
      ["Backpack", "Accessory1", "Accessory2", "Relic"],
      ["Amulet", "Ring1", "Ring2"],
      ["HelmAquatic", "WeaponAquaticA", "WeaponAquaticB"],
      ["Sickle", "Axe", "Pick"]
    ].forEach((line) => {
      const row = el("div", "equip-line");
      line.forEach((slot) => row.append(dollSlot(ch, worn[slot], slot)));
      right.append(row);
    });
    board.append(left, right);
    box.append(board);
    return box;
  }
  function renderPeople() {
    const L = t();
    const root = el("div", "acct-body");
    root.append(searchBox(personQuery, L.search, (value) => { personQuery = value; renderBody(); }));
    const query = personQuery.trim().toLowerCase();
    const list = (snap.characters || []).filter((ch) => !query || (ch.name + " " + ch.profession + " " + eliteOf(ch)).toLowerCase().includes(query));
    if (!list.some((ch) => ch.name === person)) person = list[0] ? list[0].name : "";
    const grid = el("div", "acct-people");
    const picker = el("div", "acct-picker");
    list.forEach((ch) => {
      const prof = (snap.professions || []).find((entry) => entry.id === ch.profession);
      const button = el("button");
      button.type = "button";
      button.setAttribute("aria-current", ch.name === person ? "true" : "false");
      if (PROF_COLOR[ch.profession]) button.style.borderColor = PROF_COLOR[ch.profession];
      button.append(icon(prof && prof.icon, "acct-icon"));
      const text = el("span");
      text.append(el("b", "", ch.name));
      text.append(el("small", "", word(ch.profession) + " " + ch.level + (eliteOf(ch) ? " · " + eliteOf(ch) : "")));
      button.append(text);
      button.addEventListener("click", () => { person = ch.name; renderBody(); });
      picker.append(button);
    });
    grid.append(picker);
    const current = (snap.characters || []).find((ch) => ch.name === person);
    grid.append(current ? renderPerson(current) : note(L.empty));
    root.append(grid);
    return root;
  }

  function bossName(id) {
    const map = (window.GW2Timer && window.GW2Timer.bossEvents) || {};
    const eventId = map[id];
    const event = ((window.GW2 && window.GW2.events) || []).find((entry) => entry.id === eventId);
    if (event) return event.name;
    return String(id).replace(/_/g, " ");
  }
  function renderBosses() {
    const L = t();
    const root = el("div", "acct-body");
    root.append(searchBox(bossQuery, L.search, (value) => { bossQuery = value; renderBody(); }));
    root.append(note(L.bossNote));
    const done = new Set(snap.bosses || []);
    const known = Object.keys((window.GW2Timer && window.GW2Timer.bossEvents) || {});
    const query = bossQuery.trim().toLowerCase();
    const list = el("div", "acct-list");
    known.concat((snap.bosses || []).filter((id) => !known.includes(id))).forEach((id) => {
      const name = bossName(id);
      if (query && !name.toLowerCase().includes(query)) return;
      const map = (window.GW2Timer && window.GW2Timer.bossEvents) || {};
      const event = ((window.GW2 && window.GW2.events) || []).find((entry) => entry.id === map[id]);
      const row = el("article", "acct-card boss-row");
      const body = el("div", "acct-title");
      body.append(el("strong", "", name));
      body.append(el("span", done.has(id) ? "acct-ok" : "acct-miss", done.has(id) ? L.killed : L.open));
      row.append(body);
      if (event && event.chat && window.GW2Timer && window.GW2Timer.copyTeleport) {
        const copy = el("button", "tool", "Copy teleport");
        copy.type = "button";
        copy.addEventListener("click", () => window.GW2Timer.copyTeleport(event.chat));
        row.append(copy);
      }
      list.append(row);
    });
    root.append(list);
    return root;
  }
  function gearCount(match) {
    return rows.filter((row) => {
      const item = itemOf(row.id);
      return item && item.rarity === "Ascended" && match(item);
    }).reduce((sum, row) => sum + row.count, 0);
  }
  function renderHome() {
    const L = t();
    const account = snap.account || {};
    const perms = (snap.tokeninfo && snap.tokeninfo.permissions) || [];
    const missing = NEED.filter((key) => !perms.includes(key));
    const root = el("div", "acct-body");
    if (missing.length) root.append(el("p", "acct-warn", L.missing + " " + missing.join(", ")));
    const hero = el("div", "acct-hero");
    hero.append(el("h2", "", account.name || L.account));
    hero.append(el("p", "acct-sub", L.world + ": " + ((snap.world && snap.world.name) || account.world || "—") + ". " + L.worldHint));
    root.append(hero);
    const query = "";
    const earnedRegions = new Map((((snap.progress || {}).masteryPoints || {}).totals || []).map((row) => [row.region, row.earned || 0]));
    const access = ACCESS_ORDER.filter((entry) => (account.access || []).includes(entry[0]) || (entry[1] && earnedRegions.get(entry[1]) > 0)).map((entry) => entry[0]);
    const dlcs = el("div", "acct-dlcs");
    const EXP_CLASS = {
      GuildWars2: "exp-core",
      PlayForFree: "exp-free",
      HeartOfThorns: "exp-hot",
      PathOfFire: "exp-pof",
      IcebroodSaga: "exp-ibs",
      EndOfDragons: "exp-eod",
      SecretsOfTheObscure: "exp-soto",
      JanthirWilds: "exp-jw",
      VisionsOfEternity: "exp-voe"
    };
    access.forEach((key) => {
      const label = word(key);
      if (query && !label.toLowerCase().includes(query)) return;
      dlcs.append(el("span", "chip " + (EXP_CLASS[key] || ""), label));
    });
    if (dlcs.childElementCount) root.append(dlcs);
    const facts = el("div", "acct-facts");
    [
      [account.commander ? L.yes : L.no, L.commander, "Whether this account owns the commander tag."],
      [String(account.fractal_level || 0), L.fractal, L.fractalHint],
      [String(account.daily_ap || 0), L.ap, L.apHint],
      [String(account.monthly_ap || 0), L.map, L.mapHint],
      [age(account.age), L.age, ""],
      [when(account.created), L.created, ""],
      [String((snap.characters || []).length), L.charsN, ""],
      [String((account.wvw && account.wvw.rank) || 0), "WvW rank", ""]
    ].filter((fact) => !query || (fact[0] + " " + fact[1] + " " + fact[2]).toLowerCase().includes(query)).forEach((fact) => {
      const box = el("div", "acct-fact");
      box.append(el("b", "", fact[0] || "—"), el("span", "", fact[1]));
      if (fact[2]) box.append(el("span", "", fact[2]));
      facts.append(box);
    });
    root.append(facts);
    const counts = el("div", "acct-facts");
    [
      [gearCount((item) => item.type === "Weapon"), "Ascended weapons"],
      [gearCount((item) => item.type === "Armor"), "Ascended armor"],
      [gearCount((item) => item.type === "Trinket" || item.type === "Back"), "Ascended accessories"]
    ].filter((fact) => !query || String(fact[1]).toLowerCase().includes(query) || String(fact[0]).includes(query)).forEach((fact) => {
      const box = el("div", "acct-fact");
      box.append(el("b", "", String(fact[0])), el("span", "", fact[1]));
      counts.append(box);
    });
    root.append(counts);
    const guildBox = card(L.guilds);
    (snap.guilds || []).filter((guild) => !query || (guild.info.name + " " + guild.info.tag).toLowerCase().includes(query)).forEach((guild) => {
      const line = el("button", "acct-locs", guild.info.name + " [" + guild.info.tag + "]");
      line.type = "button";
      line.addEventListener("click", () => { section = "guilds"; detail = null; render(); });
      guildBox.append(line);
    });
    root.append(guildBox);
    return root;
  }

  function walletValue(entry) {
    return entry.id === 1 ? coins(entry.value) : String(entry.value);
  }
  function renderWallet() {
    const L = t();
    const root = el("div", "acct-body");
    const filters = el("div", "filters");
    filters.append(chip(L.all, walletPick.size === 0, () => { walletPick.clear(); renderBody(); }));
    WALLET_ORDER.forEach((name) => {
      const button = chip(name, walletPick.has(name), () => togglePick(walletPick, name));
      button.classList.add("wallet-chip", WALLET_COLOR[name] || "exp-other");
      filters.append(button);
    });
    root.append(filters);
    root.append(searchBox(walletQuery, L.search, (value) => { walletQuery = value; renderBody(); }));
    const known = new Map((snap.currencies || []).map((entry) => [entry.id, entry]));
    const list = (snap.wallet || []).slice();
    if (!list.some((entry) => entry.id === 63)) list.push({ id: 63, value: 0 });
    const query = walletQuery.trim().toLowerCase();
    const grouped = {};
    list.forEach((entry) => {
      const group = WALLET_GROUP[entry.id] || "Other";
      if (walletPick.size && !walletPick.has(group)) return;
      const cur = known.get(entry.id);
      const name = entry.id === 63 ? "Astral Acclaim" : (cur ? cur.name : "#" + entry.id);
      if (!name || name === "#74") return;
      if (query && !(name + " " + group).toLowerCase().includes(query)) return;
      (grouped[group] = grouped[group] || []).push({ entry: entry, name: name, cur: cur });
    });
    WALLET_ORDER.forEach((group) => {
      const rowsHere = grouped[group];
      if (!rowsHere || !rowsHere.length) return;
      rowsHere.sort((a, b) => {
        if (a.entry.id === 1) return -1;
        if (b.entry.id === 1) return 1;
        if (a.entry.id === 63) return -1;
        if (b.entry.id === 63) return 1;
        return a.name.localeCompare(b.name);
      });
      root.append(el("h3", "acct-cat wallet-title " + (WALLET_COLOR[group] || "exp-other"), group));
      const wrap = el("div", "acct-list");
      rowsHere.forEach((row) => {
        const line = el("article", "acct-row");
        line.append(icon(row.cur && row.cur.icon));
        const body = el("div", "acct-title");
        body.append(el("strong", "", row.name));
        if (row.entry.id === 63) body.append(el("span", "acct-muted", L.wizard));
        body.append(el("span", "acct-count", walletValue(row.entry)));
        line.append(body);
        wrap.append(line);
      });
      root.append(wrap);
    });
    return root;
  }

  const SKIN_SLOTS = [
    ["Helm", "Head Armor"],
    ["Shoulders", "Shoulder Armor"],
    ["Coat", "Chest Armor"],
    ["Gloves", "Hand Armor"],
    ["Leggings", "Leg Armor"],
    ["Boots", "Foot Armor"]
  ];
  const SKIN_SUFFIX = /\s+(helm|helmet|mask|masque|circlet|visor|cowl|hood|headpiece|headgear|crown|cap|tiara|horns|antlers|halo|shoulders|pauldrons|spaulders|epaulets|epaulettes|mantle|shoulderplates|shoulderguards|coat|vest|vestments|vestment|jerkin|raiment|doublet|breastplate|chestplate|tunic|robe|robes|cuirass|harness|gambeson|gloves|gauntlets|wristguards|bracers|vambraces|handguards|mittens|grips|leggings|pants|tassets|breeches|legguards|chausses|trousers|legplates|faulds|boots|shoes|footwear|greaves|sabatons|sandals|footguards|soles|warboots)$/i;
  const unlockFailed = new Set();
  function setKey(name) {
    const next = String(name || "").replace(SKIN_SUFFIX, "").trim();
    return next && next !== name ? next : "";
  }
  function weaponSetKey(name) {
    const text = String(name || "").trim();
    const owned = text.match(/^(.+?'s)\s+\S.+$/);
    return owned ? owned[1] : "";
  }
  function unlockCell(entry) {
    const button = el("button", "acct-cell" + (entry.missing ? " missing" : "") + (entry.rarity ? " r-" + entry.rarity : ""));
    button.type = "button";
    button.append(icon(entry.icon), el("span", "", entry.name || prettyId(entry.id)));
    if (entry.quantityLabel) button.append(el("small", "", entry.quantityLabel));
    button.addEventListener("click", () => openDetail({ kind: "unlock", entry: entry }));
    return button;
  }
  function unlockReady(cat) {
    if (unlockFailed.has(cat)) return true;
    if (!unlockCache.has(cat)) return false;
    const ids = unlockIdList(cat);
    const cached = unlockCache.get(cat) || [];
    if (ids.length && !cached.length) return false;
    if (cat === "dyes") return !ids.length || cached.some((entry) => entry && entry.name && entry.rgb);
    if (cat === "recipes") return !ids.length || cached.some((entry) => entry && entry.name && entry.recipeType);
    if (cat === "skins") return !cached.length || Object.prototype.hasOwnProperty.call(cached[0], "slot");
    if (cat === "novelties") return !ids.length || (cached[0] && Object.prototype.hasOwnProperty.call(cached[0], "slot"));
    if (cat === "finishers") return !ids.length || cached.some((entry) => entry && Object.prototype.hasOwnProperty.call(entry, "quantityLabel"));
    if (cat === "mounts") return !ids.length || cached.some((entry) => entry && entry.icon);
    if (cat === "nodes" || cat === "cats" || cat === "emotes") {
      return cached.length === ids.length && cached.every((entry) => entry && entry.name && entry.name !== String(entry.id));
    }
    return true;
  }
  const MOUNT_FILTERS = [
    ["", "All"],
    ["griffon", "Griffon"],
    ["jackal", "Jackal"],
    ["raptor", "Raptor"],
    ["roller_beetle", "Roller Beetle"],
    ["skimmer", "Skimmer"],
    ["skyscale", "Skyscale"],
    ["springer", "Springer"],
    ["turtle", "Turtle"],
    ["warclaw", "Warclaw"]
  ];
  const RECIPE_TYPES = [
    "Axe", "Dagger", "Mace", "Pistol", "Sword", "Scepter", "Focus", "Shield", "Torch", "Warhorn",
    "Greatsword", "Hammer", "Longbow", "Shortbow", "Rifle", "Staff", "Spear", "Harpoon", "Trident", "Speargun",
    "Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots",
    "Backpack", "Consumable", "Dessert", "Feast", "IngredientCooking", "Meal", "Snack", "Soup", "Seasoning",
    "Component", "Refinement", "Inscription", "Insignia", "UpgradeComponent", "Potion", "Bulk", "Dye",
    "GuildDecoration", "LegendaryComponent"
  ];
  const KIT_RECIPE = new Set([
    "Axe", "Dagger", "Mace", "Pistol", "Sword", "Scepter", "Focus", "Shield", "Torch", "Warhorn",
    "Greatsword", "Hammer", "Longbow", "LongBow", "Shortbow", "ShortBow", "Rifle", "Staff", "Spear",
    "Harpoon", "Trident", "Speargun", "Helm", "Shoulders", "Coat", "Gloves", "Leggings", "Boots"
  ]);
  let mountBySkin = null;
  let mountMapLoading = false;
  let recipeIndex = null;
  let recipePage = 0;
  let recipeDone = false;
  let recipePumping = false;
  let recipeTimer = 0;
  let recipeLoad = null;
  function recipeLabel(type) {
    if (type === "IngredientCooking") return "Cooking ingredient";
    if (type === "UpgradeComponent") return "Upgrade component";
    if (type === "GuildDecoration") return "Guild decoration";
    if (type === "LegendaryComponent") return "Legendary component";
    return type;
  }
  function recipeMatches(entry, pick) {
    const type = entry.recipeType || entry.type || "";
    if (!pick) return true;
    if (pick === "Longbow") return type === "Longbow" || type === "LongBow";
    if (pick === "Shortbow") return type === "Shortbow" || type === "ShortBow";
    return type === pick;
  }
  function recipeTypeList() {
    const seen = new Set(RECIPE_TYPES);
    const extra = [];
    (unlockCache.get("recipes") || []).concat(recipeIndex || []).forEach((entry) => {
      const type = (entry && (entry.recipeType || entry.type)) || "";
      if (!type || seen.has(type) || type === "LongBow" || type === "ShortBow") return;
      seen.add(type);
      extra.push(type);
    });
    extra.sort((a, b) => a.localeCompare(b));
    return RECIPE_TYPES.concat(extra);
  }
  function ensureMountMap() {
    if (mountBySkin || mountMapLoading) return;
    mountMapLoading = true;
    api("/v2/mounts/types?ids=all").then((types) => {
      const map = new Map();
      (types || []).forEach((entry) => (entry.skins || []).forEach((id) => map.set(id, entry.id)));
      mountBySkin = map;
    }).catch(() => {
      mountBySkin = new Map();
    }).finally(() => {
      mountMapLoading = false;
      if (open && section === "unlocks" && unlockCat === "mountskins") renderBody();
    });
  }
  function loadRecipeIndex() {
    if (recipeIndex) return Promise.resolve();
    if (!recipeLoad) {
      recipeLoad = idbGet("recipe-index").then((saved) => {
        if (!saved || saved.v !== 2 || !Array.isArray(saved.rows)) {
          recipeIndex = [];
          recipePage = 0;
          recipeDone = false;
          return;
        }
        recipeIndex = saved.rows;
        recipePage = saved.page || 0;
        recipeDone = !!saved.done;
      }).catch(() => {
        recipeIndex = [];
      });
    }
    return recipeLoad;
  }
  function recipeKitKey(entry) {
    const type = entry.recipeType || entry.type || "";
    const slot = entry.sub || type;
    const armor = ARMOR_RANK[type] != null || ARMOR_RANK[slot] != null || entry.itemType === "Armor";
    if (armor) {
      const key = setKey(entry.name);
      return key ? "armor:" + key : "";
    }
    if (entry.itemType === "Weapon" || KIT_RECIPE.has(type)) {
      const key = weaponSetKey(entry.name);
      return key ? "weapon:" + key : "";
    }
    return "";
  }
  function scheduleRecipes() {
    if (recipeTimer || rateHalted || apiDown) return;
    recipeTimer = setTimeout(() => {
      recipeTimer = 0;
      if (token && !apiDown) pumpRecipes();
    }, 20000);
  }
  async function fillRecipeNames() {
    const need = [];
    const seen = new Set();
    (recipeIndex || []).forEach((entry) => {
      if (entry.name || seen.has(entry.output)) return;
      seen.add(entry.output);
      if (!items.has(entry.output)) need.push(entry.output);
    });
    const batch = need.slice(0, 800);
    const asked = new Set(batch);
    if (batch.length) {
      (await byIds("/v2/items", batch)).forEach((item) => items.set(item.id, slimItem(item)));
      saveCatalog();
    }
    (recipeIndex || []).forEach((entry) => {
      if (entry.name) return;
      const item = items.get(entry.output);
      if (item) {
        entry.name = item.name || ("#" + entry.output);
        entry.icon = item.icon || "";
        entry.sub = item.sub || "";
        entry.itemType = item.type || "";
        entry.rarity = item.rarity || "";
        return;
      }
      if (asked.has(entry.output) || items.has(entry.output)) entry.name = "#" + entry.output;
    });
  }
  async function pumpRecipes() {
    if (recipePumping || rateHalted || apiDown) return;
    recipePumping = true;
    try {
      await loadRecipeIndex();
      if (!recipeDone) {
        const seen = new Set((recipeIndex || []).map((entry) => entry.id));
        while (!recipeDone) {
          let page;
          try {
            page = await api("/v2/recipes?page=" + recipePage + "&page_size=200");
          } catch (error) {
            if (error.status === 404) { recipeDone = true; break; }
            throw error;
          }
          if (!Array.isArray(page) || !page.length) { recipeDone = true; break; }
          page.forEach((entry) => {
            if (!entry.output_item_id || seen.has(entry.id)) return;
            seen.add(entry.id);
            recipeIndex.push({ id: entry.id, output: entry.output_item_id, type: entry.type || "" });
          });
          recipePage += 1;
          if (page.length < 200) recipeDone = true;
          if (recipePage % 10 === 0) await idbSet("recipe-index", { v: 2, rows: recipeIndex, page: recipePage, done: recipeDone });
        }
      }
      for (let round = 0; round < 40; round += 1) {
        const pending = (recipeIndex || []).some((entry) => entry && !entry.name);
        if (!pending) break;
        await fillRecipeNames();
      }
      await idbSet("recipe-index", { v: 2, rows: recipeIndex, page: recipePage, done: recipeDone });
    } catch (error) {
      scheduleRecipes();
    }
    recipePumping = false;
    if (open && section === "unlocks" && unlockCat === "recipes") renderBody();
  }
  let skinIndex = null;
  let skinPage = 0;
  let skinDone = false;
  let skinPumping = false;
  let skinTimer = 0;
  let skinLoad = null;
  function loadSkinIndex() {
    if (skinIndex) return Promise.resolve();
    if (!skinLoad) {
      skinLoad = idbGet("skin-catalog").then((saved) => {
        skinIndex = (saved && Array.isArray(saved.rows)) ? saved.rows : [];
        skinPage = (saved && saved.page) || 0;
        skinDone = !!(saved && saved.done);
      }).catch(() => {
        skinIndex = [];
      });
    }
    return skinLoad;
  }
  let skinWeightJob = false;
  function skinWeightAllows(entry) {
    if (!skinWeight) return true;
    const selectedArmor = !skinSlot || SKIN_SLOTS.some((piece) => piece[0] === skinSlot);
    if (!selectedArmor) return true;
    const armorSlot = entry.type === "Armor" || SKIN_SLOTS.some((piece) => piece[0] === entry.slot);
    if (!armorSlot) return false;
    if (entry.weight == null) return false;
    return entry.weight === skinWeight;
  }
  function requestSkinWeights() {
    if (skinWeightJob || !skinIndex) return;
    const missing = skinIndex.filter((entry) => entry && entry.type === "Armor" && entry.weight == null);
    if (!missing.length) return;
    skinWeightJob = true;
    const byId = new Map(missing.map((entry) => [entry.id, entry]));
    byIds("/v2/skins", missing.map((entry) => entry.id)).then((defs) => {
      const got = new Set();
      (defs || []).forEach((entry) => {
        const row = byId.get(entry.id);
        if (!row) return;
        row.weight = (entry.details && entry.details.weight_class) || "";
        got.add(entry.id);
      });
      missing.forEach((entry) => {
        if (!got.has(entry.id)) entry.weight = "";
      });
      return idbSet("skin-catalog", { rows: skinIndex, page: skinPage, done: skinDone });
    }).catch(() => {}).finally(() => {
      skinWeightJob = false;
      if (open && section === "unlocks" && unlockCat === "skins") renderBody();
    });
  }
  async function pumpSkins() {
    if (skinPumping || rateHalted || apiDown) return;
    skinPumping = true;
    try {
      await loadSkinIndex();
      if (!skinDone) {
        const seen = new Set((skinIndex || []).map((entry) => entry.id));
        while (!skinDone) {
          let page;
          try {
            page = await api("/v2/skins?page=" + skinPage + "&page_size=200");
          } catch (error) {
            if (error.status === 404) { skinDone = true; break; }
            throw error;
          }
          if (!Array.isArray(page) || !page.length) { skinDone = true; break; }
          page.forEach((entry) => {
            if (seen.has(entry.id)) return;
            seen.add(entry.id);
            skinIndex.push({
              id: entry.id,
              name: entry.name || "",
              icon: entry.icon || "",
              type: entry.type || "",
              slot: (entry.details && entry.details.type) || "",
              weight: (entry.details && entry.details.weight_class) || ""
            });
          });
          skinPage += 1;
          if (page.length < 200) skinDone = true;
          if (skinPage % 10 === 0) await idbSet("skin-catalog", { rows: skinIndex, page: skinPage, done: skinDone });
        }
        await idbSet("skin-catalog", { rows: skinIndex, page: skinPage, done: skinDone });
      }
    } catch (error) {
      if (!skinTimer && !rateHalted && !apiDown) {
        skinTimer = setTimeout(() => {
          skinTimer = 0;
          if (token && !apiDown) pumpSkins();
        }, 20000);
      }
    }
    skinPumping = false;
    if (open && section === "unlocks" && unlockCat === "skins") renderBody();
  }
  function startCatalogs() {
    if (!token || apiDown) return;
    pumpSkins();
    pumpRecipes();
  }
  let skinOwnedShown = 240;
  let skinLockedShown = 240;
  let recipeOwnedShown = 240;
  let recipeLockedShown = 240;
  let skinBandKey = "";
  let recipeBandKey = "";
  function paintBand(root, title, list, shown, onMore) {
    root.append(el("h3", "acct-cat", title + " · " + list.length));
    if (!list.length) {
      root.append(note("Nothing matches."));
      return;
    }
    const grid = el("div", "acct-grid");
    list.slice(0, shown).forEach((entry) => grid.append(unlockCell(entry)));
    root.append(grid);
    if (list.length > shown) {
      const more = el("button", "tool", "Show more");
      more.type = "button";
      more.addEventListener("click", onMore);
      root.append(more);
    }
  }
  function renderSkinBands(root, query) {
    const key = skinSlot + "|" + skinWeight + "|" + query;
    if (key !== skinBandKey) {
      skinBandKey = key;
      skinOwnedShown = 240;
      skinLockedShown = 240;
    }
    loadSkinIndex().then(() => {
      if ((!skinIndex || !skinDone) && !skinPumping && !apiDown) pumpSkins();
      if (open && section === "unlocks" && unlockCat === "skins") requestSkinWeights();
    });
    if (!skinIndex) {
      root.append(note("Reading every skin. The two lists fill in as the pages arrive."));
      return;
    }
    const pendingWeights = skinIndex.some((entry) => entry && entry.type === "Armor" && entry.weight == null);
    if (pendingWeights) requestSkinWeights();
    const selectedArmor = !skinSlot || SKIN_SLOTS.some((piece) => piece[0] === skinSlot);
    if (pendingWeights && skinWeight && selectedArmor) root.append(note("Reading armor weights…"));
    const ownedIds = new Set(unlockIdList("skins"));
    let list = (skinIndex || []).filter((entry) => entry && entry.name);
    if (skinSlot) list = list.filter((entry) => entry.slot === skinSlot);
    if (skinWeight) list = list.filter(skinWeightAllows);
    if (query) list = list.filter((entry) => String(entry.name).toLowerCase().includes(query));
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const owned = list.filter((entry) => ownedIds.has(entry.id));
    const locked = list.filter((entry) => !ownedIds.has(entry.id));
    paintBand(root, "Unlocked appearances", owned, skinOwnedShown, () => { skinOwnedShown += 240; renderBody(); });
    paintBand(root, "Locked appearances", locked, skinLockedShown, () => { skinLockedShown += 240; renderBody(); });
    if (!skinDone) root.append(note("Reading every skin. The two lists fill in as the pages arrive."));
  }
  function renderRecipeBands(root, query) {
    const key = recipePick + "|" + query;
    if (key !== recipeBandKey) {
      recipeBandKey = key;
      recipeOwnedShown = 240;
      recipeLockedShown = 240;
    }
    loadRecipeIndex().then(() => {
      const pending = !recipeIndex || !recipeDone || recipeIndex.some((entry) => entry && !entry.name);
      if (pending && !recipePumping && !apiDown && !recipeTimer) pumpRecipes();
    });
    if (!recipeIndex && !(unlockCache.get("recipes") || []).length) {
      root.append(note("Reading every recipe. The two lists fill in as the pages arrive."));
      return;
    }
    const ownedIds = new Set(unlockIdList("recipes"));
    const byId = new Map();
    (recipeIndex || []).forEach((entry) => {
      if (!entry || !entry.name || entry.name.charAt(0) === "#") return;
      byId.set(entry.id, entry);
    });
    (unlockCache.get("recipes") || []).forEach((entry) => {
      if (entry && entry.name && !byId.has(entry.id)) byId.set(entry.id, entry);
    });
    let list = [...byId.values()];
    if (recipePick) list = list.filter((entry) => recipeMatches(entry, recipePick));
    if (query) list = list.filter((entry) => String(entry.name).toLowerCase().includes(query));
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const owned = list.filter((entry) => ownedIds.has(entry.id));
    const locked = list.filter((entry) => !ownedIds.has(entry.id));
    paintBand(root, "Unlocked recipes", owned, recipeOwnedShown, () => { recipeOwnedShown += 240; renderBody(); });
    paintBand(root, "Locked recipes", locked, recipeLockedShown, () => { recipeLockedShown += 240; renderBody(); });
    if (!recipeDone) root.append(note("Reading every recipe. The two lists fill in as the pages arrive."));
  }
  function renderRecipeBoard(root, owned, query) {
    const L = t();
    loadRecipeIndex().then(() => {
      const pending = !recipeIndex || !recipeDone || recipeIndex.some((entry) => entry && !entry.name);
      if (pending && !recipePumping && !rateHalted && !recipeTimer) pumpRecipes();
    });
    const catalog = (recipeIndex || []).filter((entry) => entry.name && entry.name.charAt(0) !== "#");
    const ownedOutputs = new Set(owned.map((entry) => entry.output).filter(Boolean));
    const ownedIds = new Set(owned.map((entry) => entry.id));
    const groups = new Map();
    owned.forEach((entry) => {
      const key = recipeKitKey(entry);
      if (!key) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(Object.assign({ missing: false }, entry));
    });
    catalog.forEach((entry) => {
      if (ownedIds.has(entry.id) || ownedOutputs.has(entry.output)) return;
      const key = recipeKitKey(entry);
      if (!key || !groups.has(key)) return;
      const list = groups.get(key);
      if (list.some((piece) => piece.output === entry.output || piece.name === entry.name)) return;
      list.push({
        id: entry.id,
        output: entry.output,
        name: entry.name,
        icon: entry.icon || "",
        recipeType: entry.type || "",
        sub: entry.sub || "",
        itemType: entry.itemType || "",
        rarity: entry.rarity || "",
        missing: true
      });
    });
    const text = String(query || "").trim().toLowerCase();
    let kits = [...groups.entries()].filter((entry) => entry[1].length >= 2);
    const kitIds = new Set();
    kits.forEach((entry) => entry[1].forEach((piece) => { if (!piece.missing) kitIds.add(piece.id); }));
    if (recipePick) kits = kits.filter((entry) => entry[1].some((piece) => recipeMatches(piece, recipePick)));
    if (text) kits = kits.filter((entry) => entry[0].replace(/^(armor|weapon):/, "").toLowerCase().includes(text) || entry[1].some((piece) => String(piece.name || "").toLowerCase().includes(text)));
    kits.sort((a, b) => a[0].localeCompare(b[0]));
    kits.forEach((entry) => {
      const ownedCount = entry[1].filter((piece) => !piece.missing).length;
      const family = entry[0].indexOf("weapon:") === 0 ? "weapons" : "armor";
      const label = entry[0].replace(/^(armor|weapon):/, "");
      root.append(el("h3", "acct-cat", label + " · " + family + " · " + ownedCount + "/" + entry[1].length));
      const grid = el("div", "acct-grid");
      entry[1].sort((a, b) => {
        const as = a.sub || a.recipeType || "";
        const bs = b.sub || b.recipeType || "";
        const ar = ARMOR_RANK[as];
        const br = ARMOR_RANK[bs];
        if (ar != null || br != null) return (ar == null ? 9 : ar) - (br == null ? 9 : br) || String(a.name).localeCompare(String(b.name));
        return as.localeCompare(bs) || String(a.name || "").localeCompare(String(b.name || ""));
      }).forEach((piece) => grid.append(unlockCell(piece)));
      root.append(grid);
    });
    let loose = owned.filter((entry) => !kitIds.has(entry.id));
    if (recipePick) loose = loose.filter((entry) => recipeMatches(entry, recipePick));
    if (text) loose = loose.filter((entry) => String(entry.name || "").toLowerCase().includes(text));
    loose.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    if (loose.length) {
      root.append(el("h3", "acct-cat", (recipePick ? recipeLabel(recipePick) : "Other") + " · " + loose.length));
      const grid = el("div", "acct-grid");
      loose.forEach((entry) => grid.append(unlockCell(entry)));
      root.append(grid);
    }
    if (!kits.length && !loose.length) root.append(note(L.empty));
    const pending = !recipeIndex || !recipeDone || (recipeIndex || []).some((entry) => entry && !entry.name);
    if (pending) root.append(note("Reading crafting sets. Missing pieces show up as they load."));
  }
  function renderUnlocks() {
    const L = t();
    const root = el("div", "acct-body");
    const filters = el("div", "filters");
    UNLOCKS.forEach((spec) => {
      const label = spec.label + " " + ((snap.unlocks && snap.unlocks[spec.id] && snap.unlocks[spec.id].length) || 0);
      filters.append(chip(label, unlockCat === spec.id, () => {
        unlockCat = spec.id;
        unlockQuery = "";
        skinSlot = "";
        skinSets = "";
        mountPick = "";
        recipePick = "";
        renderBody();
      }));
    });
    root.append(filters);
    const spec = UNLOCKS.find((entry) => entry.id === unlockCat) || UNLOCKS[0];
    root.append(searchBox(unlockQuery, L.search, (value) => { unlockQuery = value; renderBody(); }));
    if (spec.id === "dyes") {
      const dyeFilters = el("div", "filters");
      dyeFilters.append(chip(L.all, dyePick === "", () => { dyePick = ""; renderBody(); }));
      DYE_RARITY.forEach((rarity) => dyeFilters.append(chip(rarity, dyePick === rarity, () => { dyePick = rarity; renderBody(); })));
      root.append(dyeFilters);
    }
    if (spec.id === "novelties") {
      const noveltyFilters = el("div", "filters");
      [["", "All"], ["Tonic", "Tonics"], ["Music", "Musical instruments"], ["Chair", "Chairs"], ["HeldItem", "Held items"], ["Miscellaneous", "Miscellaneous"]].forEach((entry) => {
        noveltyFilters.append(chip(entry[1], noveltyPick === entry[0], () => { noveltyPick = entry[0]; renderBody(); }));
      });
      root.append(noveltyFilters);
    }
    if (spec.id === "recipes") root.append(note(L.recipesNote));
    if (spec.id === "cats") root.append(note(L.catsNote));
    if (spec.id === "nodes") root.append(note(L.nodesNote));
    if (spec.id === "emotes") root.append(note(L.emotesNote));
    if (spec.id === "mountskins") {
      const mounts = el("div", "filters");
      MOUNT_FILTERS.forEach((entry) => mounts.append(chip(entry[1], mountPick === entry[0], () => {
        mountPick = entry[0];
        renderBody();
      })));
      root.append(mounts);
      ensureMountMap();
    }
    if (spec.id === "skins") {
      const slots = el("div", "filters");
      slots.append(chip(L.all, !skinSlot, () => { skinSlot = ""; renderBody(); }));
      SKIN_SLOTS.forEach((entry) => slots.append(chip(entry[1], skinSlot === entry[0], () => {
        skinSlot = entry[0];
        renderBody();
      })));
      WEAPON_TYPES.forEach((name) => slots.append(chip(name, skinSlot === name, () => {
        skinSlot = name;
        renderBody();
      })));
      root.append(slots);
      const armorSlot = !skinSlot || SKIN_SLOTS.some((entry) => entry[0] === skinSlot);
      root.append(weightRow(skinWeight, !armorSlot, (value) => { skinWeight = value; renderBody(); }));
    }
    if (spec.id === "recipes") {
      const recipeFilters = el("div", "filters");
      recipeFilters.append(chip(L.all, recipePick === "", () => { recipePick = ""; renderBody(); }));
      recipeTypeList().forEach((name) => recipeFilters.append(chip(recipeLabel(name), recipePick === name, () => {
        recipePick = name;
        renderBody();
      })));
      root.append(recipeFilters);
    }
    const bandQuery = unlockQuery.trim().toLowerCase();
    if (spec.id === "skins") {
      renderSkinBands(root, bandQuery);
      return root;
    }
    if (spec.id === "recipes") {
      if (spec.path && !unlockReady("recipes")) ensureUnlock("recipes");
      renderRecipeBands(root, bandQuery);
      return root;
    }
    if (unlockLoading === spec.id) {
      root.append(note(L.loadNames));
      return root;
    }
    if (spec.path && !unlockReady(spec.id)) ensureUnlock(spec.id);
    if (unlockFailed.has(spec.id)) root.append(note("This list did not load. Use Update this menu from the API to try again."));
    const query = unlockQuery.trim().toLowerCase();
    if (spec.id === "dyes") {
      const defs = unlockCache.get("dyes") || [];
      let shown = 0;
      DYE_RARITY.forEach((rarity) => {
        if (dyePick && dyePick !== rarity) return;
        const list = defs.filter((entry) => entry.rarity === rarity && (!query || String(entry.name).toLowerCase().includes(query)));
        if (!list.length) return;
        shown += list.length;
        root.append(el("h3", "acct-cat", rarity + " · " + list.length));
        const grid = el("div", "acct-grid");
        list.forEach((dye) => {
          const button = el("button", "acct-cell");
          button.type = "button";
          const swatch = el("div", "acct-swatch");
          swatch.style.background = "rgb(" + (dye.rgb || [80, 80, 80]).join(",") + ")";
          button.append(swatch, el("span", "dye-name", dye.name || ""));
          button.addEventListener("click", () => openDetail({ kind: "dye", dye: dye }));
          grid.append(button);
        });
        root.append(grid);
      });
      if (!shown && !unlockLoading) root.append(note(L.empty));
      return root;
    }
    let defs = (unlockCache.get(spec.id) || []).filter((entry) => !query || String(entry.name || "").toLowerCase().includes(query));
    if (spec.id === "novelties" && noveltyPick) defs = defs.filter((entry) => entry.slot === noveltyPick);
    if (spec.id === "skins" && skinSlot) defs = defs.filter((entry) => entry.slot === skinSlot);
    if (spec.id === "mountskins" && mountPick) {
      if (!mountBySkin) root.append(note(L.loadNames));
      else defs = defs.filter((entry) => mountBySkin.get(entry.id) === mountPick);
    }
    if (spec.id === "recipes") {
      renderRecipeBoard(root, unlockCache.get("recipes") || [], query);
      return root;
    }
    if (spec.id === "skins" && skinSets) {
      const weaponMode = skinSets === "weapon";
      const groups = new Map();
      defs.forEach((entry) => {
        if (weaponMode) {
          if (entry.type !== "Weapon") return;
        } else if (entry.type && entry.type !== "Armor") return;
        const key = weaponMode ? weaponSetKey(entry.name) : setKey(entry.name);
        if (!key) return;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
      });
      const sets = [...groups.entries()].filter((entry) => entry[1].length >= 2).sort((a, b) => a[0].localeCompare(b[0]));
      if (!sets.length) root.append(note(L.empty));
      sets.forEach((entry) => {
        root.append(el("h3", "acct-cat", entry[0] + " · " + entry[1].length));
        const grid = el("div", "acct-grid");
        entry[1].sort((a, b) => {
          if (weaponMode) return String(a.slot || "").localeCompare(String(b.slot || "")) || String(a.name).localeCompare(String(b.name));
          return (ARMOR_RANK[a.slot] == null ? 9 : ARMOR_RANK[a.slot]) - (ARMOR_RANK[b.slot] == null ? 9 : ARMOR_RANK[b.slot]) || String(a.name).localeCompare(String(b.name));
        }).forEach((skin) => grid.append(unlockCell(skin)));
        root.append(grid);
      });
      return root;
    }
    if (spec.id === "titles") {
      const names = defs.slice().sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      root.append(note(L.count + " " + names.length));
      const list = el("div", "title-cols");
      names.forEach((entry) => list.append(el("p", "", entry.name || prettyId(entry.id))));
      root.append(list);
      if (!names.length) root.append(note(L.empty));
      return root;
    }
    defs.sort((a, b) => {
      const ka = a.type === "Armor" ? (setKey(a.name) || a.name || "").toLowerCase() : String(a.name || "").toLowerCase();
      const kb = b.type === "Armor" ? (setKey(b.name) || b.name || "").toLowerCase() : String(b.name || "").toLowerCase();
      if (ka !== kb) return ka.localeCompare(kb);
      const ra = a.type === "Armor" ? (ARMOR_RANK[a.slot] == null ? 9 : ARMOR_RANK[a.slot]) : 0;
      const rb = b.type === "Armor" ? (ARMOR_RANK[b.slot] == null ? 9 : ARMOR_RANK[b.slot]) : 0;
      if (ra !== rb) return ra - rb;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    const total = defs.length;
    const cap = spec.id === "recipes" ? defs.length : Math.min(240, defs.length);
    root.append(note(L.count + " " + cap + " " + L.of + " " + total + (defs.length > cap ? ". " + L.refine : "")));
    const grid = el("div", "acct-grid");
    defs.slice(0, cap).forEach((entry) => grid.append(unlockCell(entry)));
    root.append(grid);
    if (!defs.length) root.append(note(L.empty));
    return root;
  }
  async function ensureUnlock(cat) {
    if (unlockReady(cat) || unlockLoading === cat) return;
    const spec = UNLOCKS.find((entry) => entry.id === cat);
    if (!spec || !spec.path) return;
    const ids = unlockIdList(cat);
    unlockFailed.delete(cat);
    unlockLoading = cat;
    renderBody();
    try {
      let mapped = [];
      if (cat === "recipes") {
        const recipes = await byIds("/v2/recipes", ids);
        const outputs = recipes.map((entry) => entry.output_item_id).filter(Boolean);
        const missing = outputs.filter((id) => !items.has(id));
        (await byIds("/v2/items", missing)).forEach((item) => items.set(item.id, slimItem(item)));
        mapped = recipes.map((entry) => {
          const item = items.get(entry.output_item_id);
          return {
            id: entry.id,
            output: entry.output_item_id,
            name: item ? item.name : "",
            icon: item ? item.icon : "",
            recipeType: entry.type || "",
            sub: item ? item.sub : "",
            itemType: item ? item.type : "",
            rarity: item ? item.rarity : ""
          };
        }).filter((entry) => entry.name);
      } else if (cat === "dyes") {
        const defs = await byIds(spec.path, ids);
        mapped = defs.map((entry) => ({
          id: entry.id,
          name: entry.name || String(entry.id),
          rgb: (entry.cloth && entry.cloth.rgb) || entry.base_rgb || [80, 80, 80],
          rarity: (entry.categories || []).find((name) => DYE_RARITY.includes(name)) || "Exclusive"
        }));
      } else if (cat === "mounts") {
        const types = await byIds("/v2/mounts/types", ids);
        const skinIds = types.map((entry) => entry.default_skin).filter((id) => id != null);
        const mountSkins = await byIds("/v2/mounts/skins", skinIds);
        const bySkin = new Map(mountSkins.map((entry) => [entry.id, entry]));
        mapped = types.map((entry) => {
          const skin = bySkin.get(entry.default_skin);
          return { id: entry.id, name: entry.name || prettyId(entry.id), icon: (skin && skin.icon) || "" };
        });
      } else if (cat === "emotes") {
        const defs = await byIds("/v2/emotes", ids);
        const itemIds = defs.reduce((list, entry) => list.concat(entry.unlock_items || []), []);
        (await byIds("/v2/items", itemIds.filter((id) => !items.has(id)))).forEach((item) => items.set(item.id, slimItem(item)));
        mapped = defs.map((entry) => {
          const item = (entry.unlock_items || []).map((id) => items.get(id)).find(Boolean);
          return { id: entry.id, name: prettyId(entry.id), icon: (item && item.icon) || "" };
        });
      } else if (cat === "cats") {
        const defs = await byIds("/v2/cats", ids);
        mapped = defs.map((entry) => ({ id: entry.id, name: prettyId(entry.hint || entry.id), icon: "" }));
      } else if (cat === "nodes") {
        const defs = await byIds(spec.path, ids);
        mapped = (defs.length ? defs : ids.map((id) => ({ id: id }))).map((entry) => ({
          id: entry.id,
          name: prettyId(entry.id),
          icon: ""
        }));
      } else if (cat === "skins") {
        const defs = await byIds(spec.path, ids);
        mapped = defs.map((entry) => ({
          id: entry.id,
          name: entry.name || String(entry.id),
          icon: entry.icon || "",
          type: entry.type || "",
          slot: (entry.details && entry.details.type) || "",
          weight: (entry.details && entry.details.weight_class) || ""
        }));
      } else if (cat === "novelties") {
        const defs = await byIds(spec.path, ids);
        mapped = defs.map((entry) => ({
          id: entry.id,
          name: entry.name || String(entry.id),
          icon: entry.icon || "",
          slot: entry.slot || "Miscellaneous"
        }));
      } else if (cat === "finishers") {
        let owned = (snap.unlocks && snap.unlocks.finishers) || [];
        const detailed = owned.some((entry) => entry && typeof entry === "object" && Object.prototype.hasOwnProperty.call(entry, "permanent"));
        if (!detailed) {
          owned = finisherRecords(await opt("/v2/account/finishers"));
          if (snap.unlocks) snap.unlocks.finishers = owned;
        }
        const meta = new Map(finisherRecords(owned).map((entry) => [entry.id, entry]));
        const defs = await byIds(spec.path, ids);
        mapped = defs.map((entry) => {
          const info = meta.get(entry.id) || { permanent: true, quantity: 0 };
          return {
            id: entry.id,
            name: entry.name || String(entry.id),
            icon: entry.icon || "",
            quantityLabel: info.permanent ? "" : (info.quantity + " left")
          };
        });
      } else {
        const defs = await byIds(spec.path, ids);
        mapped = defs.map((entry) => ({
          id: entry.id,
          name: entry.name || prettyId(entry.id),
          icon: entry.icon || ""
        }));
      }
      if (ids.length && !mapped.length) unlockFailed.add(cat);
      unlockCache.set(cat, mapped);
      await saveCatalog();
    } catch (error) {
      unlockFailed.add(cat);
      if (!unlockCache.has(cat)) unlockCache.set(cat, []);
    } finally {
      unlockLoading = "";
      if (section === "unlocks" && unlockCat === cat) renderBody();
    }
  }

  function tradeList(title, list) {
    const L = t();
    const box = card(title);
    const query = tradeQuery.trim().toLowerCase();
    const picked = list.filter((entry) => !query || itemName(entry.item_id).toLowerCase().includes(query));
    if (!picked.length) {
      box.append(note(L.none));
      return box;
    }
    const wrap = el("div", "acct-list");
    picked.forEach((entry) => {
      const item = itemOf(entry.item_id);
      const row = el("article", "acct-row");
      row.append(icon(item && item.icon));
      const body = el("div");
      const titleRow = el("div", "acct-title");
      titleRow.append(el("strong", "", itemName(entry.item_id)));
      titleRow.append(el("span", "acct-count", coins(entry.price) + " · " + L.qty + " " + entry.quantity));
      body.append(titleRow);
      body.append(el("div", "acct-muted", when(entry.created || entry.purchased)));
      row.append(body);
      wrap.append(row);
    });
    box.append(wrap);
    return box;
  }
  function renderTrade() {
    const L = t();
    const tp = snap.tp || {};
    const root = el("div", "acct-body");
    const filters = el("div", "filters");
    [["all", L.all], ["buys", L.buys], ["sells", L.sells], ["buyHist", L.buyH], ["sellHist", L.sellH]].forEach((entry) => {
      filters.append(chip(entry[1], tradePick === entry[0], () => { tradePick = entry[0]; renderBody(); }));
    });
    root.append(filters);
    root.append(searchBox(tradeQuery, L.search, (value) => { tradeQuery = value; renderBody(); }));
    const blocks = [["buys", L.buys, tp.buys || []], ["sells", L.sells, tp.sells || []], ["buyHist", L.buyH, tp.buyHist || []], ["sellHist", L.sellH, tp.sellHist || []]];
    blocks.forEach((entry) => {
      if (tradePick !== "all" && tradePick !== entry[0]) return;
      root.append(tradeList(entry[1], entry[2]));
    });
    return root;
  }
  function pairList(obj) {
    if (!obj) return [];
    return ["wins", "losses", "desertions", "byes", "forfeits", "rating", "rank"].filter((key) => obj[key] != null).map((key) => [key, obj[key]]);
  }
  function renderPvp() {
    const L = t();
    const root = el("div", "acct-body");
    root.append(searchBox(pvpQuery, L.search, (value) => { pvpQuery = value; renderBody(); }));
    const query = pvpQuery.trim().toLowerCase();
    const pvp = snap.pvp || {};
    const top = el("div", "acct-facts");
    [[String(pvp.pvp_rank || 0), L.rank], [String(pvp.pvp_rank_points || 0), "Rank points"], [String((pvp.aggregate && pvp.aggregate.wins) || 0), L.wins], [String((pvp.aggregate && pvp.aggregate.losses) || 0), L.losses]].forEach((pair) => {
      const box = el("div", "acct-fact");
      box.append(el("b", "", pair[0]), el("span", "", pair[1]));
      top.append(box);
    });
    root.append(top);
    Object.entries(pvp.professions || {}).forEach((entry) => {
      if (query && !word(entry[0]).toLowerCase().includes(query)) return;
      const box = card(word(entry[0]));
      box.append(kv(pairList(entry[1])));
      root.append(box);
    });
    const games = card(L.games);
    (snap.games || []).forEach((game) => {
      const map = (snap.maps || []).find((entry) => entry.id === game.map_id);
      const line = [when(game.started), game.result, word(game.profession), map && map.name, game.scores && game.scores.join(" × ")].filter(Boolean).join(" · ");
      if (query && !line.toLowerCase().includes(query)) return;
      games.append(el("p", "", line));
    });
    if (!(snap.games || []).length) games.append(note(L.none));
    root.append(games);
    return root;
  }
  function renderWvw() {
    const L = t();
    const account = snap.account || {};
    const wvw = snap.wvw || {};
    const guildId = wvw.guild && wvw.guild !== NIL ? wvw.guild : "";
    const guild = (snap.guilds || []).find((entry) => entry.info && entry.info.id === guildId);
    const team = (account.wvw && account.wvw.team_id) || wvw.team || 0;
    const root = el("div", "acct-body");
    root.append(searchBox(wvwQuery, L.search, (value) => { wvwQuery = value; renderBody(); }));
    const query = wvwQuery.trim().toLowerCase();
    const lines = [
      [L.rank, String((account.wvw && account.wvw.rank) || 0)],
      [L.team, team ? String(team) : L.none],
      [L.wvwGuild, guild ? guild.info.name + " [" + guild.info.tag + "]" : L.none],
      [L.world, (snap.world && snap.world.name) || ""]
    ].filter((pair) => !query || (pair[0] + " " + pair[1]).toLowerCase().includes(query));
    root.append(kv(lines));
    return root;
  }
  function prettyId(id) {
    return String(id || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function renderProgress() {
    const L = t();
    const progress = snap.progress || {};
    const root = el("div", "acct-body");
    const modes = el("div", "filters");
    modes.append(chip("Raids/Dungeons", progressMode === "raids", () => { progressMode = "raids"; renderBody(); }));
    modes.append(chip("Masteries", progressMode === "masteries", () => { progressMode = "masteries"; renderBody(); }));
    root.append(modes);
    root.append(searchBox(progressQuery, L.search, (value) => { progressQuery = value; renderBody(); }));
    const query = progressQuery.trim().toLowerCase();
    if (progressMode === "raids") {
      root.append(note(L.raidNote));
      const done = new Set(progress.raidDone || []);
      const raids = card("Raids");
      (progress.raids || []).forEach((raid) => {
        const events = [];
        (raid.wings || []).forEach((wing) => (wing.events || []).forEach((event) => events.push(event.id)));
        const have = events.filter((id) => done.has(id)).length;
        const label = prettyId(raid.id) + " · " + have + " / " + events.length;
        if (query && !label.toLowerCase().includes(query)) return;
        raids.append(el("p", "", label));
      });
      root.append(raids);
      const dungeons = card("Dungeons");
      const cleared = new Set(progress.dungeonDone || []);
      (progress.dungeons || []).forEach((dungeon) => {
        const paths = dungeon.paths || [];
        const have = paths.filter((path) => cleared.has(path.id)).length;
        const label = prettyId(dungeon.id) + " · " + have + " / " + paths.length;
        if (query && !label.toLowerCase().includes(query)) return;
        dungeons.append(el("p", "", label));
      });
      root.append(dungeons);
      return root;
    }
    const filters = el("div", "filters");
    filters.append(chip(L.all, masteryPick.size === 0, () => { masteryPick.clear(); renderBody(); }));
    MASTERY_TOTALS.forEach((entry) => filters.append(chip(entry[0], masteryPick.has(entry[0]), () => togglePick(masteryPick, entry[0]))));
    root.append(filters);
    const totals = ((progress.masteryPoints || {}).totals) || [];
    const levels = new Map((progress.masteries || []).map((entry) => [entry.id, entry.level]));
    const visible = MASTERY_TOTALS.filter((entry) => !masteryPick.size || masteryPick.has(entry[0]));
    const earnedSum = visible.reduce((sum, entry) => {
      const found = totals.find((row) => row.region === entry[0]);
      return sum + ((found && found.earned) || 0);
    }, 0);
    const capSum = visible.reduce((sum, entry) => sum + entry[1], 0);
    const overall = el("div", "acct-fact");
    overall.append(el("b", "", earnedSum + " / " + capSum), el("span", "", "Mastery points earned / wiki total"));
    root.append(overall);
    visible.forEach((entry) => {
      const found = totals.find((row) => row.region === entry[0]);
      const earned = (found && found.earned) || 0;
      const box = card(entry[0] + " · " + earned + " / " + entry[1]);
      (progress.masteryDefs || []).filter((def) => def.region === entry[0]).forEach((def) => {
        const max = (def.levels || []).length;
        const label = def.name + " · " + (levels.get(def.id) || 0) + " / " + max;
        if (query && !label.toLowerCase().includes(query) && !entry[0].toLowerCase().includes(query)) return;
        box.append(el("p", "", label));
      });
      root.append(box);
    });
    return root;
  }
  function renderGuilds() {
    const L = t();
    const root = el("div", "acct-body");
    root.append(searchBox(guildQuery, L.search, (value) => { guildQuery = value; renderBody(); }));
    const query = guildQuery.trim().toLowerCase();
    (snap.guilds || []).forEach((guild) => {
      const info = guild.info || {};
      const hay = (info.name + " " + (info.tag || "")).toLowerCase();
      if (query && !hay.includes(query)) return;
      const box = card(info.name + " [" + info.tag + "]");
      box.append(kv([
        [L.levelWord, info.level],
        [L.members, info.member_count]
      ]));
      root.append(box);
    });
    if (!(snap.guilds || []).length) root.append(note(L.none));
    return root;
  }
  const SCREENS = {
    home: renderHome,
    legend: renderLegend,
    gear: renderGear,
    bags: renderBags,
    people: renderPeople,
    tools: renderTools,
    bosses: renderBosses,
    wallet: renderWallet,
    unlocks: renderUnlocks,
    trade: renderTrade,
    pvp: renderPvp,
    wvw: renderWvw,
    progress: renderProgress,
    guilds: renderGuilds
  };

  function renderBody() {
    const main = view.querySelector(".acct-main");
    if (!main) { render(); return; }
    const old = main.querySelector(".acct-body");
    const next = (SCREENS[section] || renderHome)();
    if (old) old.replaceWith(next);
    else main.append(next);
    restoreFocus();
    paintDetail();
    paintToolShelf();
  }

  function renderForm() {
    const L = t();
    view.className = "acct-gate";
    view.replaceChildren();
    const box = el("section", "acct-key");
    box.append(el("h2", "", L.keyTitle));
    box.append(el("p", "", L.keyLead));
    box.append(el("p", "", L.perms));
    const perms = el("div", "acct-perms");
    NEED.forEach((key) => perms.append(el("span", "chip", key)));
    box.append(perms);
    const input = el("input", "search");
    input.type = "text";
    input.placeholder = L.keyPh;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.autocapitalize = "off";
    const save = el("button", "tool", L.save);
    save.type = "button";
    save.addEventListener("click", async () => {
      const next = input.value.trim();
      if (!next) return;
      token = next;
      try {
        await api("/v2/tokeninfo");
      } catch (error) {
        token = readStore(TOKEN_KEY, "") || "";
        box.append(el("p", "acct-warn", error.status === 401 ? L.keyBad : L.keyNet));
        return;
      }
      writeStore(TOKEN_KEY, next);
      token = next;
      input.value = "";
      await prepare();
      startTimers();
      await pull();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") save.click();
    });
    box.append(input, save);
    const link = el("a", "acct-link", L.keyLink);
    link.href = "https://account.arena.net/applications";
    link.target = "_blank";
    link.rel = "noreferrer";
    box.append(el("p", "", ""), link);
    if (loadError) box.append(el("p", "acct-warn", problemText()));
    view.append(box);
  }

  function clearTier(state) {
    state.pick = "";
    state.sub = "";
    state.query = "";
    state.weight = "";
  }
  function resetGearFilters() {
    clearTier(gearState);
  }
  function resetLegendFilters() {
    clearTier(legendState);
  }
  function resetBagFilters() {
    bagQuery = "";
    bagRarity.clear();
    bagPlace = "";
    bagType.clear();
    bagLayout = "separate";
    bankLayout = "separate";
  }
  function resetUnlockFilters() {
    unlockQuery = "";
    skinSlot = "";
    skinWeight = "";
    skinSets = "";
    dyePick = "";
    noveltyPick = "";
    recipePick = "";
    mountPick = "";
  }
  function tabOne(tabs) {
    const index = (tabs || []).findIndex((tab) => tab && tab.tab === 1);
    return index >= 0 ? index : 0;
  }
  function resetPeopleFilters() {
    personQuery = "";
    const chars = (snap && snap.characters) || [];
    person = chars[0] ? chars[0].name : "";
    chars.forEach((ch) => {
      equipShown[ch.name] = tabOne(ch.equipment_tabs);
    });
  }
  function resetSectionFilters(which) {
    if (which === "legend") resetLegendFilters();
    else if (which === "gear") resetGearFilters();
    else if (which === "bags") resetBagFilters();
    else if (which === "people") resetPeopleFilters();
    else if (which === "tools") { toolQuery = ""; toolPick = ""; }
    else if (which === "bosses") bossQuery = "";
    else if (which === "wallet") { walletQuery = ""; walletPick.clear(); }
    else if (which === "unlocks") resetUnlockFilters();
    else if (which === "trade") { tradePick = "all"; tradeQuery = ""; }
    else if (which === "pvp") pvpQuery = "";
    else if (which === "wvw") wvwQuery = "";
    else if (which === "progress") { progressMode = "raids"; masteryPick.clear(); progressQuery = ""; }
    else if (which === "guilds") guildQuery = "";
    else if (which === "home") homeQuery = "";
    detail = null;
    if (open) render();
  }
  function resetAllFilters() {
    resetGearFilters();
    resetLegendFilters();
    resetBagFilters();
    resetUnlockFilters();
    resetPeopleFilters();
    toolQuery = "";
    toolPick = "";
    bossQuery = "";
    walletQuery = "";
    walletPick.clear();
    tradePick = "all";
    tradeQuery = "";
    pvpQuery = "";
    wvwQuery = "";
    progressMode = "raids";
    masteryPick.clear();
    progressQuery = "";
    guildQuery = "";
    homeQuery = "";
    detail = null;
    if (open) render();
  }
  function render() {
    try {
      renderPanel();
    } catch (err) {
      if (!open) return;
      view.className = "";
      view.replaceChildren();
      const box = el("div", "acct-card");
      box.append(el("h3", "", t().account), el("p", "acct-warn", problemText()));
      const again = el("button", "tool", t().refresh);
      again.type = "button";
      again.addEventListener("click", () => { try { render(); } catch (err2) { /* a mensagem acima já explica */ } });
      box.append(again);
      view.append(box);
    }
  }
  function renderPanel() {
    paintBtn();
    if (!open) return;
    if (!token) { renderForm(); return; }
    const L = t();
    view.className = "";
    view.replaceChildren();
    const nav = el("nav", "acct-nav");
    nav.setAttribute("aria-label", L.account);
    NAV.forEach((entry) => {
      const button = el("button", "", L[entry[1]]);
      button.type = "button";
      button.setAttribute("aria-current", section === entry[0] ? "true" : "false");
      button.addEventListener("click", () => { section = entry[0]; detail = null; render(); });
      nav.append(button);
    });
    const main = el("div", "acct-main");
    const head = el("div", "acct-head");
    const titles = el("div");
    const label = NAV.find((entry) => entry[0] === section);
    titles.append(el("h2", "", (snap && snap.account && snap.account.name) || L.account));
    const state = el("p");
    state.id = "acct-status";
    const note = cacheFailed
      ? (loadError ? problemText() : t().noCache)
      : (snap ? L.saved + " · " + when(snap.saved) : "");
    state.textContent = loading ? (status || L.updating) : (loadError ? problemText() : note);
    titles.append(state);
    head.append(titles);
    const actions = el("div", "acct-actions");
    const resetMenu = el("button", "tool", L.resetMenu);
    resetMenu.type = "button";
    resetMenu.addEventListener("click", () => resetSectionFilters(section));
    const resetAll = el("button", "tool", L.resetAll);
    resetAll.type = "button";
    resetAll.addEventListener("click", () => resetAllFilters());
    const refresh = el("button", "tool", L.refresh);
    refresh.type = "button";
    refresh.disabled = loading;
    refresh.addEventListener("click", () => pullSection());
    const refreshAll = el("button", "tool", L.refreshAll);
    refreshAll.type = "button";
    refreshAll.dataset.refreshAll = "1";
    refreshAll.disabled = loading || Date.now() < refreshAllAt + 60000;
    refreshAll.addEventListener("click", () => {
      if (loading || Date.now() < refreshAllAt + 60000) return;
      refreshAllAt = Date.now();
      paintRefreshAll();
      pull();
    });
    const forget = el("button", "tool", L.forget);
    forget.type = "button";
    forget.addEventListener("click", () => { forgetAsk = true; render(); });
    actions.append(resetMenu, resetAll, refresh, refreshAll, forget);
    if (label) titles.append(el("p", "", L[label[1]]));
    head.append(actions);
    main.append(head);
    view.append(nav, main);
    if (!snap) main.append(el("div", "acct-body", loading ? (status || L.reading) : problemText()));
    else renderBody();
    if (forgetAsk) {
      const modal = el("div", "acct-modal");
      const box = el("div", "acct-card");
      box.append(el("h3", "", L.forget), el("p", "", L.forgetAsk));
      const row = el("div", "acct-actions");
      const yes = el("button", "tool", L.forget);
      yes.type = "button";
      yes.addEventListener("click", async () => {
        const old = token ? hash(token) : "";
        dropStore(TOKEN_KEY);
        dropStore("gw2-tool-track");
        token = "";
        paintSync();
        snap = null;
        rows = [];
        paintToolShelf();
        forgetAsk = false;
        detail = null;
        if (old) await idbDel("snap:" + old);
        render();
      });
      const no = el("button", "tool", L.cancel);
      no.type = "button";
      no.addEventListener("click", () => { forgetAsk = false; render(); });
      row.append(no, yes);
      box.append(row);
      modal.append(box);
      view.append(modal);
    }
  }

  btn.addEventListener("click", async () => {
    if (apiDown) {
      paintApiDown();
      return;
    }
    open = !open;
    document.body.classList.toggle("mode-account", open);
    view.hidden = !open;
    forgetAsk = false;
    paintBtn();
    if (!open) return;
    if (!token) { renderForm(); return; }
    await loadCatalog();
    if (!snap) {
      const cached = await idbGet("snap:" + hash(token));
      if (cached && cached.account) {
        snap = cached;
        rows = indexRows(snap);
        applyBosses();
      }
    }
    render();
    if (!snap) await pull();
  });

  async function refreshBosses() {
    if (!token || loading) return;
    if (!snap) return pull();
    beginSync();
    let syncResult = "ok";
    try {
      const bosses = await opt("/v2/account/worldbosses");
      if (!Array.isArray(bosses)) syncResult = "fail";
      else {
        snap.bosses = bosses;
        snap.bossesSaved = Date.now();
        await idbSet("snap:" + hash(token), snap);
        applyBosses();
        noteApiOk();
        showAccount();
      }
    } catch (error) {
      syncResult = "fail";
      noteApiError(error);
    } finally {
      endSync(syncResult);
    }
  }
  async function refreshLive() {
    if (!token || loading || !snap) return;
    beginSync();
    loading = true;
    let syncResult = "ok";
    let wrote = false;
    try {
      await refreshStorage();
      wrote = true;
      await refreshWallet();
      if (!snap.unlocks) snap.unlocks = {};
      for (const spec of UNLOCKS) {
        const raw = await opt(spec.account);
        const next = spec.id === "finishers" ? finisherRecords(raw) : asIds(raw);
        const prev = JSON.stringify(snap.unlocks[spec.id] || []);
        snap.unlocks[spec.id] = next;
        if (JSON.stringify(next) !== prev) unlockCache.delete(spec.id);
      }
      snap.saved = Date.now();
      storageAt = Date.now();
      await idbSet("snap:" + hash(token), snap);
      rows = indexRows(snap);
      noteApiOk();
    } catch (error) {
      syncResult = wrote ? "partial" : "fail";
      noteApiError(error);
    } finally {
      loading = false;
      endSync(syncResult);
      paintToolShelf();
      if (open) render();
    }
  }
  async function refreshTools() {
    if (!token || loading || !snap) return;
    if (Date.now() - storageAt < 4 * 60 * 1000) return;
    beginSync();
    loading = true;
    let syncResult = "ok";
    let wrote = false;
    try {
      snap.characters = await readCharacters();
      wrote = true;
      const shared = await opt("/v2/account/inventory");
      snap.shared = shared || [];
      rows = indexRows(snap);
      await hydrate(snap);
      snap.saved = Date.now();
      storageAt = Date.now();
      await idbSet("snap:" + hash(token), snap);
      noteApiOk();
    } catch (error) {
      syncResult = wrote ? "partial" : "fail";
      noteApiError(error);
    } finally {
      loading = false;
      endSync(syncResult);
      showAccount();
    }
  }

  let preparePromise = null;
  let timersOn = false;
  let buildCheckedAt = 0;

  async function syncGameBuild() {
    if (Date.now() - buildCheckedAt < 60000) return false;
    buildCheckedAt = Date.now();
    let build = null;
    try { build = await opt("/v2/build"); } catch (err) { return false; }
    const id = build && build.id;
    if (id == null) return false;
    const saved = await idbGet("game-build");
    const changed = saved != null && String(saved) !== String(id);
    if (changed) {
      items.clear();
      stats.clear();
      specs.clear();
      skins.clear();
      unlockCache.clear();
      await idbDel("catalog");
    }
    await idbSet("game-build", id);
    return changed;
  }

  function prepare() {
    if (!preparePromise) {
      preparePromise = (async () => {
        await syncGameBuild();
        await loadCatalog();
      })().catch(() => {});
    }
    return preparePromise;
  }

  function startTimers() {
    if (timersOn) return;
    timersOn = true;
    setInterval(() => {
      if (!token || loading || document.hidden) return;
      refreshBosses();
    }, 3600000);
    setInterval(() => {
      if (!token || loading || document.hidden) return;
      refreshLive();
    }, 10 * 60 * 1000);
    setInterval(() => {
      if (!token || loading || document.hidden) return;
      refreshTools();
    }, 5 * 60 * 1000);
    setInterval(() => {
      if (document.hidden) return;
      paintRefreshAll();
    }, 1000);
  }

  let booted = false;
  async function boot() {
    if (booted) return;
    booted = true;
    if (!token) return;
    await prepare();
    startTimers();
    if (!snap) {
      const cached = await idbGet("snap:" + hash(token));
      if (cached && cached.account) {
        snap = cached;
        rows = indexRows(snap);
        applyBosses();
        hydrate(snap).catch(() => {}).finally(() => { if (open) render(); });
      }
    }
    const now = Date.now();
    const saved = (snap && snap.saved) || 0;
    const bossesAt = (snap && (snap.bossesSaved || snap.saved)) || 0;
    paintToolShelf();
    paintApiDown();
    paintSync();
    startCatalogs();
    if (!snap) pull();
    else if (now - saved > 10 * 60 * 1000) refreshLive();
    else if (now - bossesAt > 3600000) refreshBosses();
  }

  window.GW2Account = {
    syncLang() {
      paintBtn();
      if (open) render();
    }
  };
  paintBtn();
  boot();
})();
