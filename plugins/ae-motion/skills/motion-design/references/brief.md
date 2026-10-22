# Brief: check understanding before building

Before you **create or change** a video, run this once per task. One round, one tool call, one click per answer for the user.
It replaces guessing on the expensive decisions; everything else stays your call (director.md).

Skip it only when the user said so in this conversation ("без вопросов", "сразу делай", "no questions", `--fast`):
then print the plan with your assumptions marked and build. Small follow-up edits inside an agreed brief
("сделай шрифт крупнее") need no new brief.

## 1. Say what you understood (2–4 lines, before the questions)

```
Понял так: 15-секундное промо кофейни «Зерно» для Reels. Главное — новая сезонная карта, финал — адрес и CTA.
Предлагаю: тема Playful, бит-лист HOOK → 3 напитка → лого → CTA, ~16 шотов.
```

Name the subject, goal, main message and the ending. This is what the user corrects most often, so make it concrete,
never "делаю видео по вашему запросу".

## 2. Ask in one `AskUserQuestion` call

Up to 4 questions. Each has 2–4 options. **The first option is your recommendation**, marked `(Recommended)`,
filled from the prompt, the mode preset (`modes/<id>.json`) and director.md defaults, so "accept everything" is one click per question.
Pick the questions top-down from the bank below and skip any the prompt already answers. When the prompt answers all of them,
still ask **Direction** (3) — the one that is never obvious from text.

| # | Question | Options to offer | Why it is asked |
|---|---|---|---|
| 1 | **Where will it play?** | 9:16 Reels/TikTok/Shorts · 16:9 YouTube/presentation · 1:1 or 4:5 feed | The frame changes every shot's composition and the text sizes. Changing it later means rebuilding everything. |
| 2 | **How long?** | the mode default (intro 6 s, promo 15 s, explainer 30–45 s) and one shorter, one longer | Length sets the beat count and the script. 15 s and 30 s are different videos, not a trim of each other. |
| 3 | **Direction** | 3 concrete directions, each = theme + 2–3 lexicon names + tempo, e.g. "Kinetic Red: slam + whip pan + impact shake, cuts every 0.4 s"; put the beat list in `preview` | Adjectives ("dynamic", "stylish") mean different things to everyone. Named moves from `references/lexicon.md` don't. This is where most "not what I meant" comes from. |
| 4 | **Sound** | voice-over (TTS, language) + found music · user's own track (beat-sync) · music only · silent | The voice sets shot lengths (a shot = a spoken line), a track sets cuts on beats. Changing sound later re-times the whole edit. |
| 5 | **Assets & words** | "I'll put logo/footage in `public/`" · "build from type and shapes" · "write the copy for me" | Brand names, logos and claims can't be invented. Ask only when the video depends on them. |
| 6 | **Editing an existing video: what must not change?** | timing · music · text · colors (multiSelect) | Prevents "improving" the parts the user already approved. Ask this instead of 2 when the task is a change, not a new video. |

Rules:
- Questions are about the result, never about implementation (no "which easing?", "Remotion or not?").
- Options are specific values, not "other" (the tool adds "Other" itself).
- Write questions and options in the user's language.
- When the user picked moves on the lexicon site (a pasted prompt with `#043`-style ids), those **are** the direction: confirm them, don't re-ask.

## 3. Then build

Fold the answers into the plan from director.md §4 (format · length · theme · fonts · beat list), print it, and build.
After the first stills check (SKILL.md step 6), show 2–3 key frames to the user with the beat list when the render is long (> 30 s of video):
a cheap second checkpoint before the expensive render.
