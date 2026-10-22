---
description: "Edit mode — Hard short-form edit about any subject: fast cuts, beat hits, aura/glitch, voice-over."
argument-hint: "<what the video is about>"
---

Make a video in **Edit mode** with the `motion-design` skill. Request: $ARGUMENTS

1. Load the preset `modes/edit.json` from the motion-design skill folder. If the current project has `.ae-motion/modes/edit.json`, use that instead (user override / imported preset).
2. Run the brief (`references/brief.md`): the preset values below are the recommended answers. Then apply the whole stack: format `9:16` unless the request or the brief picks another of ['9:16', '16:9', '1:1']; palette, fonts, grade, text presets, timing (`entrance_f`, `exit_f`, `shot_f`), the `effects` list as the modifier stack, `exits` for shot exits, and `audio` → `script.json` fields (voice, rate, musicStyle, bpm, sections, sfx cues).
3. Write `script.json` and run `tools/build.py script.json .`. Then follow the SKILL.md workflow (build shots → check stills → render). Live preview: `npx remotion studio`.
4. If the user asks to **decompose / разобрать**: print the active stack as a numbered list of modifiers with their parameters and save it to `.ae-motion/modes/edit.json` so they can edit, export or share it; re-run with the edited file.
5. If the user asks to **save as preset**: write the current stack to `.ae-motion/modes/<name>.json` (same schema); it becomes usable via this command with "preset <name>".
