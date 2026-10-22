"""Plugin catalog for the docs/ site: modes, commands, kit, transitions, sound, themes, fonts — read from the plugin's own files.

  python site.py            write docs/plugin.json and render missing sound previews to docs/sfx/*.mp3 (needs ffmpeg)
  python site.py --check    fail if docs/plugin.json is stale or a sound preview is missing

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


if __name__ == "__main__":
    if not DOCS.is_dir():
        sys.exit("docs/ not found: run from the repository, not an installed plugin")
    check = "--check" in sys.argv
    text, missing = build(check)
    out = DOCS / "plugin.json"
    if check:
        stale = not out.exists() or out.read_text() != text
        sys.exit(f"stale: plugin.json={stale}, missing sounds={missing}" if stale or missing else print("site ok: plugin.json fresh, all sounds present"))
    out.write_text(text)
    d = json.loads(text)
    assert len(d["modes"]) == 18 and len(d["themes"]) == 14 and len(d["cuts"]) >= 30 and len(d["kit"]) > 100, "catalog looks incomplete"
    print(f"wrote {out}: {len(d['modes'])} modes, {len(d['commands'])} commands, {len(d['kit'])} kit exports, {len(d['cuts'])} cuts, {len(d['themes'])} themes, {len(d['fonts'])} font pairs")
