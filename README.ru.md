# ae-motion

**Русский** | [English](README.md)

Плагин для [Claude Code](https://claude.com/claude-code), который учит Claude делать видео «как в After Effects» — без самого After Effects. Видео собирается кодом через [Remotion](https://www.remotion.dev/) (React), а плагин даёт Claude вкус: шрифты, темы, приёмы анимации и аналоги эффектов AE.

## Что внутри

Один скилл `motion-design`, который Claude подгружает сам, когда вы просите сделать ролик, интро, титры, промо, reels и т.п.

| Файл | Что там |
|---|---|
| `SKILL.md` | Порядок работы (тема → раскадровка → сцены → полировка), правила «профессионального» движения, чеклист полировки, форматы видео |
| `references/fonts.md` | ~16 пар Google Fonts по стилям, с пометкой о кириллице. Шрифты грузятся через `@remotion/google-fonts`, ничего скачивать не нужно |
| `references/themes.md` | 10 готовых тем: Clean Tech, Neon Cyber, Bold Promo, Swiss, Luxury, Y2K, SaaS Gradient, Playful, Cinematic, Terminal — палитра + шрифты + характер движения |
| `references/effects.md` | Эффекты AE → код Remotion: Easy Ease, spring-отскок, побуквенная анимация, motion blur, Glow, wiggle/тряска, параллакс и 3D, Trim Paths, маски и матты, зерно, виньетка, глитч, переходы, Lottie, синхронизация с музыкой |

## Стили (темы)

Назовите тему в запросе — Claude возьмёт её палитру, шрифты и характер движения на весь ролик.

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
        └── references/{fonts,themes,effects}.md
```

## Шрифты

Google Fonts (SIL Open Font License), в репозиторий не входят.
