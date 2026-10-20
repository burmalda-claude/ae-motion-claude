# ae-motion

[Русский](README.ru.md) | **English**

A [Claude Code](https://claude.com/claude-code) plugin that teaches Claude to make videos that look like After Effects work — without After Effects. Videos are built in code with [Remotion](https://www.remotion.dev/) (React); the plugin gives Claude the taste: fonts, themes, animation principles and code equivalents of AE effects.

## What's inside

One skill, `motion-design`, which Claude loads on its own when you ask for a video, intro, titles, promo, reels and so on.

| File | Contents |
|---|---|
| `SKILL.md` | Workflow (theme → storyboard → scenes → polish), rules for professional-looking motion, polish checklist, video formats |
| `references/fonts.md` | ~16 Google Fonts pairings by style, with Cyrillic support marked. Fonts load via `@remotion/google-fonts` — nothing to download |
| `references/themes.md` | 10 ready themes: Clean Tech, Neon Cyber, Bold Promo, Swiss, Luxury, Y2K, SaaS Gradient, Playful, Cinematic, Terminal — palette + fonts + motion character |
| `references/effects.md` | AE effects → Remotion code: Easy Ease, spring overshoot, per-letter animation, motion blur, Glow, wiggle/shake, parallax and 3D, Trim Paths, masks and mattes, grain, vignette, glitch, transitions, Lottie, beat sync |

## Installation

```bash
claude plugin marketplace add burmalda-claude/ae-motion-claude
claude plugin install ae-motion@ae-motion-local
```

Or from a local folder: `claude plugin marketplace add ./ae-motion-claude`.

You need a Remotion project (`npx create-video@latest`) and Node.js. Extra packages (`@remotion/transitions`, `@remotion/motion-blur`, etc.) Claude installs as needed.

## Example

> Make a 15-second Reels promo in the Neon Cyber style: "New collection. Available now."

Claude picks the theme, writes the scene list, builds the composition with transitions, glow and grain, and renders preview stills.

## Structure

```
ae-motion-claude/
├── .claude-plugin/marketplace.json
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        └── references/{fonts,themes,effects}.md
```

## Fonts

Google Fonts (SIL Open Font License), not included in the repository.
