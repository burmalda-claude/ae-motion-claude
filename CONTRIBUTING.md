# Contributing

## Layout
- `plugins/ae-motion/` — the plugin: `.claude-plugin/plugin.json`, `commands/`, `agents/`, `hooks/`, `skills/motion-design/` (SKILL.md, `references/`, `kit/` Remotion components, `tools/` Python helpers, `modes/` presets, `lexicon/`, `examples/`).
- `docs/` — the GitHub Pages site (static, no build step). `docs/lexicon.json`, `docs/plugin.json`, `docs/sfx/` and `docs/vendor/ae-style/` are **generated**.
- `ci/kit-typecheck/`, `scripts/` — CI only, not shipped with the plugin.

## Checks (run all before a PR; CI runs the same)
```bash
pip install -r plugins/ae-motion/skills/motion-design/tools/requirements.txt ruff
ruff check --select F plugins scripts
cd plugins/ae-motion/skills/motion-design/tools
python sound.py test && python sfxgen.py test && python transplan.py --selftest
python doctor.py --selftest && python site.py --selftest && python ../../../hooks/scripts/confirm_download.py --selftest
python lexicon.py --check && python site.py --check
cd -
(cd ci/kit-typecheck && npm ci) && python scripts/check_kit_types.py
python scripts/check_docs.py
claude plugin validate plugins/ae-motion && claude plugin validate .
```

## Regenerating
- Changed `lexicon/ae.json`, a kit export name or a mode: `python tools/lexicon.py`.
- Changed modes, commands, kit doc comments, `references/themes.md|fonts.md|transitions.md|sfx.md`, `CHANGELOG.md` or sfx generators: `python tools/site.py` (needs `ffmpeg` on PATH for new sound previews).

## Rules
- Do not document what the code does not do. `scripts/check_docs.py` fails on unknown `/ae-motion:` commands and missing plugin paths.
- Removing or renaming a command is a breaking change: add a migration table to `CHANGELOG.md`.
- No secrets, tokens or absolute paths in committed files.
- Versions: bump `plugins/ae-motion/.claude-plugin/plugin.json` and add a `CHANGELOG.md` section.

## Release checklist
1. All checks above pass; CI is green.
2. `version` in `plugin.json` and the top `CHANGELOG.md` section agree; the date is set.
3. `python tools/site.py` was re-run so the site shows the new version and changelog.
4. Tag: `claude plugin tag plugins/ae-motion` (validates plugin.json against the marketplace entry and creates `ae-motion--v<version>`).
