/* =========================================================================
   MALL AFTER DARK · game engine
   ========================================================================= */

(() => {
  "use strict";

  const DATA = ESCAPE_DATA;
  const $ = (id) => document.getElementById(id);

  const PREFS_KEY = "mad-prefs-v2";
  const SAVE_KEY = "mad-save-v3";
  const HINTS_TOTAL = 3;
  const PENALTY = 20;
  const CODE_LENGTH = 5;

  const PALETTE = ["#2ee6c5", "#ffc857", "#b79cff", "#59c2ff", "#ff7d8a", "#3ddc97"];

  /* ------------------------------- STATE ------------------------------- */
  function freshRooms() {
    const map = {};
    DATA.rooms.forEach((r) => { map[r.id] = { codeOpen: false, missionDone: false }; });
    return map;
  }

  const state = {
    started: false,
    finished: false,
    team: "Team 1",
    members: ["", "", "", "", ""],
    timerMode: 25,
    timerLeft: 25 * 60,
    timerRunning: false,
    startedAt: null,
    hintsLeft: HINTS_TOTAL,
    hintsUsed: 0,
    rooms: freshRooms(),
    activeRoom: null,
    pendingMissionRoom: null,
    wrongCodes: 0,
    soundOn: true
  };

  /* -------------------------------- DOM -------------------------------- */
  const SCREENS = {
    start: $("screen-start"),
    map: $("screen-map"),
    room: $("screen-room"),
    win: $("screen-win")
  };

  const ui = {
    brandHome: $("brandHome"),
    timerWrap: $("timerWrap"),
    timer: $("timer"),
    pauseBtn: $("pauseBtn"),
    soundBtn: $("soundBtn"),
    teamInput: $("teamInput"),
    memberInputs: [...document.querySelectorAll(".member-input")],
    timerChoices: $("timerChoices"),
    startBtn: $("startBtn"),
    resumeWrap: $("resumeWrap"),
    resumeInfo: $("resumeInfo"),
    resumeBtn: $("resumeBtn"),
    mapTitle: $("mapTitle"),
    mapSub: $("mapSub"),
    roomTrack: $("roomTrack"),
    roomGrid: $("roomGrid"),
    restartBtn: $("restartBtn"),
    backToMap: $("backToMap"),
    roomIcon: $("roomIcon"),
    roomTitle: $("roomTitle"),
    roomTopic: $("roomTopic"),
    roomHintBtn: $("roomHintBtn"),
    hintLeft: $("hintLeft"),
    roomContent: $("roomContent"),
    winStats: $("winStats"),
    winRank: $("winRank"),
    winMembers: $("winMembers"),
    winCodes: $("winCodes"),
    playAgain: $("playAgain"),
    modalMission: $("modalMission"),
    missionTitle: $("missionTitle"),
    missionIntro: $("missionIntro"),
    missionBox: $("missionBox"),
    missionBtn: $("missionBtn"),
    toast: $("toast")
  };

  /* ------------------------------- HELPERS ----------------------------- */
  const roomById = (id) => DATA.rooms.find((r) => r.id === id);
  const roomIndex = (id) => DATA.rooms.findIndex((r) => r.id === id);
  const roomNumber = (room) => roomIndex(room.id) + 1;
  const letter = (i) => String.fromCharCode(65 + i);

  function showScreen(name) {
    Object.entries(SCREENS).forEach(([key, node]) => {
      node.classList.toggle("hidden", key !== name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isUnlocked(room) {
    if (state.rooms[room.id].missionDone) return true;
    const idx = roomIndex(room.id);
    if (idx === 0) return true;
    return state.rooms[DATA.rooms[idx - 1].id].missionDone;
  }

  function allRoomsDone() {
    return DATA.rooms.every((r) => state.rooms[r.id].missionDone);
  }

  function roomsCleared() {
    return DATA.rooms.filter((r) => state.rooms[r.id].missionDone).length;
  }

  function nextRoom(room) {
    const idx = roomIndex(room.id);
    return DATA.rooms[idx + 1] || null;
  }

  function readMemberInputs() {
    return ui.memberInputs.map((input) => input.value.trim());
  }

  function fillMemberInputs(members) {
    const list = Array.isArray(members) ? members : [];
    ui.memberInputs.forEach((input, i) => { input.value = list[i] || ""; });
  }

  function memberNames() {
    return state.members.map((name) => name.trim()).filter(Boolean);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function missionSteps(room) {
    const whCards = room.cards.filter((card) => card.wh).slice(0, CODE_LENGTH);
    let names = memberNames().slice(0, CODE_LENGTH);
    if (!names.length) {
      names = Array.from({ length: CODE_LENGTH }, (_, i) => `Member ${i + 1}`);
    }
    return whCards.map((card, i) => ({
      index: i + 1,
      asker: names[i % names.length],
      answerer: names[(i + 1) % names.length],
      question: card.q,
      number: card.n
    }));
  }

  function missionStepBody(step) {
    return `
      <span class="mission-step-body">
        <span class="mission-step-head"><span class="mission-step-num">${step.index}</span> <strong>${escapeHtml(step.asker)}</strong> asks <strong>${escapeHtml(step.answerer)}</strong></span>
        <span class="mission-step-question">“${escapeHtml(step.question)}”</span>
      </span>`;
  }

  function missionStepsHtml(room, interactive) {
    return missionSteps(room).map((step) => (
      interactive
        ? `<label class="mission-step"><input type="checkbox" class="mission-step-check" data-step="${step.index}" aria-label="Question ${step.index} completed" />${missionStepBody(step)}</label>`
        : `<div class="mission-step is-static">${missionStepBody(step)}</div>`
    )).join("");
  }

  /* -------------------------------- SOUND ------------------------------ */
  let audioCtx = null;

  function beep(notes) {
    if (!state.soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      notes.forEach(([freq, start, dur]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.14, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } catch (_) { /* no audio */ }
  }

  const sfx = {
    good: () => beep([[620, 0, 0.1], [880, 0.08, 0.16]]),
    bad: () => beep([[200, 0, 0.15], [150, 0.1, 0.2]]),
    unlock: () => beep([[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1046, 0.27, 0.25]]),
    win: () => beep([[523, 0, 0.14], [659, 0.14, 0.14], [784, 0.28, 0.14], [1046, 0.42, 0.3], [1318, 0.62, 0.4]])
  };

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  /* -------------------------------- TOAST ------------------------------ */
  let toastTimer = null;
  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 3400);
  }

  /* ----------------------------- PREFERENCES --------------------------- */
  function loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(PREFS_KEY));
      if (!p) return;
      if (p.team) state.team = p.team;
      if (Array.isArray(p.members)) {
        state.members = p.members.slice(0, 5).map((name) => String(name || ""));
      }
      if (p.timerMode === 0 || p.timerMode === 25) state.timerMode = p.timerMode;
      if (typeof p.soundOn === "boolean") state.soundOn = p.soundOn;
    } catch (_) { /* ignore */ }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        team: state.team,
        members: state.members,
        timerMode: state.timerMode,
        soundOn: state.soundOn
      }));
    } catch (_) { /* ignore */ }
  }

  /* -------------------------------- SAVE ------------------------------- */
  function snapshot() {
    if (!state.started || state.finished) return;
    try {
      const rooms = {};
      DATA.rooms.forEach((r) => {
        rooms[r.id] = {
          codeOpen: state.rooms[r.id].codeOpen,
          missionDone: state.rooms[r.id].missionDone
        };
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        team: state.team,
        members: state.members,
        timerMode: state.timerMode,
        hintsLeft: state.hintsLeft,
        hintsUsed: state.hintsUsed,
        wrongCodes: state.wrongCodes,
        rooms
      }));
    } catch (_) { /* ignore */ }
  }

  function readSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s || !s.rooms) return null;
      const progress = (s.hintsUsed || 0) > 0 ||
        Object.values(s.rooms).some((r) => r.codeOpen || r.missionDone);
      return progress ? s : null;
    } catch (_) {
      return null;
    }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (_) { /* ignore */ }
  }

  /* -------------------------------- TIMER ------------------------------ */
  let timerId = null;

  function fmt(sec) {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function updateTimer() {
    ui.timer.textContent = fmt(state.timerLeft);
    ui.timerWrap.classList.toggle("is-low", state.timerMode > 0 && state.timerLeft <= 300);
    ui.pauseBtn.textContent = state.timerRunning ? "⏸" : "▶";
    ui.pauseBtn.setAttribute("aria-label", state.timerRunning ? "Pause the timer" : "Resume the timer");
  }

  function setupTimer() {
    clearInterval(timerId);
    if (state.timerMode === 0) {
      ui.timerWrap.classList.add("hidden");
      return;
    }
    ui.timerWrap.classList.remove("hidden");
    state.timerLeft = state.timerMode * 60;
    state.timerRunning = true;
    state.startedAt = Date.now();
    updateTimer();
    timerId = setInterval(() => {
      if (!state.timerRunning) return;
      state.timerLeft -= 1;
      updateTimer();
      if (state.timerLeft <= 0) {
        state.timerLeft = 0;
        state.timerRunning = false;
        updateTimer();
        toast("⏰ Time's up! You can still finish the escape.");
      }
    }, 1000);
  }

  function stopTimer() {
    state.timerRunning = false;
    clearInterval(timerId);
    updateTimer();
  }

  function setGameChrome(on) {
    if (!on) {
      ui.timerWrap.classList.add("hidden");
      return;
    }
    if (state.timerMode > 0) ui.timerWrap.classList.remove("hidden");
    else ui.timerWrap.classList.add("hidden");
  }

  /* -------------------------------- MAP -------------------------------- */
  function renderMap() {
    const done = roomsCleared();

    ui.roomTrack.innerHTML = "";
    DATA.rooms.forEach((room) => {
      const dot = document.createElement("span");
      const roomState = state.rooms[room.id];
      dot.className = "room-dot" + (roomState.missionDone ? " done" : isUnlocked(room) && !roomState.missionDone ? " current" : "");
      dot.textContent = roomState.missionDone ? "✓" : String(roomNumber(room));
      dot.title = `${room.title} · ${roomState.missionDone ? "cleared" : isUnlocked(room) ? "open" : "locked"}`;
      ui.roomTrack.appendChild(dot);
    });

    ui.roomGrid.innerHTML = "";

    DATA.rooms.forEach((room) => {
      const roomState = state.rooms[room.id];
      const unlocked = isUnlocked(room);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "room-card";
      card.style.setProperty("--accent", room.accent);
      card.dataset.room = room.id;

      let statusHtml;
      if (roomState.missionDone) {
        card.classList.add("cleared");
        statusHtml = `<span class="room-status good">✓ Room cleared</span>`;
      } else if (!unlocked) {
        card.classList.add("locked");
        statusHtml = `<span class="room-status">🔒 Locked</span>`;
      } else if (roomState.codeOpen) {
        card.classList.add("pending");
        statusHtml = `<span class="room-status warn">🔓 Door open · mission pending</span>`;
      } else {
        card.classList.add("current");
        statusHtml = `<span class="room-status play">▶ Enter the room</span>`;
      }

      card.innerHTML = `
        <span class="room-num">${room.number}</span>
        <span class="room-icon">${room.icon}</span>
        <span class="room-name">${room.title}</span>
        <span class="room-topic">${room.topic}</span>
        ${statusHtml}`;

      card.addEventListener("click", () => {
        if (!unlocked) {
          toast("Clear the previous room to unlock this one.");
          return;
        }
        openRoom(room.id);
      });

      ui.roomGrid.appendChild(card);
    });

    const allDone = allRoomsDone();
    const exit = document.createElement("button");
    exit.type = "button";
    exit.className = "room-card exit-card" + (allDone ? " ready" : " locked");
    exit.innerHTML = `
      <span class="room-icon">🚪</span>
      <div>
        <div class="room-name">The Exit</div>
        <div class="room-status">${allDone ? "All four codes found" : `${done}/4 rooms cleared · locked`}</div>
      </div>
      <span class="room-status ${allDone ? "play" : ""}">${allDone ? "Escape now →" : "🔒"}</span>`;
    exit.addEventListener("click", () => {
      if (!allDone) {
        toast("The exit is locked. Clear all four rooms first.");
        return;
      }
      winGame();
    });
    ui.roomGrid.appendChild(exit);

    ui.mapTitle.textContent = allDone ? "The exit is open." : "Four shops. Four codes.";

    const current = DATA.rooms.find((r) => !state.rooms[r.id].missionDone);
    ui.mapSub.textContent = allDone
      ? "All four rooms are cleared. Run to the exit!"
      : current && state.rooms[current.id].codeOpen
        ? `${current.title}: the door is open. Complete the team mission.`
        : current
          ? `Enter ${current.title} and find the five WH questions.`
          : "Find the five WH questions.";
  }

  function renderMapAndShow() {
    renderMap();
    showScreen("map");
  }

  /* -------------------------------- ROOM ------------------------------- */
  function openRoom(id) {
    const room = roomById(id);
    const roomState = state.rooms[id];
    state.activeRoom = id;

    ui.roomIcon.textContent = room.icon;
    ui.roomTitle.textContent = room.title;
    ui.roomTopic.textContent = `${room.topic} · Room ${room.number}`;
    ui.roomContent.style.setProperty("--accent", room.accent);
    updateHintButton();

    if (roomState.missionDone) renderCompleted(room);
    else if (roomState.codeOpen) renderMissionPending(room);
    else renderPuzzle(room);

    showScreen("room");
  }

  function updateHintButton() {
    ui.hintLeft.textContent = state.hintsLeft;
    ui.roomHintBtn.disabled = !state.activeRoom || state.hintsLeft <= 0;
  }

  function revealHint(room) {
    if (state.hintsLeft <= 0) return;
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    updateHintButton();
    snapshot();

    let box = ui.roomContent.querySelector(".hint-box");
    if (!box) {
      box = document.createElement("div");
      box.className = "hint-box";
      ui.roomContent.prepend(box);
    }
    box.innerHTML = `<strong>💡 Hint:</strong> ${room.hint}`;
    if (state.hintsLeft === 0) toast("That was your last hint!");
  }

  /* ------------------------------ PUZZLE ------------------------------- */
  function renderPuzzle(room) {
    ui.roomContent.innerHTML = `
      <p class="room-intro">${room.intro}</p>
      <div class="task-line">
        <span>Select the five WH questions.</span>
        <span class="micro">Their numbers make the code, in card order.</span>
      </div>

      <div class="ticket-grid">
        ${room.cards.map((card, i) => `
          <button class="ticket" type="button" data-i="${i}" aria-pressed="false">
            <span class="ticket-letter">${letter(i)}</span>
            <span class="ticket-num">${card.n}</span>
            <span class="ticket-q">${card.q}</span>
          </button>`).join("")}
      </div>

      <div id="codePanel" class="code-panel">
        <p class="field-label">Room code</p>
        <div id="codeSlots" class="code-slots"></div>
        <div class="code-actions">
          <button id="clearCode" class="btn secondary" type="button">Clear</button>
          <button id="tryCode" class="btn primary" type="button" disabled>Open the door</button>
        </div>
        <div id="codeFeedback" class="feedback hidden" role="status" aria-live="polite"></div>
      </div>`;

    const tickets = [...ui.roomContent.querySelectorAll(".ticket")];
    const slots = $("codeSlots");
    const tryBtn = $("tryCode");
    const clearBtn = $("clearCode");
    const panel = $("codePanel");
    const fb = $("codeFeedback");

    let selected = [];
    let locked = false;

    function draw() {
      tickets.forEach((ticket, i) => {
        const on = selected.includes(i);
        ticket.classList.toggle("selected", on);
        ticket.setAttribute("aria-pressed", String(on));
      });

      slots.innerHTML = "";
      for (let i = 0; i < CODE_LENGTH; i++) {
        const idx = selected[i];
        const slot = document.createElement("div");
        slot.className = "code-slot" + (idx === undefined ? " empty" : " filled");
        slot.innerHTML = idx === undefined
          ? `<span class="num">?</span><span class="letter">—</span>`
          : `<span class="num">${room.cards[idx].n}</span><span class="letter">${letter(idx)}</span>`;
        slots.appendChild(slot);
      }

      tryBtn.disabled = selected.length !== CODE_LENGTH || locked;
      clearBtn.disabled = selected.length === 0 || locked;
    }

    tickets.forEach((ticket, i) => {
      ticket.addEventListener("click", () => {
        if (locked) return;
        if (selected.includes(i)) {
          selected = selected.filter((x) => x !== i);
        } else {
          if (selected.length >= CODE_LENGTH) {
            setFeedback(fb, "bad", "Only five questions can be selected. Deselect one first.");
            ticket.classList.add("shake");
            setTimeout(() => ticket.classList.remove("shake"), 420);
            return;
          }
          selected = [...selected, i].sort((a, b) => a - b);
        }
        fb.className = "feedback hidden";
        draw();
      });
    });

    clearBtn.addEventListener("click", () => {
      if (locked) return;
      selected = [];
      fb.className = "feedback hidden";
      draw();
    });

    tryBtn.addEventListener("click", () => {
      if (locked || selected.length !== CODE_LENGTH) return;
      const code = selected.map((i) => room.cards[i].n).join("");

      if (code === room.code) {
        locked = true;
        state.rooms[room.id].codeOpen = true;
        snapshot();
        draw();
        sfx.unlock();
        setFeedback(fb, "good", `Code ${code} accepted. The door is opening…`);
        setTimeout(() => {
          if (state.activeRoom === room.id && !state.rooms[room.id].missionDone) {
            openMission(room);
          }
        }, 700);
      } else {
        state.wrongCodes += 1;
        let penaltyText = "";
        if (state.timerMode > 0 && state.timerRunning) {
          state.timerLeft = Math.max(0, state.timerLeft - PENALTY);
          updateTimer();
          penaltyText = ` −${PENALTY} seconds.`;
          if (state.timerLeft === 0) {
            state.timerRunning = false;
            updateTimer();
            toast("⏰ Time's up! You can still finish the escape.");
          }
        }
        snapshot();
        sfx.bad();
        panel.classList.add("shake");
        slots.classList.add("shake");
        setTimeout(() => {
          panel.classList.remove("shake");
          slots.classList.remove("shake");
        }, 420);
        setFeedback(
          fb,
          "bad",
          `The door stays locked.${penaltyText} Check which questions ask for information and which ones ask for Yes/No.`
        );
      }
    });

    draw();
  }

  function setFeedback(node, kind, message) {
    node.className = `feedback ${kind}`;
    node.textContent = message;
  }

  /* --------------------------- ROOM STATES ----------------------------- */
  function renderMissionPending(room) {
    ui.roomContent.innerHTML = `
      <div class="completed-banner">
        <span class="big" aria-hidden="true">🔓</span>
        <div>
          <p><strong>The door is open!</strong> Now complete the team mission to leave the room.</p>
          <p class="micro">Room ${room.number} · ${room.title}</p>
        </div>
      </div>

      <div class="code-recap">
        <p class="micro">Room code</p>
        <p><strong>${room.code}</strong></p>
      </div>

      <div class="mission">
        <p class="mission-label">Question chain</p>
        <div class="mission-steps">${missionStepsHtml(room, false)}</div>
      </div>

      <div class="solved-actions" style="margin-top:1rem">
        <button id="doMission" class="btn primary" type="button">🎤 Team mission</button>
        <button id="goMap" class="btn secondary" type="button">← Mall map</button>
      </div>`;

    $("doMission").addEventListener("click", () => openMission(room));
    $("goMap").addEventListener("click", renderMapAndShow);
  }

  function renderCompleted(room) {
    const next = nextRoom(room);
    ui.roomContent.innerHTML = `
      <div class="completed-banner">
        <span class="big" aria-hidden="true">✅</span>
        <div>
          <p><strong>Room cleared!</strong> Your team found the code and completed the mission.</p>
          <p class="micro">Room ${room.number} · ${room.title}</p>
        </div>
      </div>

      <div class="code-recap">
        <p class="micro">Room code</p>
        <p><strong>${room.code}</strong></p>
      </div>

      <div class="mission">
        <p class="mission-label">Question chain</p>
        <div class="mission-steps">${missionStepsHtml(room, false)}</div>
      </div>

      <div class="solved-actions" style="margin-top:1rem">
        <button id="goMap" class="btn secondary" type="button">← Mall map</button>
        ${next && !state.rooms[next.id].missionDone && isUnlocked(next)
          ? `<button id="goNext" class="btn primary" type="button">Next room: ${next.title} →</button>`
          : ""}
      </div>`;

    $("goMap").addEventListener("click", renderMapAndShow);
    if ($("goNext")) $("goNext").addEventListener("click", () => openRoom(next.id));
  }

  /* ------------------------------ MISSION ------------------------------ */
  function openMission(room) {
    state.pendingMissionRoom = room.id;
    ui.missionTitle.textContent = `${room.icon} ${room.title}`;
    ui.missionIntro.textContent = room.mission.intro;
    ui.missionBox.innerHTML = `
      <p class="mission-label">Question chain</p>
      <div class="mission-steps">${missionStepsHtml(room, true)}</div>`;
    ui.missionBtn.disabled = true;
    ui.missionBtn.textContent = nextRoom(room)
      ? "Complete mission → next room"
      : "Complete mission → open the exit";

    openModal(ui.modalMission);
    const firstCheck = ui.missionBox.querySelector(".mission-step-check");
    if (firstCheck) firstCheck.focus({ preventScroll: true });
  }

  ui.missionBox.addEventListener("change", () => {
    const checks = [...ui.missionBox.querySelectorAll(".mission-step-check")];
    ui.missionBtn.disabled = checks.length === 0 || checks.some((check) => !check.checked);
  });

  ui.missionBtn.addEventListener("click", () => {
    const checks = [...ui.missionBox.querySelectorAll(".mission-step-check")];
    if (!checks.length || checks.some((check) => !check.checked) || !state.pendingMissionRoom) return;
    const room = roomById(state.pendingMissionRoom);
    if (!room) return;

    state.rooms[room.id].missionDone = true;
    snapshot();
    closeModal(ui.modalMission);
    sfx.unlock();

    if (allRoomsDone()) {
      renderMapAndShow();
      toast("All four rooms cleared. The exit is open! 🚪");
    } else {
      renderMapAndShow();
      toast("Room cleared! The next room is open.");
    }
  });

  /* -------------------------------- MODAL ------------------------------ */
  function openModal(node) {
    node.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal(node) {
    node.classList.add("hidden");
    if (!document.querySelector(".modal:not(.hidden)")) {
      document.body.classList.remove("modal-open");
    }
  }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      closeModal(modal);
      if (modal === ui.modalMission) {
        const room = roomById(state.pendingMissionRoom);
        if (room && !state.rooms[room.id].missionDone) {
          openRoom(room.id);
        }
      }
    });
  });

  /* -------------------------------- WIN -------------------------------- */
  function winGame() {
    state.finished = true;
    stopTimer();
    clearSave();
    setGameChrome(false);
    sfx.win();

    const used = state.timerMode > 0
      ? state.timerMode * 60 - Math.max(0, state.timerLeft)
      : Math.floor((Date.now() - state.startedAt) / 1000);

    const rank = state.hintsUsed === 0 && state.wrongCodes <= 2
      ? "🥇 Gold detective"
      : state.hintsUsed <= 2 && state.wrongCodes <= 5
        ? "🥈 Silver detective"
        : "🥉 Bronze detective";

    ui.winStats.innerHTML = `
      <div class="stat"><span class="stat-label">Time</span><span class="stat-value">${fmt(used)}</span></div>
      <div class="stat"><span class="stat-label">Hints</span><span class="stat-value">${state.hintsUsed} / 3</span></div>
      <div class="stat"><span class="stat-label">Wrong codes</span><span class="stat-value">${state.wrongCodes}</span></div>
      <div class="stat"><span class="stat-label">Team</span><span class="stat-value">${escapeHtml(state.team)}</span></div>`;
    ui.winRank.textContent = rank;
    const names = memberNames();
    ui.winMembers.textContent = names.length ? `Detectives: ${names.join(" · ")}` : "";
    ui.winCodes.textContent = `Room codes: ${DATA.rooms.map((r) => r.code).join(" · ")}`;

    const confetti = $("confetti");
    confetti.innerHTML = "";
    for (let i = 0; i < 70; i++) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      piece.style.animationDuration = `${2.4 + Math.random() * 2.6}s`;
      piece.style.animationDelay = `${Math.random() * 1.6}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      confetti.appendChild(piece);
    }

    showScreen("win");
  }

  /* -------------------------------- GAME ------------------------------- */
  function startGame() {
    state.team = ui.teamInput.value.trim() || "Team 1";
    state.members = readMemberInputs();
    state.started = true;
    state.finished = false;
    state.hintsLeft = HINTS_TOTAL;
    state.hintsUsed = 0;
    state.rooms = freshRooms();
    state.wrongCodes = 0;
    state.pendingMissionRoom = null;
    state.activeRoom = null;
    state.startedAt = Date.now();
    savePrefs();

    setGameChrome(true);
    setupTimer();
    renderMap();
    showScreen("map");
    toast(`Welcome, ${state.team}! Find the five WH questions in Room 1.`);
    snapshot();
  }

  function resetGame() {
    stopTimer();
    state.started = false;
    state.finished = false;
    state.hintsLeft = HINTS_TOTAL;
    state.hintsUsed = 0;
    state.rooms = freshRooms();
    state.wrongCodes = 0;
    state.pendingMissionRoom = null;
    state.activeRoom = null;
    clearSave();
    ui.modalMission.classList.add("hidden");
    document.body.classList.remove("modal-open");
    setGameChrome(false);
    updateHintButton();
  }

  function resumeGame() {
    const save = readSave();
    if (!save) return;

    state.team = save.team || "Team 1";
    state.members = Array.isArray(save.members)
      ? save.members.slice(0, 5).map((name) => String(name || ""))
      : ["", "", "", "", ""];
    state.timerMode = save.timerMode === 0 ? 0 : 25;
    state.hintsLeft = typeof save.hintsLeft === "number" ? save.hintsLeft : HINTS_TOTAL;
    state.hintsUsed = save.hintsUsed || 0;
    state.wrongCodes = save.wrongCodes || 0;
    state.rooms = freshRooms();
    DATA.rooms.forEach((room) => {
      const saved = save.rooms[room.id];
      if (saved) {
        state.rooms[room.id].codeOpen = Boolean(saved.codeOpen);
        state.rooms[room.id].missionDone = Boolean(saved.missionDone);
      }
    });

    state.started = true;
    state.finished = false;
    state.startedAt = Date.now();
    state.pendingMissionRoom = null;
    state.activeRoom = null;

    ui.teamInput.value = state.team;
    fillMemberInputs(state.members);
    ui.timerChoices.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("is-on", Number(b.dataset.timer) === state.timerMode);
    });

    setGameChrome(true);
    setupTimer();
    renderMap();
    showScreen("map");
    toast(`Welcome back, ${state.team}! Continue the escape.`);
  }

  function checkResume() {
    const save = readSave();
    if (!save) {
      ui.resumeWrap.classList.add("hidden");
      return;
    }
    const cleared = Object.values(save.rooms).filter((r) => r.missionDone).length;
    ui.resumeInfo.textContent = `Saved escape: ${save.team} · ${cleared}/4 rooms cleared · ${save.hintsLeft} hints left`;
    ui.resumeWrap.classList.remove("hidden");
  }

  /* ------------------------------- EVENTS ------------------------------ */
  ui.startBtn.addEventListener("click", startGame);
  ui.resumeBtn.addEventListener("click", resumeGame);

  ui.timerChoices.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.timerMode = Number(btn.dataset.timer);
      ui.timerChoices.querySelectorAll(".seg-btn").forEach((b) => b.classList.toggle("is-on", b === btn));
      savePrefs();
    });
  });

  ui.teamInput.addEventListener("change", () => {
    state.team = ui.teamInput.value.trim() || "Team 1";
    savePrefs();
  });

  ui.memberInputs.forEach((input) => {
    input.addEventListener("change", () => {
      state.members = readMemberInputs();
      savePrefs();
    });
  });

  ui.soundBtn.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    ui.soundBtn.textContent = state.soundOn ? "🔊" : "🔇";
    ui.soundBtn.setAttribute("aria-label", state.soundOn ? "Mute sounds" : "Turn sounds on");
    savePrefs();
    if (state.soundOn) sfx.good();
  });

  ui.pauseBtn.addEventListener("click", () => {
    if (state.timerLeft <= 0) return;
    state.timerRunning = !state.timerRunning;
    updateTimer();
  });

  ui.backToMap.addEventListener("click", renderMapAndShow);

  ui.roomHintBtn.addEventListener("click", () => {
    const room = state.activeRoom ? roomById(state.activeRoom) : null;
    if (room) revealHint(room);
  });

  ui.brandHome.addEventListener("click", () => {
    if (state.started && !state.finished) {
      renderMapAndShow();
    } else {
      stopTimer();
      setGameChrome(false);
      showScreen("start");
    }
  });

  ui.restartBtn.addEventListener("click", () => {
    const ok = window.confirm("Restart the escape? All progress will be lost.");
    if (!ok) return;
    resetGame();
    showScreen("start");
    checkResume();
  });

  ui.playAgain.addEventListener("click", () => {
    resetGame();
    showScreen("start");
    ui.teamInput.value = state.team;
    fillMemberInputs(state.members);
    ui.timerChoices.querySelectorAll(".seg-btn").forEach((b) => {
      b.classList.toggle("is-on", Number(b.dataset.timer) === state.timerMode);
    });
    checkResume();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const open = document.querySelector(".modal:not(.hidden)");
      if (open) open.querySelector("[data-close]")?.click();
    }
  });

  /* ----------------------------- INITIALISE ---------------------------- */
  loadPrefs();
  ui.teamInput.value = state.team;
  fillMemberInputs(state.members);
  ui.timerChoices.querySelectorAll(".seg-btn").forEach((b) => {
    b.classList.toggle("is-on", Number(b.dataset.timer) === state.timerMode);
  });
  ui.soundBtn.textContent = state.soundOn ? "🔊" : "🔇";
  ui.soundBtn.setAttribute("aria-label", state.soundOn ? "Mute sounds" : "Turn sounds on");
  updateHintButton();
  checkResume();
})();
