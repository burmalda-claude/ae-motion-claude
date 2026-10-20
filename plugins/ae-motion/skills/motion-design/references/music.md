# Finding music on the internet (default for edits)

Real tracks beat generated beds. Generated music (`musicStyle`) is only the fallback when the user says "no download" or there is no internet.

## 1. Pick the genre by topic and mood
| Video / topic | Genre | Search words that work |
|---|---|---|
| Hype edit, sport, gym, sigma, cars | **Brazilian phonk / funk** (cowbell, distorted 808, 125–135 BPM) | `brazilian phonk`, `funk phonk`, `montagem`, `phonk tiktok edit audio` |
| Dark / drift / villain edit | **Drift phonk / dark phonk** (90–110 or 160–170 BPM) | `drift phonk`, `dark phonk`, `memphis phonk`, `villain edit audio` |
| Sad / emotional / aesthetic edit | **slowed + reverb**, sad phonk, lofi | `slowed reverb edit audio`, `sad phonk`, `<song> slowed` |
| Anime AMV / fight | phonk, jcore, anime OP remix, hardstyle | `anime edit audio`, `jcore`, `hardstyle phonk`, `<anime> OP remix` |
| Gacha / vtuber / cute | hyperpop, kawaii future bass, jcore | `hyperpop edit audio`, `kawaii future bass`, `nightcore` |
| Space / cinematic / trailer | epic trailer, orchestral hybrid, dark ambient | `epic trailer music`, `cinematic hybrid trailer`, `interstellar style` |
| Horror / creepy | dark ambient, horror phonk, distorted drones | `horror phonk`, `creepy ambient`, `analog horror music` |
| Meme / shitpost | the meme sound itself + funny phonk | `<meme> sound`, `funny phonk` |
| Product / ad / tutorial | upbeat corporate, lofi, chill house | `upbeat corporate`, `lofi hip hop instrumental` |
| Vlog / travel | chill house, lofi, indie | `chill house travel`, `lofi travel` |
| Cars specifically | phonk, trap, drift phonk | `car edit phonk`, `drift phonk` |

Measured on 28 reference edits: median 123 BPM (108–144), double-time phonk at 160–172; sub-bass ≈ 45 % of the spectrum; loud and limited.

## 2. Search
1. WebSearch: `<genre words> <mood> tiktok edit audio 2026` and `<genre> trending tiktok`. Prefer results from YouTube, SoundCloud, TikTok sound pages, Pixabay Music.
2. Shortlist 3–5 tracks with: title, artist, link, length, why it fits (genre, energy, has a clear drop). Show the list to the user.
3. If the user named a track or artist — search exactly that first.

## 3. Download (always ask first)
- Before each download say: **file name, source link, approximate size**, and wait for "yes". Never download without it.
- Tool: `yt-dlp -x --audio-format mp3 -o "public/music/%(title)s.%(ext)s" <url>` (`pip install yt-dlp`; needs ffmpeg — use `imageio_ffmpeg.get_ffmpeg_exe()` via `--ffmpeg-location`).
- Put the file in `public/music/`. Note the source in `CREDITS.md` of the project (title, artist, link).
- Licensing is the user's call (TikTok "contains: …" credit). Do not refuse a track because of its license; do mention in one line if it is clearly copyrighted.

## 4. Fit the edit to the track
1. `python tools/beats.py public/music/<track>.mp3 .` → `src/beats.json` (bpm, beats, downbeats, hits, energy).
2. Find the drop: the first downbeat where energy jumps (> 0.6 after < 0.4). Start the edit 1–2 bars before it (`"musicStart": <seconds>` in script.json).
3. Cut on `hits` (transients) for ~half the cuts, on `downbeats` for scene changes, whiteout flashes on the strongest hits, black dip before the last drop.
4. In `script.json`: `"musicFile": "public/music/<track>.mp3", "musicStart": 12.3, "musicGain": 0.9` — build.py uses it instead of the generated bed, ducks it under voice, masters the whole mix.
5. Edit length = whole number of bars (4 beats) so it ends on a hit or a reverb tail.
