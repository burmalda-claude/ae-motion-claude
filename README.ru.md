# ae-motion

**Русский** | [English](README.md)

Плагин для [Claude Code](https://claude.com/claude-code), который учит Claude делать видео «как в After Effects» — без самого After Effects. Видео собирается кодом через [Remotion](https://www.remotion.dev/) (React), а плагин превращает промпт в одну строку в готовый ролик уровня AE: Claude сам режиссирует (сценарий, ритм, тема) и собирает его из готового набора компонентов, тем, шрифтов и правил монтажа.

## Что внутри

Один скилл `motion-design`, который Claude подгружает сам, когда вы просите ролик, интро, титры, промо, reels и т.п. Вы пишете одну строку — Claude работает как режиссёр и моушн-дизайнер.

| Часть | Что делает |
|---|---|
| **Режиссёрский режим** (`references/director.md`) | Превращает короткий промпт в полное ТЗ без допроса: формат, длина, тема по смыслу ролика, язык, сценарий битами по 1–4 слова (хук → завязка → раскрытие → доказательства → кульминация → лого/призыв), и сразу собирает |
| **Набор компонентов** (`kit/`) | ~45 готовых компонентов Remotion, которые Claude копирует в проект: кинетический текст, эффекты, камера, переходы, макеты интерфейсов |
| **Эталонный ролик** (`examples/KineticPromo.tsx`) | Полное промо из 15 шотов в красно-чёрно-белом трейлерном стиле — планка качества |
| **Правила монтажа** (`references/editing.md`) | Ритм склеек по сетке битов, 8 типов склеек, 14 типов шотов, правила вёрстки и акцентов, звук |
| **Темы / шрифты / эффекты** | 14 тем, ~23 пары шрифтов, рецепты AE → Remotion для всего, чего нет в наборе |

### Компоненты набора

| Группа | Компоненты |
|---|---|
| Текст | `SlamText` (удар-появление), `WhipIn` (вылет с размытием в движении), `Letters` (подъём / поп / падение / размытие), `Words` (акцентные слова), `MaskReveal`, `Typewriter` (с подсветкой слов), `Counter`, `Outline`, `Extrude` (3D-текст), `EchoStack`, `Stretch`, `Glitch` (RGB + нарезка), `Highlight`, `Underline`, `CheckerText`, `punch()` |
| Эффекты | `Smear` (направленное размытие), `Glow`, `Grain`, `Vignette`, `Scanlines`, `DotGrid`, `Orb`, `Bokeh`, `LightStreak`, `Sparks`, `Starburst`, `Shockwave`, `Cube3D`, `Viewfinder`, `HudRing`, `Letterbox`, `Flash` |
| Камера | `Camera` (наезд, дрейф, тряска на ударах, крен), `Parallax`, `Tilt3D` |
| Переходы | `whip()`, `zoomThrough()`, `slices()` + стандартные fade / slide / wipe / flip / clock wipe |
| Макеты UI | `PromptBox` (печатает сам), `Timeline` (ключи как в AE), `NodeGraph` (светящиеся связи), `RenderBar`, `PlayerMock`, `Cursor` |

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

Нужен проект Remotion (`npx create-video@latest`) и Node.js. Дополнительные пакеты (`@remotion/transitions`, `@remotion/motion-blur` и др.) Claude поставит сам по мере надобности.

## Пример

> Сделай промо-ролик на 15 секунд для Reels в стиле Neon Cyber: «Новая коллекция. Уже в продаже».

Claude выберет тему, распишет сцены, соберёт композицию с переходами, glow и зерном и отрендерит превью кадров.

## Структура

```
ae-motion-claude/
├── .claude-plugin/marketplace.json
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        ├── kit/            ← easing, text, fx, camera, transitions, ui (+ index.ts)
        ├── examples/KineticPromo.tsx
        └── references/{director,editing,themes,fonts,effects}.md
```

## Шрифты

Google Fonts (SIL Open Font License), в репозиторий не входят.
