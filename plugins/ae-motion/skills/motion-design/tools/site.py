"""Plugin catalog for the docs/ site: modes, commands, kit, transitions, sound, themes, fonts — read from the plugin's own files.

  python site.py            write docs/plugin.json and render missing sound previews to docs/sfx/*.mp3 (needs ffmpeg)
  python site.py --check    fail if docs/plugin.json or a restyled pack is stale, or a sound preview is missing
  python site.py --selftest check the house-style colour mapping

Runs from the repo (docs/ next to plugins/). The lexicon tab has its own generator: tools/lexicon.py.
"""
import hashlib, json, re, subprocess, sys, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lexicon as L  # noqa: E402

SKILL = L.SKILL
PLUGIN = SKILL.parents[1]
DOCS = L.DOCS
REF = SKILL / "references"


def frontmatter(p):
    m = re.match(r"---\n(.*?)\n---", p.read_text(), re.S)
    return dict(re.findall(r'^([\w-]+):\s*"?(.*?)"?\s*$', m.group(1), re.M)) if m else {}


def md_tables(text):
    """Every markdown table as a list of {header: cell} rows."""
    out = []
    for block in re.findall(r"((?:^\|.*\|\s*$\n?){3,})", text, re.M):
        rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in block.strip().split("\n")]
        out.append([dict(zip(rows[0], r)) for r in rows[2:]])
    return out


# ---------------------------------------------------------------- sections
def commands():
    out = []
    for p in sorted((PLUGIN / "commands").glob("*.md")):
        fm, n = frontmatter(p), p.stem
        group = ("mode" if (SKILL / "modes" / f"{n}.json").exists() else "transition" if n.startswith("trans")
                 else "sound" if n.startswith(("sfx", "music")) else "start")
        out.append({"name": n, "group": group, "description": fm.get("description", ""), "hint": fm.get("argument-hint", "")})
    return out


def kit():
    out = []
    for f in sorted((SKILL / "kit").glob("*.ts*")):
        for doc, kind, name in re.findall(r"(?:/\*\*\s*((?:(?!\*/)[\s\S])*?)\s*\*/\s*)?export (const|function) (\w+)", f.read_text()):
            doc = re.sub(r"\s*\n\s*\*?\s*", " ", doc).strip()
            role = "component" if name[0].isupper() and not name.isupper() and "_" not in name else "helper"
            out.append({"name": name, "file": f.name, "doc": doc, "role": role})
    return out


def cuts(sfx_files):
    import sfxgen as G
    text = (SKILL / "kit" / "cuts.tsx").read_text()
    cat = dict(re.findall(r'^\s*(\w+): "(\w+)",', text[text.index("CUT_CATEGORY"):text.index("CUT_FRAMES")], re.M))
    frames = dict(re.findall(r"^\s*(\w+): (\d+),", text[text.index("export const CUT_FRAMES"):], re.M))
    use = {}
    for table in md_tables((REF / "transitions.md").read_text()):
        for row in table:
            first = list(row.values())[0]
            for k in re.findall(r"`(\w+)`", first):
                use.setdefault(k, row)
    _, kinds = L.kit_names()
    order = re.findall(r'\|\s*"(\w+)"', text[text.index("export type CutKind"):text.index("export const CUT_CATEGORY")])
    out = []
    for k in order:
        row = use.get(k, {})
        out.append({"kind": k, "category": cat.get(k, ""), "frames": int(frames.get(k, 0)),
                    "use": next((v.replace("**", "") for h, v in row.items() if h.lower().startswith(("use", "when", "what"))), ""),
                    "ease": next((v for h, v in row.items() if "ease" in h.lower()), ""),
                    "layers": G.LAYERS.get(k, []), "sound": sfx_files.get(f"layer:{k}")})
    return out


