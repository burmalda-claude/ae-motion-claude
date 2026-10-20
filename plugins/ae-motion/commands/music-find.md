---
description: "Find real music online for the video (genre by topic: phonk for edits etc.), download with permission, fit the edit to it."
argument-hint: "<description / genre / file>"
---

Follow `references/music.md`: pick genre + search words from the topic and mood (edits → Brazilian/drift phonk, sad → slowed+reverb, anime → phonk/jcore, space → epic trailer…), WebSearch, shortlist 3–5 tracks (title, artist, link, length, why), **ask before downloading** (file, source, size), `yt-dlp -x --audio-format mp3` into `public/music/`, log in `CREDITS.md`, run `tools/beats.py`, set `musicFile` + `musicStart` (1–2 bars before the drop) in script.json, cut on `hits`. Licensing is the user's call — don't refuse, mention it in one line.

Request: $ARGUMENTS
