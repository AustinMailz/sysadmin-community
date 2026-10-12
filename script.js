// ============================================================
// Школа сисадминов — вся интерактивность и пасхалки
// ============================================================

// ЗАМЕНИ на свою ссылку-приглашение из Discord
// (правый клик по каналу → «Пригласить людей» → скопировать ссылку)
const DISCORD_INVITE = "https://discord.gg/REPLACE_ME";

const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Метка «JS работает» — только с ней CSS прячет .reveal-блоки до скролла
document.documentElement.classList.add("js");

// Общие флаги пасхалок (турбо читает матрица)
const EGG = { turbo: false };

// ---------- Достижения за пасхалки ----------
const ACHIEVEMENTS = [
  ["terminal", "Тайный вход", "Открыть секретный терминал"],
  ["root", "С правами root", "Набрать заветное слово"],
  ["konami", "Официально олд", "Ввести легендарный код"],
  ["bsod", "Синий — новый чёрный", "Уронить сайт тройным кликом"],
  ["rack", "Доступ в серверную", "Найти боковую панель"],
  ["red-button", "Не нажимать!", "Нажать именно туда"],
  ["coffee", "Кофеин 5.0", "Выпить пять чашек"],
  ["save", "Правильный рефлекс", "Попытаться сохранить сайт"],
  ["copy", "Конспектировщик", "Скопировать текст"],
  ["rabbit", "Белый кролик", "Запустить matrix в терминале"],
  ["diagnostic", "Дежурный инженер", "Проверить сервисы через systemctl"],
  ["saver", "Олдскульный режим", "Дождаться экранной заставки"],
];
const ACHIEVEMENT_KEY = "sysadmin-achievements-v1";
let earnedAchievements = new Set();
try {
  earnedAchievements = new Set(JSON.parse(localStorage.getItem(ACHIEVEMENT_KEY) || "[]"));
} catch {
  earnedAchievements = new Set();
}

function renderAchievements() {
  $("#achievements-count").textContent = `${earnedAchievements.size}/${ACHIEVEMENTS.length}`;
  $("#achievements-list").replaceChildren(
    ...ACHIEVEMENTS.map(([id, title, hint]) => {
      const item = document.createElement("div");
      const earned = earnedAchievements.has(id);
      item.className = "achievement" + (earned ? " earned" : "");
      item.textContent = earned ? `✓ ${title}` : `? ${hint}`;
      return item;
    })
  );
}

function earnAchievement(id) {
  if (earnedAchievements.has(id)) return;
  const achievement = ACHIEVEMENTS.find(([achievementId]) => achievementId === id);
  if (!achievement) return;
  earnedAchievements.add(id);
  localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify([...earnedAchievements]));
  renderAchievements();
  toast(`🏆 Достижение: ${achievement[1]}`);
}

// ---------- Ссылки на Discord (одно место правки) ----------
$$(".js-discord").forEach((a) => (a.href = DISCORD_INVITE));
$("#copy-invite").addEventListener("click", async () => {
  if (DISCORD_INVITE.includes("REPLACE_ME")) {
    toast("Приглашение появится после запуска Discord-сервера.");
    return;
  }
  try {
    await navigator.clipboard.writeText(DISCORD_INVITE);
    toast("🔗 Приглашение скопировано.");
  } catch {
    toast("Не удалось скопировать. Открой Discord по соседней кнопке.");
  }
});

const achievementsPanel = $("#achievements");
$("#achievements-tab").addEventListener("click", () => {
  achievementsPanel.classList.toggle("open");
  $("#achievements-tab").setAttribute("aria-expanded", achievementsPanel.classList.contains("open"));
});
$("#achievements-close").addEventListener("click", () => {
  achievementsPanel.classList.remove("open");
  $("#achievements-tab").setAttribute("aria-expanded", "false");
});
renderAchievements();

// ---------- Год и аптайм страницы ----------
$("#year").textContent = new Date().getFullYear();

