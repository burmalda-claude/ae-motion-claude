# Sound design engine

Every visual accent (transition, hit, text appearing, glitch) gets a *motivated* sound layer — not a random whoosh from a free pack.

## Tools
- `tools/sfxgen.py` — parametric generators (unlimited variations via `seed`/params), layer stacks per transition, genre packs, beat sync, AI generation.
- `tools/audit.py` — masking, clipping, true peak, LUFS, phase, DC, beat clashes, AI artifacts.
- `tools/build.py` — places cues, ducks SFX under the voice (broadband `sfxDuck` + presence band `sfxPresenceDuck`), varies pitch (`sfxVary`), masters to `lufs`.

## Categories → specs
| Category | Spec | Params |
|---|---|---|
| Whooshes & swipes | `whoosh:len=12f,dir=LR,tone=dark,weight=heavy,reverse=1,seed=7` | len 4–24 f, dir LR/RL/UP/DOWN, tone bright/dark, weight light/medium/heavy, reverse — `python tools/sfxgen.py variations whoosh 100 dir/` makes 100 |
| Impacts & hits | `impact:kind=boom,weight=heavy,tail=long,sub=1` | kind snare/boom/sub/glass/metal, weight, tail short/long, sub on/off |
| Risers & build-ups | `riser:len=2s,kind=noise,end=hit,curve=exp` | len 0.5–8 s, kind tonal/noise/reverse/uplifter/downlifter, end hit/drop/silence, curve exp/lin/log/s |
| Ambience & room tone | `ambience:kind=rain,len=10s,loop=1` | kind room/office/street/forest/coffee/rain/wind, seamless loop |
| UI & tech | `ui:kind=toggle,dry=1,tone=soft` | click/tap/toggle/notification/hover/typing/digital, dry/wet, soft/sharp |
| Transition-specific | `trans:kind=glitch_burst` | glitch_burst, reverse_impact, tape_stop, sub_drop, whiteout |
| Trends 2026 | `trend:kind=vine_boom` | hook_click/ding/pop/whoosh, vine_boom, boing, record_scratch, wasted, get_out (stinger), phonk_808, distorted_hit, cowbell, electric_burst, tesla_arc, corrupted, scifi_whoosh |
| ASMR | `asmr:kind=rustle` | soft_click, rustle, wet — keep under the original sound |

All specs take `seed`, `pitch` (semitones), `gain`. Lengths: `12f`, `0.4s`.

## Parameters
- **Sync point** — the cue frame (`w3`, `end-4`, absolute frames in `sfxTrack`). Whooshes/risers/reverse sounds END on it; impacts START on it.
- **Duration** — `render(spec, max_frames)` trims to the transition/animation length with a micro fade.
- **Layer stack** — `layer:<transition>` → 2–3 layers (high whoosh + low impact + sub tail), table `LAYERS` in sfxgen.py.
- **Ducking** — SFX −6 dB under speech + −9 dB more in 1–4 kHz (keeps the hit's body, frees the words).
- **Loudness target** — `"lufs": -14` (TikTok/Reels/YouTube) or `-23` (TV/EBU R128). True peak ≤ −1 dBTP.
- **Pitch/time** — `pitch=±n` per spec, `sfxVary` random ± semitones per placement (repeats stop sounding copy-pasted).

## Rules
1. **Layering, not one sound.** A transition = whoosh (top) + impact (body) + sub/tail (weight). One file never sounds big.
2. **Sync in the frame, not "near" it.** 1–3 frames early/late reads as a flam. `audit.py` flags it.
3. **Context.** Phonk edit → distorted 808 hits, cowbell, glitch; cinematic → booms + tonal risers; tutorial → dry UI clicks; meme → vine boom / scratch. Universal "cinematic whoosh" on everything sounds cheap.
4. A transition sound either **reinforces the beat** (on the hit) or **lives in the gap** — never fights it.
5. Restraint: in measured edits most accents are carried by the music; add SFX to transitions and the first frame (hook), not to every cut.

## AI vs library vs procedural
| Use | When |
|---|---|
| **Procedural (sfxgen)** | default: instant, unlimited variations, exact length, no download, no license questions |
| **AI (ElevenLabs Sound Effects, Stable Audio 2.5, AudioGen)** | specific real-world sounds you can't synthesize (a specific engine, crowd, animal), long ambiences — then `audit.py --file` (robotic/metallic, clipping, phase) |
| **Library (Pixabay, Mixkit, Freesound, YouTube Audio Library, SONNISS GDC)** | iconic recordings (meme voice clips, real foley), when the user wants "the" sound — ask before downloading, log in CREDITS.md |

## Credits & licenses (sources the plugin may suggest)
| Source | License | Commercial |
|---|---|---|
| ae-motion procedural engine | generated, no rights reserved | yes |
| Pixabay Audio | Pixabay Content License | yes, no attribution |
| Mixkit SFX | Mixkit Free License | yes |
| YouTube Audio Library | per track (some need attribution) | yes, check each |
| Freesound.org | CC0 / CC-BY / CC-BY-NC per file | check each file |
| SONNISS GDC bundles | royalty-free, per bundle EULA | yes |
| ElevenLabs Sound Effects | per plan (commercial from paid plans) | per plan |
| Stable Audio 2.5 | per Stability license | per plan |
| Meta AudioCraft (AudioGen) | code MIT, weights CC-BY-NC | non-commercial weights |

References: DJordanMedia · Versely · SONNISS · AEscripts AI Scorpion SFX.
