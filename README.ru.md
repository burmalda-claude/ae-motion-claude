# ae-motion

**Русский** | [English](README.md)

Плагин для [Claude Code](https://claude.com/claude-code), который учит Claude делать видео «как в After Effects» — без самого After Effects. Видео собирается кодом через [Remotion](https://www.remotion.dev/) (React), а плагин превращает промпт в одну строку в готовый ролик уровня AE: Claude сам режиссирует (сценарий, ритм, тема) и собирает его из готового набора компонентов, тем, шрифтов и правил монтажа.

## Что внутри

Один скилл `motion-design`, который Claude подгружает сам, когда вы просите ролик, интро, титры, промо, reels и т.п. Вы пишете одну строку — Claude работает как режиссёр, моушн-дизайнер, монтажёр и звукорежиссёр.

| Часть | Что делает |
|---|---|
| **Бриф + режиссёр** (`references/brief.md`, `references/director.md`) | Сначала говорит, как понял задачу, и задаёт один раунд вопросов в один клик (формат, длина, направление, звук) с уже выбранной рекомендацией; потом превращает ответы в полное ТЗ: формат, длина, тема по смыслу ролика, язык, сценарий короткими битами — и сразу собирает |
| **Голос и звук** (`tools/build.py`, `tools/sound.py`) | Одна команда превращает `script.json` в: озвучку по фразам (Edge TTS, по умолчанию выразительный Brian Multilingual — чисто говорит по-русски) с **кадром каждого слова**, обработку голоса как на радио, синтезированные эффекты на словах, музыку 123 BPM по секциям с «качанием» и приглушением под голос, мастеринг до −14 LUFS. Уровни сведения сняты с эталонного ролика |
| **23 синтезированных эффекта** | удар, хит, саб-удар, бум, свист, засасывание, зум, райзер, реверс, световой меч, глитч, печать, клик, клавиша, поп, звон, тик, затвор, заикание, остановка ленты… Без сэмплов и лицензий |
| **Набор компонентов** (`kit/`) | 70+ компонентов Remotion: кинетический текст, зум-блюр, варп-полосы, линии скорости, световые разрезы, камера, переходы, интерфейсы в стиле AE, таймлайн под голос |
| **Эталонный трейлер** (`examples/Trailer.tsx`) | Озвученный кинетический трейлер на 86 секунд и 45 шотов на русском, собранный шот-в-шот после разбора каждого кадра и звука топового техно-промо — планка качества |
| **Разбор эталона** (`references/reference-breakdown.md`) | Этот разбор как библиотека приёмов: что делает каждый бит и каким компонентом это собрать |
| **Монтаж / темы / шрифты / эффекты** | Ритм, типы склеек, словарь шотов; 14 тем; ~23 пары шрифтов; рецепты AE → Remotion |

### Компоненты набора

| Группа | Компоненты |
|---|---|
| Голос и звук | `layoutBeats` (длина шота = длина фразы), `VoiceTimeline` (шоты + голос + эффекты + приглушаемая музыка), `Sfx`, `TypingSfx`, `Captions` (субтитры по словам как в TikTok) |
| Кинетика | `ZoomIn` (радиальный зум-блюр), `WarpStreaks`, `SpeedLines`, `Slash` (световой меч), `Pops`, `ScrollStack` (вертикальный проезд камеры), `Wobble`, `WeightShift`, `Scatter`, `MorphShape`, `RepeatStretch`, `DiagonalBand`, `GlowPill`, `LightSweep` |
| Текст | `Fit`, `SlamText`, `WhipIn`, `Letters` (подъём / поп / падение / размытие), `Words`, `MaskReveal`, `Typewriter`, `Counter`, `Outline`, `Extrude` (3D), `EchoStack`, `Stretch`, `Glitch`, `Highlight`, `Underline`, `CheckerText`, `TerminalLine`, `GradientText`, `punch()` |
| Эффекты | `Smear` (направленное размытие), `Glow`, `Grain`, `Vignette`, `Scanlines`, `DotGrid`, `Orb`, `Bokeh`, `LightStreak`, `Sparks`, `Sparkle`, `Starburst`, `Shockwave`, `Cube3D`, `Viewfinder`, `HudRing`, `Letterbox`, `Flash`, `Bulb` |
| Камера | `Camera` (наезд, дрейф, тряска на ударах, крен), `Parallax`, `Tilt3D` |
| Переходы | `whip()`, `zoomThrough()`, `zoomBlur()`, `streak()`, `slices()` + стандартные fade / slide / wipe / flip / clock wipe |
| Интерфейс в стиле AE | `CompGrid`, `TransformBox`, `LayerBars`, `KeyLanes`, `GraphCurve`, `EchoTower`, `Timeline`, `RenderBar`, `Ruler`, `Filmstrip`, `PlayerMock`, `PromptBox`, `ChatCard`, `NodeGraph`, `Cursor` |

## Сначала бриф, потом сборка

Перед тем как делать или менять видео, Claude в 2–4 строках пересказывает, как понял задачу (о чём, зачем, главная мысль, чем заканчивается), и задаёт **один раунд** до 4 вопросов. В каждом уже выбран рекомендуемый вариант, так что согласиться со всем — один клик на вопрос:

| Вопрос | Зачем |
|---|---|
| Где будет крутиться (9:16 / 16:9 / 1:1 · 4:5) | формат меняет композицию каждого шота; поменять потом = пересобрать всё |
| Сколько длится | длина задаёт число битов и сценарий: 15 и 30 секунд — разные ролики |
| Направление: 3 варианта, каждый = тема + 2–3 названия приёмов + темп | «динамично» каждый понимает по-своему, а «вип-пан + удар с тряской» — одинаково |
| Звук: голос + музыка / свой трек / только музыка / без звука | голос и бит задают длину шотов; смена звука потом перетаймит весь монтаж |
| Материалы и тексты, а при правке — «что не трогать» | бренд и логотип не придумать; одобренное не должно сломаться при правке |

Вопросы, на которые уже ответил промпт, пропускаются. Скажите «без вопросов», чтобы пропустить бриф. Подробно: `references/brief.md`.

## Словарь движений: 144 названия → kit

«Вижу, а как это называется?» Словарь даёт каждому движению имя, живой пример и компоненты kit, которыми оно собирается: 144 названия из [motion-prompt](https://github.com/showheyohtaki/motion-prompt) (моушн-графика, камера и склейки, UI, веб-эффекты, фото-свет и стиль; MIT, © Shohei Ohtaki) плюс слой ae-motion: русские названия и запросы, **привязка к компонентам kit** (`≈` — если kit даёт только похожий вид), энергия 1–3 и режимы, где приём уместен.

- **Сайт:** https://burmalda-claude.github.io/ae-motion-claude/ — все названия в движении; поиск по-русски / по-английски / по-японски или по `#043`, фильтры по набору, режиму, энергии и «только из kit», карточка со спецификацией таймингов и похожими приёмами, подборка из нескольких приёмов + заметка → готовый промпт для Claude в один клик. Исходник: `docs/` (GitHub Pages, без сборки).
- **Весь плагин на том же сайте:** 18 режимов (палитра, шрифты, тайминги, стек эффектов, секции музыки), 155 экспортов kit с описаниями и перекрёстными ссылками (в каких режимах компонент и какие названия из словаря он собирает), 30 переходов — у каждого можно послушать звуковой стек, звуковой движок (52 синтезированных звука + жанровые паки), 14 тем с живыми образцами шрифтов, 23 шрифтовые пары, 30 команд. Всё генерируется из файлов плагина: `python tools/site.py` (`--check` падает, если данные устарели), поэтому сайт не может разойтись с плагином.
- **В Claude:** `/ae-motion:lexicon <описание>` или просто назовите приём в запросе; Claude ищет через `tools/lexicon.py find` и использует названия в вариантах «Направления» на брифе.
- **Данные:** `lexicon/motion-prompt/*.json` (оригинал, не тронут) + `lexicon/ae.json` (наш слой). `python tools/lexicon.py` проверяет, что каждый компонент реально есть в kit, и пересобирает `references/lexicon.md` и `docs/lexicon.json`; `--check` падает, если они устарели.

## Команды / режимы

Не знаете, с чего начать: `/ae-motion:help`.

Одна команда = весь стек (эффекты, текстовые пресеты, шрифты, тайминги, поведение по биту и звуку, форматы). Команды с пространством имён: `/ae-motion:cinematic` (просто `/cinematic` тоже работает, если имя не занято другим плагином). Пресеты лежат в `skills/motion-design/modes/<id>.json`.

- **Live-превью:** `npx remotion studio` (обновляется на лету при правках).
- **Разобрать на модификаторы:** скажите «разобрать» после команды — Claude выведет стек нумерованным списком модификаторов и сохранит его в `.ae-motion/modes/<id>.json` в проекте для ручной правки.
- **Экспорт/импорт пресетов:** пресет — это один JSON-файл. Экспорт = скопировать его; импорт = положить в `.ae-motion/modes/` (файлы проекта важнее встроенных). «сохрани как пресет <имя>» записывает текущий стек.

| Команда | Назначение | Автоэффекты (модификаторы) | Форматы | Пример |
|---|---|---|---|---|
| `/ae-motion:edit` | Hard short-form edit about any subject: fast cuts, beat hits, aura/glitch, voice-over. | ZoomIn, WhipIn, Slide, Glitch, Chroma, Camera(hits), SpeedLines… | 9:16, 16:9, 1:1 | 20-сек эдит про фикус с электрической аурой |
| `/ae-motion:cinematic` | Trailers, teasers, cinematic intros in three acts (setup → build → payoff). | Letterbox, Grade(cinematic), Grain(0.1), Vignette, AnamorphicFlare, LightStreak, Camera(push 0.08, slow)… | 16:9, 2.39:1 | 30-сек тизер с тремя актами (setup → build → payoff) |
| `/ae-motion:lyric` | Lyric videos, karaoke, text to music (your track). | KaraokeLine, Letters(pop), punch() on beats, EchoStack(trail), Glow on hits, Chroma, Grain | 16:9, 9:16, 1:1 | синхронный текст с подсветкой по словам |
| `/ae-motion:clip` | Cut long podcasts/interviews into Reels/Shorts clips with hooks and subtitles. | Captions, LowerThird, ProgressBar, EmojiPop, StatCard, Camera(push 0.03), punch on topic change | 9:16, 1:1 | 5 клипов по 30 сек с хуками и субтитрами |
| `/ae-motion:tutorial` | Tutorials, guides, how-tos, screen recordings. | StepBadge, Callout, HighlightBox, ZoomTo, ChapterCard, ProgressBar, Cursor… | 16:9, 9:16 | авто-разметка шагов и подсветка областей экрана |
| `/ae-motion:gym` | Motivation edits, sport, sigma content. | SlamText, StatCard, TimerDisplay, Counter(reps), Camera(hits shake 40), Flash, Chroma… | 9:16, 16:9 | 15-сек мотивашка с хуком, stat-картой и финальным quote |
| `/ae-motion:gaming` | Game highlights and frag montages (your footage + frag timecodes). | Hitmarker, KillFeed, ComboCounter, Glitch, Chroma, Scanlines, HudRing… | 16:9, 9:16 | hitmarkers и счётчики по таймкодам |
| `/ae-motion:ad` | Ads, promos, product videos. | Callout, PriceTag, CTAButton, BeforeAfter, LightStreak(logo), MaskReveal, Words… | 16:9, 9:16, 1:1, 4:5 | 15-сек продуктовый ролик с 3 фичами и CTA |
| `/ae-motion:amv` | Anime edits, AMVs, opening-style. | SpeedLines, ImpactFrame, MangaPanels, JPText, Starburst, Shockwave, Chroma… | 9:16, 16:9 | 20-сек эдит с impact-кадрами на каждый удар |
| `/ae-motion:travel` | Vlogs, travel, lifestyle. | LowerThird, MapPin, DayCounter, QuoteCard, LightLeak, Grain, Letterbox… | 16:9, 9:16, 4:5 | авто-lower-thirds с локацией и счётчиком дня |
| `/ae-motion:meme` | Memes, short jokes, reaction cuts. | MemeCaption, ZoomTo(punch-in), SlamText, Wobble(warp), Camera(shake), Wasted, EmojiPop | 9:16, 1:1 | top/bottom caption + zoom punch на ключевой фразе |
| `/ae-motion:news` | News inserts, documentaries, reports. | LowerThird, BreakingBanner, Ticker, QuoteCard, Timeline, MapPin, Grade(news) | 16:9, 9:16 | нижняя плашка с именем спикера и тикер событий |
| `/ae-motion:fashion` | Fashion edits, lookbooks, runway. | MaskReveal, Outline, Grade(fashion), Grain, Letterbox, slow motion (playbackRate 0.5), runway cut on step | 9:16, 4:5, 16:9 | лукбук с collection name и плавными переходами |
| `/ae-motion:horror` | Horror edits, creepy content, dark aesthetic. | VHS, Flicker, Glitch, Scanlines, Chroma(red/green), Grain(0.15), ImpactFrame(jumpscare)… | 9:16, 16:9 | VHS-эдит с jumpscare на 3-й секунде |
| `/ae-motion:wedding` | Weddings, anniversaries, events. | MaskReveal, QuoteCard, LightLeak, Bokeh, Grade(dream), Grain(0.04), slow motion | 16:9, 9:16, 1:1 | имя пары, дата и мягкий переход между сценами |
| `/ae-motion:realestate` | Property tours, apartment reviews. | LowerThird, PriceTag, Callout, Camera(push 0.05, drift), Parallax, ProgressBar | 16:9, 9:16 | подписи комнат и цена в углу кадра |
| `/ae-motion:asmr` | ASMR, satisfying content, slow edits. | Camera(push 0.03, drift 2), Glow(soft), Grain(0.03) | 9:16, 1:1 | минимум графики, максимум плавности |
| `/ae-motion:reaction` | Reactions, commentary, breakdowns. | PiP, CommentBubble, EmojiPop, ZoomTo(emotion), LowerThird, Captions | 16:9, 9:16 | PiP-рамка + всплывающие комментарии зрителей |

## Музыка и SFX

**Музыка ищется в интернете, а не генерируется** (`/ae-motion:music-find`, `references/music.md`): жанр подбирается по теме и настроению (эдиты → бразильский / дрифт-фонк, грустное → slowed + reverb, аниме → фонк / jcore, космос → эпик-трейлер, реклама → бодрый корпоратив…), Claude собирает шорт-лист из 3–5 треков, **перед каждой загрузкой спрашивает разрешение**, скачивает через `yt-dlp`, анализирует бит (`beats.py`) и начинает эдит за 1–2 такта до дропа. Сгенерированная музыка остаётся запасным вариантом.

**SFX-движок** (`tools/sfxgen.py`, `tools/audit.py`, `references/sfx.md`): 8 категорий параметрических генераторов (вариаций сколько угодно), стеки из 2–3 слоёв под каждый переход, паки по жанрам, синхронизация с битом, AI-генерация (ElevenLabs, если задан ключ), аудит маскировки речи / клиппинга / фазы / true peak / LUFS / «флэмов» с битом / артефактов AI. Команды: `sfx-find`, `sfx-generate`, `sfx-sync`, `sfx-layer`, `sfx-audit`, `sfx-pack`.

| Категория | Примеры | Источник / лицензия | Команда |
|---|---|---|---|
| Whoosh-и и свайпы | short/long, light/heavy, LR/RL/up/down, reverse; 100 variations | procedural · Pixabay/Mixkit (free) · SONNISS | `sfx-layer`, `sfx-pack` |
| Удары и хиты | snare, boom, sub drop, glass, metal; light→heavy, short/long tail | procedural · Pixabay · SONNISS | `sfx-sync`, `sfx-layer` |
| Райзеры и нагнетание | tonal, noise, reverse, uplifter, downlifter; 0.5–8 s; ends on hit/drop/silence | procedural · ElevenLabs | `sfx-generate` |
| Эмбиент и room tone | room, office, street, forest, coffee shop, rain, wind; seamless loops | procedural · ElevenLabs/Stable Audio · Freesound (check license) | `sfx-generate`, `sfx-find` |
| UI и техно | click, tap, toggle, notification, hover, typing, digital; dry/wet | procedural · Mixkit | `sfx-pack tech` |
| Под переходы | glitch burst, reverse impact, tape stop, sub drop, whiteout swell | procedural | `sfx-layer` |
| Тренды 2026 | hook click/ding/pop, vine boom, boing, record scratch, wasted, phonk 808, distorted hit, cowbell, tesla arc, corrupted, sci-fi whoosh | procedural · meme voice clips via search (Pixabay/YouTube) | `sfx-pack meme/phonk/tech`, `sfx-find` |
| ASMR | soft clicks, rustle, wet | procedural | `sfx-generate` |

### Почему ваши SFX звучат дёшево
1. **Слоистость** — один звук звучит тонко. Whoosh сверху + удар для тела + саб-хвост для веса.
2. **Синхронизация** — в кадр, а не «около». Сдвиг на 1–3 кадра звучит как флэм (`sfx-audit` это ловит).
3. **Контекст** — звук под жанр (фонк-808 для эдитов, сухие клики для туториалов, бумы + райзеры для синематика), а не один универсальный whoosh.

### AI или библиотека: когда что
- **Процедурные (встроенные)** — по умолчанию: точная длина, мгновенные вариации, без загрузок.
- **AI-генерация** — конкретные реальные звуки и длинные эмбиенты; всегда через аудит («металлические» / роботные артефакты).
- **Библиотека** — культовые записи (голосовые мем-клипы, настоящий фоли); спрашивать перед загрузкой, записывать в `CREDITS.md`.

### Авторы и лицензии
В `references/sfx.md` — таблица всех источников, которые может предложить плагин, с лицензией и коммерческой пригодностью (Pixabay, Mixkit, YouTube Audio Library, Freesound, SONNISS, ElevenLabs, Stable Audio, AudioGen). Скачанные треки и звуки записываются в `CREDITS.md` проекта (автор, источник, лицензия, коммерческое использование).

Референсы: DJordanMedia · Versely · SONNISS · AEscripts AI Scorpion SFX.

Названия движений, описания, спецификации и анимированные примеры словаря: [motion-prompt](https://github.com/showheyohtaki/motion-prompt), Shohei Ohtaki, MIT (лицензия лежит в `lexicon/motion-prompt/LICENSE` и `docs/vendor/motion-prompt/LICENSE`).

### Что делают настоящие эдиты
`references/edits-breakdown.md`: 28 TikTok-эдитов, разобранных по кадрам, — ~7 склеек на 10 с, половина на звуковых ударах, ~2 вспышки в белое на 10 с, тряска на ударах, зум-панчи, стробоскоп, ореол-свечение; музыка 108–144 BPM, очень много саба. Это стало `kit/editfx.tsx` и переходами `whiteout` / `blackDip`. Второй проход, `tools/transscan.py`, замерил все 1 148 склеек и вспышек в этих эдитах (вспышка нарастает 1 кадр и спадает 4, чёрное держится 3 кадра, размытие 6, растворения всего 4 кадра, событие каждые 8 кадров) и добавил в движок 11 приёмов: `punchIn`, `exposure`, `invertCut`, `threshold`, `shrinkPop`, `push`, `pixelate`, `tvOff`, `hueShift`, `stutter`, `card` (демо: `examples/EditCuts.tsx`, 9:16).

## Переходы

Отдельный движок (`kit/cuts.tsx`, правила в `references/transitions.md`): переход должен исчезать в склейке и обслуживать эмоцию кадра. 5 категорий (Cut, Dissolve, Wipe & Reveal, Speed Ramp, атмосферные) + тренды 2026 (морфинг текста, жидкий переход, кинетический разрыв, 2D/3D глубина, глитч/dark phonk). У каждого перехода есть ручки: длительность (6–16 кадров для «невидимых»), easing (Ease / Bezier / S-кривая — линейный по умолчанию запрещён), motion blur на движущихся переходах, автоматический overlap (`<TransitionSeries>`), синхронизация с аудио (`tools/beats.py` → доли, сильные доли, удары, энергия). `pickTransition()` выбирает по энергии кадров, BPM и смыслу — сначала чистый кат.

| Команда | Категория | Длительность (кадры) | Easing | Аудио | Пример |
|---|---|---|---|---|---|
| `/ae-motion:transition` | all | per cut | per kind | SFX on every transition frame | pick + place transitions for every cut of the video |
| `/ae-motion:transition clean` | Cut | 0 (dissolve 10 if the cut jumps) | — | thump on the cut | clean cut, dissolve only if the cut does not read |
| `/ae-motion:transition dissolve` | Dissolve | 6–12 | Ease | soft whoosh | cross / blur / 100→103% scale dissolve |
| `/ae-motion:transition wipe` | Wipe & Reveal | 12–14 | Ease | swish into the edge | circle/diagonal/panel, eye → moon match cut, track matte; always with an edge |
| `/ae-motion:transition speedramp` | Speed Ramp | ramp 12 | S-curve | whoosh on the cut | 100% → 45% → cut → 45% → 100%, no effect |
| `/ae-motion:transition beat` | any, on beats | 6–16 | per kind | beats.py: beats / downbeats / hits | beat analysis first, transitions centered on beats |
| `/ae-motion:transition morph` | Trend: morph text | 12–16 | S-curve | swish | letters melt into letters (MorphText) + liquid |
| `/ae-motion:transition glitch` | Atmospheric / phonk | 4–8 | Ease | glitch + impact on the hit | RGB split + slices + VHS + 1-frame invert |
| `/ae-motion:transition random` | smart | per kind | per kind | BPM + energy per beat | chooses by shot energy & BPM, never the same twice in a row |
| `/ae-motion:transition edit` | Приёмы эдитов (замерены) | 3–10 | по типу | удар на кадре склейки | влёт с зумом, вспышка-пересвет, негатив / ч/б кадры, сжатие-выпрыгивание, выталкивание, пикселизация, «выключение ТВ», сдвиг оттенка, мерцание, карточка |
| `/ae-motion:trans-plan` | Планировщик (по замерам) | по типу | по типу | SFX на каждую склейку | `tools/transplan.py`: склейки на ударах, серии из 2–5 одинаковых переходов, чёрное + вспышка на дропе, живая камера (`EditCam`) на каждой склейке в бит |
| `/ae-motion:trans-learn` | Анализ | — | — | — | сканирует ваши референсы (`tools/transscan.py`): каждая склейка замерена, ленты кадров, сопоставление с типами переходов |

### Почему ваши переходы выглядят дёшево
1. **Overlap.** Переходу нужны кадры обоих шотов; без перекрытия он мигает или замирает. Движок перекрывает сам — планируйте длину шотов с учётом этого.
2. **Сдержанность.** Лучший переход — чистый кат. Один эффект на 5–10 склеек, никогда один и тот же дважды подряд, 6–16 кадров.
3. **Мотивация.** У каждого эффекта должна быть причина: прошло время (dissolve), совпала форма (match reveal), продолжается движение (whip, speed ramp), ударил бит (glitch на `hits`).

Референсы: MridhaFX · DJordanMedia · LesFM · Domer AI.

Демо: `examples/Transitions.tsx` (28 с): «пресет из 2012» против чистого ката → 5 категорий с ручками на экране → переходы в бит под фонк → финал.

## Стили (темы)

Назовите тему в запросе (или не называйте — Claude подберёт по смыслу) — Claude возьмёт её палитру, шрифты и характер движения на весь ролик.

| Тема | Для чего | Шрифты | Палитра | Движение |
|---|---|---|---|---|
| **Clean Tech** | презентации продуктов, «как у Apple» | Inter | чёрный, серый, синий `#2997FF` | плавное, медленное, проявление из размытия, лёгкий наезд камеры |
| **Neon Cyber** | гейминг, техно, киберпанк | Orbitron + Exo 2 | тёмно-синий, неон голубой/розовый/салатовый | быстрое, свечение, глитч на склейках, сканлайны, сетка-пол |
| **Bold Promo / Sport** | промо, спорт, распродажи | Unbounded + Montserrat | чёрный, белый, красный, жёлтый | агрессивное: отскоки, жёсткие слайды, тряска камеры, нарезка в бит |
| **Swiss / Minimal** | инфографика, редакционный стиль | Inter / Manrope | бумажный бежевый, чёрный, красный | по сетке, текст выезжает из-под маски, много воздуха |
| **Luxury / Fashion** | мода, премиум, ювелирка | Cormorant Garamond + Raleway | почти чёрный, кремовый, золото | очень медленное, побуквенное проявление, рисующиеся золотые линии, зерно |
| **Retro Y2K / Vaporwave** | ретро, музыка, мемы | Rubik Mono One + Press Start 2P | фиолетовый, градиент розовый-сиреневый-бирюзовый | упругие пружины, хромированный текст, VHS-шум, RGB-сдвиг |
| **Soft Gradient SaaS** | стартапы, приложения, IT-продукты | Space Grotesk + Inter | тёмный фон, размытые цветные пятна | плавающие пятна, стеклянные карточки, UI выезжает пружиной |
| **Playful / Kids** | соцсети, детский контент, лёгкие ролики | Nunito + Rubik | кремовый, яркие красный/бирюзовый/жёлтый/фиолетовый | сжатие-растяжение, большие отскоки, «поп» появления, стикеры |
| **Cinematic / Documentary** | документалки, истории, трейлеры | Playfair Display + Lora | чёрный, светлый, охра | Ken Burns по фото, киношные полосы 2.39:1, затемнения, сильное зерно |
| **Terminal / Hacker** | разработка, код, IT-обучение | JetBrains Mono | тёмный GitHub, зелёный, синий | печатная машинка с курсором, построчное появление, мерцание CRT |
| **Kinetic Red** | запуски AI/техно, трейлеры | Archivo Black + Oswald + Playfair italic | чёрный / бумага / красный `#FF2A3D`, резкая смена фона | шоты по 4–24 кадра, удары, вылеты, глитч, лого с лучом и искрами, макеты UI |
| **Brutalist Mono** | дизайн-студии, портфолио | Archivo Black + Space Grotesk | белый, чёрный, синий | жёсткие рывки, огромный обрезанный кадром текст, сетка и подписи |
| **Acid Hype** | дропы, музыка, стритвир | Unbounded + Dela Gothic One | чёрный, кислотно-зелёный, ярко-розовый | стробящая смена цветов, растяжение, эхо-стопки, сильная тряска |
| **Anime Impact** | гейминг, аниме-эдиты | Dela Gothic One + Russo One | белый/чёрный, красный, жёлтый | спидлайны, кадры удара, взрывы-звёзды, зум-удары |

## Шрифты по стилям

Все — Google Fonts, подгружаются автоматически. ✅ — есть кириллица.

| Стиль | Заголовок | Текст |
|---|---|---|
| Чистый тех | Inter ✅ | Inter ✅ |
| Современный геометрический | Manrope ✅ | Manrope ✅ |
| Жирное промо / спорт | Unbounded ✅ | Montserrat ✅ |
| Узкий ударный | Oswald ✅ | Roboto ✅ |
| Огромный постерный | Anton / Bebas Neue (кириллица: Oswald, Russo One) | Inter ✅ |
| Футуристичный / гейминг | Orbitron | Exo 2 ✅ |
| Стартап / продукт | Space Grotesk | IBM Plex Sans ✅ |
| Журнальный / люкс | Playfair Display ✅ | Lora ✅ |
| Элегантный засечный | Cormorant Garamond ✅ | Raleway ✅ |
| Округлый дружелюбный | Nunito ✅ | Nunito ✅ |
| Игривый | Rubik ✅ | Rubik ✅ |
| Ретро / Y2K | Rubik Mono One ✅ | Press Start 2P ✅ |
| Рукописный акцент | Caveat ✅ | — |
| Маркер / кисть | Permanent Marker (кириллица: Neucha, Marck Script) | — |
| Код / терминал | JetBrains Mono ✅ | JetBrains Mono ✅ |
| Кинетический трейлер | Archivo Black (кириллица: Dela Gothic One, Unbounded) | Oswald ✅ / JetBrains Mono ✅ |
| Тяжёлый дисплейный | Dela Gothic One ✅ | Inter ✅ |
| Техно-квадратный | Russo One ✅ | Exo 2 ✅ |
| Высокий узкий | Big Shoulders Display (кириллица: Oswald) | Inter ✅ |
| Модный гротеск | Syne (кириллица: Manrope) | Inter ✅ |
| Широкий техно | Michroma (кириллица: Unbounded) | Space Grotesk |
| Мягкий курсивный акцент | Playfair Display italic ✅ | — |

## Эффекты

| Как в After Effects | Что получится |
|---|---|
| Easy Ease, ease-out, Overshoot | плавные ключи и отскоки вместо линейного движения |
| Text Animator | побуквенное и пословное появление, выезд из-под маски, печатная машинка, счётчик цифр, разлёт букв (tracking) |
| Motion Blur, Echo | размытие движения и шлейф |
| Glow / Deep Glow | неоновое свечение текста и фигур, пульсация |
| Wiggle, Camera Shake | дрожание и тряска камеры на ударах |
| 3D Camera, Parallax | наезд камеры, параллакс слоёв, 3D-повороты |
| Trim Paths, Shape Morph | рисующиеся линии, превращение фигур, готовые фигуры (звезда, круг и др.) |
| Masks, Track Matte | шторки, круговое раскрытие, видео внутри текста, мягкие маски |
| Noise / Grain, Vignette, Scanlines, Letterbox | зерно плёнки, виньетка, сканлайны, киношные полосы |
| Glitch, RGB Split | глитч, хроматическая аберрация, нарезка слоя полосами |
| Фоны | анимированный градиент, размытые пятна, сетка-пол (synthwave), стеклянные карточки |
| Переходы | fade, slide, wipe, flip, clock wipe, а также zoom-through, whip pan, вспышка |
| Time Remap | ускорение и замедление видео |
| Lottie (Bodymovin) | готовые анимации из AE и LottieFiles |
| Audio Spectrum | реакция на музыку (бас качает масштаб/свечение), склейки в бит |

## Форматы

| Куда | Размер | FPS |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 | 30 или 60 |
| YouTube | 1920×1080 | 30 или 60 |
| Квадратный пост | 1080×1080 | 30 |

## Установка

```bash
claude plugin marketplace add burmalda-claude/ae-motion-claude
claude plugin install ae-motion@ae-motion-local
```

Или из локальной папки: `claude plugin marketplace add ./ae-motion-claude`.

Нужны Node.js и Python 3 (`pip install edge-tts numpy scipy librosa imageio-ffmpeg`). Проект Remotion и пакеты Claude ставит сам. Для озвучки нужен интернет (Edge TTS); без него используется роботизированный офлайн-голос Windows.

## Пример

> Сделай промо-ролик на 15 секунд для Reels в стиле Neon Cyber: «Новая коллекция. Уже в продаже».

Claude выберет тему, напишет текст озвучки, сгенерирует голос с таймингом слов, синтезирует эффекты и бит, соберёт каждый шот под произносимые слова, проверит кадры и отрендерит mp4.

## Структура

```
ae-motion-claude/
├── .claude-plugin/marketplace.json
├── docs/               ← сайт словаря (GitHub Pages): index.html, lexicon.json, vendor/motion-prompt
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        ├── kit/            ← easing, text, fx, kinetic, camera, transitions, ui, audio (+ index.ts)
        ├── tools/          ← build.py (script → voice, timing, SFX, music, master), sound.py (synths, DSP)
        ├── examples/       ← Trailer.tsx + trailer-script.json, KineticPromo.tsx, Showcase.tsx
        ├── lexicon/        ← паки motion-prompt (MIT) + ae.json (русские названия, привязка к kit, энергия, режимы)
        └── references/{brief,director,lexicon,editing,transitions,themes,fonts,effects,…}.md
```

## Шрифты

Google Fonts (SIL Open Font License), в репозиторий не входят.