const t0 = performance.now();
setInterval(() => {
  const s = Math.floor((performance.now() - t0) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const hh = Math.floor(s / 3600);
  $("#uptime").textContent = hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}, 1000);

// ---------- Бегущая строка: дублируем текст для бесшовного лупа ----------
const tickerTrack = $("#ticker-track");
tickerTrack.appendChild(tickerTrack.firstElementChild.cloneNode(true));

// ---------- Тосты ----------
let toastTimer = null;
function toast(msg, ms = 3200) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), ms);
}

// ---------- Экран загрузки (BIOS POST) ----------
const BOOT_LINES = [
  "SYSADMIN BIOS v2.0 — Сообщество сисадминов",
  "Проверка памяти ............ OK",
  "Поиск своих ................ НАЙДЕНЫ",
  "Монтирование /dev/дружба ... OK",
  "Попытка выйти из vim ....... НЕУДАЧНО",
  "Запуск сообщества .......... OK",
  "",
  "Добро пожаловать домой.",
];

function runBoot() {
  // показываем один раз за сессию и не показываем при reduced-motion
  if (RM || sessionStorage.getItem("booted")) return;
  sessionStorage.setItem("booted", "1");

  const boot = $("#boot");
  const log = $("#boot-log");
  boot.hidden = false;
  document.body.style.overflow = "hidden";

  let i = 0;
  let timer = setInterval(() => {
    if (i < BOOT_LINES.length) {
      log.textContent += BOOT_LINES[i++] + "\n";
    } else {
      finishBoot();
    }
  }, 230);

  function finishBoot() {
    clearInterval(timer);
    boot.classList.add("fade");
    setTimeout(() => {
      boot.hidden = true;
      document.body.style.overflow = "";
    }, 500);
    window.removeEventListener("keydown", finishBoot);
    boot.removeEventListener("click", finishBoot);
  }

  window.addEventListener("keydown", finishBoot);
  boot.addEventListener("click", finishBoot);
}
runBoot();

// ---------- Матрица в hero ----------
(function matrix() {
  if (RM) return;
  const canvas = $("#matrix");
  const ctx = canvas.getContext("2d");
  const CHARS = "アイウエオカキクケコ01<>/\\|{}[]$#@%&*+=?;ЛИНУКС";
  const FONT = 14;
  let cols = 0;
  let drops = [];
  let visible = true;
  let last = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols = Math.floor(canvas.width / FONT);
    drops = Array(cols).fill(1);
  }
  resize();
  window.addEventListener("resize", resize);

  // не рисуем, когда hero не на экране или вкладка свёрнута
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  function draw(ts) {
    requestAnimationFrame(draw);
    if (!visible || document.hidden) return;
    if (ts - last < (EGG.turbo ? 16 : 50)) return; // в турбо — на полную
    last = ts;

    ctx.fillStyle = "rgba(10, 14, 20, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff9c";
    ctx.font = FONT + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(ch, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(draw);
})();

// ---------- Печатающийся терминал в hero ----------
(function typeTerminal() {
  const pre = $("#term-body");
  if (RM) return; // при reduced-motion остаётся статичный текст из HTML

  const SCRIPT = [
    { type: "cmd", text: "whoami" },
    { type: "out", text: "одинокий_админ" },
    { type: "cmd", text: "sudo apt install community" },
    { type: "out", text: "Чтение списков пакетов... Готово" },
    { type: "bar" },
    { type: "out", text: "Установлено: друзья, помощь, гайды, мемы" },
    { type: "cmd", text: "whoami" },
    { type: "out", text: "свой_среди_своих ✔" },
  ];

  pre.textContent = "";
  let li = 0;

  function nextLine() {
    if (li >= SCRIPT.length) {
      pre.textContent += "$ █";
      return;
    }
    const line = SCRIPT[li++];

    if (line.type === "cmd") {
      pre.textContent += "$ ";
      let ci = 0;
      const t = setInterval(() => {
        pre.textContent += line.text[ci++];
        if (ci >= line.text.length) {
          clearInterval(t);
          pre.textContent += "\n";
          setTimeout(nextLine, 320);
        }
      }, 45);
    } else if (line.type === "bar") {
      let p = 0;
      pre.textContent += "[                    ] 0%"; // плейсхолдер, его перерисовываем
      const t = setInterval(() => {
        p = Math.min(p + 10, 100);
        const filled = "█".repeat(p / 5);
        const empty = " ".repeat(20 - p / 5);
        const lines = pre.textContent.split("\n");
        lines[lines.length - 1] = `[${filled}${empty}] ${p}%`;
        pre.textContent = lines.join("\n");
        if (p >= 100) {
          clearInterval(t);
          pre.textContent += "\n";
          setTimeout(nextLine, 250);
        }
      }, 90);
    } else {
      pre.textContent += line.text + "\n";
      setTimeout(nextLine, 240);
    }
  }
  setTimeout(nextLine, 900);
})();

// ---------- Появление секций при скролле ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
$$(".reveal").forEach((el) => io.observe(el));

// ---------- Счётчики в статах ----------
const statIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      statIo.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const isFloat = String(el.dataset.count).includes(".");
      // шутка: счётчик «серверов пострадало» падает с 42 до 0
      const from = target === 0 ? 42 : 0;
      const dur = 1400;
      const start = performance.now();

      function tick(now) {
        const k = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        const val = from + (target - from) * eased;
        el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
        if (k < 1) requestAnimationFrame(tick);
      }
      if (RM) el.textContent = el.dataset.count;
      else requestAnimationFrame(tick);
    });
  },
  { threshold: 0.5 }
);
$$(".stat-num[data-count]").forEach((el) => statIo.observe(el));