def themes():
    out = []
    for n, name, body in re.findall(r"^## (\d+)\. (.+?)\n(.*?)(?=^## |\Z)", (REF / "themes.md").read_text(), re.S | re.M):
        field = lambda k: (re.search(rf"^- {k}: (.*)$", body, re.M) or [None, ""])[1]
        pal = field("Palette")
        swatches = [{"label": (lbl or "").strip(" ,/").split()[-1] if lbl.strip(" ,/") else "", "hex": h}
                    for lbl, h in re.findall(r"([\w\s]*?)`(#[0-9A-Fa-f]{6})`", pal)]
        out.append({"n": int(n), "name": name, "palette": swatches, "paletteText": re.sub(r"`", "", pal),
                    "fonts": field("Fonts"), "motion": re.sub(r"`", "", field("Motion"))})
    return out


def fonts():
    rows = md_tables((REF / "fonts.md").read_text())[0]
    return [{"style": r["Style"], "headline": r["Headline"], "body": r["Body / UI"], "cyr": r["Cyr"]} for r in rows]


def font_families(font_rows):
    """Google font family names the site can load for specimens."""
    fam = set()
    for r in font_rows:
        cyr = r["cyr"].split("Cyr:", 1)[1] if "Cyr:" in r["cyr"] else ""  # the Cyr column names fonts only after "Cyr:"
        for cell in (r["headline"], r["body"], cyr):
            for part in re.split(r"[/,()]|Cyr:", cell):
                name = re.sub(r"\b(\d{3}(?:[–-]\d{3})?|italic|accents|only|yes|no|—)\b", "", part).strip(" .:")
                if name and name[0].isupper():
                    fam.add(name)
    return sorted(fam)


def sound_catalog():
    """Spec list for previews: every kind of every category, the genre packs, and each transition's layer stack."""
    import sfxgen as G
    kinds = {
        "whoosh": ["whoosh:len=10f,dir=LR,tone=bright,weight=light", "whoosh:len=14f,tone=dark,weight=heavy", "whoosh:len=8f,dir=UP,tone=bright,weight=heavy", "whoosh:len=12f,reverse=1"],
        "impact": [f"impact:kind={k}" for k in "snare boom sub glass metal".split()],
        "riser": [f"riser:len=1.5s,kind={k}" for k in "tonal noise reverse uplifter downlifter".split()],
        "ambience": [f"ambience:kind={k},len=4s" for k in "room office street forest coffee rain wind".split()],
        "ui": [f"ui:kind={k}" for k in "click tap toggle notification hover typing digital".split()],
        "trans": [f"trans:kind={k}" for k in "glitch_burst reverse_impact tape_stop sub_drop whiteout".split()],
        "trend": [f"trend:kind={k}" for k in "vine_boom boing record_scratch wasted get_out phonk_808 distorted_hit cowbell electric_burst tesla_arc corrupted scifi_whoosh hook_click hook_ding hook_pop hook_whoosh".split()],
        "asmr": [f"asmr:kind={k}" for k in "soft_click rustle wet".split()],
    }
    sfx_rows = {r["Category"]: r for r in md_tables((REF / "sfx.md").read_text())[0]}
    cats = []
    for cat, specs in kinds.items():
        row = next((r for r in sfx_rows.values() if r["Spec"].strip("`").startswith(cat + ":")), {})
        cats.append({"id": cat, "name": row.get("Category", cat), "spec": row.get("Spec", "").strip("`"), "params": row.get("Params", "").replace("`", ""), "specs": specs})
    packs = {k: v for k, v in G.PACKS.items()}
    all_specs = {s for c in cats for s in c["specs"]} | {s for v in packs.values() for s in v if ":" in s}
    return cats, packs, sorted(all_specs) + [f"layer:{k}" for k in G.LAYERS]


def fname(spec):
    return "sfx/" + re.sub(r"[^a-z0-9]+", "-", spec.lower()).strip("-")[:48] + "-" + hashlib.md5(spec.encode()).hexdigest()[:6] + ".mp3"


def render_layer(G, kind):
    """Mix a transition's layer stack the way the engine places it: whooshes/risers end on the cut, impacts start on it."""
    import numpy as np
    parts = [(G.render(s), off) for s, off in G.layer(kind)]
    cut = max([len(x) for x, off in parts if off == "end"] + [int(0.15 * G.SR)])
    n = cut + max([len(x) for x, off in parts if off != "end"] + [0])
    mix = np.zeros((n, 2))
    for x, off in parts:
        start = cut - len(x) if off == "end" else cut
        mix[start:start + len(x)] += x
    return mix / max(1e-9, np.abs(mix).max()) * 0.9


