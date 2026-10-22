"""Environment doctor (/ae-motion:doctor): is this machine and this Remotion project ready for ae-motion?

  python doctor.py [project_dir] [--json]     default project_dir: current directory
  python doctor.py --selftest

Read-only: imports nothing heavy, changes no files, makes no network calls, never prints secret values.
Exit 1 when something blocking is missing (✖), 0 otherwise (warnings ! and info · do not fail).
"""
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
KIT = TOOLS.parent / "kit"
CORE = {"numpy": "numpy", "scipy": "scipy", "librosa": "librosa", "edge_tts": "edge-tts", "imageio_ffmpeg": "imageio-ffmpeg"}
EXTRA = {"faster_whisper": ("faster-whisper", "modes on your own media: lyric, clip, reaction, gaming"),
         "cv2": ("opencv-python-headless", "/ae-motion:trans-learn")}
OK, WARN, FAIL, INFO = "ok", "warn", "fail", "info"


def has(module):
    try:
        return importlib.util.find_spec(module) is not None
    except (ImportError, ValueError):
        return False


def version(cmd):
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=10).stdout.strip()
        return out.splitlines()[0] if out else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def digest(p):
    return hashlib.sha256(p.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def check_system():
    out = []
    v = sys.version_info
    out.append((OK if v >= (3, 10) else FAIL, "Python", f"{v.major}.{v.minor}.{v.micro}", "install Python 3.10+"))
    missing = [pkg for mod, pkg in CORE.items() if not has(mod)]
    out.append((FAIL if missing else OK, "Python packages (core)", "missing: " + ", ".join(missing) if missing else "all present",
                f'pip install -r "{TOOLS / "requirements.txt"}"'))
    for mod, (pkg, what) in EXTRA.items():
        out.append((OK if has(mod) else INFO, f"{pkg} (optional)", "present" if has(mod) else f"absent, needed for {what}", f"pip install {pkg}"))
    ytdlp = shutil.which("yt-dlp") or has("yt_dlp")
    out.append((OK if ytdlp else INFO, "yt-dlp (optional)", "present" if ytdlp else "absent, needed to download music in /ae-motion:music-find", "pip install yt-dlp"))
    node = version(["node", "--version"])
    major = int(re.match(r"v(\d+)", node).group(1)) if node and re.match(r"v(\d+)", node) else 0
    out.append((OK if major >= 18 else FAIL, "Node.js", node or "not found", "install Node.js 18+ (https://nodejs.org)"))
    out.append((OK if shutil.which("npx") else FAIL, "npx", "present" if shutil.which("npx") else "not found", "comes with npm / Node.js"))
    out.append((INFO, "ElevenLabs key (optional)", "set" if __import__("os").environ.get("ELEVENLABS_API_KEY") else "not set: AI SFX fall back to procedural",
                "export ELEVENLABS_API_KEY=… (never commit it)"))
    return out


def check_project(root):
    root = Path(root)
    pkg = root / "package.json"
    if not pkg.exists():
        return [(INFO, "Remotion project", f"none in {root}", "Claude creates one on the first video (npx create-video@latest)")]
    try:
        deps = {**json.loads(pkg.read_text()).get("dependencies", {}), **json.loads(pkg.read_text()).get("devDependencies", {})}
    except (json.JSONDecodeError, UnicodeDecodeError):
        return [(FAIL, "package.json", "not valid JSON", "fix package.json")]
    out = [(OK if "remotion" in deps else WARN, "Remotion project", f"remotion {deps['remotion']}" if "remotion" in deps else "package.json has no remotion dependency",
            "npm i remotion @remotion/cli")]
    if "remotion" not in deps:
        return out
    out.append(remotion_security(root, deps["remotion"]))
    need = ["@remotion/google-fonts", "@remotion/transitions", "@remotion/noise", "@remotion/paths", "@remotion/layout-utils"]
    miss = [d for d in need if d not in deps]
    out.append((WARN if miss else OK, "Remotion add-ons used by the kit", "missing: " + ", ".join(miss) if miss else "all present", "npx remotion add " + " ".join(miss or need)))
    kit = root / "src" / "kit"
    if not kit.is_dir():
        out.append((WARN, "kit in project", "src/kit/ not found", f'copy "{KIT}" to src/kit/'))
    else:
        stale = [p.name for p in KIT.glob("*.ts*") if not (kit / p.name).exists() or digest(kit / p.name) != digest(p)]
        out.append((WARN if stale else OK, "kit in project", "differs from the plugin's kit: " + ", ".join(sorted(stale)) if stale else "matches the plugin",
                    f'copy "{KIT}" over src/kit/ (keep your own edits elsewhere)'))
    ts = root / "tsconfig.json"
    if ts.exists():
        text = re.sub(r"//[^\n]*|/\*.*?\*/", "", ts.read_text(), flags=re.S)
        rjm = '"resolveJsonModule": true' in re.sub(r"\s+", " ", text).replace('"resolveJsonModule" :', '"resolveJsonModule":')
        out.append((OK if rjm else WARN, "tsconfig resolveJsonModule", "on" if rjm else "off: timeline.json imports will fail", 'set "resolveJsonModule": true in tsconfig.json'))
    return out


SAFE_REMOTION = (4, 0, 410)  # GHSA-2jqp-f4gr-44fr (RCE) and GHSA-g6pc-6676-c23j (arbitrary file write) affect < 4.0.410


def remotion_security(root, declared):
    """Installed version wins over the declared range; a range's floor is what a fresh install may still resolve to."""
    installed = Path(root) / "node_modules" / "remotion" / "package.json"
    try:
        ver = json.loads(installed.read_text())["version"] if installed.exists() else declared
    except (json.JSONDecodeError, KeyError, UnicodeDecodeError):
        ver = declared
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", ver)
    if not m:
        return (WARN, "Remotion security", f"cannot read version '{ver}'", "npx remotion upgrade")
    v = tuple(int(x) for x in m.groups())
    if v < SAFE_REMOTION:
        return (FAIL, "Remotion security", f"{ver} < 4.0.410: critical RCE and file-write advisories (GHSA-2jqp-f4gr-44fr, GHSA-g6pc-6676-c23j)", "npx remotion upgrade")
    return (OK, "Remotion security", f"{ver} has the 4.0.410 fixes", "")


def report(rows, as_json=False):
    if as_json:
        print(json.dumps([dict(zip(("status", "check", "detail", "fix"), r)) for r in rows], ensure_ascii=False, indent=2))
    else:
        mark = {OK: "✔", WARN: "!", FAIL: "✖", INFO: "·"}
        for st, name, detail, fix in rows:
            print(f"{mark[st]} {name}: {detail}" + (f"\n    → {fix}" if st in (WARN, FAIL) else ""))
        n = {s: sum(r[0] == s for r in rows) for s in (FAIL, WARN)}
        print(f"\n{n[FAIL]} blocking, {n[WARN]} warnings")
    return 1 if any(r[0] == FAIL for r in rows) else 0


def selftest():
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        assert check_project(d)[0][0] == INFO  # no project: info, not a failure
        (d / "package.json").write_text(json.dumps({"dependencies": {"remotion": "4.0.0"}}))
        (d / "src" / "kit").mkdir(parents=True)
        for p in KIT.glob("*.ts*"):
            (d / "src" / "kit" / p.name).write_bytes(p.read_bytes())
        (d / "src" / "kit" / "easing.ts").write_text("// edited\n")
        (d / "tsconfig.json").write_text('{ // c\n "compilerOptions": { "resolveJsonModule" : true } }')
        rows = {r[1]: r for r in check_project(d)}
        assert rows["kit in project"][0] == WARN and "easing.ts" in rows["kit in project"][2], rows["kit in project"]
        assert rows["Remotion add-ons used by the kit"][0] == WARN and rows["tsconfig resolveJsonModule"][0] == OK
        assert rows["Remotion security"][0] == FAIL  # 4.0.0 is vulnerable
        (d / "package.json").write_text(json.dumps({"dependencies": {"remotion": "^4.0.537"}}))
        assert {r[1]: r for r in check_project(d)}["Remotion security"][0] == OK
        (d / "node_modules" / "remotion").mkdir(parents=True)
        (d / "node_modules" / "remotion" / "package.json").write_text('{"version": "4.0.300"}')
        assert {r[1]: r for r in check_project(d)}["Remotion security"][0] == FAIL  # installed version wins over the range
        (d / "package.json").write_text("{nope")
        assert check_project(d)[0][0] == FAIL
    assert all(r[0] in (OK, WARN, FAIL, INFO) for r in check_system())
    print("selftest ok")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    sys.exit(report(check_system() + check_project(args[0] if args else "."), "--json" in sys.argv))