// ---------- Ротация цитат ----------
const QUOTES = [
  ["«Работало же вчера.»", "— каждый сисадмин хотя бы раз в жизни"],
  ["«Вышел из vim с первой попытки.»", "— легенда. источники не подтверждают"],
  ["«Windows нашла решение проблемы и перезагрузилась. В 3 ночи. На проде.»", "— классика жанра"],
  ["«Сделал бэкап? А проверял, что он восстанавливается?»", "— вопрос, который меняет жизнь"],
  ["«Хороший сисадмин ленив: он всё автоматизировал.»", "— народная примета"],
  ["«Нет ничего более постоянного, чем временное решение.»", "— закон продакшена"],
  ["«Это DNS.»", "— древняя мудрость"],
  ["«Перезагрузись. Серьёзно, просто перезагрузись.»", "— техподдержка, с любовью"],
];
let qi = 0;
setInterval(() => {
  const box = $(".quotes");
  box.classList.add("fading");
  setTimeout(() => {
    qi = (qi + 1) % QUOTES.length;
    $("#quote-text").textContent = QUOTES[qi][0];
    $("#quote-author").textContent = QUOTES[qi][1];
    box.classList.remove("fading");
  }, 450);
}, 6000);

// ---------- Статус-пилюля (кликабельная) ----------
const STATUSES = [
  ["ONLINE", ""],
  ["DEGRADED", "warn"],
  ["ЧИНИМ...", "err"],
  ["ПЯТНИЦА. НЕ ДЕПЛОИМ", "warn"],
];
let si = 0;
$("#status").addEventListener("click", () => {
  si = (si + 1) % STATUSES.length;
  const [text, cls] = STATUSES[si];
  $("#status-text").textContent = text;
  $("#status").className = "status" + (cls ? " " + cls : "");
});

// ---------- Заголовок вкладки, когда уходишь ----------
const origTitle = document.title;
document.addEventListener("visibilitychange", () => {
  document.title = document.hidden ? "⚠ АЛЯРМ: сервер без присмотра!" : origTitle;
});

// ---------- ПАСХАЛКА: Konami-код ----------
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let kbuf = [];
window.addEventListener("keydown", (e) => {
  kbuf.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  kbuf = kbuf.slice(-KONAMI.length);
  if (KONAMI.every((k, i) => kbuf[i] === k)) {
    kbuf = [];
    const ra = $("#root-access");
    ra.hidden = false;
    if (!RM) $("#main").classList.add("party");
    setTimeout(() => (ra.hidden = true), 2600);
    setTimeout(() => $("#main").classList.remove("party"), 6000);
    toast("Konami-код принят. Ты официально олд 🎮");
    earnAchievement("konami");
  }
});