def render_sounds(specs, check):
    import sfxgen as G, sound as S
    files, missing = {}, []
    for spec in specs:
        rel = fname(spec)
        files[spec] = rel
        out = DOCS / rel
        if out.exists():
            continue
        if check:
            missing.append(rel)
            continue
        x = render_layer(G, spec[6:]) if spec.startswith("layer:") else G.render(spec)
        out.parent.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "x.wav"
            S.write_wav(str(wav), x)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-ac", "2", "-b:a", "96k", str(out)], check=True)
        print("rendered", rel)
    return files, missing


# ---------------------------------------------------------------- house style for the motion-prompt samples
# Edit-bay look: graphite neutrals, four accents (keyframe amber, red, teal, cream), the site's fonts.
# Light packs are inverted to dark. photo is left alone: its colours are the subject (teal & orange, duotone, b/w).
STYLE_PACKS = {"motion": "dark", "motion2": "dark", "camera": "light", "ui": "light", "lp": "light"}
ACCENTS = [(20, "#FF4D5E"), (70, "#F2A93B"), (180, "#F4EDE0"), (330, "#3FD0C9"), (360, "#FF4D5E")]  # (hue upper bound, colour)
STAGE, SURFACE = "#121419", "#232730"
FONTS = {"DISP": '"IBM Plex Sans", "Avenir Next", system-ui, sans-serif', "EN": '"IBM Plex Sans", "Helvetica Neue", system-ui, sans-serif',
         "NUMF": '"JetBrains Mono", ui-monospace, monospace', "MONO": '"JetBrains Mono", ui-monospace, Menlo, monospace'}


def _rgb(h):
    h = h.lstrip("#")
    h = "".join(c * 2 for c in h) if len(h) == 3 else h
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def _hex(rgb):
    return "#" + "".join(f"{round(max(0, min(1, c)) * 255):02X}" for c in rgb)


def _mix(a, b, t):
    return [x + (y - x) * t for x, y in zip(_rgb(a), _rgb(b))]


def restyle_color(h, tone):
    import colorsys
    r, g, b = _rgb(h)
    hue, light, sat = colorsys.rgb_to_hls(r, g, b)
    if sat < 0.25 or (tone == "dark" and light < 0.35):  # neutral (navy counts as neutral): graphite ramp, inverted for light packs
        lv = light if tone == "dark" else (1 - light) ** 0.6  # gamma spreads the many near-white UI greys apart once they turn dark
        return _hex(colorsys.hls_to_rgb(0.61, 0.07 + lv * 0.86, 0.12))
    accent = next(c for top, c in ACCENTS if hue * 360 < top)
    if light > 0.75:  # pale tint (selected row, soft badge): accent-tinted surface
        return _hex(_mix(SURFACE, accent, 0.12 + (1 - light) / 0.25 * 0.4 if tone == "light" else 0.75))  # paler original = fainter tint
    return accent


def restyle_pack(src, pack):
    tone = STYLE_PACKS[pack]
    rgba = lambda m: m.group(0) if m.group(4) and {m.group(1), m.group(2), m.group(3)} <= {"0", "255"} else (  # keep black/white overlays
        "rgba({},{},{},{})".format(*[round(c * 255) for c in _rgb(restyle_color("#%02x%02x%02x" % tuple(int(m.group(i)) for i in (1, 2, 3)), tone))], m.group(4)) if m.group(4)
        else restyle_color("#%02x%02x%02x" % tuple(int(m.group(i)) for i in (1, 2, 3)), tone))
    src = re.sub(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![0-9A-Fa-f])", lambda m: restyle_color(m.group(0), tone), src)
    src = re.sub(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)", rgba, src)
    for const, stack in FONTS.items():
        src = re.sub(rf"const {const} = '[^']*'", f"const {const} = '{stack}'", src)
    src = src.replace(f"MotionPrompt.pack('{pack}'", f"MotionPrompt.pack('ae:{pack}'", 1)
    return f"/* ae-motion house style of motion-prompt pack \"{pack}\" — generated by tools/site.py, do not edit. Original: ../motion-prompt/{pack}.js (MIT, Shohei Ohtaki) */\n" + src


