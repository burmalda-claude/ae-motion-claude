"""PreToolUse(Bash) hook: turn a file download into a permission prompt.

ae-motion promises to ask before every download (licenses, size, network). This makes it deterministic instead of a
model instruction: yt-dlp, and curl/wget writing to a file, get "ask". Everything else passes silently.
Never blocks on its own errors: bad input or an unexpected shape -> exit 0 with no output (the call proceeds normally).
Off switch: AE_MOTION_ALLOW_DOWNLOADS=1.
"""
import json, os, re, sys

def downloads(segment):
    """True when this one command (no ; & | inside) writes a downloaded file."""
    words = segment.split()
    while words and (words[0] in ("sudo", "env", "command", "time") or "=" in words[0]):  # skip prefixes and VAR=x
        words = words[1:]
    if not words:
        return False
    cmd, args = os.path.basename(words[0]), words[1:]
    if cmd in ("yt-dlp", "youtube-dl"):
        return True
    if cmd == "curl":  # writes a file only with -o/-O/--output/--remote-name, also inside short clusters like -LO
        return any(a in ("--output", "--remote-name", "--remote-name-all") or re.fullmatch(r"-[A-Za-z]*[oO][A-Za-z]*", a) for a in args)
    if cmd == "wget":  # saves a file unless it is a dry check or prints to stdout
        return not ("--spider" in args or any(re.fullmatch(r"-[A-Za-z]*O", a) and i + 1 < len(args) and args[i + 1] == "-" or a in ("-qO-", "-O-") for i, a in enumerate(args)))
    return False


def decide(command):
    """Reason string when the command downloads files, else None."""
    if os.environ.get("AE_MOTION_ALLOW_DOWNLOADS") == "1":
        return None
    if not any(downloads(seg) for seg in re.split(r"[;&|()]+|\n", command or "")):
        return None
    return ("ae-motion: this command downloads files. Check the source, license and size before allowing it "
            "(set AE_MOTION_ALLOW_DOWNLOADS=1 to stop these prompts).")


def main():
    try:
        data = json.load(sys.stdin)
        reason = decide(data.get("tool_input", {}).get("command", ""))
    except Exception:  # never get in the way because of our own bug
        return
    if reason:
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "ask", "permissionDecisionReason": reason}}))


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        ask = ['yt-dlp -x "https://youtu.be/x" -o public/music/a.mp3', "cd public && curl -L -o sfx.mp3 https://x/y.mp3",
               "curl -LO https://x/y.mp3", "wget https://x/y.mp3", "npm i && yt-dlp --version", "curl --output a.wav https://x"]
        ask += ["sudo yt-dlp x", "VAR=1 wget https://x -O a.mp3", "/usr/bin/curl -o a https://x"]
        allow = ["curl -s https://api.github.com", "curl -sS https://x | jq .", "npx remotion render Main out/video.mp4",
                 "wget --spider https://x", "wget -qO- https://x", "echo yt-dlpish", "pip install yt-dlp", "grep wget README.md"]
        bad = [c for c in ask if not decide(c)] + [c for c in allow if decide(c)]
        assert not bad, bad
        print("selftest ok")
    else:
        main()
