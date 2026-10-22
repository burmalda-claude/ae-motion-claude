"""Docs ↔ code consistency (CI). Offline, no dependencies.

  python scripts/check_docs.py

1. Every `/ae-motion:<name>` mentioned in READMEs, SKILL.md, commands, agents, references and the site is a real command
   (commands/<name>.md). Catches stale names such as the removed trans-* aliases.
2. Every backticked plugin path (`references/x.md`, `tools/x.py`, `modes/x.json`, `kit/x.tsx`, `examples/X.tsx`,
   `lexicon/…`) exists in the skill folder.
3. Relative links in markdown files and local src/href in docs/*.html resolve to files.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = ROOT / "plugins" / "ae-motion"
SKILL = PLUGIN / "skills" / "motion-design"
# Old names that docs may mention on purpose (the migration notes), never as a live command.
RETIRED = {"trans-clean", "trans-dissolve", "trans-wipe", "trans-glitch", "trans-morph", "trans-speedramp", "trans-beat", "trans-edit", "trans-random"}
MIGRATION_FILES = {"CHANGELOG.md"}


def texts():
    files = [*ROOT.glob("*.md"), *PLUGIN.rglob("*.md"), *(ROOT / "docs").glob("*.html"), *(ROOT / "docs").glob("*.js")]
    return {p: p.read_text(encoding="utf-8") for p in files if "vendor" not in p.parts and "node_modules" not in p.parts}


def check():
    errors = []
    commands = {p.stem for p in (PLUGIN / "commands").glob("*.md")}
    for p, t in texts().items():
        rel = p.relative_to(ROOT)
        for name in set(re.findall(r"/ae-motion:([a-z][a-z0-9]*(?:-[a-z0-9]+)*)", t)):
            if name not in commands and not (name in RETIRED and p.name in MIGRATION_FILES):
                errors.append(f"{rel}: /ae-motion:{name} is not a command")
        if p.suffix == ".md":
            for path in set(re.findall(r"`((?:references|tools|modes|kit|examples|lexicon)/[\w./-]+\.(?:md|py|json|tsx?|txt))`", t)):
                if not (SKILL / path).exists():
                    errors.append(f"{rel}: `{path}` does not exist in skills/motion-design/")
            for link in re.findall(r"\]\((?!https?:|#|mailto:)([^)\s]+)\)", t):
                if not (p.parent / link.split("#")[0]).exists():
                    errors.append(f"{rel}: broken link ({link})")
        if p.suffix == ".html":
            for ref in re.findall(r'(?:src|href)="(?!https?:|#|data:|mailto:)([^"]+)"', t):
                if not (p.parent / ref).exists():
                    errors.append(f"{rel}: missing local file {ref}")
    return errors


if __name__ == "__main__":
    errs = check()
    print("\n".join(errs) or "docs ok: commands, plugin paths and local links resolve")
    sys.exit(1 if errs else 0)
