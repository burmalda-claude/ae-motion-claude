# Security

## Reporting
Report a vulnerability privately through GitHub: **Security → Report a vulnerability** on this repository (private advisory). Please do not open a public issue for it. Include the affected file, steps to reproduce and the impact.

## What the plugin can do on your machine
ae-motion is a Claude Code plugin: instructions, slash commands, one agent, one hook and Python/TypeScript helpers. Claude runs the helpers through its normal tools, so your Claude Code permission settings apply to every command.

| Action | When | Network |
|---|---|---|
| `tools/build.py` voice-over | building a voiced video | sends the script text to Microsoft Edge TTS |
| `/ae-motion:music-find`, online SFX | when you ask for music or sounds | searches the web; downloads only after you confirm (enforced by the hook) |
| `tools/sfxgen.py ai` | only if `ELEVENLABS_API_KEY` is set | sends the sound prompt to ElevenLabs |
| `npm` / `npx` (Remotion) | project setup and rendering | npm registry, Google Fonts at render time |
| `tools/doctor.py`, `tools/lexicon.py`, hook script | any time | none |

## Secrets
- The only secret the plugin reads is `ELEVENLABS_API_KEY`, from the environment. Never put it in `script.json`, presets or committed files. `doctor.py` only reports whether it is set.
- CI scans the full history with gitleaks.

## Dependencies
- Remotion **< 4.0.410** has critical advisories (GHSA-2jqp-f4gr-44fr: remote code execution; GHSA-g6pc-6676-c23j: arbitrary file write). `/ae-motion:doctor` flags it; fix with `npx remotion upgrade`.
- CI runs `pip-audit` on `tools/requirements*.txt` and `npm audit` on the pinned TypeScript check.

## Supported versions
Only the latest minor version gets fixes.
