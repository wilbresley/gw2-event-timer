/* The timer never contacts a server. Schedules come from data.js.
   Favorites, alerts, and completed marks stay in this browser's localStorage. */
(function () {
  const data = window.GW2;
  const I18N = {
    pt: {
      title: "Gw2 Event Timer",
      lang: "EN",
      html: "pt-BR",
      soundOn: "Som ligado",
      soundOff: "Ligar som",
      search: "Buscar pelo nome",
      favorites: "Favoritos",
      alerts: "Alertas",
      closeAlarm: "Toque para fechar",
      addFav: "Adicionar favorito",
      removeFav: "Remover favorito",
      addAlert: "Ativar alerta",
      removeAlert: "Desativar alerta",
      markDone: "Marcar que já fiz hoje",
      copyTip: "Copiar teleporte",
      queues: [
        ["active", "Ativos"],
        ["soon", "Em 10 min"],
        ["done", "Concluídos"]
      ],
      sections: { active: "Ativos", soon: "Em 10 min", prep: "Preparar", later: "Próximos", done: "Concluídos" },
      parts: { madrugada: "Madrugada", manha: "Manhã", tarde: "Tarde", noite: "Noite" },
      filters: [
        ["main", "Principais", ""],
        ["boss", "Chefes", ""],
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
      now: "Agora",
      ends: "acaba em",
      in: "em",
      tomorrow: "amanhã",
      yesterday: "ontem",
      copy: "TP",
      copied: "Código copiado. Cole no chat do jogo.",
      copyFail: "Copia este código e cola no chat:",
      done: "Já fiz",
      undo: "Desfazer",
      alert: "Avisar",
      empty: "Nada nessa combinação.",
      soonBody: "começa em 10 minutos",
      startBody: "começou agora",
      soonTitle: "Em 10 minutos",
      startTitle: "Começou agora",
      prepTitle: "Preparar",
      prepStatus: "prepara o mapa",
      prepBody: "hora de achar mapa e grupo",
      phases: { Day: "Dia", Dusk: "Entardecer", Night: "Noite", Dawn: "Amanhecer" }
    },
    en: {
      title: "Gw2 Event Timer",
      lang: "PT-BR",
      html: "en-US",
      soundOn: "Sound on",
      soundOff: "Enable sound",
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
  function loadSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
    catch (err) { return new Set(); }
  }

  let lang = "en";
  let sound = localStorage.getItem("gw2-sound") !== "0";
  let cats = new Set(localStorage.getItem("gw2-cats")
    ? JSON.parse(localStorage.getItem("gw2-cats"))
    : [localStorage.getItem("gw2-filter") || "main"]);
  let queues = new Set(JSON.parse(localStorage.getItem("gw2-queues") || "[]"));
  let favOn = localStorage.getItem("gw2-fav") === "1";
  let alertOn = localStorage.getItem("gw2-alert-on") === "1";
  let query = "";
  let alertIds = localStorage.getItem("gw2-alerts") === null
    ? loadSet("gw2-stars")
    : loadSet("gw2-alerts");
  if (localStorage.getItem("gw2-alerts") === null) {
    localStorage.setItem("gw2-alerts", JSON.stringify([...alertIds]));
  }
  let favs = loadSet("gw2-favs");
  let done = JSON.parse(localStorage.getItem("gw2-done") || "{}");
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
  let audioArmed = false;
  let soundBusy = false;
  let repeatLeft = 0;
  let voiceGeneration = 0;
  const soundQueue = [];
  let voice = null;
  let arming = false;
  const phase = {};
  const PREP_MIN = { "g10-3": 20, "g9-3": 15, "g11-1": 15 };

  function t() { return I18N[lang]; }

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
      localStorage.setItem("gw2-done", JSON.stringify(done));
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

  function cycleName(now) {
    const minute = new Date(now).getUTCHours() * 60 + new Date(now).getUTCMinutes();
    const partial = data.cycle.partial;
    const pattern = data.cycle.pattern;
    let at = 0;
    const walk = (step) => {
      const end = at + step[1];
      if (minute >= at && minute < end) {
        const seg = data.cycle.segments.find((s) => s.id === step[0]);
        return seg ? seg.name : "";
      }
      at = end;
      return "";
    };
    for (const step of partial) {
      const hit = walk(step);
      if (hit) return hit;
    }
    const span = pattern.reduce((sum, step) => sum + step[1], 0) || 1;
    let left = (minute - at) % span;
    if (left < 0) left += span;
    for (const step of pattern) {
      if (left < step[1]) {
        const seg = data.cycle.segments.find((s) => s.id === step[0]);
        return seg ? seg.name : "";
      }
      left -= step[1];
    }
    return "";
  }

  function fmtClock(ms) {
    return new Intl.DateTimeFormat(t().html, {
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

  function placeName() {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return zone.split("/").pop().replace(/_/g, " ");
  }

  function resetClock() {
    const mark = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    return new Intl.DateTimeFormat(t().html, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(mark);
  }

  function footText() {
    const time = resetClock();
    const city = placeName();
    if (lang === "en") {
      return "Times follow this device. Done clears at the game reset, " + time + " in " + city + ". Favorites and alerts stay saved in this browser.";
    }
    return "O horário é o deste aparelho. Concluídos zeram no reset do jogo, às " + time + " em " + city + ". Favoritos e alertas ficam salvos neste navegador.";
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
    localStorage.setItem("gw2-favs", JSON.stringify([...favs]));
  }

  function saveAlerts() {
    localStorage.setItem("gw2-alerts", JSON.stringify([...alertIds]));
  }

  function saveDone() {
    localStorage.setItem("gw2-done", JSON.stringify(done));
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

  function silentClip() {
    const n = 400;
    const bytes = new ArrayBuffer(44 + n * 2);
    const view = new DataView(bytes);
    const mark = (at, text) => {
      for (let i = 0; i < text.length; i++) view.setUint8(at + i, text.charCodeAt(i));
    };
    mark(0, "RIFF");
    view.setUint32(4, 36 + n * 2, true);
    mark(8, "WAVE");
    mark(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 8000, true);
    view.setUint32(28, 16000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    mark(36, "data");
    view.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  }

  function ensureVoice() {
    if (voice) return voice;
    voice = new Audio();
    voice.preload = "auto";
    return voice;
  }

  function silence(audio) {
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
  }

  function stopVoice() {
    voiceGeneration += 1;
    repeatLeft = 0;
    soundBusy = false;
    soundQueue.length = 0;
    silence(voice);
  }

  function playKind(kind, onDone) {
    if (!sound || !audioArmed || !clips[kind]) return;
    const audio = ensureVoice();
    const generation = ++voiceGeneration;
    soundBusy = true;
    repeatLeft = (REPEATS[kind] || 1) - 1;
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
      if (!soundBusy) silence(audio);
    };
    if (audio.getAttribute("src") !== clips[kind]) audio.src = clips[kind];
    else {
      try { audio.currentTime = 0; } catch (err) { /* o arquivo ainda não voltou ao início */ }
    }
    const played = audio.play();
    if (!played || !played.catch) return;
    played.catch((err) => {
      if (generation !== voiceGeneration) return;
      soundBusy = false;
      repeatLeft = 0;
      silence(audio);
      if (err && err.name === "NotAllowedError") audioArmed = false;
      if (!onDone) {
        soundQueue.unshift(kind);
        if (soundQueue.length > 3) soundQueue.pop();
      }
    });
  }

  const REPEATS = { prep: 2, soon: 3, start: 5, preview: 1 };
  const CLIP_SEC = { prep: 7.0425, soon: 3.3958125, start: 2.3770625 };
  ["prep", "soon", "start"].forEach((kind) => {
    const probe = new Audio(clips[kind]);
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) CLIP_SEC[kind] = probe.duration;
    });
  });

  function pumpSounds() {
    if (!sound || soundBusy || alarmCurrent || !soundQueue.length || !audioArmed) return;
    playKind(soundQueue.shift());
  }

  function enqueueSound(kind) {
    if (!sound || !clips[kind]) return;
    soundQueue.push(kind);
    if (soundQueue.length > 3) soundQueue.shift();
    pumpSounds();
  }

  let silentUrl = "";
  function armAudio() {
    if (!sound || audioArmed || arming) {
      if (sound && audioArmed) pumpSounds();
      return;
    }
    arming = true;
    if (!silentUrl) silentUrl = silentClip();
    const kick = new Audio(silentUrl);
    kick.muted = true;
    const played = kick.play();
    const done = () => {
      silence(kick);
      arming = false;
      audioArmed = true;
      pumpSounds();
    };
    if (played && played.then) played.then(done).catch(() => { arming = false; audioArmed = false; });
    else done();
  }

  function kindMs(kind) {
    return Math.ceil(CLIP_SEC[kind] * REPEATS[kind] * 1000);
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
  }

  function beginAlarm(note) {
    alarmCurrent = note;
    const ms = kindMs(note.kind);
    alarmUntil = Date.now() + ms;
    clearTimeout(alarmTimer);
    if (sound && audioArmed) {
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

  function notify(title, body) {
    if (document.visibilityState === "visible") return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try { new Notification(title, { body }); } catch (err) { /* ignore */ }
  }

  function watch(now) {
    const woke = lastWatch > 0 && now - lastWatch > 2000;
    const fired = [];
    data.events.forEach((ev) => {
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
          const body = kind === "start" ? t().startBody : kind === "prep" ? t().prepBody : t().soonBody;
          fired.push({ name: ev.name, kind });
          notify(ev.name, body);
        }
        phase[key] = state;
      });
    });
    if (sound && audioArmed && soundQueue.length) pumpSounds();
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
    $("sound").textContent = sound ? text.soundOn : text.soundOff;
    $("sound").setAttribute("aria-pressed", sound ? "true" : "false");

    const queueNav = $("queues");
    queueNav.replaceChildren();
    text.queues.forEach(([id, label]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = label;
      btn.setAttribute("aria-pressed", queues.has(id) ? "true" : "false");
      btn.addEventListener("click", () => {
        if (queues.has(id)) queues.delete(id);
        else queues.add(id);
        localStorage.setItem("gw2-queues", JSON.stringify([...queues]));
        paintChrome();
        redraw();
      });
      queueNav.append(btn);
    });
    queueNav.append(toggleChip(text.favorites, favOn, () => {
      favOn = !favOn;
      localStorage.setItem("gw2-fav", favOn ? "1" : "0");
    }));
    queueNav.append(toggleChip(text.alerts, alertOn, () => {
      alertOn = !alertOn;
      localStorage.setItem("gw2-alert-on", alertOn ? "1" : "0");
    }));

    const nav = $("filters");
    nav.replaceChildren();
    text.filters.forEach(([id, label, tip]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = label;
      if (tip) btn.setAttribute("data-tip", tip);
      btn.setAttribute("aria-pressed", cats.has(id) ? "true" : "false");
      btn.addEventListener("click", () => {
        if (cats.has(id)) cats.delete(id);
        else cats.add(id);
        localStorage.setItem("gw2-cats", JSON.stringify([...cats]));
        paintChrome();
        redraw();
      });
      nav.append(btn);
    });
  }

  function toggleChip(label, pressed, flip) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    btn.addEventListener("click", () => {
      flip();
      paintChrome();
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
      main: lang === "en" ? "Main" : "Principais",
      boss: lang === "en" ? "Boss" : "Chefe",
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
    const text = t();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    $("clock").textContent = fmtClock(now) + " · " + zone + " · " + dayPart(now);

    const { groups, order } = collect(now);
    const sig = lang + "|" + order.map((key) => key + ":" + groups[key].map((row) => row.ev.id).join(",")).join("|");
    const list = $("list");
    if (sig === lastSig) {
      list.querySelectorAll(".card").forEach((card) => {
        const row = order.flatMap((key) => groups[key]).find((item) => item.ev.id === card.dataset.id);
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

  $("sound").addEventListener("click", () => {
    sound = !sound;
    localStorage.setItem("gw2-sound", sound ? "1" : "0");
    if (sound) {
      armAudio();
      enqueueSound("preview");
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } else {
      audioArmed = false;
      stopVoice();
    }
    paintChrome();
  });

  $("alarm").addEventListener("click", finishAlarm);

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
    if (sound) armAudio();
  });

  function onWake() {
    if (alarmCurrent && voice && voice.paused && !voice.ended && sound && audioArmed) {
      const again = voice.play();
      if (again && again.catch) again.catch(() => {});
    }
    if (alarmHold && alarmCurrent) {
      const playing = voice && !voice.paused && !voice.ended;
      if (alarmUntil > Date.now() || playing) revealAlarm();
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
  setInterval(renderList, 1000);
  try {
    const url = URL.createObjectURL(new Blob(
      ["setInterval(function(){postMessage(0)},1000)"],
      { type: "text/javascript" }
    ));
    const worker = new Worker(url);
    worker.onmessage = () => renderList();
  } catch (err) { /* o intervalo acima segue o relógio */ }
})();
