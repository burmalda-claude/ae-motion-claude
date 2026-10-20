# ae-motion

**Русский** | [English](README.md)

Плагин для [Claude Code](https://claude.com/claude-code), который учит Claude делать видео «как в After Effects» — без самого After Effects. Видео собирается кодом через [Remotion](https://www.remotion.dev/) (React), а плагин превращает промпт в одну строку в готовый ролик уровня AE: Claude сам режиссирует (сценарий, ритм, тема) и собирает его из готового набора компонентов, тем, шрифтов и правил монтажа.

## Что внутри

Один скилл `motion-design`, который Claude подгружает сам, когда вы просите ролик, интро, титры, промо, reels и т.п. Вы пишете одну строку — Claude работает как режиссёр, моушн-дизайнер, монтажёр и звукорежиссёр.

| Часть | Что делает |
|---|---|
| **Режиссёрский режим** (`references/director.md`) | Превращает короткий промпт в полное ТЗ без допроса: формат, длина, тема по смыслу ролика, язык, сценарий короткими битами — и сразу собирает |
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

## Команды / режимы

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
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        ├── kit/            ← easing, text, fx, kinetic, camera, transitions, ui, audio (+ index.ts)
        ├── tools/          ← build.py (script → voice, timing, SFX, music, master), sound.py (synths, DSP)
        ├── examples/       ← Trailer.tsx + trailer-script.json, KineticPromo.tsx, Showcase.tsx
        └── references/{director,editing,reference-breakdown,themes,fonts,effects}.md
```

## Шрифты

Google Fonts (SIL Open Font License), в репозиторий не входят.
