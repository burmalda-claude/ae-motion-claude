// UI language (ru / en) + Russian translations of plugin texts that plugin.json carries in English.
// Content translations are keyed by the English source: if the plugin text changes, the site shows the new English text, never a stale translation.
(() => {
  let lang;
  try { lang = localStorage.getItem("ae-lang"); } catch {}
  if (lang !== "ru" && lang !== "en") lang = /^ru|^uk|^be|^kk/i.test(navigator.language || "") ? "ru" : "en";

  const UI = {
    ru: {
      title: "Каталог ae-motion",
      "tab.start": "Старт", startH2: "Быстрый старт", startIntro: "ae-motion — плагин для Claude Code. Он не автоматизирует After Effects и не требует его: видео собирается в коде (Remotion), голос, звук и бит — Python-помощниками.",
      reqH: "Что нужно", req: "Claude Code, Node.js 18+, Python 3.10+. ffmpeg приходит с пакетом imageio-ffmpeg. Озвучке нужен интернет (Edge TTS).",
      installH: "Установка", updateH: "Обновление (затем перезапустите Claude Code)", removeH: "Удаление", firstH: "Первый запуск",
      first: "<code class=\"mono\">/ae-motion:doctor</code> проверит окружение и напишет, что поставить. Потом <code class=\"mono\">/ae-motion:help</code> или просто опишите видео: Claude перескажет задачу, задаст пару вопросов в один клик и соберёт ролик.",
      autoH: "Что работает само", autoName: "Что", autoKind: "Тип", autoWhat: "Что делает", autoOff: "Как выключить",
      auto1: ["Подтверждение загрузок", "hook", "yt-dlp и curl/wget с сохранением файла спрашивают разрешение. Остальное проходит молча.", "AE_MOTION_ALLOW_DOWNLOADS=1"],
      auto2: ["/ae-motion:doctor", "команда + скрипт", "Проверка без изменений: пакеты, Node, дополнения Remotion, устаревший src/kit, tsconfig, Remotion ниже 4.0.410 (критические уязвимости).", "запускается только по вызову"],
      auto3: ["frame-reviewer", "агент", "Проверяет ключевые кадры по брифу в отдельном контексте. Только отчёт.", "скажите «без ревьюера»"],
      auto4: ["Бриф, словарь, режимы", "инструкции для Claude", "Как Claude планирует и собирает. Кодом не принуждается.", "скажите «без вопросов»"],
      faqH: "Частые вопросы",
      faq: [["Нужен ли After Effects?", "Нет. Плагин делает видео в стиле After Effects кодом и ничего в AE не запускает."],
            ["Пропала команда trans-wipe и похожие", "С 0.10.0 это /ae-motion:transition wipe (и clean, dissolve, glitch, morph, speedramp, beat, edit, random)."],
            ["Падает импорт или чего-то не хватает", "Запустите /ae-motion:doctor — он печатает исправление для каждой проблемы."],
            ["Doctor пишет про Remotion ниже 4.0.410", "У этих версий критические уязвимости. Обновите: npx remotion upgrade."],
            ["Можно без вопросов?", "Да: напишите «без вопросов» — Claude перечислит допущения и начнёт сразу."],
            ["Куда уходят мои данные?", "Текст озвучки — в Microsoft Edge TTS; музыка и звуки скачиваются только после вашего подтверждения; ключ ElevenLabs читается только из переменной окружения. Подробно — SECURITY.md."]],
      linksH: "Ссылки", released: "вышла", changesH: "Что нового", unreleased: "не выпущено",
      lead: 'Плагин для Claude Code, который делает видео уровня After Effects из одной строки. Здесь всё, что у него внутри: <b>названия движений</b> с живыми примерами, <b>режимы</b>, <b>компоненты</b>, <b>переходы</b>, <b>звуки</b>, темы и шрифты. Отметьте нужное, допишите задачу и вставьте готовый промпт в Claude Code.',
      tabs: "Разделы", "tab.moves": "Движения", "tab.modes": "Режимы", "tab.kit": "Компоненты", "tab.cuts": "Переходы", "tab.sound": "Звук", "tab.themes": "Темы", "tab.fonts": "Шрифты", "tab.commands": "Команды",
      searchPh: "вип-пан, тряска, glitch, #043…", modeAria: "Режим ae-motion", allModes: "Все режимы", energy: "Энергия", anyEnergy: "Любая энергия", e1: "Спокойно", e2: "Средне", e3: "Жёстко",
      kitOnly: "Только из kit", themeAria: "Светлая или тёмная тема", packsAria: "Набор", langAria: "Язык",
      styleAe: "Стиль: ae-motion", styleOrig: "Стиль: оригинал", styleTitle: "Примеры в стиле ae-motion или в оригинальном стиле motion-prompt. Фото-набор всегда в оригинальных цветах: в нём цвет и есть содержание.",
      empty: "Ничего не нашлось. Попробуйте английское название или тег: whip, zoom, mask, glitch.",
      footer: 'Названия, описания и анимации: <a href="https://github.com/showheyohtaki/motion-prompt" target="_blank" rel="noopener">motion-prompt</a> © Shohei Ohtaki, MIT. Русский слой, привязка к kit, стиль примеров, каталог и сайт: <a href="https://github.com/burmalda-claude/ae-motion-claude" target="_blank" rel="noopener">ae-motion</a>.',
      binAria: "Подборка", clear: "Очистить", task: "Задача", notePh: "Что делаем? Например: 20-сек эдит про кофейню, вертикально", copyAll: "Скопировать промпт для Claude",
      approx: "Похожий вид, не тот же приём", inKit: "Есть в kit", specTitle: "В kit нет — Claude соберёт по спецификации", spec: "по спецификации", energyOf: "Энергия {0} из 3",
      open: "Открыть", inBin: "✓ В подборке", toBin: "+ В подборку", copyAsk: "Копировать запрос", taskPh: "<задача>", specMp: "по спецификации motion-prompt",
      promptHead: "Приёмы из словаря ae-motion (references/lexicon.md):", remove: "Убрать", copied: "Скопировано", selected: "Выделено — Ctrl+C", close: "Закрыть",
      howBuild: "Как собрать в ae-motion", request: "Запрос", specH: "Спецификация (тайминги и изинг)", modesH: "Режимы", nearH: "Рядом", all: "Все",
      loadErr: "Не удалось загрузить {0} ({1}). Откройте сайт через веб-сервер: python -m http.server в папке docs.",
      // catalog
      "files.kinetic.tsx": "Кинетика", "files.text.tsx": "Текст", "files.fx.tsx": "Эффекты", "files.camera.tsx": "Камера", "files.cuts.tsx": "Переходы", "files.transitions.tsx": "Переходы (пресеты)", "files.editfx.tsx": "Эдит-эффекты", "files.modes.tsx": "Блоки режимов", "files.ui.tsx": "UI-моки", "files.audio.tsx": "Голос и звук", "files.easing.ts": "Изинг",
      "cat.cut": "Склейка", "cat.dissolve": "Растворение", "cat.wipe": "Шторка", "cat.speed": "Скорость", "cat.atmospheric": "Атмосфера", "cat.trend": "Тренд 2026", "cat.edit": "Эдит",
      "grp.start": "С чего начать", "grp.mode": "Режимы", "grp.transition": "Переходы", "grp.sound": "Звук и музыка",
      modesH2: "18 режимов", modesIntro: "Одна команда = весь стек: формат, палитра, шрифты, тайминги, эффекты, голос и музыка. Перед сборкой Claude задаёт короткий бриф — значения режима становятся рекомендуемыми ответами.",
      fmt: "Формат", fontsL: "Шрифты", grade: "Грейд", shot: "Шот", soundL: "Звук", fr: "к", entry: "вход", exit: "выход", cutsPer10: "склеек/10 с", defVoice: "голос по умолчанию, без музыки", sections: "Секции музыки", copyCmd: "Скопировать команду",
      kitH2: "{0} экспортов kit", kitIntro: 'Компоненты Remotion и хелперы из <code class="mono">kit/</code>. У каждого — в каких режимах он в стеке эффектов и какие названия из словаря им собираются. Описания — из кода, на английском.', kitPh: "Camera, glitch, text…", onlyComp: "Только компоненты", helper: "хелпер", nothing: "Ничего не нашлось.",
      cutsH2: "{0} переходов", cutsIntro: 'Движок <code class="mono">kit/cuts.tsx</code>: <code class="mono">transition(kind)</code> внутри <code class="mono">&lt;TransitionSeries&gt;</code>, перекрытие автоматически. Кнопка проигрывает звук перехода — стек из 2–3 слоёв, сведённый так, как его ставит движок: свисты заканчиваются на склейке, удары начинаются с неё.', soundLayer: "слой звука", cutSound: "звук перехода", copy: "Копировать",
      soundH2: "Звуковой движок", soundIntro: 'Все звуки ниже синтезированы движком плагина (<code class="mono">tools/sfxgen.py</code>) — без сэмплов и лицензий, бесконечные вариации через <code class="mono">seed</code>. Спецификацию можно вставить в <code class="mono">script.json</code> как звуковую метку. Примеров: {0}.', copySpec: "Копировать спецификацию",
      packsH2: "Жанровые паки", packsIntro: '<code class="mono">/ae-motion:sfx-pack &lt;жанр&gt;</code> собирает готовый набор под жанр.',
      themesH2: "14 тем", themesIntro: "Тема = палитра + шрифты + характер движения. Claude выбирает её по смыслу ролика, на брифе предлагает три направления. Характер движения — из плагина, на английском.", sample1: "Один промпт — ", sample2: "готовое видео", motion: "Движение", themeCopy: "Тема {0} (references/themes.md)", copyForPrompt: "Копировать для промпта",
      fontsH2: "{0} шрифтовых пар", fontsIntro: "Все — Google Fonts (OFL), подгружаются при рендере. Для русского текста берите пары с кириллицей; если её нет, в скобках — замена.", style: "Стиль", headline: "Заголовок", body: "Текст", cyr: "Кириллица", specimenH: "Съешь ещё булок", specimenB: "Видео из одной строки", yes: "да", no: "нет",
      cmdsH2: "{0} команд", cmdsIntro: 'Все команды пишутся как <code class="mono">/ae-motion:&lt;имя&gt;</code>. Не знаете, с чего начать — <code class="mono">/ae-motion:help</code>.', modeWord: "Режим",
    },
    en: {
      title: "ae-motion catalog",
      "tab.start": "Start", startH2: "Quick start", startIntro: "ae-motion is a Claude Code plugin. It does not automate or need After Effects: the video is built in code (Remotion), voice, sound and beat by Python helpers.",
      reqH: "Requirements", req: "Claude Code, Node.js 18+, Python 3.10+. ffmpeg comes with the imageio-ffmpeg package. Voice-over needs internet (Edge TTS).",
      installH: "Install", updateH: "Update (then restart Claude Code)", removeH: "Remove", firstH: "First run",
      first: "<code class=\"mono\">/ae-motion:doctor</code> checks the environment and tells you what to install. Then <code class=\"mono\">/ae-motion:help</code>, or just describe the video: Claude restates the task, asks a few one-click questions and builds it.",
      autoH: "What runs by itself", autoName: "Piece", autoKind: "Kind", autoWhat: "What it does", autoOff: "Turn off",
      auto1: ["Download confirmation", "hook", "yt-dlp, and curl/wget that save a file, ask for permission. Everything else passes silently.", "AE_MOTION_ALLOW_DOWNLOADS=1"],
      auto2: ["/ae-motion:doctor", "command + script", "Read-only check: packages, Node, Remotion add-ons, stale src/kit, tsconfig, Remotion below 4.0.410 (critical advisories).", "runs only when called"],
      auto3: ["frame-reviewer", "agent", "Reviews key frames against the brief in its own context. Reports only.", "say \"no reviewer\""],
      auto4: ["Brief, lexicon, modes", "instructions for Claude", "How Claude plans and builds. Not enforced by code.", "say \"no questions\""],
      faqH: "FAQ",
      faq: [["Do I need After Effects?", "No. The plugin makes After Effects-style video in code and runs nothing in AE."],
            ["The trans-wipe command and similar are gone", "Since 0.10.0 they are /ae-motion:transition wipe (and clean, dissolve, glitch, morph, speedramp, beat, edit, random)."],
            ["An import fails or something is missing", "Run /ae-motion:doctor: it prints the fix for each problem."],
            ["Doctor reports Remotion below 4.0.410", "Those versions have critical advisories. Upgrade: npx remotion upgrade."],
            ["Can it skip the questions?", "Yes: say \"no questions\" and Claude lists its assumptions and starts."],
            ["Where does my data go?", "Voice-over text goes to Microsoft Edge TTS; music and sounds are downloaded only after you confirm; the ElevenLabs key is read only from an environment variable. Details in SECURITY.md."]],
      linksH: "Links", released: "released", changesH: "What's new", unreleased: "unreleased",
      lead: 'A Claude Code plugin that turns one line into an After Effects-quality video. Everything inside it is here: <b>motion names</b> with live samples, <b>modes</b>, <b>components</b>, <b>transitions</b>, <b>sounds</b>, themes and fonts. Pick what you need, add your task and paste the ready prompt into Claude Code.',
      tabs: "Sections", "tab.moves": "Moves", "tab.modes": "Modes", "tab.kit": "Components", "tab.cuts": "Transitions", "tab.sound": "Sound", "tab.themes": "Themes", "tab.fonts": "Fonts", "tab.commands": "Commands",
      searchPh: "whip pan, shake, glitch, #043…", modeAria: "ae-motion mode", allModes: "All modes", energy: "Energy", anyEnergy: "Any energy", e1: "Calm", e2: "Medium", e3: "Hard",
      kitOnly: "Kit only", themeAria: "Light or dark theme", packsAria: "Set", langAria: "Language",
      styleAe: "Style: ae-motion", styleOrig: "Style: original", styleTitle: "Samples in the ae-motion house style or in the original motion-prompt style. The photo set always keeps its original colours: there the colour is the subject.",
      empty: "Nothing found. Try another word or a tag: whip, zoom, mask, glitch.",
      footer: 'Names, descriptions and animations: <a href="https://github.com/showheyohtaki/motion-prompt" target="_blank" rel="noopener">motion-prompt</a> © Shohei Ohtaki, MIT. Russian layer, kit mapping, sample style, catalog and site: <a href="https://github.com/burmalda-claude/ae-motion-claude" target="_blank" rel="noopener">ae-motion</a>.',
      binAria: "Picks", clear: "Clear", task: "Task", notePh: "What are we making? E.g. a 20 s vertical edit about a coffee shop", copyAll: "Copy prompt for Claude",
      approx: "Close look, not the same move", inKit: "In the kit", specTitle: "Not in the kit: Claude builds it from the spec", spec: "from the spec", energyOf: "Energy {0} of 3",
      open: "Open", inBin: "✓ Picked", toBin: "+ Pick", copyAsk: "Copy request", taskPh: "<task>", specMp: "from the motion-prompt spec",
      promptHead: "Moves from the ae-motion lexicon (references/lexicon.md):", remove: "Remove", copied: "Copied", selected: "Selected — Ctrl+C", close: "Close",
      howBuild: "How ae-motion builds it", request: "Request", specH: "Spec (timings and easing)", modesH: "Modes", nearH: "Related", all: "All",
      loadErr: "Could not load {0} ({1}). Serve the site over HTTP: python -m http.server in docs.",
      "files.kinetic.tsx": "Kinetic", "files.text.tsx": "Text", "files.fx.tsx": "Effects", "files.camera.tsx": "Camera", "files.cuts.tsx": "Transitions", "files.transitions.tsx": "Transition presets", "files.editfx.tsx": "Edit FX", "files.modes.tsx": "Mode blocks", "files.ui.tsx": "UI mocks", "files.audio.tsx": "Voice & sound", "files.easing.ts": "Easing",
      "cat.cut": "Cut", "cat.dissolve": "Dissolve", "cat.wipe": "Wipe", "cat.speed": "Speed", "cat.atmospheric": "Atmospheric", "cat.trend": "2026 trend", "cat.edit": "Edit",
      "grp.start": "Start here", "grp.mode": "Modes", "grp.transition": "Transitions", "grp.sound": "Sound & music",
      modesH2: "18 modes", modesIntro: "One command = the whole stack: format, palette, fonts, timing, effects, voice and music. Before building, Claude runs a short brief and the mode's values become the recommended answers.",
      fmt: "Format", fontsL: "Fonts", grade: "Grade", shot: "Shot", soundL: "Sound", fr: "f", entry: "in", exit: "out", cutsPer10: "cuts/10 s", defVoice: "default voice, no music", sections: "Music sections", copyCmd: "Copy command",
      kitH2: "{0} kit exports", kitIntro: 'Remotion components and helpers from <code class="mono">kit/</code>, each with the modes that stack it and the lexicon names it builds.', kitPh: "Camera, glitch, text…", onlyComp: "Components only", helper: "helper", nothing: "Nothing found.",
      cutsH2: "{0} transitions", cutsIntro: 'The <code class="mono">kit/cuts.tsx</code> engine: <code class="mono">transition(kind)</code> inside <code class="mono">&lt;TransitionSeries&gt;</code>, overlap handled for you. The button plays the transition\'s sound: a 2–3 layer stack mixed the way the engine places it, whooshes ending on the cut and impacts starting on it.', soundLayer: "sound layer", cutSound: "transition sound", copy: "Copy",
      soundH2: "Sound engine", soundIntro: 'Every sound below is synthesized by the plugin\'s engine (<code class="mono">tools/sfxgen.py</code>): no samples, no licenses, endless variations via <code class="mono">seed</code>. Paste a spec into <code class="mono">script.json</code> as a sound cue. {0} samples.', copySpec: "Copy spec",
      packsH2: "Genre packs", packsIntro: '<code class="mono">/ae-motion:sfx-pack &lt;genre&gt;</code> builds a ready set for a genre.',
      themesH2: "14 themes", themesIntro: "Theme = palette + fonts + motion character. Claude picks one by topic and offers three directions in the brief.", sample1: "One prompt, ", sample2: "a finished video", motion: "Motion", themeCopy: "Theme {0} (references/themes.md)", copyForPrompt: "Copy for a prompt",
      fontsH2: "{0} font pairs", fontsIntro: "All Google Fonts (OFL), loaded at render time. For Russian text pick pairs with Cyrillic; otherwise the brackets name a substitute.", style: "Style", headline: "Headline", body: "Body", cyr: "Cyrillic", specimenH: "Motion design", specimenB: "Video from one line", yes: "yes", no: "no",
      cmdsH2: "{0} commands", cmdsIntro: 'Every command is <code class="mono">/ae-motion:&lt;name&gt;</code>. Not sure where to start: <code class="mono">/ae-motion:help</code>.', modeWord: "Mode",
    },
  };

  const RU = {
    "Ads, promos, product videos.": "Реклама, промо, ролики о продукте.",
    "Anime edits, AMVs, opening-style.": "Аниме-эдиты, AMV, стиль опенинга.",
    "ASMR, satisfying content, slow edits.": "ASMR, satisfying-контент, медленный монтаж.",
    "Trailers, teasers, cinematic intros in three acts (setup → build → payoff).": "Трейлеры, тизеры, кинематографичные интро в трёх актах (завязка → нарастание → развязка).",
    "Cut long podcasts/interviews into Reels/Shorts clips with hooks and subtitles.": "Нарезка длинных подкастов и интервью в клипы для Reels/Shorts с хуками и субтитрами.",
    "Hard short-form edit about any subject: fast cuts, beat hits, aura/glitch, voice-over.": "Жёсткий короткий эдит о чём угодно: быстрые склейки, удары в бит, аура и глитч, закадровый голос.",
    "Fashion edits, lookbooks, runway.": "Фэшн-эдиты, лукбуки, подиум.",
    "Game highlights and frag montages (your footage + frag timecodes).": "Игровые хайлайты и фраг-мувики (ваш футаж + таймкоды фрагов).",
    "Motivation edits, sport, sigma content.": "Мотивационные эдиты, спорт, сигма-контент.",
    "Horror edits, creepy content, dark aesthetic.": "Хоррор-эдиты, жуткий контент, тёмная эстетика.",
    "Lyric videos, karaoke, text to music (your track).": "Лирик-видео, караоке, текст под музыку (ваш трек).",
    "Memes, short jokes, reaction cuts.": "Мемы, короткие шутки, реакции.",
    "News inserts, documentaries, reports.": "Новостные вставки, документалки, репортажи.",
    "Reactions, commentary, breakdowns.": "Реакции, комментарии, разборы.",
    "Property tours, apartment reviews.": "Обзоры недвижимости и квартир.",
    "Vlogs, travel, lifestyle.": "Влоги, путешествия, лайфстайл.",
    "Tutorials, guides, how-tos, screen recordings.": "Туториалы, гайды, инструкции, записи экрана.",
    "Weddings, anniversaries, events.": "Свадьбы, годовщины, события.",
    "rhythm and visual logic match — the default": "ритм и визуальная логика совпадают — выбор по умолчанию",
    "time passed, emotion softened": "прошло время, эмоция смягчилась",
    "same, hides the digital crossfade": "то же, но прячет цифровое растворение",
    "100% → 103%: reads as an impulse, not a fade": "100% → 103%: читается как импульс, а не затухание",
    "circle / diagonal / panel, always with an edge stroke": "круг, диагональ или панель — всегда с обводкой по краю",
    "a shape repeats across the cut (eye → moon)": "форма повторяется через склейку (глаз → луна)",
    "a moving object carries the next shot (track matte)": "движущийся объект проносит следующий шот (трек-матт)",
    "warm/cool leak on the beat, energy drops": "тёплая или холодная засветка в бит, энергия спадает",
    "energetic accent, RGB split + scanline burst": "энергичный акцент: RGB-расслоение и вспышка строк",
    "glitch + VHS + 1-frame invert on the hit": "глитч + VHS + инверсия на 1 кадр на ударе",
    "dust/sparks dissolve": "растворение пылью или искрами",
    "organic fluid fill": "органичная жидкая заливка",
    "kinetic split: the frame tears apart": "кинетический разрыв: кадр разрывается пополам",
    "2D/3D hybrid: back into depth, out of the screen": "гибрид 2D/3D: уход в глубину и вылет из экрана",
    "energy rises; motion blur built in": "энергия растёт; размытие движения встроено",
    "A blows out, B fades out of white": "A пересвечивается, B проявляется из белого",
    "2–4 black frames": "2–4 чёрных кадра",
    "A blows out in 1 frame, optional pure-color hold (`props.hold`, `color`), B settles from overexposure": "A пересвечивается за 1 кадр, можно задержать чистый цвет (`props.hold`, `color`), B проявляется из пересвета",
    "the 1–2 frames around the cut are negative + smeared": "1–2 кадра вокруг склейки — негатив со смазом",
    "1–2 frames of 1-bit b/w on the cut": "1–2 кадра однобитного ч/б на склейке",
    "A shrinks to a point over a color, B pops in oversized with glow": "A сжимается в точку на цвете, B выпрыгивает крупнее нужного со свечением",
    "hard cut, B lands at 140 % with radial blur and settles": "жёсткая склейка, B приземляется на 140% с радиальным блюром и успокаивается",
    "B pushes A out (up/down/left/right) with motion blur": "B выталкивает A (вверх, вниз, влево, вправо) с размытием движения",
    "A breaks into blocks, B resolves out of them (`props.white` = out of white)": "A распадается на блоки, B собирается из них (`props.white` — из белого)",
    "A collapses into a bright line, B opens out of it": "A схлопывается в яркую линию, B раскрывается из неё",
    "palette rotates through the spectrum while B dissolves in": "палитра прокручивается по спектру, пока B проявляется",
    "A/B/A/B flicker every 2 frames, lands on B": "мерцание A/B/A/B каждые 2 кадра, остаётся на B",
    "B appears as a rounded card and grows to full frame": "B появляется скруглённой карточкой и растёт на весь кадр",
    "Start here — what ae-motion can do and which command to use for your video.": "С чего начать: что умеет ae-motion и какую команду взять под ваше видео.",
    "Motion lexicon — find the name of a move (144 names: motion, camera, UI, web, photo looks) and how the kit builds it; open the visual gallery.": "Словарь движений: найти название приёма (144 названия: моушн, камера, UI, веб, фото) и как его собирает kit; открыть галерею.",
    "Find real music online for the video (genre by topic: phonk for edits etc.), download with permission, fit the edit to it.": "Найти настоящую музыку в интернете (жанр по теме: фонк для эдитов и т. д.), скачать с разрешения и подогнать монтаж.",
    "Check SFX against speech/music: masking, clipping, phase, true peak, loudness, beat clashes, AI artifacts.": "Проверить звуки на фоне речи и музыки: маскировка, клиппинг, фаза, пики, громкость, конфликты с битом, артефакты ИИ.",
    "Find SFX by mood/scene (not by file name) — library, generated, or online.": "Найти звук по настроению или сцене (а не по имени файла): библиотека, генерация или интернет.",
    "Generate a custom SFX from a prompt (length, tone, loop, sub-bass).": "Сгенерировать звук по описанию (длина, тон, луп, саб-бас).",
    "Auto-build a 2–3 layer SFX stack for a transition (whoosh + impact + tail).": "Собрать для перехода стек из 2–3 слоёв звука (свист + удар + хвост).",
    "Build a ready mini-pack for a genre: gym, phonk, anime, meme, horror, tech, edit, cinematic.": "Собрать готовый мини-пак под жанр: gym, phonk, anime, meme, horror, tech, edit, cinematic.",
    "Analyze the beat/hits of the music and place SFX hits on the timecodes.": "Разобрать бит и удары музыки и поставить звуки на таймкоды.",
    "Learn transitions from reference edits: scan videos, measure every cut, review strips, map to transition kinds.": "Изучить переходы по референсным эдитам: просканировать видео, измерить каждую склейку, сопоставить с типами переходов.",
    "Plan an edit's cuts and transitions from the music with the grammar measured in real edits (onset sync, bursts, drop, camera life).": "Спланировать склейки и переходы под музыку по грамматике, измеренной на реальных эдитах (синхрон с атаками, серии, дроп, живая камера).",
    "Transitions — pick and place transitions between shots: auto (smart pick per cut) or one kind: clean, dissolve, wipe, glitch, morph, speedramp, beat, edit, random.": "Переходы: подобрать и расставить между шотами — автоматически (умный выбор на каждую склейку) или одного вида: clean, dissolve, wipe, glitch, morph, speedramp, beat, edit, random.",
    "Whooshes & swipes": "Свисты и свайпы", "Impacts & hits": "Удары и хиты", "Risers & build-ups": "Райзеры и нарастания", "Ambience & room tone": "Атмосфера и фон помещения",
    "UI & tech": "UI и техника", "Transition-specific": "Для переходов", "Trends 2026": "Тренды 2026", "ASMR": "ASMR",
  };

  const fill = (s, args) => s.replace(/\{(\d)\}/g, (_, i) => args[i]);
  window.LANG = lang;
  window.t = (key, ...args) => { const v = UI[lang][key] ?? UI.ru[key] ?? key; return typeof v === "string" ? fill(v, args) : v; };
  // Plugin text: Russian when a translation exists; "<Name> mode — <purpose>" keeps the name and translates the purpose.
  window.tr = s => {
    if (lang !== "ru" || !s) return s;
    if (RU[s]) return RU[s];
    const m = s.match(/^(.+?) mode — (.+)$/);
    return m ? `${UI.ru.modeWord} ${m[1]} — ${RU[m[2]] ?? m[2]}` : s;
  };
  window.setLang = l => { try { localStorage.setItem("ae-lang", l); } catch {} location.reload(); };

  // Static markup: data-i18n (innerHTML from our own dictionary), data-i18n-ph (placeholder), data-i18n-aria, data-i18n-title.
  const apply = () => {
    document.documentElement.lang = lang;
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach(el => el.innerHTML = t(el.dataset.i18n));
    document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
    document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.querySelectorAll("[data-i18n-title]").forEach(el => el.title = t(el.dataset.i18nTitle));
    const sel = document.getElementById("lang");
    if (sel) { sel.value = lang; sel.onchange = () => setLang(sel.value); }
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", apply) : apply();
})();
