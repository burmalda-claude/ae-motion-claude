---
description: "Cinematic / Trailer mode — Trailers, teasers, cinematic intros in three acts (setup → build → payoff)."
argument-hint: "<what the video is about>"
---

Make a video in **Cinematic / Trailer mode** with the `motion-design` skill. Request: $ARGUMENTS

1. Load the preset `modes/cinematic.json` from the motion-design skill folder. If the current project has `.ae-motion/modes/cinematic.json`, use that instead (user override / imported preset).
2. Run the brief (`references/brief.md`): the preset values below are the recommended answers. Then apply the whole stack: format `16:9` unless the request or the brief picks another of ['16:9', '2.39:1']; palette, fonts, grade, text presets, timing (`entrance_f`, `exit_f`, `shot_f`), the `effects` list as the modifier stack, `exits` for shot exits, and `audio` → `script.json` fields (voice, rate, musicStyle, bpm, sections, sfx cues).
3. Write `script.json` and run `tools/build.py script.json .`. Then follow the SKILL.md workflow (build shots → check stills → render). Live preview: `npx remotion studio`.
4. If the user asks to **decompose / разобрать**: print the active stack as a numbered list of modifiers with their parameters and save it to `.ae-motion/modes/cinematic.json` so they can edit, export or share it; re-run with the edited file.
5. If the user asks to **save as preset**: write the current stack to `.ae-motion/modes/<name>.json` (same schema); it becomes usable via this command with "preset <name>".
