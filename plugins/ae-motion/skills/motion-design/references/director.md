# Director mode: short prompt → full video

Users write one line ("сделай промо для моей кофейни", "intro for my channel"). Your job is to fill in everything a motion designer would decide. The few decisions that are expensive to get wrong (frame, length, direction, sound) are confirmed with the user first in one round: **run `references/brief.md` before building or changing a video.** Everything else you decide yourself and state in the plan.

## 1. Extract from the prompt

| Field | Look for | Default if absent |
|---|---|---|
| Subject / brand | names, product, channel | generic but specific-sounding copy about the topic |
| Goal | promo, intro, announcement, explainer, ad, meme, recap | promo |
| Platform | reels/shorts/tiktok, youtube, presentation | Reels/TikTok → 1080×1920 if they mention phone/social, else 1920×1080 |
| Length | seconds | intro 5–8 s, promo/ad 15 s, explainer 30–45 s, trailer 20–30 s |
| Vibe | adjectives, reference brands, colors | pick by topic (table below) |
| Language | language of the prompt | on-screen text in the user's language; pick Cyrillic fonts for Russian |
| Assets | logo, footage, photos, music in `public/` | none — build with type + shapes + mock UI |
| Music | track, BPM | no audio; still cut on a virtual 120 BPM grid (15 frames @30fps) so music can be added later |

## 2. Pick the theme by topic

| Topic | Theme (themes.md) |
|---|---|
| AI, tech launch, dev tools, "insane new feature" | Kinetic Red or Neon Cyber |
| SaaS, app, startup | Soft Gradient SaaS or Clean Tech |
| Sport, energy drink, sale, hype | Bold Promo or Acid Hype |
| Fashion, beauty, jewelry, real estate premium | Luxury |
| Music, party, retro, memes | Y2K or Acid Hype |
| Gaming, esports | Neon Cyber or Anime Impact |
| Education, infographic, news | Swiss Minimal |
| Story, documentary, history | Cinematic |
| Programming, terminal, hacking | Terminal |
| Kids, food, cafe, social | Playful |

## 3. Write the script as beats

Kinetic videos are read, not narrated. Turn the message into **beats of 1–4 words**:

- Hook (first 1–2 s): a provocation or big claim. "NO WAY." / "STOP SCROLLING." / "THIS CHANGES EVERYTHING."
- Problem → reveal → proof (features as 2–3 word punches) → name/logo hit → CTA.
- One **accent word** per beat gets the accent color.
- Each beat = one shot. Short beats (1 word) 4–12 frames, phrases 15–30 frames, UI demos 45–90 frames.
- Repeat the hero word 2–3 times through the video in different treatments (slam, glitch, glow logo).

Template for a 15 s promo @30fps (~450 frames, 14–20 shots):
```
HOOK        2–3 shots  × 8–20f   slam / stretch / color flips
SETUP       2 shots    × 20–40f  question or problem, starburst / mask reveal
REVEAL      1 shot     × 40–60f  logo hit: light streak + sparks + glow + flash
PROOF       4–6 shots  × 15–60f  feature words + mock UI (prompt box, timeline, graph, player)
CLIMAX      2–3 shots  × 6–15f   fastest cutting, shakes, glitches
LOGO + CTA  1–2 shots  × 45–60f  calm hold so it can be read
```

## 4. Announce, then build

After the brief, print a compact plan with the answers folded in:
```
Формат: 1080×1920, 30fps, 15 c · Тема: Kinetic Red · Шрифты: Archivo Black + Oswald
Бит-лист: NO WAY → OKAY. → THAT I DID → ... → KATANA (лого) → ONE PROMPT.
```
Then implement with the kit (SKILL.md), render stills of 3–4 key frames, check them visually, fix, then render the video.

## 5. "Make it better than the prompt"

Always add what the user didn't think to ask for: grain + vignette, camera push/shake, motion blur on fast moves, at least two shot types besides plain text (UI mock, shape, 3D, particles), a logo hit moment, and a held final frame. Never ship a video where every shot is the same animation.
