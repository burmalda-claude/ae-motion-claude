---
description: "Plan an edit's cuts and transitions from the music with the grammar measured in real edits (onset sync, bursts, drop, camera life)."
argument-hint: "<track / section, style phonk|anime|cinematic, optional>"
---

1) Beats: `python tools/beats.py <music> .` → `src/beats.json` (beats, downbeats, hits, energy).
2) Plan: `python tools/transplan.py src/beats.json --start <section start s> --end <end s> --drop <drop s> --style phonk|anime|cinematic` → `src/trans-plan.json`.
3) Compare the printed stats with the reference numbers in `references/transitions.md` → "Measured grammar": median shot 4–8 f in loud parts / ≥ 12 f in quiet parts, median run 2 (≤ 5), cuts on the grid 100 %. Change `--seed` or `--style` if the mix is off.
4) Build the composition from `shots[]`: `transition(shot.in)` between shots (or a hard cut + the overlay for `punchIn`/`exposure`), `<EditCam kind={shot.cam} dur={shot.dur}>` around every shot, `<BloomFlash at={from}>` for `fx: "flash"` (measured curve, starts 2 f before the cut), `<HitShake>` for `fx: "shake"`, black for `fx: "black"`.
5) Audio: put each `shot.sfx` into `sfxTrack` at `from` (whooshes end on the cut, impacts start on it), then `tools/build.py` and `tools/audit.py`.

Request: $ARGUMENTS