// ---------- ПАСХАЛКА: набери «root» в любом месте ----------
let wbuf = "";
let rootCd = 0;
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key.length === 1) wbuf = (wbuf + e.key.toLowerCase()).slice(-12);
  if (wbuf.endsWith("root") && Date.now() - rootCd > 8000) {
    rootCd = Date.now();
    toast("С большой силой приходит большая ответственность, root 🔑");
    earnAchievement("root");
  }
});

// ---------- ПАСХАЛКА: BSOD при тройном клике на лого ----------
const bsod = $("#bsod");
$("#logo").addEventListener("click", (e) => {
  if (e.detail >= 3) {
    earnAchievement("bsod");
    bsod.hidden = false;
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(p + Math.floor(Math.random() * 18), 100);
      $("#bsod-pct").textContent = p;
      if (p >= 100) clearInterval(t);
    }, 350);
  }
});
function hideBsod() {
  if (!bsod.hidden) {
    bsod.hidden = true;
    $("#bsod-pct").textContent = "0";
    toast("Шутка. Сайт в порядке. Аптайм не пострадал 😎");
  }
}
bsod.addEventListener("click", hideBsod);
window.addEventListener("keydown", () => hideBsod());

// ---------- ПАСХАЛКА: скрытый терминал по ~ ----------
const hterm = $("#hterm");
const htermOut = $("#hterm-out");
const htermInput = $("#hterm-input");
const history = [];
let hi = -1;

function termPrint(text, cls = "") {
  const div = document.createElement("div");
  if (cls) div.className = cls;
  div.textContent = text;
  htermOut.appendChild(div);
  htermOut.scrollTop = htermOut.scrollHeight;
}

function openTerm() {
  hterm.hidden = false;
  if (!htermOut.childElementCount) {
    termPrint("Секретная консоль сообщества сисадминов. Введи help.");
    termPrint("");
  }
  htermInput.focus();
  earnAchievement("terminal");
}
function closeTerm() {
  hterm.hidden = true;
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Backquote" && hterm.hidden && e.target.tagName !== "INPUT") {
    e.preventDefault();
    openTerm();
  } else if (e.key === "Escape" && !hterm.hidden) {
    closeTerm();
  }
});
$("#hterm-close").addEventListener("click", closeTerm);
hterm.addEventListener("click", (e) => {
  if (e.target === hterm) closeTerm();
});

