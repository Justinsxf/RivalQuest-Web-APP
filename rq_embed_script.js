    const STORAGE_KEY = "rivalquest-mvp-state-v1";
    const BG_KEY = "rq-bg-scene";
    const RIVAL_TICK_MS = 60000;
    const ACTIVE_MINUTES = 960;
    const TASK_CATEGORY = {
      study: { icon: "📚", label: "学习" },
      fitness: { icon: "💪", label: "健身" },
      health: { icon: "🥗", label: "健康" },
      work: { icon: "💼", label: "工作" },
      other: { icon: "⚡", label: "其他" }
    };
    const DIFFICULTY_MAP = { 30: "⭐", 60: "⭐⭐", 100: "⭐⭐⭐" };

    const AVATARS = {
      blaze: {
        label: "BLAZE 🔥",
        tag: "热血型",
        persona: "taunt",
        preview: "今天你要是不冲，我就直接领跑。",
        variants: [
          { id: "ember", label: "余烬", p: "#ff8c42", s: "#ff3d3d", a: "#5d2e1f" },
          { id: "sun", label: "炽阳", p: "#ffb347", s: "#ff5c3a", a: "#6f321f" },
          { id: "inferno", label: "烈焰", p: "#ff6f3c", s: "#d7263d", a: "#4a1f19" }
        ]
      },
      frost: {
        label: "FROST 🧊",
        tag: "冷静型",
        persona: "silent",
        preview: "节奏才是王道，我会稳定追赶你。",
        variants: [
          { id: "snow", label: "雪原", p: "#f6fbff", s: "#7ec8ff", a: "#20252d" },
          { id: "ice", label: "冰晶", p: "#eaf7ff", s: "#5db2ff", a: "#1f2a34" },
          { id: "glacier", label: "冰川", p: "#dff3ff", s: "#3f97ff", a: "#18222f" }
        ]
      },
      volt: {
        label: "VOLT ⚡",
        tag: "急躁型",
        persona: "data",
        preview: "慢一点都不行！现在就做下一项。",
        variants: [
          { id: "spark", label: "电火花", p: "#ffd43b", s: "#ff5f5f", a: "#5f4b1b" },
          { id: "storm", label: "雷暴", p: "#ffe066", s: "#ff4040", a: "#6b531f" },
          { id: "flash", label: "闪电", p: "#ffcf33", s: "#d93838", a: "#493a16" }
        ]
      },
      shade: {
        label: "SHADE 🌙",
        tag: "嘲讽型",
        persona: "taunt",
        preview: "你停一下，我就笑着超过你。",
        variants: [
          { id: "midnight", label: "午夜", p: "#101010", s: "#9b5de5", a: "#2a2a2a" },
          { id: "void", label: "虚空", p: "#0f1118", s: "#b56bff", a: "#31333f" },
          { id: "dusk", label: "薄暮", p: "#1a1b23", s: "#8f4bff", a: "#3a3d4a" }
        ]
      },
      sage: {
        label: "SAGE 🌿",
        tag: "激励型",
        persona: "coach",
        preview: "继续坚持，我会逼你变得更强。",
        variants: [
          { id: "forest", label: "林野", p: "#6bcf63", s: "#8b5e34", a: "#2f6b2f" },
          { id: "moss", label: "苔绿", p: "#5abf5a", s: "#7b5230", a: "#275f2a" },
          { id: "grove", label: "树荫", p: "#7ad66f", s: "#9b6a3f", a: "#356f34" }
        ]
      }
    };

    const LINES = {
      taunt: ["你慢一秒，我就多一分。", "你不动，我升级。", "今天你会被我反超。"],
      silent: ["......", "进度条不会说谎。", "我只做一件事：稳定增长。"],
      coach: ["保持节奏，你还能反超我。", "别怕难题，先做下一项。", "继续执行，优势会回来。"],
      data: ["当前差值已更新。", "你的增长率下降。", "胜负由累计 XP 决定。"]
    };

    const SCENE_THEMES = [
      { id: 0, emoji: "🌲", name: "松林晨雾", dark: false }, { id: 1, emoji: "🏔", name: "雪山晴空", dark: false },
      { id: 2, emoji: "🌅", name: "沙漠日落", dark: false }, { id: 3, emoji: "🌊", name: "海边黄昏", dark: true },
      { id: 4, emoji: "🌙", name: "星空夜城", dark: true }, { id: 5, emoji: "🌸", name: "樱花公园", dark: false },
      { id: 6, emoji: "🌧", name: "雨天咖啡馆", dark: true }, { id: 7, emoji: "🌿", name: "热带丛林", dark: false },
      { id: 8, emoji: "❄", name: "冬日雪原", dark: false }, { id: 9, emoji: "🌃", name: "赛博都市", dark: true }
    ];

    let importDrafts = [];
    let bgSpeed = 1;
    let bgPhase = 0;
    let audioCtx = null;
    let analyser = null;
    let musicNodes = [];
    let musicPlaying = false;
    let currentMusicCategory = 0;
    let currentTrackIndex = 0;

    const MUSIC_TRACKS = {
      0: [{ name: "Lo-Fi A", t: "lofi" }, { name: "Lo-Fi B", t: "lofi" }, { name: "Lo-Fi C", t: "lofi" }, { name: "Lo-Fi D", t: "lofi" }],
      1: [{ name: "细雨", t: "rain" }, { name: "阵雨", t: "rain" }, { name: "雷雨", t: "rain" }],
      2: [{ name: "小步", t: "classical" }, { name: "卡农", t: "classical" }, { name: "夜曲", t: "classical" }],
      3: [{ name: "林间", t: "nature" }, { name: "鸟鸣", t: "nature" }, { name: "微风", t: "nature" }, { name: "溪流", t: "nature" }]
    };

    function formatChineseDate(d = new Date()) {
      const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${week[d.getDay()]}`;
    }

    function calcTaskTotalXp(tasks = []) {
      return tasks.reduce((sum, t) => sum + (Number(t.xp) || 0), 0);
    }

    function genId(prefix = "id") {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }

    function getAvatarDef(id) {
      return AVATARS[id] || AVATARS.blaze;
    }

    function getVariant(id, variantId) {
      const avatar = getAvatarDef(id);
      return avatar.variants.find((v) => v.id === variantId) || avatar.variants[0];
    }

    function getRivalXpPerMinute() {
      const total = calcTaskTotalXp(state.tasks);
      const strength = Number(state.rival.strength || 1);
      return (total * strength) / ACTIVE_MINUTES;
    }

    function computeRivalXpFloat() {
      if (!state.gameStartTime) return 0;
      const elapsedMin = (Date.now() - state.gameStartTime) / 60000;
      return elapsedMin * getRivalXpPerMinute();
    }

    function applyRivalXp() {
      state.rivalXpFloat = computeRivalXpFloat();
      state.rivalXp = Math.floor(state.rivalXpFloat);
    }

    function ensureGameStartTime() {
      if (!state.gameStartTime) {
        state.gameStartTime = Date.now();
      }
    }

    function hasGameSave() {
      return state.gameStartTime != null || state.onboardingDone === true;
    }

    function shouldSkipOnboarding() {
      return state.gameStartTime != null || state.onboardingDone === true;
    }

    function gameDaysElapsed() {
      if (!state.gameStartTime) return 1;
      const days = Math.floor((Date.now() - state.gameStartTime) / 86400000) + 1;
      return Math.max(1, days);
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        onboardingDone: false,
        onboardingStep: 0,
        gameStartTime: null,
        playerAvatar: "volt",
        playerColor: "spark",
        rival: { name: "NOVA", avatar: "blaze", variant: "ember", strength: 1.0, strengthTouched: false, personality: "taunt" },
        userXp: 0,
        rivalXp: 0,
        rivalXpFloat: 0,
        tasks: [],
        motivationQuote: "今天也要赢过昨天的自己。"
      };
    }

    let state = loadState();

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function normalizeLegacyState() {
      if (!state.rival) state.rival = {};
      if (!AVATARS[state.rival.avatar]) state.rival.avatar = "blaze";
      state.rival.variant = getVariant(state.rival.avatar, state.rival.variant).id;
      if (typeof state.rival.strength !== "number") state.rival.strength = 1.0;
      if (!state.rival.name) state.rival.name = "NOVA";
      const def = getAvatarDef(state.rival.avatar);
      state.rival.personality = def.persona;
      if (!state.playerAvatar || !AVATARS[state.playerAvatar]) state.playerAvatar = "volt";
      state.playerColor = getVariant(state.playerAvatar, state.playerColor).id;
      if (!Array.isArray(state.tasks)) state.tasks = [];
      state.tasks = state.tasks.map((t) => ({
        id: t.id || genId("task"),
        text: t.text || "未命名任务",
        xp: Number(t.xp) || 30,
        done: !!t.done,
        category: t.category || "other"
      }));
      if (typeof state.rivalXpFloat !== "number") state.rivalXpFloat = Number(state.rivalXp) || 0;
      if (!state.motivationQuote) state.motivationQuote = "今天也要赢过昨天的自己。";
      if (typeof state.onboardingStep !== "number") state.onboardingStep = 0;
      if (state.onboardingDone && !state.gameStartTime && state.tasks.length > 0) {
        state.gameStartTime = Date.now() - 86400000;
      }
      delete state.daily;
      delete state.streakDays;
      delete state.lastRivalTickAt;
    }

    function avatarSVGById(id, variantId) {
      const def = getAvatarDef(id);
      const v = getVariant(id, variantId);
      const px = [];
      const add = (x, y, w, h, c) => px.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
      if (id === "blaze") {
        add(4,2,2,2,v.s); add(10,2,2,2,v.s); add(5,4,6,6,v.p); add(4,6,8,5,v.p); add(3,8,10,4,v.p); add(2,11,5,2,v.s); add(1,12,7,2,v.s); add(8,10,4,2,v.a); add(10,11,4,3,v.s); add(6,6,1,1,"#ff9f1c"); add(9,6,1,1,"#ff9f1c"); add(6,8,4,1,v.a);
      } else if (id === "frost") {
        add(4,2,3,2,v.s); add(9,2,3,2,v.s); add(3,4,10,8,v.p); add(2,7,12,6,v.p); add(4,13,3,2,v.a); add(9,13,3,2,v.a); add(6,6,1,1,v.a); add(9,6,1,1,v.a); add(6,7,1,1,"#111"); add(9,7,1,1,"#111");
      } else if (id === "volt") {
        add(4,2,8,8,v.p); add(3,5,1,4,v.p); add(12,5,1,4,v.p); add(5,10,6,4,v.p); add(6,13,2,2,v.a); add(9,13,2,2,v.a); add(6,5,1,1,"#222"); add(9,5,1,1,"#222"); add(5,7,2,2,v.s); add(9,7,2,2,v.s); add(12,9,2,1,v.a); add(13,10,2,1,v.a); add(11,11,2,1,v.a);
      } else if (id === "shade") {
        add(4,2,2,2,v.a); add(10,2,2,2,v.a); add(4,4,8,7,v.p); add(3,7,10,5,v.p); add(4,12,3,3,v.a); add(9,12,3,3,v.a); add(6,6,1,1,v.s); add(9,6,1,1,v.s); add(6,9,4,1,"#1f1f1f");
      } else if (id === "sage") {
        add(4,3,8,6,v.p); add(3,5,10,6,v.p); add(4,4,8,4,v.a); add(5,8,6,5,v.p); add(3,11,2,3,v.s); add(11,11,2,3,v.s); add(6,6,1,1,"#2a2a2a"); add(9,6,1,1,"#2a2a2a"); add(7,1,2,2,"#5abf5a"); add(8,0,1,1,"#7ad66f");
      }
      return `<svg viewBox="0 0 16 16" aria-label="${def.label}">${px.join("")}</svg>`;
    }

    function isDuplicateCharacter() {
      return state.playerAvatar === state.rival.avatar && state.playerColor === state.rival.variant;
    }

    function updateDuplicateUI() {
      const warn = document.getElementById("duplicateWarn");
      const btn = document.getElementById("btnStart");
      const dup = isDuplicateCharacter();
      warn.classList.toggle("hidden", !dup);
      btn.disabled = dup;
    }

    function renderCharacterPicker(kind) {
      const isPlayer = kind === "player";
      const avatarKey = isPlayer ? state.playerAvatar : state.rival.avatar;
      const variantKey = isPlayer ? state.playerColor : state.rival.variant;
      const listEl = document.getElementById(isPlayer ? "playerAvatarList" : "rivalAvatarList");
      listEl.innerHTML = "";
      Object.entries(AVATARS).forEach(([id, item]) => {
        const node = document.createElement("button");
        node.className = `avatar-card ${avatarKey === id ? "active" : ""}`;
        node.type = "button";
        node.innerHTML = `<div class="pixel-avatar">${avatarSVGById(id, getVariant(id, variantKey).id)}</div><div class="avatar-name">${item.label}<br><span style="font-size:7px;opacity:.85;">${item.tag}</span></div>`;
        node.addEventListener("click", () => {
          if (isPlayer) {
            state.playerAvatar = id;
            state.playerColor = getAvatarDef(id).variants[0].id;
          } else {
            state.rival.avatar = id;
            state.rival.variant = getAvatarDef(id).variants[0].id;
            state.rival.personality = getAvatarDef(id).persona;
          }
          renderCharacterPicker(kind);
          renderVariantPicker(kind);
          renderCharacterDetail(kind);
          updateDuplicateUI();
        });
        listEl.appendChild(node);
      });
    }

    function renderVariantPicker(kind) {
      const isPlayer = kind === "player";
      const wrap = document.getElementById(isPlayer ? "playerVariantWrap" : "rivalVariantWrap");
      wrap.classList.remove("hidden");
      const host = document.getElementById(isPlayer ? "playerVariantList" : "rivalVariantList");
      host.innerHTML = "";
      const aid = isPlayer ? state.playerAvatar : state.rival.avatar;
      const vid = isPlayer ? state.playerColor : state.rival.variant;
      getAvatarDef(aid).variants.forEach((v) => {
        const node = document.createElement("button");
        node.type = "button";
        node.className = `variant-chip ${vid === v.id ? "active" : ""}`;
        node.innerHTML = `<span class="swatch" style="background:${v.p};"></span><span class="swatch" style="background:${v.s};"></span><span>${v.label}</span>`;
        node.addEventListener("click", () => {
          if (isPlayer) state.playerColor = v.id;
          else { state.rival.variant = v.id; state.rival.personality = getAvatarDef(state.rival.avatar).persona; }
          renderCharacterPicker(kind);
          renderVariantPicker(kind);
          renderCharacterDetail(kind);
          updateDuplicateUI();
        });
        host.appendChild(node);
      });
    }

    function renderCharacterDetail(kind) {
      const isPlayer = kind === "player";
      const id = isPlayer ? state.playerAvatar : state.rival.avatar;
      const variantId = isPlayer ? state.playerColor : state.rival.variant;
      const def = getAvatarDef(id);
      const v = getVariant(id, variantId);
      const nameEl = document.getElementById(isPlayer ? "playerDetailName" : "rivalDetailName");
      const tagEl = document.getElementById(isPlayer ? "playerDetailTag" : "rivalDetailTag");
      const lineEl = document.getElementById(isPlayer ? "playerDetailLine" : "rivalDetailLine");
      nameEl.textContent = def.label;
      tagEl.textContent = `性格标签：${def.tag}`;
      lineEl.textContent = (isPlayer ? `预览：${def.preview}` : `对手台词预览：${def.preview}`);
    }

    function getRivalLine() {
      const pool = LINES[state.rival.personality] || LINES.taunt;
      const gap = state.userXp - state.rivalXp;
      if (gap <= -20) return "你已经落后很多了，我会继续拉开差距。";
      if (gap >= 20) return "你暂时领先，但我会慢慢追上来。";
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function renderRivalBubbleLine() {
      const bubble = document.getElementById("rivalBubble");
      const span = document.getElementById("rivalBubbleText");
      bubble.classList.add("fade-line");
      setTimeout(() => {
        span.textContent = getRivalLine();
        bubble.classList.remove("fade-line");
      }, 300);
    }

    function renderTasks() {
      const host = document.getElementById("taskList");
      host.innerHTML = "";
      state.tasks.forEach((task) => {
        const cat = TASK_CATEGORY[task.category] || TASK_CATEGORY.other;
        const item = document.createElement("div");
        item.className = `task-item ${task.done ? "done" : ""}`;
        item.innerHTML = `
          <div><div class="task-text">${cat.icon} ${task.text}</div><div class="task-meta">${cat.label} · ${DIFFICULTY_MAP[task.xp] || "⭐"}</div></div>
          <div class="task-xp">+${task.xp} XP</div>
          <button class="pixel-btn ${task.done ? "" : "btn-success"}" data-action="done" data-id="${task.id}" ${task.done ? "disabled" : ""}>${task.done ? "已完成" : "完成 ✓"}</button>
          <button class="pixel-btn btn-warn" data-action="delete" data-id="${task.id}">删除 ✕</button>`;
        const doneBtn = item.querySelector('[data-action="done"]');
        const delBtn = item.querySelector('[data-action="delete"]');
        if (!task.done) doneBtn.addEventListener("click", () => completeTask(task.id));
        delBtn.addEventListener("click", () => deleteTask(task.id));
        host.appendChild(item);
      });
      renderStatusBar();
    }

    function animateGain(targetId) {
      const el = document.getElementById(targetId);
      el.classList.remove("xp-pop"); void el.offsetWidth; el.classList.add("xp-pop");
    }

    function showFloatingXp(amount) {
      const host = document.getElementById("userXpNum");
      const node = document.createElement("span");
      node.className = "xp-gain-float";
      node.textContent = `+${amount} XP`;
      host.appendChild(node);
      setTimeout(() => node.remove(), 1200);
    }

    function celebrateUser() {
      const avatar = document.getElementById("userAvatar");
      avatar.classList.remove("jump-celebrate");
      void avatar.offsetWidth;
      avatar.classList.add("jump-celebrate");
      avatar.addEventListener("animationend", () => avatar.classList.remove("jump-celebrate"), { once: true });
    }

    function renderXP() {
      applyRivalXp();
      const maxXp = Math.max(state.userXp, state.rivalXp, 100);
      const userRate = (state.userXp / maxXp) * 100;
      const rivalRate = (state.rivalXp / maxXp) * 100;
      document.getElementById("userXpFill").style.width = `${userRate}%`;
      document.getElementById("rivalXpFill").style.width = `${rivalRate}%`;
      document.getElementById("userXpNum").textContent = `${state.userXp} XP`;
      document.getElementById("rivalXpNum").textContent = `${state.rivalXp} XP`;
      const rivalLead = state.rivalXp > state.userXp;
      const rivalFill = document.getElementById("rivalXpFill");
      rivalFill.classList.toggle("danger", rivalLead);
      rivalFill.classList.toggle("blink", rivalLead);
    }

    function renderRivalArea() {
      document.getElementById("rivalAvatar").innerHTML = avatarSVGById(state.rival.avatar, state.rival.variant);
      document.getElementById("rivalNameLabel").textContent = state.rival.name || "RIVAL";
      const v = getVariant(state.rival.avatar, state.rival.variant);
      const lbl = document.getElementById("rivalBubbleLabel");
      lbl.textContent = state.rival.name || "RIVAL";
      lbl.style.backgroundColor = v.p;
      lbl.style.borderColor = v.a;
      const bubble = document.getElementById("rivalBubble");
      bubble.classList.remove("fade-line");
      document.getElementById("rivalBubbleText").textContent = getRivalLine();
    }

    function renderStatusBar() {
      const finished = state.tasks.filter((t) => t.done).length;
      const total = state.tasks.length;
      document.getElementById("todayDateText").textContent = formatChineseDate();
      document.getElementById("todayProgressText").textContent = `${finished} / ${total} 已完成`;
      document.getElementById("gameDayText").textContent = `游戏第 ${gameDaysElapsed()} 天`;
      document.getElementById("motivationBar").textContent = `「${state.motivationQuote || "今天也要赢过昨天的自己。"}」`;
    }

    function renderOnboardingSteps() {
      const step = Math.max(0, Math.min(4, state.onboardingStep || 0));
      document.getElementById("stepCountText").textContent = `${step + 1} / 5`;
      document.getElementById("onboardingProgressFill").style.width = `${((step + 1) / 5) * 100}%`;
      for (let i = 0; i <= 4; i++) {
        const el = document.getElementById(`step${i}Card`);
        if (el) el.classList.toggle("hidden", i > step);
      }
    }

    function rivalXpTodayIntro() {
      const rate = getRivalXpPerMinute();
      const now = Date.now();
      const sod = new Date();
      sod.setHours(0, 0, 0, 0);
      const t0 = state.gameStartTime ? Math.max(state.gameStartTime, sod.getTime()) : sod.getTime();
      const mins = Math.max(0, (now - t0) / 60000);
      return Math.floor(mins * rate);
    }

    function renderIntroWarning() {
      const xp = rivalXpTodayIntro();
      document.getElementById("introWarningText").textContent = `⚠ 你的对手今天已获得 ${xp} XP`;
    }

    function renderViews() {
      const onboardingView = document.getElementById("onboardingView");
      const dashboardView = document.getElementById("dashboardView");
      const skip = shouldSkipOnboarding();
      onboardingView.classList.toggle("hidden", skip);
      dashboardView.classList.toggle("hidden", !skip);
      document.getElementById("btnOpenReport").classList.toggle("hidden", !skip);
      document.getElementById("btnArchive").classList.toggle("hidden", !hasGameSave());
      if (!skip) {
        document.getElementById("rivalNameInput").value = state.rival.name || "";
        document.getElementById("strengthInput").value = state.rival.strength || 1.0;
        document.getElementById("strengthLabel").textContent = `${Number(state.rival.strength || 1).toFixed(1)}x`;
        document.getElementById("motivationInput").value = state.motivationQuote || "";
        renderCharacterPicker("player");
        renderVariantPicker("player");
        renderCharacterDetail("player");
        renderCharacterPicker("rival");
        renderVariantPicker("rival");
        renderCharacterDetail("rival");
        renderOnboardingSteps();
        renderIntroWarning();
        updateDuplicateUI();
      } else {
        document.getElementById("userAvatar").innerHTML = avatarSVGById(state.playerAvatar, state.playerColor);
        renderRivalArea();
        renderStatusBar();
        renderXP();
        renderTasks();
      }
    }

    function completeTask(taskId) {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task || task.done) return;
      task.done = true;
      state.userXp += task.xp;
      renderTasks();
      renderXP();
      celebrateUser();
      showFloatingXp(task.xp);
      animateGain("userXpNum");
      renderRivalBubbleLine();
      saveState();
    }

    function deleteTask(taskId) {
      const idx = state.tasks.findIndex((t) => t.id === taskId);
      if (idx < 0) return;
      const task = state.tasks[idx];
      if (task.done) state.userXp = Math.max(0, state.userXp - task.xp);
      state.tasks.splice(idx, 1);
      applyRivalXp();
      renderTasks();
      renderXP();
      saveState();
    }

    function openTaskModal() {
      document.getElementById("taskModalOverlay").classList.remove("hidden");
      document.getElementById("taskNameInput").focus();
    }

    function closeTaskModal() {
      document.getElementById("taskModalOverlay").classList.add("hidden");
    }

    function saveTaskFromModal() {
      const name = document.getElementById("taskNameInput").value.trim();
      const xp = Number(document.getElementById("taskDifficultyInput").value || 30);
      const category = document.getElementById("taskCategoryInput").value;
      if (!name) return;
      ensureGameStartTime();
      state.tasks.push({ id: genId("task"), text: name, xp, done: false, category });
      document.getElementById("taskNameInput").value = "";
      applyRivalXp();
      renderTasks();
      renderXP();
      saveState();
      closeTaskModal();
    }

    function normalizeTodoLine(line) {
      const trimmed = line.trim();
      if (!trimmed) return "";
      const withoutPrefix = trimmed.replace(/^\s*(?:[-*•]+|\d+[.)]|[一二三四五六七八九十]+[、.)])\s*/, "").trim();
      if (!withoutPrefix) return "";
      if (!/[A-Za-z0-9\u4e00-\u9fa5]/.test(withoutPrefix)) return "";
      return withoutPrefix;
    }

    function toggleImportPanel() {
      const body = document.getElementById("importBody");
      const btn = document.getElementById("btnToggleImport");
      const hidden = body.classList.contains("hidden");
      body.classList.toggle("hidden", !hidden);
      btn.textContent = hidden ? "收起" : "展开";
    }

    function renderImportPreview() {
      const host = document.getElementById("importPreviewList");
      const bar = document.getElementById("importConfirmBar");
      host.innerHTML = "";
      bar.classList.toggle("hidden", importDrafts.length === 0);
      importDrafts.forEach((d, i) => {
        const item = document.createElement("div");
        item.className = "import-preview-item";
        item.innerHTML = `
          <div>${d.text}</div>
          <select data-kind="xp" data-idx="${i}">
            <option value="30" ${d.xp===30?"selected":""}>⭐ 30</option>
            <option value="60" ${d.xp===60?"selected":""}>⭐⭐ 60</option>
            <option value="100" ${d.xp===100?"selected":""}>⭐⭐⭐ 100</option>
          </select>
          <select data-kind="cat" data-idx="${i}">
            <option value="study" ${d.category==="study"?"selected":""}>学习📚</option>
            <option value="fitness" ${d.category==="fitness"?"selected":""}>健身💪</option>
            <option value="health" ${d.category==="health"?"selected":""}>健康🥗</option>
            <option value="work" ${d.category==="work"?"selected":""}>工作💼</option>
            <option value="other" ${d.category==="other"?"selected":""}>其他⚡</option>
          </select>`;
        host.appendChild(item);
      });
      host.querySelectorAll("select").forEach((s) => {
        s.addEventListener("change", (e) => {
          const idx = Number(e.target.dataset.idx);
          if (e.target.dataset.kind === "xp") importDrafts[idx].xp = Number(e.target.value);
          if (e.target.dataset.kind === "cat") importDrafts[idx].category = e.target.value;
        });
      });
    }

    function parseImportText() {
      const raw = document.getElementById("todoPasteInput").value || "";
      importDrafts = raw.split(/\r?\n/).map(normalizeTodoLine).filter(Boolean).map((text) => ({ text, xp: 30, category: "other" }));
      renderImportPreview();
    }

    function confirmImportTasks() {
      if (!importDrafts.length) return;
      ensureGameStartTime();
      importDrafts.forEach((d) => state.tasks.push({ id: genId("task"), text: d.text, xp: d.xp, category: d.category, done: false }));
      importDrafts = [];
      document.getElementById("todoPasteInput").value = "";
      renderImportPreview();
      applyRivalXp();
      renderTasks();
      renderXP();
      saveState();
    }

    function openReport() {
      applyRivalXp();
      document.getElementById("reportUserGain").textContent = `${state.userXp} XP`;
      document.getElementById("reportRivalGain").textContent = `${state.rivalXp} XP`;
      let result = "势均力敌。";
      if (state.userXp > state.rivalXp) result = "你累计领先对手。";
      if (state.userXp < state.rivalXp) result = "对手累计领先，加油追赶。";
      document.getElementById("reportResult").textContent = result;
      document.getElementById("reportOverlay").classList.remove("hidden");
    }

    function closeReport() {
      document.getElementById("reportOverlay").classList.add("hidden");
    }

    function openArchive() {
      document.getElementById("archivePlayerAv").innerHTML = avatarSVGById(state.playerAvatar, state.playerColor);
      document.getElementById("archiveRivalAv").innerHTML = avatarSVGById(state.rival.avatar, state.rival.variant);
      document.getElementById("archiveRivalName").textContent = state.rival.name || "RIVAL";
      document.getElementById("archiveXpLine").textContent = `你 ${state.userXp} XP · 对手 ${state.rivalXp} XP`;
      document.getElementById("archiveDays").textContent = `${gameDaysElapsed()} 天`;
      document.getElementById("archiveOverlay").classList.remove("hidden");
    }

    function closeArchive() {
      document.getElementById("archiveOverlay").classList.add("hidden");
    }

    function newGameConfirm() {
      if (!window.confirm("确定新建存档？当前进度将清空。")) return;
      try {
        localStorage.clear();
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BG_KEY);
      }
      state = loadState();
      normalizeLegacyState();
      saveState();
      closeArchive();
      renderViews();
    }

    function startDashboard() {
      if (isDuplicateCharacter()) return;
      state.rival.name = document.getElementById("rivalNameInput").value.trim() || "NOVA";
      state.rival.strength = Number(document.getElementById("strengthInput").value || 1.0);
      state.rival.personality = getAvatarDef(state.rival.avatar).persona;
      state.motivationQuote = document.getElementById("motivationInput").value.trim() || state.motivationQuote;
      state.onboardingDone = true;
      saveState();
      renderViews();
    }

    function bindStepButtons() {
      document.getElementById("btnStep0Next").addEventListener("click", () => { state.onboardingStep = 1; renderOnboardingSteps(); });
      document.getElementById("btnStep1Next").addEventListener("click", () => { state.onboardingStep = 2; renderOnboardingSteps(); });
      document.getElementById("btnStep2Next").addEventListener("click", () => { state.onboardingStep = 3; renderOnboardingSteps(); });
      document.getElementById("btnStep3Next").addEventListener("click", () => { state.onboardingStep = 4; renderOnboardingSteps(); });
    }

    function getSceneIndex() {
      const v = parseInt(localStorage.getItem(BG_KEY) || "0", 10);
      return Math.min(9, Math.max(0, v));
    }

    function drawBackground(ts) {
      const canvas = document.getElementById("bgCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;
      const scene = getSceneIndex();
      const palettes = [
        ["#87ceeb","#2e8b57","#1a4d2e","#0d2818"], ["#b8e0ff","#a8c8e8","#e8f4fc","#ffffff"],
        ["#ff9a6b","#d4a574","#c17c4a","#8b5a2b"], ["#ff6b9d","#4a6fa5","#2d4a6e","#1a2f4a"],
        ["#1a0a2e","#4a2c6a","#16213e","#0f3460"], ["#ffd6e8","#ffb8d9","#ff9ec4","#c8e6c9"],
        ["#6b6b6b","#4a4a4a","#3d2c2d","#2a1a1a"], ["#7cb342","#558b2f","#33691e","#1b5e20"],
        ["#e3f2fd","#90caf9","#64b5f6","#42a5f5"], ["#0a0a1a","#ff00aa","#00fff7","#1a0033"]
      ];
      const pal = palettes[scene] || palettes[0];
      ctx.fillStyle = pal[0];
      ctx.fillRect(0, 0, w, h);
      bgPhase += 0.15 * bgSpeed * (1 + (window.__beat || 0));
      const px = (ts % 50000) / 50000;
      ctx.fillStyle = pal[1];
      ctx.fillRect(0, h * 0.45, w, h * 0.2);
      ctx.fillStyle = pal[2];
      for (let i = 0; i < 12; i++) {
        const x = ((i * 137 + bgPhase) % (w + 120)) - 60;
        ctx.fillRect(x, h * 0.45, 40, h * 0.35);
      }
      ctx.fillStyle = pal[3];
      ctx.beginPath();
      ctx.moveTo(0, h * 0.75);
      ctx.lineTo(w, h * 0.72);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      requestAnimationFrame(drawBackground);
    }

    function initMusicUI() {
      const tabs = document.getElementById("musicTabs");
      const tabLabels = ["🎵 Lo-Fi", "🌧 雨声", "🎹 古典", "🌿 自然"];
      tabLabels.forEach((label, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "music-tab" + (i === 0 ? " active" : "");
        b.textContent = label;
        b.addEventListener("click", () => {
          currentMusicCategory = i;
          tabs.querySelectorAll(".music-tab").forEach((t, j) => t.classList.toggle("active", j === i));
          renderTrackList();
        });
        tabs.appendChild(b);
      });
      renderTrackList();
    }

    function renderTrackList() {
      const host = document.getElementById("trackList");
      host.innerHTML = "";
      (MUSIC_TRACKS[currentMusicCategory] || []).forEach((tr, i) => {
        const row = document.createElement("div");
        row.className = "track-row" + (musicPlaying && currentTrackIndex === i ? " playing" : "");
        row.textContent = tr.name;
        row.addEventListener("click", () => { currentTrackIndex = i; startMusicEngine(tr.t); });
        host.appendChild(row);
      });
    }

    function stopMusicEngine() {
      musicNodes.forEach((n) => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
      musicNodes = [];
      musicPlaying = false;
    }

    function startMusicEngine(type) {
      stopMusicEngine();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      const ctx = audioCtx;
      const master = ctx.createGain();
      master.gain.value = 0.15;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      master.connect(analyser);
      analyser.connect(ctx.destination);
      if (type === "lofi") {
        const freqs = [261.63, 329.63, 392.0];
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator();
          o.type = "triangle";
          o.frequency.value = f;
          const g = ctx.createGain();
          g.gain.value = 0.08;
          const flp = ctx.createBiquadFilter();
          flp.type = "lowpass";
          flp.frequency.value = 800;
          o.connect(flp);
          flp.connect(g);
          g.connect(master);
          o.start();
          musicNodes.push(o);
        });
      } else if (type === "rain") {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 800;
        noise.connect(f);
        f.connect(master);
        noise.start();
        musicNodes.push(noise);
      } else if (type === "classical") {
        const melody = [261.63, 293.66, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66];
        let t = 0;
        melody.forEach((f) => {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = f;
          const g = ctx.createGain();
          g.gain.value = 0.12;
          o.connect(g);
          g.connect(master);
          o.start(ctx.currentTime + t);
          o.stop(ctx.currentTime + t + 0.35);
          t += 0.4;
          musicNodes.push(o);
        });
      } else {
        for (let k = 0; k < 3; k++) {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = 2000 + Math.random() * 1500;
          const g = ctx.createGain();
          g.gain.value = 0.02;
          o.connect(g);
          g.connect(master);
          o.start();
          musicNodes.push(o);
        }
      }
      musicPlaying = true;
      document.getElementById("projectorPlayer").classList.add("playing", "glow");
      loopAnalyser();
    }

    function loopAnalyser() {
      if (!analyser || !musicPlaying) { window.__beat = 0; return; }
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) s += buf[i];
      window.__beat = s / (buf.length * 255);
      bgSpeed = 1 + window.__beat * 0.6;
      requestAnimationFrame(loopAnalyser);
    }

    function initScenePicker() {
      const grid = document.getElementById("sceneGrid");
      if (!grid) return;
      grid.innerHTML = "";
      SCENE_THEMES.forEach((sc) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "scene-thumb" + (getSceneIndex() === sc.id ? " active" : "");
        b.title = sc.name;
        b.textContent = sc.emoji;
        b.addEventListener("click", () => {
          localStorage.setItem(BG_KEY, String(sc.id));
          document.body.classList.toggle("theme-dark", sc.dark);
          grid.querySelectorAll(".scene-thumb").forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
        });
        grid.appendChild(b);
      });
    }

    function bindEvents() {
      document.getElementById("btnStart").addEventListener("click", startDashboard);
      document.getElementById("btnOpenReport").addEventListener("click", openReport);
      document.getElementById("btnCloseReport").addEventListener("click", closeReport);
      document.getElementById("btnArchive").addEventListener("click", openArchive);
      document.getElementById("btnArchiveContinue").addEventListener("click", closeArchive);
      document.getElementById("btnArchiveNew").addEventListener("click", newGameConfirm);
      document.getElementById("btnAddTask").addEventListener("click", () => {
        ensureGameStartTime();
        saveState();
        openTaskModal();
      });
      document.getElementById("btnCancelTask").addEventListener("click", closeTaskModal);
      document.getElementById("btnSaveTask").addEventListener("click", saveTaskFromModal);
      document.getElementById("btnToggleImport").addEventListener("click", toggleImportPanel);
      document.getElementById("btnParseImport").addEventListener("click", parseImportText);
      document.getElementById("btnConfirmImport").addEventListener("click", confirmImportTasks);
      document.getElementById("taskModalOverlay").addEventListener("click", (e) => { if (e.target.id === "taskModalOverlay") closeTaskModal(); });
      document.getElementById("reportOverlay").addEventListener("click", (e) => { if (e.target.id === "reportOverlay") closeReport(); });
      document.getElementById("archiveOverlay").addEventListener("click", (e) => { if (e.target.id === "archiveOverlay") closeArchive(); });
      document.getElementById("rivalNameInput").addEventListener("input", () => { state.onboardingStep = Math.max(state.onboardingStep, 2); });
      document.getElementById("strengthInput").addEventListener("input", (e) => {
        document.getElementById("strengthLabel").textContent = `${Number(e.target.value).toFixed(1)}x`;
        state.rival.strengthTouched = true;
      });
      document.getElementById("motivationInput").addEventListener("input", () => {});
      document.getElementById("bgGearBtn").addEventListener("click", () => {
        initScenePicker();
        document.getElementById("sceneOverlay").classList.remove("hidden");
      });
      document.getElementById("btnCloseScene").addEventListener("click", () => document.getElementById("sceneOverlay").classList.add("hidden"));
      document.getElementById("sceneOverlay").addEventListener("click", (e) => { if (e.target.id === "sceneOverlay") document.getElementById("sceneOverlay").classList.add("hidden"); });
      document.getElementById("projectorPlayer").addEventListener("click", () => {
        document.getElementById("musicOverlay").classList.remove("hidden");
      });
      document.getElementById("btnCloseMusic").addEventListener("click", () => document.getElementById("musicOverlay").classList.add("hidden"));
      document.getElementById("musicOverlay").addEventListener("click", (e) => { if (e.target.id === "musicOverlay") document.getElementById("musicOverlay").classList.add("hidden"); });
      document.getElementById("btnMusicPlayPause").addEventListener("click", () => {
        if (musicPlaying) { stopMusicEngine(); document.getElementById("projectorPlayer").classList.remove("playing", "glow"); }
        else { const tr = MUSIC_TRACKS[currentMusicCategory][currentTrackIndex]; if (tr) startMusicEngine(tr.t); }
      });
      bindStepButtons();
    }

    function tickRival() {
      if (!state.onboardingDone) return;
      applyRivalXp();
      renderXP();
      saveState();
    }

    function init() {
      normalizeLegacyState();
      applyRivalXp();
      initMusicUI();
      bindEvents();
      const sc = SCENE_THEMES[getSceneIndex()];
      document.body.classList.toggle("theme-dark", sc.dark);
      renderViews();
      saveState();
      setInterval(tickRival, RIVAL_TICK_MS);
      requestAnimationFrame(drawBackground);
    }

    init();
