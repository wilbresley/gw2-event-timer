/* The timer never contacts a server. Schedules come from data.js.
   Favorites, alerts, and completed marks stay in this browser's localStorage. */
(function () {
  const data = window.GW2;
  const I18N = {
    en: {
      title: "Gw2 Event Timer",
      html: "en-US",
      soundLabel: "Sound",
      soundOn: "Sound on",
      soundOff: "Sound off",
      soundPrep: "Prepare",
      soundSoon: "10 min",
      soundStart: "Started",
      search: "Search by name",
      favorites: "Favorites",
      alerts: "Alerts",
      closeAlarm: "Tap to close",
      addFav: "Add favorite",
      removeFav: "Remove favorite",
      addAlert: "Enable alert",
      removeAlert: "Disable alert",
      markDone: "Mark that I did this today",
      copyTip: "Copy teleport",
      queues: [
        ["active", "Active"],
        ["soon", "Next 10 min"],
        ["done", "Done"]
      ],
      sections: { active: "Active", soon: "Next 10 min", prep: "Prepare", later: "Upcoming", done: "Done" },
      parts: { madrugada: "Late night", manha: "Morning", tarde: "Afternoon", noite: "Night" },
      filters: [
        ["main", "Main", ""],
        ["boss", "Bosses", ""],
        ["meta", "Metas", ""],
        ["core", "Core Tyria", ""],
        ["hot", "HoT - Heart of Thorns", ""],
        ["pof", "PoF - Path of Fire", ""],
        ["ibs", "IBS - Icebrood Saga", ""],
        ["eod", "EoD - End of Dragons", ""],
        ["soto", "SotO - Secrets of the Obscure", ""],
        ["janthir", "JW - Janthir Wilds", ""],
        ["voe", "VoE - Visions of Eternity", ""]
      ],
      now: "Now",
      ends: "ends in",
      in: "in",
      tomorrow: "tomorrow",
      yesterday: "yesterday",
      copy: "TP",
      copied: "Code copied. Paste it in the game chat.",
      copyFail: "Copy this code into chat:",
      done: "Done",
      undo: "Undo",
      alert: "Alert",
      empty: "Nothing matches this combination.",
      soonBody: "starts in 10 minutes",
      startBody: "started now",
      soonTitle: "In 10 minutes",
      startTitle: "Started now",
      prepTitle: "Prepare",
      prepStatus: "get a map",
      prepBody: "time to find a map and a squad",
      phases: { Day: "Day", Dusk: "Dusk", Night: "Night", Dawn: "Dawn" }
    }
  };

  const $ = (id) => document.getElementById(id);
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === "") return fallback;
      const value = JSON.parse(raw);
      return value === null || value === undefined ? fallback : value;
    } catch (err) { return fallback; }
  }
  function readList(key) {
    const value = readJSON(key, []);
    return Array.isArray(value) ? value : [];
  }
  function readObject(key) {
    const value = readJSON(key, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function readFlag(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }
  function writeFlag(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* modo privado ou cota cheia */ }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* modo privado ou cota cheia */ }
  }
  function loadSet(key) {
    try { return new Set(readList(key)); }
    catch (err) { return new Set(); }
  }

  let sound = readFlag("gw2-sound") !== "0";
  const REPEAT_DEFAULT = { prep: 2, soon: 3, start: 5 };
  function loadRepeats() {
    const counts = { prep: 2, soon: 3, start: 5 };
    const saved = readObject("gw2-sound-repeats");
    Object.keys(counts).forEach((key) => {
      const count = Math.round(Number(saved[key]));
      if (count >= 1 && count <= 5) counts[key] = count;
    });
    return counts;
  }
  let repeats = loadRepeats();
  function repeatCount(kind) {
    if (kind === "preview") return 1;
    return repeats[kind] || REPEAT_DEFAULT[kind] || 1;
  }
  const storedCats = readFlag("gw2-cats");
  let cats = new Set(storedCats === null ? [readFlag("gw2-filter") || "main"] : readList("gw2-cats"));
  let queues = new Set(readList("gw2-queues"));
  let favOn = readFlag("gw2-fav") === "1";
  let alertOn = readFlag("gw2-alert-on") === "1";
  let query = "";
  let alertIds = readFlag("gw2-alerts") === null
    ? loadSet("gw2-stars")
    : loadSet("gw2-alerts");
  if (readFlag("gw2-alerts") === null) {
    writeJSON("gw2-alerts", [...alertIds]);
  }
  let favs = loadSet("gw2-favs");
  let done = readObject("gw2-done");
  let toastTimer = 0;
  let alarmTimer = 0;
  let alarmHold = false;
  let alarmUntil = 0;
  let alarmCurrent = null;
  let alarmFinishing = false;
  const alarmQueue = [];
  let lastSig = "";
  let tipTimer = 0;
  let lastWatch = 0;
  let footAt = 0;
  let alarmHadFocus = false;
  let alarmFocusBack = null;
  let soundUnlocked = false;
  let soundBusy = false;
  let repeatLeft = 0;
  let voiceGeneration = 0;
  let alarmPlayTries = 0;
  const soundQueue = [];
  const voices = {};
  let arming = false;
  const phase = {};
  const phaseEnd = {};
  const PHASE_KEEP_MS = 36 * 3600 * 1000;
  const PREP_MIN = { "g10-3": 20, "g9-3": 15, "g11-1": 15 };

  function t() { return I18N.en; }

  function slots(group, segment) {
    const found = [];
    let at = 0;
    const take = (step) => {
      if (at < 1440 && step[0] === segment) found.push([at, step[1]]);
      at += step[1];
    };
    for (const step of group.partial) {
      take(step);
      if (at >= 1440) return found;
    }
    let guard = 0;
    while (group.pattern.length && at < 1440 && guard < 80) {
      for (const step of group.pattern) {
        if (at >= 1440) break;
        take(step);
      }
      guard += 1;
    }
    return found;
  }

  const cache = {};
  function eventSlots(ev) {
    if (!cache[ev.id]) cache[ev.id] = slots(data.groups[ev.group], ev.segment);
    return cache[ev.id];
  }

  function utcMidnight(ms) {
    const d = new Date(ms);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  function gameDay(ms) {
    return new Date(ms).toISOString().slice(0, 10);
  }

  const BOSS_EVENT = {
    admiral_taidha_covington: "g2-1",
    claw_of_jormag: "g2-2",
    fire_elemental: "g2-3",
    inquest_golem_mark_ii: "g2-4",
    great_jungle_wurm: "g2-5",
    megadestroyer: "g2-6",
    modniir_ulgoth: "g2-7",
    shadow_behemoth: "g2-8",
    svanir_shaman_chief: "g2-9",
    the_shatterer: "g2-10",
    triple_trouble_wurm: "g3-1",
    karka_queen: "g3-2",
    tequatl_the_sunless: "g3-3",
    drakkar: "g23-1",
    mists_and_monsters_titans: "g37-1"
  };

  window.GW2Timer = {
    bossEvents: BOSS_EVENT,
    copyTeleport(chat) {
      const text = t();
      if (!chat) return;
      copyText(chat).then((ok) => showToast(ok ? text.copied : text.copyFail, ok ? "" : chat));
    },
    applyBosses(ids) {
      const day = gameDay(Date.now());
      let changed = false;
      (ids || []).forEach((id) => {
        const ev = BOSS_EVENT[id];
        if (!ev || done[ev] === day) return;
        done[ev] = day;
        changed = true;
      });
      if (!changed) return;
      writeJSON("gw2-done", done);
      redraw();
    }
  };

  function nextOf(ev, now) {
    const horizon = now + 18 * 3600 * 1000;
    let best = null;
    for (const shift of [-1, 0, 1]) {
      const midnight = utcMidnight(now) + shift * 86400000;
      for (const slot of eventSlots(ev)) {
        const start = midnight + slot[0] * 60000;
        const end = start + slot[1] * 60000;
        if (end <= now) continue;
        if (start > horizon) continue;
        if (!best || start < best.start) best = { start, end };
      }
    }
    return best;
  }

  function followingStart(ev, after) {
    const horizon = after + 18 * 3600 * 1000;
    let best = null;
    for (const shift of [-1, 0, 1]) {
      const midnight = utcMidnight(after) + shift * 86400000;
      for (const slot of eventSlots(ev)) {
        const start = midnight + slot[0] * 60000;
        if (start <= after || start > horizon) continue;
        const end = start + slot[1] * 60000;
        if (!best || start < best.start) best = { start, end };
      }
    }
    return best;
  }

  function viewWhen(ev, now) {
    const running = nextOf(ev, now);
    if (!running || !PREP_MIN[ev.id] || running.start > now) return running;
    const future = followingStart(ev, running.start);
    if (future && future.start - now <= PREP_MIN[ev.id] * 60000) return future;
    return running;
  }

  const formatters = new Map();
  function formatter(locale, options) {
    const key = locale + "|" + JSON.stringify(options);
    let made = formatters.get(key);
    if (!made) {
      made = new Intl.DateTimeFormat(locale, options);
      formatters.set(key, made);
    }
    return made;
  }

  function fmtClock(ms) {
    return formatter(t().html, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(ms);
  }

  function dayPrefix(start, now) {
    const s = new Date(start);
    const n = new Date(now);
    const sDay = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const nDay = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    const diff = Math.round((sDay - nDay) / 86400000);
    if (diff >= 1) return t().tomorrow + " ";
    if (diff <= -1) return t().yesterday + " ";
    return "";
  }

  function fmtRemain(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return h + "h " + String(m).padStart(2, "0");
    if (total >= 600) return m + " min";
    return m + ":" + String(s).padStart(2, "0");
  }

  let zoneName = "";
  function zone() {
    if (!zoneName) {
      try {
        zoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch (err) { zoneName = "UTC"; }
    }
    return zoneName;
  }

  function placeName() {
    return zone().split("/").pop().replace(/_/g, " ");
  }

  function resetClock() {
    const mark = utcMidnight(Date.now());
    return formatter(t().html, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(mark);
  }

  function footText() {
    const time = resetClock();
    const city = placeName();
    return "Times follow this device. Done clears at the game reset, " + time + " in " + city + ". Favorites and alerts stay saved in this browser.";
  }

  function bellIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 22a2.4 2.4 0 0 0 2.35-2h-4.7A2.4 2.4 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z");
    svg.append(path);
    return svg;
  }

  function checkIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 12.5 10 17.5 19 7");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  function dayPart(now) {
    const hour = new Date(now).getHours();
    const parts = t().parts;
    if (hour < 6) return parts.madrugada;
    if (hour < 12) return parts.manha;
    if (hour < 18) return parts.tarde;
    return parts.noite;
  }

  function inCategory(ev) {
    if (!cats.size) return true;
    for (const id of cats) {
      if (id === "main" && ev.featured) return true;
      if ((id === "boss" || id === "meta") && ev.kind === id) return true;
      if (ev.region === id) return true;
    }
    return false;
  }

  function bucketOf(ev, when, now, marked) {
    if (marked) return "done";
    if (when.start <= now) return "active";
    const remain = when.start - now;
    if (remain <= 10 * 60000) return "soon";
    const lead = PREP_MIN[ev.id];
    if (lead && alertIds.has(ev.id) && remain <= lead * 60000) return "prep";
    return "later";
  }

  function matchesQueue(bucket) {
    if (queues.size) {
      if (bucket === "prep") return queues.has("soon");
      return queues.has(bucket);
    }
    if (bucket === "done") return favOn || alertOn;
    return true;
  }

  function matchesMarks(ev) {
    if (favOn && !favs.has(ev.id)) return false;
    if (alertOn && !alertIds.has(ev.id)) return false;
    return true;
  }

  function matchesQuery(ev) {
    if (!query) return true;
    const hay = (ev.name + " " + ev.map).toLowerCase();
    return hay.includes(query);
  }

  function saveFavs() {
    writeJSON("gw2-favs", [...favs]);
  }

  function saveAlerts() {
    writeJSON("gw2-alerts", [...alertIds]);
  }

  function saveDone() {
    writeJSON("gw2-done", done);
  }

  function isDone(id, now) {
    return done[id] === gameDay(now);
  }

  function pruneDone(now) {
    const day = gameDay(now);
    let changed = false;
    Object.keys(done).forEach((id) => {
      if (done[id] !== day) {
        delete done[id];
        changed = true;
      }
    });
    if (changed) saveDone();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-999px";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch (ignore) {
        return false;
      }
    }
  }

  function showToast(message, code) {
    const box = $("toast");
    box.replaceChildren();
    box.append(document.createTextNode(message));
    if (code) {
      const c = document.createElement("code");
      c.textContent = code;
      box.append(c);
    }
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.hidden = true; }, 2800);
  }
  const clips = {
    prep: "assets/sounds/prep.mp3?v=2",
    soon: "assets/sounds/soon.mp3?v=2",
    start: "assets/sounds/start.mp3?v=2",
    preview: "assets/sounds/soon.mp3?v=2"
  };

  function clipKey(kind) {
    return kind === "preview" ? "soon" : kind;
  }

  function voiceFor(kind) {
    const key = clipKey(kind);
    if (!voices[key]) {
      const audio = new Audio(clips[key]);
      audio.preload = "auto";
      voices[key] = audio;
    }
    return voices[key];
  }

  function pauseVoice(audio) {
    if (!audio) return;
    audio.pause();
    try { audio.currentTime = 0; } catch (err) { /* o arquivo ainda não voltou ao início */ }
  }

  function stopVoice() {
    voiceGeneration += 1;
    repeatLeft = 0;
    soundBusy = false;
    soundQueue.length = 0;
    Object.keys(voices).forEach((key) => pauseVoice(voices[key]));
  }

  function alarmVoice() {
    return alarmCurrent ? voiceFor(alarmCurrent.kind) : null;
  }

  function playKind(kind, onDone) {
    if (!sound || !soundUnlocked || !clips[kind]) return;
    const audio = voiceFor(kind);
    const generation = ++voiceGeneration;
    Object.keys(voices).forEach((key) => {
      if (voices[key] !== audio) pauseVoice(voices[key]);
    });
    soundBusy = true;
    repeatLeft = repeatCount(kind) - 1;
    audio.volume = 1;
    audio.onended = () => {
      if (generation !== voiceGeneration) return;
      if (sound && repeatLeft > 0) {
        repeatLeft -= 1;
        try { audio.currentTime = 0; } catch (err) { /* o arquivo ainda não voltou ao início */ }
        const again = audio.play();
        if (again && again.catch) {
          again.catch(() => {
            if (generation !== voiceGeneration) return;
            soundBusy = false;
            repeatLeft = 0;
            if (onDone) onDone();
            else pumpSounds();
          });
        }
        return;
      }
      soundBusy = false;
      repeatLeft = 0;
      if (onDone) onDone();
      else pumpSounds();
    };
    try { audio.currentTime = 0; } catch (err) { /* o arquivo ainda não voltou ao início */ }
    const played = audio.play();
    if (!played || !played.catch) return;
    played.catch(() => {
      if (generation !== voiceGeneration) return;
      soundBusy = false;
      repeatLeft = 0;
      if (!onDone || !alarmCurrent || !sound || alarmPlayTries >= 3) return;
      alarmPlayTries += 1;
      setTimeout(() => {
        if (generation !== voiceGeneration || !alarmCurrent || !sound || soundBusy) return;
        playKind(kind, onDone);
      }, 500);
    });
  }

  const CLIP_SEC = { prep: 7.0425, soon: 3.3958125, start: 2.3770625 };
  ["prep", "soon", "start"].forEach((kind) => {
    const probe = new Audio(clips[kind]);
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) CLIP_SEC[kind] = probe.duration;
    });
  });

  function pumpSounds() {
    if (!sound || soundBusy || alarmCurrent || !soundQueue.length || !soundUnlocked) return;
    playKind(soundQueue.shift());
  }

  function enqueueSound(kind) {
    if (!sound || !clips[kind]) return;
    soundQueue.push(kind);
    if (soundQueue.length > 3) soundQueue.shift();
    pumpSounds();
  }

  function unlockSound() {
    if (!sound || soundUnlocked) {
      if (sound && soundUnlocked) pumpSounds();
      return;
    }
    if (arming) return;
    arming = true;
    let pending = 3;
    let ok = false;
    const finish = (good) => {
      if (good) ok = true;
      pending -= 1;
      if (pending > 0) return;
      arming = false;
      if (!ok) return;
      soundUnlocked = true;
      if (alarmCurrent && sound && !soundBusy) playKind(alarmCurrent.kind, finishAlarm);
      pumpSounds();
    };
    ["prep", "soon", "start"].forEach((key) => {
      const audio = voiceFor(key);
      audio.volume = 0;
      const played = audio.play();
      const done = () => {
        pauseVoice(audio);
        audio.volume = 1;
        finish(true);
      };
      if (played && played.then) played.then(done).catch(() => finish(false));
      else done();
    });
  }

  function kindMs(kind) {
    return Math.ceil((CLIP_SEC[kind] || 3) * repeatCount(kind) * 1000);
  }

  function groupNotes(items) {
    const buckets = { start: [], soon: [], prep: [] };
    items.forEach((item) => {
      const list = buckets[item.kind];
      if (!list || list.includes(item.name)) return;
      list.push(item.name);
    });
    return ["start", "soon", "prep"]
      .filter((kind) => buckets[kind].length)
      .map((kind) => ({ kind, names: buckets[kind] }));
  }

  function hideAlarm() {
    const box = $("alarm");
    box.hidden = true;
    box.classList.remove("on");
    alarmHold = false;
    alarmUntil = 0;
    alarmCurrent = null;
    alarmQueue.length = 0;
    if (alarmHadFocus) {
      alarmHadFocus = false;
      const back = alarmFocusBack;
      alarmFocusBack = null;
      if (back && back.isConnected && typeof back.focus === "function") {
        try { back.focus({ preventScroll: true }); } catch (err) { /* o elemento saiu da tela */ }
      }
    }
  }

  function paintAlarm() {
    const note = alarmCurrent;
    if (!note) return;
    const box = $("alarm");
    const titles = { start: t().startTitle, soon: t().soonTitle, prep: t().prepTitle };
    box.replaceChildren();
    box.classList.toggle("crowd", note.names.length > 1);
    const kind = document.createElement("p");
    kind.className = "alarm-kind";
    kind.textContent = titles[note.kind];
    box.append(kind);
    note.names.forEach((label) => {
      const name = document.createElement("p");
      name.className = "alarm-name";
      name.textContent = label;
      box.append(name);
    });
    const hint = document.createElement("p");
    hint.className = "alarm-hint";
    hint.textContent = t().closeAlarm;
    box.append(hint);
  }

  function revealAlarm() {
    if (!alarmCurrent) return;
    if (alarmUntil - Date.now() <= 200) return;
    const box = $("alarm");
    alarmHold = false;
    paintAlarm();
    box.hidden = false;
    box.classList.remove("on");
    void box.offsetWidth;
    box.classList.add("on");
    if (!alarmHadFocus && document.activeElement !== box) {
      alarmFocusBack = document.activeElement;
      alarmHadFocus = true;
      try { box.focus({ preventScroll: true }); } catch (err) { /* sem foco: o leitor ainda lê o anúncio */ }
    }
  }

  function beginAlarm(note) {
    alarmCurrent = note;
    alarmPlayTries = 0;
    const ms = kindMs(note.kind);
    alarmUntil = Date.now() + ms;
    clearTimeout(alarmTimer);
    if (sound && soundUnlocked) {
      playKind(note.kind, finishAlarm);
      alarmTimer = setTimeout(finishAlarm, ms + 400);
    } else {
      alarmTimer = setTimeout(finishAlarm, ms);
    }
    if (document.visibilityState !== "visible") {
      alarmHold = true;
      $("alarm").hidden = true;
      return;
    }
    revealAlarm();
  }

  function finishAlarm() {
    if (alarmFinishing) return;
    alarmFinishing = true;
    stopVoice();
    clearTimeout(alarmTimer);
    alarmCurrent = null;
    alarmUntil = 0;
    const next = alarmQueue.shift();
    alarmFinishing = false;
    if (next) beginAlarm(next);
    else hideAlarm();
  }

  function showAlarm(items) {
    const notes = groupNotes(items);
    if (!notes.length) return;
    if (alarmCurrent) {
      alarmQueue.push(...notes);
      return;
    }
    beginAlarm(notes.shift());
    alarmQueue.push(...notes);
  }

  function prunePhase(now) {
    Object.keys(phaseEnd).forEach((key) => {
      if (now - phaseEnd[key] > PHASE_KEEP_MS) {
        delete phase[key];
        delete phaseEnd[key];
      }
    });
  }

  function watch(now) {
    const woke = lastWatch > 0 && now - lastWatch > 2000;
    const fired = [];    data.events.forEach((ev) => {
      if (!alertIds.has(ev.id) || isDone(ev.id, now)) return;
      const running = nextOf(ev, now);
      if (!running) return;
      const lead = PREP_MIN[ev.id];
      const marks = [];
      if (!lead) {
        marks.push(running);
      } else if (running.start <= now) {
        marks.push(running);
        const future = followingStart(ev, running.start);
        if (future) marks.push(future);
      } else {
        marks.push(running);
      }
      marks.forEach((when) => {
        const active = when.start <= now;
        const remain = active ? when.end - now : when.start - now;
        const state = active ? "now"
          : remain <= 10 * 60000 ? "soon"
          : lead && remain <= lead * 60000 ? "prep"
          : "idle";
        const key = ev.id + "@" + when.start;
        const prev = phase[key];
        const entered = (prev && prev !== state) || (!prev && woke);
        if (entered && (state === "prep" || state === "soon" || state === "now")) {
          const kind = state === "now" ? "start" : state;
          fired.push({ name: ev.name, kind });
        }
        phase[key] = state;
        phaseEnd[key] = when.end;
      });
    });
    prunePhase(now);
    if (sound && soundUnlocked && soundQueue.length) pumpSounds();
    if (fired.length) showAlarm(fired);
    lastWatch = now;
  }

  function paintChrome() {
    const text = t();
    document.documentElement.lang = text.html;
    document.title = text.title;
    $("title").textContent = text.title;
    $("search").placeholder = text.search;
    $("search").setAttribute("aria-label", text.search);
    $("foot").textContent = footText();
    $("sound").textContent = text.soundLabel;
    $("sound").setAttribute("aria-label", text.soundLabel);
    $("sound").setAttribute("aria-pressed", sound ? "true" : "false");
    $("sound-toggle").textContent = sound ? text.soundOn : text.soundOff;
    $("sound-toggle").setAttribute("aria-pressed", sound ? "true" : "false");
    $("sound-prep-label").textContent = text.soundPrep;
    $("sound-soon-label").textContent = text.soundSoon;
    $("sound-start-label").textContent = text.soundStart;
    $("sound-prep").textContent = repeats.prep + "x";
    $("sound-soon").textContent = repeats.soon + "x";
    $("sound-start").textContent = repeats.start + "x";

    const queueNav = $("queues");
    if (!queueNav.children.length) {
      text.queues.forEach(([id, label]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset.queue = id;
        btn.textContent = label;
        btn.addEventListener("click", () => {
          if (queues.has(id)) queues.delete(id);
          else queues.add(id);
          writeJSON("gw2-queues", [...queues]);
          paintChipState();
          redraw();
        });
        queueNav.append(btn);
      });
      queueNav.append(toggleChip(text.favorites, "fav", () => {
        favOn = !favOn;
        writeFlag("gw2-fav", favOn ? "1" : "0");
      }));
      queueNav.append(toggleChip(text.alerts, "alerts", () => {
        alertOn = !alertOn;
        writeFlag("gw2-alert-on", alertOn ? "1" : "0");
      }));
    }

    const nav = $("filters");
    if (!nav.children.length) {
      text.filters.forEach(([id, label, tip]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset.cat = id;
        btn.textContent = label;
        if (tip) btn.setAttribute("data-tip", tip);
        btn.addEventListener("click", () => {
          if (cats.has(id)) cats.delete(id);
          else cats.add(id);
          writeJSON("gw2-cats", [...cats]);
          paintChipState();
          redraw();
        });
        nav.append(btn);
      });
    }
    paintChipState();
  }

  function paintChipState() {
    document.querySelectorAll("#queues [data-queue]").forEach((btn) => {
      btn.setAttribute("aria-pressed", queues.has(btn.dataset.queue) ? "true" : "false");
    });
    document.querySelectorAll("#filters [data-cat]").forEach((btn) => {
      btn.setAttribute("aria-pressed", cats.has(btn.dataset.cat) ? "true" : "false");
    });
    const fav = document.querySelector('#queues [data-toggle="fav"]');
    if (fav) fav.setAttribute("aria-pressed", favOn ? "true" : "false");
    const alerts = document.querySelector('#queues [data-toggle="alerts"]');
    if (alerts) alerts.setAttribute("aria-pressed", alertOn ? "true" : "false");
  }

  function toggleChip(label, key, flip) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.dataset.toggle = key;
    btn.textContent = label;
    btn.addEventListener("click", () => {
      flip();
      paintChipState();
      redraw();
    });
    return btn;
  }

  function redraw() {
    lastSig = "";
    renderList();
  }

  function statusText(active, remain, id) {
    const text = t();
    if (active) return text.now + " · " + text.ends + " " + fmtRemain(remain);
    const lead = PREP_MIN[id];
    if (lead && alertIds.has(id) && remain > 10 * 60000 && remain <= lead * 60000) {
      return text.prepStatus + " · " + text.in + " " + fmtRemain(remain);
    }
    return text.in + " " + fmtRemain(remain);
  }

  function paintTimes(card, when, now, bucket) {
    const active = when.start <= now;
    const remain = active ? when.end - now : when.start - now;
    const fresh = bucket === "active" && now - when.start < 120000;
    card.classList.toggle("fresh", fresh);
    card.classList.toggle("urgent", bucket === "soon");
    card.classList.toggle("prep", bucket === "prep");
    card.querySelector(".status").textContent = statusText(active, remain, card.dataset.id);
    card.querySelector(".start").textContent = dayPrefix(when.start, now) + fmtClock(when.start);
  }

  function eventTags(ev) {
    const labels = Object.fromEntries(t().filters.map((row) => [row[0], row[1]]));
    const short = {
      main: "Main",
      boss: "Boss",
      meta: "Meta",
      core: "Core",
      hot: "HoT",
      pof: "PoF",
      ibs: "IBS",
      eod: "EoD",
      soto: "SotO",
      janthir: "JW",
      voe: "VoE"
    };
    const ids = [];
    if (ev.region) ids.push(ev.region);
    if (ev.kind === "boss" || ev.kind === "meta") ids.push(ev.kind);
    if (ev.featured) ids.push("main");
    return ids.map((id) => ({
      short: short[id] || id,
      full: labels[id] || short[id] || id
    }));
  }

  function cardFor(ev, when, now, bucket) {
    const text = t();
    const active = when.start <= now;
    const remain = active ? when.end - now : when.start - now;
    const marked = bucket === "done";
    const fresh = bucket === "active" && now - when.start < 120000;
    const card = document.createElement("article");
    card.dataset.id = ev.id;
    card.dataset.bucket = bucket;
    card.className = "card"
      + (bucket === "active" ? " now" : bucket === "soon" ? " soon" : bucket === "prep" ? " prep" : "")
      + (bucket === "soon" ? " urgent" : "")
      + (fresh ? " fresh" : "")
      + (marked ? " done" : "");

    const head = document.createElement("div");
    head.className = "row";
    const name = document.createElement("h2");
    name.className = "name";
    name.textContent = ev.name;
    const start = document.createElement("span");
    start.className = "start";
    start.textContent = dayPrefix(when.start, now) + fmtClock(when.start);
    head.append(name, start);

    const sub = document.createElement("div");
    sub.className = "row";
    const map = document.createElement("span");
    map.className = "map";
    map.textContent = ev.map;
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = statusText(active, remain, ev.id);
    sub.append(map, status);

    const tags = document.createElement("div");
    tags.className = "tags";
    eventTags(ev).forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "tag";
      pill.textContent = tag.short;
      if (tag.full && tag.full !== tag.short) pill.setAttribute("data-tip", tag.full);
      tags.append(pill);
    });

    const actions = document.createElement("div");
    actions.className = "row actions";
    const code = document.createElement("code");
    code.className = "chat";
    code.textContent = ev.chat;
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy";
    copy.textContent = text.copy;
    copy.setAttribute("data-tip", text.copyTip);
    copy.setAttribute("aria-label", text.copyTip);
    copy.addEventListener("click", async () => {
      const ok = await copyText(ev.chat);
      showToast(ok ? text.copied : text.copyFail, ok ? "" : ev.chat);
    });
    const star = document.createElement("button");
    star.type = "button";
    star.className = "icon star" + (favs.has(ev.id) ? " on" : "");
    star.textContent = "★";
    star.setAttribute("aria-pressed", favs.has(ev.id) ? "true" : "false");
    const favTip = favs.has(ev.id) ? text.removeFav : text.addFav;
    star.setAttribute("data-tip", favTip);
    star.setAttribute("aria-label", favTip);
    star.addEventListener("click", () => {
      if (favs.has(ev.id)) favs.delete(ev.id);
      else favs.add(ev.id);
      saveFavs();
      redraw();
    });
    const bell = document.createElement("button");
    bell.type = "button";
    bell.className = "icon" + (alertIds.has(ev.id) ? " ring" : "");
    bell.setAttribute("aria-pressed", alertIds.has(ev.id) ? "true" : "false");
    bell.append(bellIcon());
    const alertTip = alertIds.has(ev.id) ? text.removeAlert : text.addAlert;
    bell.setAttribute("data-tip", alertTip);
    bell.setAttribute("aria-label", alertTip);
    bell.addEventListener("click", () => {
      if (alertIds.has(ev.id)) alertIds.delete(ev.id);
      else alertIds.add(ev.id);
      saveAlerts();
      redraw();
    });
    const mark = document.createElement("button");
    mark.type = "button";
    mark.className = "icon check" + (marked ? " checked" : "");
    mark.append(checkIcon());
    mark.setAttribute("aria-pressed", marked ? "true" : "false");
    const doneTip = marked ? text.undo : text.markDone;
    mark.setAttribute("data-tip", doneTip);
    mark.setAttribute("aria-label", doneTip);
    mark.addEventListener("click", () => {
      if (isDone(ev.id, Date.now())) delete done[ev.id];
      else done[ev.id] = gameDay(Date.now());
      saveDone();
      redraw();
    });
    actions.append(code, copy, star, bell, mark);
    card.append(head, sub, tags, actions);
    return card;
  }

  function collect(now) {
    const groups = { active: [], soon: [], prep: [], later: [], done: [] };
    data.events.forEach((ev) => {
      if (!inCategory(ev) || !matchesQuery(ev) || !matchesMarks(ev)) return;
      const when = viewWhen(ev, now);
      if (!when) return;
      const bucket = bucketOf(ev, when, now, isDone(ev.id, now));
      if (!matchesQueue(bucket)) return;
      groups[bucket].push({ ev, when, bucket });
    });
    ["active", "soon", "prep", "later", "done"].forEach((key) => {
      groups[key].sort((a, b) => a.when.start - b.when.start);
    });
    const order = queues.size
      ? ["active", "soon", "prep", "later", "done"].filter((key) => key === "prep" ? queues.has("soon") : queues.has(key))
      : ["active", "soon", "prep", "later"].concat(favOn || alertOn ? ["done"] : []);
    return { groups, order };
  }

  function renderList() {
    const now = Date.now();
    pruneDone(now);
    watch(now);
    if (!footAt || now - footAt >= 60000) {
      $("foot").textContent = footText();
      footAt = now;
    }
    const text = t();
    $("clock").textContent = document.body.classList.contains("is-narrow")
      ? fmtClock(now)
      : fmtClock(now) + " · " + zone() + " · " + dayPart(now);

    const { groups, order } = collect(now);
    const sig = order.map((key) => key + ":" + groups[key].map((row) => row.ev.id).join(",")).join("|");
    const list = $("list");
    if (sig === lastSig) {
      const byId = new Map();
      order.forEach((key) => {
        groups[key].forEach((row) => byId.set(row.ev.id, row));
      });
      list.querySelectorAll(".card").forEach((card) => {
        const row = byId.get(card.dataset.id);
        if (row) paintTimes(card, row.when, now, row.bucket);
      });
      return;
    }
    lastSig = sig;
    list.replaceChildren();
    let shown = 0;
    order.forEach((key) => {
      const rows = groups[key];
      if (!rows.length) return;
      const heading = document.createElement("h2");
      heading.className = "queue" + (key === "prep" ? " prep" : "");
      heading.textContent = text.sections[key];
      list.append(heading);
      rows.forEach(({ ev, when, bucket }) => {
        list.append(cardFor(ev, when, now, bucket));
        shown += 1;
      });
    });
    if (!shown) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = text.empty;
      list.append(p);
    }
  }

  const narrowMq = window.matchMedia("(max-width: 900px)");
  const sheetMovers = [
    $("account"),
    document.querySelector(".git-link"),
    $("heart"),
    $("pix"),
    $("tool-shelf"),
    $("filters")
  ];
  const sheetHomes = sheetMovers.map((el) => ({ el: el, parent: el.parentNode, next: el.nextSibling }));

  function closeSoundPanel() {
    $("sound-panel").hidden = true;
    $("sound").setAttribute("aria-expanded", "false");
  }

  function closeSheet() {
    const wasOpen = !$("sheet").hidden;
    $("sheet").hidden = true;
    $("menu").setAttribute("aria-expanded", "false");
    const menu = $("menu");
    if (wasOpen && menu.getClientRects().length > 0 && sheetCard && sheetCard.contains(document.activeElement)) {
      try { menu.focus({ preventScroll: true }); } catch (err) { /* sem foco */ }
    }
  }

  const sheetCard = document.querySelector(".sheet-card");

  function sheetFocusables() {
    if (!sheetCard) return [];
    return [...sheetCard.querySelectorAll("button, a[href], input, [tabindex]:not([tabindex='-1'])")]
      .filter((node) => !node.disabled && node.getClientRects().length > 0);
  }

  function trapSheetFocus(event) {
    if ($("sheet").hidden) return false;
    if (event.key === "Escape") {
      closeSheet();
      return true;
    }
    if (event.key !== "Tab") return false;
    const nodes = sheetFocusables();
    if (!nodes.length) return true;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || !sheetCard.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
      return true;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
      return true;
    }
    return false;
  }

  function openSheet() {
    closeSoundPanel();
    $("bar").classList.remove("search-open");
    $("sheet").hidden = false;
    $("menu").setAttribute("aria-expanded", "true");
    try { $("sheet-close").focus({ preventScroll: true }); } catch (err) { /* sem foco */ }
  }

  function applyNarrow(on) {
    document.body.classList.toggle("is-narrow", on);
    if (on) {
      const body = $("sheet-body");
      sheetMovers.forEach((el) => body.append(el));
    } else {
      closeSheet();
      $("bar").classList.remove("search-open");
      sheetHomes.forEach((home) => {
        if (home.next && home.next.parentNode === home.parent) home.parent.insertBefore(home.el, home.next);
        else home.parent.append(home.el);
      });
    }
  }

  $("find").addEventListener("click", () => {
    closeSheet();
    const open = $("bar").classList.toggle("search-open");
    if (open) $("search").focus();
  });
  $("menu").addEventListener("click", () => {
    if ($("sheet").hidden) openSheet();
    else closeSheet();
  });
  $("sheet-close").addEventListener("click", closeSheet);
  $("sheet").addEventListener("click", (event) => {
    if (event.target === $("sheet")) {
      closeSheet();
      return;
    }
    const path = event.composedPath();
    if (!path.includes($("sheet-body"))) return;
    if (event.target.closest("button, a")) closeSheet();
  });
  document.addEventListener("keydown", (event) => {
    if (trapSheetFocus(event)) return;
    if (event.key !== "Escape") return;
    if (!$("sheet").hidden) closeSheet();
    if (!$("sound-panel").hidden) closeSoundPanel();
  });
  applyNarrow(narrowMq.matches);
  narrowMq.addEventListener("change", (event) => applyNarrow(event.matches));

  $("heart").addEventListener("click", () => {
    const page = "https://github.com/" + ["sponsors", "wilbresley"].join("/");
    window.open(page, "_blank", "noopener,noreferrer");
  });

  const pixModal = $("pix-modal");
  $("pix").addEventListener("click", () => pixModal.showModal());
  pixModal.addEventListener("click", (event) => {
    if (event.target === pixModal) pixModal.close();
  });
  $("pix-close").addEventListener("click", () => pixModal.close());
  $("pix-copy").addEventListener("click", async () => {
    const key = $("pix").getAttribute("data-pix");
    const ok = await copyText(key);
    showToast(ok ? "Pix key copied" : "Could not copy the Pix key", ok ? "" : key);
  });

  $("sound").addEventListener("click", (event) => {
    event.stopPropagation();
    closeSheet();
    const open = $("sound-panel").hidden;
    $("sound-panel").hidden = !open;
    $("sound").setAttribute("aria-expanded", open ? "true" : "false");
    if (open && sound) unlockSound();
  });
  $("sound-panel").addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", () => {
    if (!$("sound-panel").hidden) closeSoundPanel();
  });
  $("sound-toggle").addEventListener("click", () => {
    sound = !sound;
    writeFlag("gw2-sound", sound ? "1" : "0");
    if (sound) {
      unlockSound();
      enqueueSound("preview");
    } else stopVoice();
    paintChrome();
  });
  ["prep", "soon", "start"].forEach((kind) => {
    $("sound-" + kind).addEventListener("click", () => {
      repeats[kind] = repeats[kind] >= 5 ? 1 : repeats[kind] + 1;
      writeJSON("gw2-sound-repeats", repeats);
      paintChrome();
    });
  });

  $("alarm").addEventListener("click", finishAlarm);
  $("alarm").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      finishAlarm();
    }
  });

  $("search").addEventListener("input", () => {
    query = $("search").value.trim().toLowerCase();
    redraw();
  });

  function hideTip() {
    clearTimeout(tipTimer);
    tipTimer = 0;
    $("tip").hidden = true;
  }

  function showTip(el) {
    const text = el.getAttribute("data-tip");
    if (!text) return;
    const tip = $("tip");
    tip.textContent = text;
    tip.hidden = false;
    const rect = el.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = rect.top - height - 8;
    if (top < 8) top = rect.bottom + 8;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  document.addEventListener("pointerover", (event) => {
    const el = event.target.closest && event.target.closest("[data-tip]");
    if (!el) return;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => showTip(el), 1000);
  });

  document.addEventListener("pointerout", (event) => {
    const el = event.target.closest && event.target.closest("[data-tip]");
    if (!el) return;
    const next = event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest("[data-tip]");
    if (next === el) return;
    hideTip();
  });

  document.addEventListener("scroll", hideTip, true);

  document.addEventListener("pointerdown", () => {
    if (sound) unlockSound();
  });

  function onWake() {
    const playing = alarmVoice();
    if (alarmCurrent && playing && playing.paused && !playing.ended && sound && soundUnlocked && soundBusy) {
      const again = playing.play();
      if (again && again.catch) again.catch(() => {});
    } else if (alarmCurrent && sound && soundUnlocked && !soundBusy) {
      playKind(alarmCurrent.kind, finishAlarm);
    }
    if (alarmHold && alarmCurrent) {
      const alive = alarmVoice();
      const stillPlaying = alive && !alive.paused && !alive.ended;
      if (alarmUntil > Date.now() || stillPlaying) revealAlarm();
      else finishAlarm();
    }
    renderList();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") onWake();
  });
  window.addEventListener("focus", onWake);

  paintChrome();
  renderList();
  const versionLine = $("version-line");
  if (versionLine && window.GW2_VERSION) versionLine.textContent = "Version " + window.GW2_VERSION + " · Bresleywil.2384";

  /* The account panel is about 165 KB. Only someone who uses it pays for it:
     a saved key loads it at boot (the tool shelf needs it), anyone else
     gets it on the first click on Account. */
  let accountLoad = null;
  function loadAccount(thenOpen) {
    if (accountLoad) {
      accountLoad.then(() => { if (thenOpen) $("account").click(); });
      return accountLoad;
    }
    accountLoad = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "account.js?v=39";
      script.async = true;
      script.onload = () => {
        $("account").dataset.ready = "1";
        resolve();
        if (thenOpen) $("account").click();
      };
      script.onerror = () => {
        accountLoad = null;
        showToast("The account panel did not load.");
        resolve();
      };
      document.body.append(script);
    });
    return accountLoad;
  }
  const accountBtn = $("account");
  accountBtn.addEventListener("click", (event) => {
    if (accountBtn.dataset.ready === "1") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    loadAccount(true);
  }, true);
  if (readFlag("gw2-token")) loadAccount(false);

  let ticking = false;
  try {
    const url = URL.createObjectURL(new Blob(
      ["setInterval(function(){postMessage(0)},1000)"],
      { type: "text/javascript" }
    ));
    const worker = new Worker(url);
    worker.onmessage = () => renderList();
    ticking = true;
  } catch (err) { /* sem worker: o intervalo abaixo segue o relógio */ }
  if (!ticking) setInterval(renderList, 1000);
})();
