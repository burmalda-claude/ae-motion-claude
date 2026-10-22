---
description: "Keep a head in the centre of the frame: track it through the video, move the video under it, wrap the picture around the edges instead of showing black."
argument-hint: "<video, whose head, repeat|mirror, zoom, optional>"
---

1) Sheet: `python tools/headtrack.py <video> --sheet head_sheet.jpg` — finds every cut (1-frame impact inserts count as shots) and saves the middle frame of each shot with a 0..1 grid. It prints the frame numbers to give boxes for.
2) Look at the sheet. For every shot with the head, read its box on the grid (`x,y,w,h`, 0..1 of the frame; just the head, not the body). If several people are in the shot, take the one the user named (by default the one who talks or is biggest).
3) Track: `python tools/headtrack.py <video> --box <frame>:x,y,w,h --box ... --out src/head.json`. Shots listed as "missing" have no box and stay centred. Track the same file you render: re-encoding can change frame order.
4) Compose: `<HeadLock src={staticFile("video/clip.mp4")} track={head} startFrom={…} />` from `kit/headlock.tsx`. `startFrom` is in composition frames; `zoom` > 1 crops in; `mirror` flips neighbouring tiles so the edges meet without a seam; `follow` 0..1 softens the lock; `at={[x, y]}` holds the head somewhere other than the centre.
5) Check stills (`npx remotion still … --frame=N`): the head must sit on the centre in every shot, the edges must show the wrapped picture, never black.

Rules: the video is never scaled below "cover", so a wrapped copy, not black, fills what the move uncovers. Hard cuts stay hard: tracking and smoothing never cross a cut.

Request: $ARGUMENTS