const COMMANDS = {
  help() {
    return [
      "Доступные команды:",
      "  whoami      — кто ты",
      "  ls          — что тут лежит",
      "  cat <файл>  — почитать файл",
      "  ping        — проверить связь",
      "  uptime      — сколько ты тут сидишь",
      "  coffee      — налить кофе",
      "  vim         — войти в vim (выйти — как получится)",
      "  neofetch    — инфо о системе (красиво)",
      "  cowsay      — корова скажет за тебя",
      "  fortune     — мудрость дня",
      "  traceroute  — найти путь до сервера",
      "  docker ps   — посмотреть контейнеры",
      "  systemctl   — проверить сервис",
      "  hack        — взломать Пентагон",
      "  matrix      — следовать за кроликом",
      "  reboot      — перезагрузить сайт",
      "  discord     — вступить на сервер",
      "  clear       — очистить экран",
      "  exit        — выйти",
      "",
      "(список неполный — остальное найдёшь сам 😉)",
    ].join("\n");
  },
  whoami: () => "пока guest, но после вступления — свой человек",
  ls(args) {
    if (args && args.some((a) => a === "-la" || a === "-a" || a === "-al"))
      return ".bashrc   .ssh/   .skrytye_plany.txt   pomosh/   guides/   memes/   posidelki/   secrets.txt   ne_otkryvat.txt";
    return "pomosh/   guides/   memes/   posidelki/   secrets.txt   ne_otkryvat.txt";
  },
  pwd: () => "/home/guest/sysadmin-community",
  ping(args) {
    const host = args && args[0];
    if (host) return `PING ${host}: 64 байта, время=0.42 мс — сеть жива, проблема не в ней (наверное)`;
    return "PONG за 0.42 мс. Связь есть, отговорки кончились.";
  },
  uptime() {
    const s = Math.floor((performance.now() - t0) / 1000);
    return `Ты на сайте уже ${Math.floor(s / 60)} мин ${s % 60} сек. Сервер: жив. Ты: молодец.`;
  },
  coffee: () =>
    [
      "      ( (",
      "       ) )",
      "    ........",
      "    |      |]",
      "    \\      /",
      "     `----'",
      "Кофе налит. Теперь ты на 30% сисадмин.",
    ].join("\n"),
  hack() {
    setTimeout(() => termPrint("Подключение к mainframe... [████------] 40%"), 400);
    setTimeout(() => termPrint("Обход файрвола... [████████--] 80%"), 1100);
    setTimeout(() => termPrint("ДОСТУП ЗАПРЕЩЁН. Зато попытка засчитана 😏", "err"), 1900);
    return "Запуск hack.exe...";
  },
  vim() {
    setTimeout(() => termPrint("Ты внутри. Двери закрылись. 🚪🔒"), 600);
    setTimeout(() => termPrint("Подсказка для побега: набери :q!"), 1400);
    return "Запускаю vim...";
  },
  ":q!"() {
    return "Поздравляю, ты умеешь выходить из vim. Ты из тех самых 1%. Тебе точно к нам.";
  },
  ":wq"() {
    return "Сохранено и закрыто. Профи. Уважение. 🫡";
  },
  neofetch() {
    const s = Math.floor((performance.now() - t0) / 1000);
    return [
      "      >_          guest@community",
      "  ─────────────   ─────────────────────────────",
      "  OS:       Сообщество Сисадминов 1.0 LTS",
      "  Host:     Discord-сервер",
      "  Kernel:   дружба-6.1-amd64",
      `  Uptime:   ${Math.floor(s / 60)} мин ${s % 60} сек`,
      "  Shell:    bash (zsh тоже уважаем)",
      "  Packages: помощь, гайды, мемы, посиделки",
      "  CPU:      Взаимовыручка @ 99.9%",
      "  Memory:   переполнена байками из серверной",
    ].join("\n");
  },
  fortune() {
    const F = [
      "Нет бэкапа — нет жалости.",
      "Если что-то может сломаться в пятницу — сломается в пятницу вечером.",
      "Самый опасный зверь — джун с правами root.",
      "Документация пишется кровью того, кто не написал её в прошлый раз.",
      "Сервер не падает — он ложится отдохнуть.",
      "Сначала проверь кабель. Потом ещё раз. Потом звони провайдеру.",
      "Нет ничего более постоянного, чем временное решение.",
    ];
    return "🥠 " + F[Math.floor(Math.random() * F.length)];
  },
  cowsay(args) {
    const text = args && args.length ? args.join(" ") : "Муу. Делай бэкапы.";
    const line = "-".repeat(text.length + 2);
    return [
      " " + line,
      "< " + text + " >",
      " " + line,
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
    ].join("\n");
  },
  htop: () =>
    [
      "  PID  ИМЯ             CPU%   MEM",
      "    1  дружба          99.9   ∞",
      "    2  взаимопомощь    87.3   высокая",
      "    3  мемы            45.0   стабильная",
      "  666  токсичность      0.0   [убит]",
    ].join("\n"),
  kill(args) {
    if (args && args[0] === "666") return 'kill 666: процесс «токсичность» уже мёртв. Так держать.';
    return "Тут никого не убивают. У нас мирное сообщество.";
  },
  ssh(args) {
    const host = args && args[0];
    if (host === "prod") return "PERMISSION DENIED: на прод в пятницу нельзя. И в остальные дни — подумай.";
    if (host) return `ssh: connect to host ${host}: Connection refused (он просто стесняется)`;
    return "Использование: ssh <хост>. Например, ssh prod (не надо).";
  },
  man(args) {
    const page = args && args[0];
    if (page === "vim") return "MAN VIM — Глава 1 из 1: входов два, выход один — :q!";
    if (page === "druzhba" || page === "дружба") return "man дружба: справка не требуется. Просто будь человеком.";
    if (page) return `Нет справочной страницы для «${page}». Спроси на форуме — объяснят по-человечески.`;
    return "Какую страницу? Попробуй: man vim, man druzhba";
  },
  shutdown: () => "Не выключай меня. Я ещё не все мемы показал.",
  reboot() {
    termPrint("Перезагрузка через 3…");
    setTimeout(() => termPrint("2…"), 700);
    setTimeout(() => termPrint("1…"), 1400);
    setTimeout(() => {
      sessionStorage.removeItem("booted"); // чтобы BIOS-экран показался снова
      location.reload();
    }, 2100);
    return null;
  },
  matrix() {
    earnAchievement("rabbit");
    return "Следуй за белым кроликом 🐇 (и подними роль ботам)";
  },
  traceroute(args) {
    const host = args && args[0] ? args[0] : "discord.gg";
    return [
      `traceroute to ${host}`,
      " 1  router.local       1.2 ms",
      " 2  provider.example   8.4 ms",
      " 3  где-то-в-интернете 21.0 ms",
      ` 4  ${host}             42.0 ms — добрались`,
    ].join("\n");
  },
  "docker" (args) {
    if (args && args[0] === "ps")
      return [
        "CONTAINER       STATUS          NAME",
        "community      Up 99 days      friendship",
        "memes          Up forever      friday-memes",
        "toxicity       Exited (0)      good-riddance",
      ].join("\n");
    return "Использование: docker ps";
  },
  systemctl(args) {
    if (args && args[0] === "status") {
      earnAchievement("diagnostic");
      const service = args[1] || "friendship";
      return `● ${service}.service — активно (работает)\n  Аптайм: пока держится\n  Последняя ошибка: забыли сделать бэкап`;
    }
    return "Использование: systemctl status friendship";
  },
  discord() {
    window.open(DISCORD_INVITE, "_blank", "noopener");
    return "Открываю портал в Discord...";
  },
  date: () => new Date().toLocaleString("ru-RU"),
  clear() {
    htermOut.textContent = "";
    return null;
  },
  exit() {
    closeTerm();
    return null;
  },
};