def restyled():
    out = {}
    for pack in STYLE_PACKS:
        src = (DOCS / "vendor" / "motion-prompt" / f"{pack}.js").read_text()
        assert f"MotionPrompt.pack('{pack}'" in src, pack
        out[DOCS / "vendor" / "ae-style" / f"{pack}.js"] = restyle_pack(src, pack)
    return out


def build(check=False):
    items = L.load()
    L.validate(items)
    cats, packs, specs = sound_catalog()
    files, missing = render_sounds(specs, check)
    font_rows = fonts()
    k = kit()
    for c in k:  # cross-links: which lexicon names and modes use this piece
        c["lexicon"] = [it["id"] for it in items if c["name"] in {x.lstrip("~").split(":")[0] for x in it["kit"]}]
    modes = []
    for p in sorted((SKILL / "modes").glob("*.json")):
        m = json.loads(p.read_text())
        m["effectsKit"] = [re.match(r"\w+", e).group(0) for e in m.get("effects", []) if re.match(r"\w+", e)]
        modes.append(m)
    for c in k:
        c["modes"] = [m["id"] for m in modes if c["name"] in m["effectsKit"]]
    for c in cats:
        c["files"] = [files[s] for s in c["specs"]]
    data = {
        "version": json.loads((PLUGIN / ".claude-plugin" / "plugin.json").read_text())["version"],
        "modes": modes, "commands": commands(), "kit": k, "cuts": cuts(files), "themes": themes(),
        "fonts": font_rows, "families": font_families(font_rows),
        "sfx": {"categories": cats, "packs": {n: [{"spec": s, "file": files.get(s)} for s in v] for n, v in packs.items()}},
    }
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")), missing


def selftest():
    assert restyle_color("#0F1A3D", "dark") == restyle_color("#0F1A3D", "dark") and _rgb(restyle_color("#0F1A3D", "dark"))[0] < 0.25  # navy -> dark graphite
    assert _rgb(restyle_color("#FFFFFF", "light"))[0] < 0.15 and _rgb(restyle_color("#111111", "light"))[0] > 0.8  # light packs invert
    assert restyle_color("#FF6B5C", "dark") == "#FF4D5E" and restyle_color("#FFC83D", "dark") == "#F2A93B" and restyle_color("#3B7BFF", "dark") == "#3FD0C9"
    src = "MotionPrompt.pack('motion', () => { const DISP = 'x'; k.fillStyle = 'rgba(0,0,0,.3)'; c = 'rgba(59,123,255,0.5)'; d = '#fff'; })"
    out = restyle_pack(src, "motion")
    assert "ae:motion" in out and "IBM Plex Sans" in out and "rgba(0,0,0,.3)" in out and "rgba(63,208,201,0.5)" in out and "'#fff'" not in out
    print("selftest ok")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    if not DOCS.is_dir():
        sys.exit("docs/ not found: run from the repository, not an installed plugin")
    check = "--check" in sys.argv
    text, missing = build(check)
    out = DOCS / "plugin.json"
    styled = restyled()
    if check:
        stale = not out.exists() or out.read_text() != text or any(not p.exists() or p.read_text() != t for p, t in styled.items())
        sys.exit(f"stale: plugin.json={stale}, missing sounds={missing}" if stale or missing else print("site ok: plugin.json fresh, all sounds present"))
    out.write_text(text)
    for p, t in styled.items():
        p.parent.mkdir(exist_ok=True)
        p.write_text(t)
    d = json.loads(text)
    assert len(d["modes"]) == 18 and len(d["themes"]) == 14 and len(d["cuts"]) >= 30 and len(d["kit"]) > 100, "catalog looks incomplete"
    print(f"wrote {out}: {len(d['modes'])} modes, {len(d['commands'])} commands, {len(d['kit'])} kit exports, {len(d['cuts'])} cuts, {len(d['themes'])} themes, {len(d['fonts'])} font pairs")
