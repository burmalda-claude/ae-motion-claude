# Changelog

Versions follow [semver](https://semver.org/). While the major version is 0, a minor bump may remove or rename commands; every such change is listed under **Breaking** with a migration.

## 0.11.0 — 2026-10-22

### Added
- `/ae-motion:doctor` + `tools/doctor.py`: read-only environment check (Python packages, Node.js, optional tools, Remotion add-ons, whether `src/kit/` matches the plugin's kit, `tsconfig` JSON imports, and a **Remotion version below 4.0.410**, which has critical advisories GHSA-2jqp-f4gr-44fr and GHSA-g6pc-6676-c23j).
- Hook (PreToolUse on Bash): `yt-dlp`, and `curl`/`wget` that write a file, now ask the user first. Off switch: `AE_MOTION_ALLOW_DOWNLOADS=1`.
- Agent `frame-reviewer`: reviews key-frame stills against the brief and `timeline.json` in its own context, read-only.
- `tools/requirements.txt` and `tools/requirements-extra.txt` (the README had missed `faster-whisper`, `opencv` and `yt-dlp`).
- CI (`.github/workflows/ci.yml`): plugin validation, Python self-tests on 3.10 and 3.13, generated-file freshness, strict TypeScript check of the kit against Remotion 4.0.537, docs ↔ code consistency, gitleaks, pip-audit, npm audit.
- Site: catalog of the whole plugin (modes, components, transitions, sound with playable previews, themes, fonts, commands), the samples in the ae-motion house style, Russian/English interface, a start tab with install, update, FAQ and this changelog.
- `SECURITY.md`, `CONTRIBUTING.md`, PR and issue templates; manifest `author`, `homepage`, `repository`, `keywords`.

### Fixed
- `examples/EditCuts.tsx` and `examples/PlanTest.tsx` imported `./kit` while the other examples import `../kit`; all now use `../kit`.
- Dead code in `tools/build.py` and `tools/transplan.py`.

## 0.10.0 — 2026-10-22

### Added
- Motion lexicon: 144 motion names from [motion-prompt](https://github.com/showheyohtaki/motion-prompt) (MIT) mapped to kit components, with Russian names, energy and fitting modes; `tools/lexicon.py find|show`; `/ae-motion:lexicon`; gallery site in `docs/`.
- Brief before building (`references/brief.md`): Claude restates the task and asks one round of one-click questions.
- `/ae-motion:help`.

### Breaking
- The nine `trans-<kind>` commands were merged into one `/ae-motion:transition <kind>`.

  | Before | Now |
  |---|---|
  | `/ae-motion:trans-clean …` | `/ae-motion:transition clean …` |
  | `/ae-motion:trans-dissolve …` | `/ae-motion:transition dissolve …` |
  | `/ae-motion:trans-wipe …` | `/ae-motion:transition wipe …` |
  | `/ae-motion:trans-glitch …` | `/ae-motion:transition glitch …` |
  | `/ae-motion:trans-morph …` | `/ae-motion:transition morph …` |
  | `/ae-motion:trans-speedramp …` | `/ae-motion:transition speedramp …` |
  | `/ae-motion:trans-beat …` | `/ae-motion:transition beat …` |
  | `/ae-motion:trans-edit …` | `/ae-motion:transition edit …` |
  | `/ae-motion:trans-random …` | `/ae-motion:transition random …` |

  `/ae-motion:trans-plan` and `/ae-motion:trans-learn` are unchanged. The behaviour of each kind is the same text as before, now one section of `commands/transition.md`.

## 0.9.0 — 2026-10-21
- Transition grammar measured in real edits and the planner `tools/transplan.py` (`/ae-motion:trans-plan`).

## 0.8.0 — 2026-10-21
- Edit-staple transitions learned from 28 reference edits (`kit/editfx.tsx`, `tools/transscan.py`, `/ae-motion:trans-learn`).

## 0.7.1 — 2026-10-20
- Online SFX by default, audio files as cues, edit-from-track example.

## 0.7 — 2026-10-20
- SFX engine (`tools/sfxgen.py`, `tools/audit.py`), online music search, lessons from 28 TikTok edits.

## 0.6 — 2026-10-20
- Transition engine (`kit/cuts.tsx`) and transition commands.

## 0.5 — 2026-10-20
- 18 slash-command modes with JSON presets, mode kit, music styles, `tools/transcribe.py`.

## 0.4 — 2026-10-20
- One-command voice + sound engine (`tools/build.py`), fast-cut kit, reference trailer.

## 0.3 — 2026-10-20
- Word-synced voice-over, procedural sound design, kinetic kit.

## 0.2 — 2026-10-20
- Director mode, component kit, themes; 0.2.1 verified kit renders and added the Showcase example.

## 0.1 — 2026-10-20
- First version: After Effects-style motion design skill for Remotion.