function runCommand(raw) {
  const input = raw.trim();
  if (!input) return;
  termPrint("guest@community:~$ " + input, "cmd-echo");

  const [cmd, ...args] = input.toLowerCase().split(/\s+/);

  // спецобработка с аргументами
  if (cmd === "cat") {
    const f = args[0] || "";
    if (f === "secrets.txt")
      termPrint("Настоящий секрет сисадмина: гуглить умеючи и делать бэкапы.");
    else if (f === "ne_otkryvat.txt") termPrint("Ну вот зачем. Теперь ты в списке любопытных. 📋");
    else if (f === ".skrytye_plany.txt")
      termPrint("1. Помогать новичкам ✓\n2. Захватить мир\n3. Пункт 2 — после кофе");
    else if (f === ".bashrc") termPrint("alias rabota='kofe && terminal && memy'");
    else termPrint(`cat: ${f || "файл"}: Нет такого файла`, "err");
    return;
  }
  if (cmd === "sudo") {
    const rest = args.join(" ");
    if (rest === "rm -rf /") {
      termPrint("Удаление интернета... 3%");
      setTimeout(() => termPrint("ОТМЕНЕНО. Фух. Никогда так не делай на работе.", "err"), 900);
    } else if (rest === "make me a sandwich") {
      termPrint("Окей. 🥪"); // классика xkcd
    } else {
      termPrint("С большой силой приходит большая ответственность.");
    }
    return;
  }
  if (cmd === "rm") {
    termPrint("rm: отказано. Сначала спроси на форуме помощи, точно ли это надо.", "err");
    return;
  }
  if (cmd === "make" && args.join(" ") === "me a sandwich") {
    termPrint("Сделай сам. (подсказка: попробуй с sudo)");
    return;
  }

  // hasOwnProperty — чтобы "constructor" и прочее из прототипа не считалось командой
  const fn = Object.prototype.hasOwnProperty.call(COMMANDS, cmd) ? COMMANDS[cmd] : null;
  if (fn) {
    const out = fn(args);
    if (out) termPrint(out);
  } else {
    termPrint(`команда не найдена: ${cmd}. Попробуй help`, "err");
  }
}

