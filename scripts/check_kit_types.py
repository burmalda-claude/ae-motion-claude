"""Typecheck the Remotion kit and examples the way a user's project holds them (src/kit, src/examples), strict mode.

  cd ci/kit-typecheck && npm ci && cd ../.. && python scripts/check_kit_types.py

The only tolerated errors are imports of files that exist in a user's project but not here: the JSON that
tools/build.py and tools/transplan.py generate (timeline*.json, *-plan.json) and the user's own asset module (./Ficus).
"""
import re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "plugins" / "ae-motion" / "skills" / "motion-design"
PROJ = ROOT / "ci" / "kit-typecheck"
ALLOWED = re.compile(r"error TS2307: Cannot find module '\./(timeline[\w-]*\.json|[\w-]+-plan\.json|sfx-wave\.json|Ficus)'")


def main():
    if not (PROJ / "node_modules" / "typescript").exists():
        sys.exit("run `npm ci` in ci/kit-typecheck first")
    src = PROJ / "src"
    shutil.rmtree(src, ignore_errors=True)
    shutil.copytree(SKILL / "kit", src / "kit")
    shutil.copytree(SKILL / "examples", src / "examples", ignore=shutil.ignore_patterns("*.json", "*.py", "*.md"))
    r = subprocess.run(["npx", "--no-install", "tsc", "-p", "."], cwd=PROJ, capture_output=True, text=True, shell=sys.platform == "win32")
    errors = [l for l in r.stdout.splitlines() if "error TS" in l]
    real = [l for l in errors if not ALLOWED.search(l)]
    print(f"tsc: {len(errors)} errors, {len(errors) - len(real)} expected (generated JSON / user assets), {len(real)} real")
    print("\n".join(real))
    sys.exit(1 if real or (r.returncode and not errors) else 0)


if __name__ == "__main__":
    main()
