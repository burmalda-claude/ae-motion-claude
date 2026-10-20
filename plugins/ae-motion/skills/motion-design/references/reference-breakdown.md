# Breakdown of a top kinetic tech trailer (every 10th frame studied)

~72 s of animation at 30 fps, red / black / paper palette, voiced by the creator; on-screen text = the narration. Use this as a pattern library: each row is a reusable beat. Kit names in `code`.

| t (s) | Beat | What happens | Kit |
|---|---|---|---|
| 0–1 | Cold open | Black screen, tiny pulsing red dot, white star streaks start flying out of it | `WarpStreaks`, red dot |
| 1–1.6 | "NO" | Word rushes at camera with radial zoom blur, red glow behind | `ZoomIn from={4}` + `Glow` + `Orb` |
| 1.6–2 | "F***ING" | Hard flip to red bg, word whips in, a white light-saber line slices across | `Red`, `WhipIn`, `Slash` |
| 2–2.6 | "WAY." | Flip to paper, comic speed lines around, red dot as period | `SpeedLines`, `ZoomIn from={0.4}` |
| 2.6–3.3 | Recap stack | NO / F***ING / WAY stacked, middle word red + glitch | `Glitch` |
| 3.3–4.2 | "OKAY," | Letters drop in individually on red, little "HA" words pop in corners | `Letters mode="drop"`, `Pops` |
| 4.2–6 | "OKAY." | Dark bg with red floor glow, bokeh, white word + red period, zoom-blur out | `Dark`, `Orb`, `Bokeh`, `zoomBlur()` |
| 6–8 | "CAN YOU BELIEVE THAT I DID NOT" | Huge stacked lines, camera scrolls vertically, one line outlined, one red | `ScrollStack`, `Outline` |
| 8–8.4 | Cut | Vertical column streak (letters stretched into bars) | `streak()` |
| 8.4–10.3 | "TOUCH AFTER EFFECTS FOR THIS VIDEO?" | Condensed caps, AE timeline window tilts in, cursor clicks keyframes, two red slashes X the window with sparks | `cond`, `Tilt3D`, `TimelineMock`, `Cursor`, `Slash`×2, `Sparks` |
| 10.6–13 | "AND BEFORE YOU ASK" | Paper, stacked left-aligned (small / huge / red), giant red "?" swings in, black "?" and outline "?" follow | `MaskReveal`, rotated "?" |
| 13–13.6 | "NO." | Red, black extruded 3D word with radial lines, heavy shake | `Extrude`, `SpeedLines`, `Camera hits` |
| 13.6–17 | "THIS ISN'T AN MCP" | Dark, word with red underline streak + glitch bars; badge-highlighted keyword; node graph Claude → MCP → After Effects with glowing cables | `Highlight`, `NodeGraph`, `Slash angle 0` |
| 16.7–20 | Logo reveal | Red dot → horizontal lens flare → "THIS" echo stack → "IS" giant black on red → brand logo with sparks, streaks, shockwave, subtitle | `LightStreak`, `Sparks`, `Shockwave`, `Flash`, `Glow` |
| 20.3–21.3 | "YOU TELL CLAUDE" | Paper, diagonal red line slash, words whip in with motion blur | `Slash`, `WhipIn` |
| 21.3–22.5 | "WHAT YOU WANT TO SEE" | Condensed stack left, chat card right typing a prompt | `ChatCard` |
| 22.5–23.5 | Badge | Brand name in a glowing pill, then whips out | `GlowPill` |
| 23.5–25.5 | "TURNS THAT INTO THE ANIMATION" | Filmstrip scrolling + video player with a red shape morphing circle → rotated square; last word huge at bottom | `Filmstrip`, `PlayerMock`, `MorphShape`, `Stretch` |
| 26–27.3 | "ALL YOU NEED IS TO WRITE:" | Dark dot grid, condensed words, red huge "WRITE:" with typing cursor | `MaskReveal`, `ZoomIn` |
| 27.6–31 | Prompt | Glass prompt box flies in tilted, types with highlighted tokens, Enter → radial speed burst | `Tilt3D`, `PromptBox`, `SpeedLines`, `Flash` |
| 31–32 | "KINETIC TYPE" | Red, letters wobble independently | `Wobble` |
| 32–33 | "MORPHING SHAPES" | Circle wipes through words, square morph behind | `MorphShape` |
| 33–34.6 | "3D ELEMENTS" | Paper, rotating red cube next to heavy text | `Cube3D` |
| 34.6–37 | "CAMERA MOVES" | Viewfinder brackets + REC dot; text orbits in 3D; fast horizontal smears | `Viewfinder`, 3D rotate, `WhipIn` |
| 37–40 | "NOW WATCH THE LETTERS STRETCH" | Red dot as letter O; letters drop in separately; "STRETCH" squeezed then snapped with a strike line on red | `Letters`, `Stretch` |
| 40–44 | "and wait for the transition—" | HUD ring with ticks and glowing core; serif italic typewriter; diagonal light sweep flash out | `HudRing`, `Typewriter`, `LightSweep` |
| 44–48 | "ARE YOU F***ING KIDDING ME?!" | Paper, spinning red starburst, heavy stack; font switches to thin condensed; red circle; letters scatter | `Starburst`, `WeightShift`, `Scatter` |
| 48–55 | "THINK ABOUT MAKING THIS THE USUAL WAY: LAYERS, KEYFRAMES, GRAPH EDITOR" | Desaturated AE section: comp grid + rulers, transform box with handles on a word, cursor; layer bars stack; keyframe diamonds pop on lanes; bezier curve with handles draws; echo tower in 3D | `CompGrid`, `TransformBox`, `LayerBars`, `KeyLanes`, `GraphCurve`, `EchoTower` |
| 55–57 | "THEN THE… RENDER." | Paper "THEN THE…"; checkerboard-filled RENDER with progress bar 1 % and ETA 03:00:29 | `CheckerText`, `RenderBar` |
| 57–59 | "HERE?" | Tilted red band slides in, brand logo flashes back | `DiagonalBand` |
| 59–61 | "PROMPT / GENERATE / RENDER" | Terminal chevron + outline word; sparkle + yellow-green gradient word | `TerminalLine`, `Sparkle`, `GradientText` |
| 61–66 | "FROM THE FIRST IDEA TO THE FINAL FRAME" | Ruler with a red dot travelling, light bulb icon, small mono labels + huge words, framed player | `Ruler`, `Bulb` |
| 66.7–68 | "MADE WITH — ONE PROMPT." | Red, small spaced label + giant word; "F" + stretched "UUUUU" | `RepeatStretch` |
| 70–73 | End card | Logo with particles, then cut to talking-head tutorial with word-by-word captions | `Captions` |

## Recurring techniques (apply everywhere)
1. **Every word is an event** — no word sits still on entry: zoom blur, whip smear, drop, stretch.
2. **Background flips on word boundaries** — dark ↔ red ↔ paper; the flip itself reads as a cut.
3. **Motion blur everywhere** — directional on whips, radial on zooms, vertical on scroll moves.
4. **Red as the only accent** — one word, a period, a dot, a line, glow.
5. **Texture on dark** — dot grid + red floor glow + bokeh.
6. **UI mocks as proof** — timeline, prompt box, chat card, node graph, player, render bar.
7. **Narration = text** — the voice reads exactly what is on screen, word-synced.