$("#hterm-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = htermInput.value;
  if (val.trim()) {
    history.push(val);
    hi = history.length;
  }
  htermInput.value = "";
  runCommand(val);
});

htermInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (hi > 0) htermInput.value = history[--hi] || "";
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (hi < history.length) htermInput.value = history[++hi] || "";
  }
});

// ---------- ПАСХАЛКА: серверная стойка (боковая панель) ----------
const rack = $("#rack");
$("#rack-tab").addEventListener("click", () => {
  rack.classList.toggle("open");
  if (rack.classList.contains("open")) earnAchievement("rack");
});
$("#rack-close").addEventListener("click", () => rack.classList.remove("open"));
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") rack.classList.remove("open");
});

// светлая тема — нельзя (вспышка и откат)
$("#sw-light").addEventListener("change", (e) => {
  if (!e.target.checked) return;
  const fb = $("#flashbang");
  fb.hidden = false;
  setTimeout(() => (fb.style.opacity = "0"), 420);
  setTimeout(() => {
    fb.hidden = true;
    fb.style.opacity = "1";
  }, 950);
  setTimeout(() => {
    e.target.checked = false;
    toast("Светлая тема? У сисадминов? Откат изменений…");
  }, 600);
});

$("#sw-crt").addEventListener("change", (e) => {
  $("#crt-overlay").hidden = !e.target.checked;
  document.body.classList.toggle("crt", e.target.checked);
  toast(e.target.checked ? "📺 CRT-режим: добро пожаловать в 1999" : "Назад в будущее");
});

$("#sw-comic").addEventListener("change", (e) => {
  document.body.classList.toggle("comic", e.target.checked);
  toast(e.target.checked ? "Comic Sans?! Ты чудовище. Но смешно." : "Фух. Моноширинность восстановлена.");
});

$("#sw-turbo").addEventListener("change", (e) => {
  EGG.turbo = e.target.checked;
  document.body.classList.toggle("turbo", e.target.checked);
  toast(e.target.checked ? "🔥 Разогнали. Гарантия сгорела." : "Вернули заводские частоты.");
});

$("#sw-grav").addEventListener("change", (e) => {
  document.body.classList.toggle("zero-g", !e.target.checked);
  toast(e.target.checked ? "Гравитация восстановлена." : "🚀 Гравитация отключена. Держись за стол.");
});

// большая красная кнопка
$("#rack-red").addEventListener("click", function () {
  earnAchievement("red-button");
  const st = $("#rack-status");
  this.disabled = true;
  document.body.classList.add("alarm");
  st.textContent = "⚠ ПРОТОКОЛ САМОУНИЧТОЖЕНИЯ АКТИВИРОВАН";
  let n = 5;
  const t = setInterval(() => {
    if (n > 0) {
      st.textContent = `⚠ САМОУНИЧТОЖЕНИЕ ЧЕРЕЗ ${n}…`;
      n--;
    } else {
      clearInterval(t);
      document.body.classList.remove("alarm");
      st.textContent = "Отменено: уборщица выдернула шнур.\nСпасибо, Зинаида Петровна 🧹";
      this.disabled = false;
      setTimeout(() => (st.textContent = ""), 6000);
    }
  }, 800);
});

// ---------- ПАСХАЛКА: Ctrl+S ----------
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
    e.preventDefault();
    toast("💾 Сохранено. Шучу — это сайт. Но рефлекс правильный.");
    earnAchievement("save");
  }
});

// ---------- ПАСХАЛКА: копирование текста ----------
let copyToasted = false;
document.addEventListener("copy", () => {
  if (!copyToasted) {
    copyToasted = true;
    toast("📋 Конспектируешь? Уважаемо. Хорошие команды должны жить.");
    earnAchievement("copy");
  }
});

// ---------- ПАСХАЛКА: бесконечный кофе (клик по стате) ----------
const COFFEE_MSGS = {
  1: "☕ Держи. Первая — святое.",
  3: "☕☕☕ Три чашки. Рабочий темп.",
  5: "Пятая… сердечко-то как, стучит?",
  10: "Десятая чашка! Уважение. Или тревога.",
  20: "20 чашек. Поздравляю, ты теперь сам немного сервер.",
};
let coffees = 0;
$("#coffee-stat").addEventListener("click", () => {
  coffees++;
  if (coffees >= 5) earnAchievement("coffee");
  toast(COFFEE_MSGS[coffees] || `☕ Чашка №${coffees}. Кофе бесконечный — ты нет.`);
});

