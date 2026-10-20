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