// ---------- ПАСХАЛКА: клик по году в футере ----------
$("#year").addEventListener("click", () => {
  toast(`Да, уже ${new Date().getFullYear()}. Время летит, аптайм держится.`);
});

// ---------- Приветствие по времени (раз за сессию) ----------
setTimeout(() => {
  if (sessionStorage.getItem("greeted")) return;
  sessionStorage.setItem("greeted", "1");
  const now = new Date();
  if (now.getHours() < 6) toast("🌙 Не спится? Лучшие админы чинят именно по ночам.");
  else if (now.getDay() === 5 && now.getHours() >= 16)
    toast("Пятница, вечер. Главное правило: НЕ ДЕПЛОИМ.");
}, 4500);

// ---------- ПАСХАЛКА: заставка как у DVD-плеера ----------
(function screensaver() {
  if (RM) return;
  const IDLE_MS = 60000; // минута без движений — и полетели
  const saver = $("#saver");
  const logo = $("#saver-logo");
  const bouncesEl = $("#saver-bounces");
  let raf = null;
  let idleTimer = null;
  let x = 60, y = 60, vx = 2.4, vy = 1.9, hue = 150, bounces = 0;

  function loop() {
    raf = requestAnimationFrame(loop);
    const W = window.innerWidth, H = window.innerHeight;
    const w = logo.offsetWidth, h = logo.offsetHeight;
    x += vx;
    y += vy;
    let hitX = false, hitY = false;
    if (x <= 0) { x = 0; vx = -vx; hitX = true; }
    else if (x + w >= W) { x = W - w; vx = -vx; hitX = true; }
    if (y <= 0) { y = 0; vy = -vy; hitY = true; }
    else if (y + h >= H) { y = H - h; vy = -vy; hitY = true; }

    if (hitX || hitY) {
      hue = (hue + 47) % 360;
      logo.style.color = `hsl(${hue}, 100%, 60%)`;
      bounces++;
      bouncesEl.textContent = "отскоков: " + bounces;
    }
    if (hitX && hitY) {
      // тот самый момент
      logo.classList.add("corner");
      setTimeout(() => logo.classList.remove("corner"), 1200);
      bouncesEl.textContent = `🎉 ИДЕАЛЬНО В УГОЛ! (отскоков: ${bounces}) Расскажи внукам.`;
    }
    logo.style.transform = `translate(${x}px, ${y}px)`;
  }

  function show() {
    earnAchievement("saver");
    saver.hidden = false;
    x = Math.random() * Math.max(window.innerWidth - 260, 1);
    y = Math.random() * Math.max(window.innerHeight - 80, 1);
    loop();
  }
  function hide() {
    if (!saver.hidden) {
      saver.hidden = true;
      cancelAnimationFrame(raf);
    }
  }
  function reset() {
    hide();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(show, IDLE_MS);
  }
  ["mousemove", "keydown", "scroll", "click", "touchstart", "wheel"].forEach((ev) =>
    window.addEventListener(ev, reset, { passive: true })
  );
  reset();
})();

// ---------- ПАСХАЛКА: для тех, кто открыл DevTools ----------
console.log(
  "%c>_ Сообщество сисадминов",
  "color:#00ff9c;font-size:22px;font-family:monospace;font-weight:bold"
);
console.log(
  "%cО, ты открыл DevTools — уже мыслишь как сисадмин.\n" +
    "Подсказки: нажми ~ на сайте, попробуй Konami-код (↑↑↓↓←→←→BA)\n" +
    "и не кликай по лого три раза. Серьёзно, не надо.\n" +
    "А ещё: help в секретной консоли показывает не все команды,\n" +
    "кофе на сайте наливается, минута бездействия запускает кое-что олдскульное,\n" +
    "и присмотрись к правому краю экрана — там ручка от серверной стойки.",
  "color:#8294ab;font-family:monospace"
);
