---
description: "Check that this machine and the current Remotion project are ready: Python packages, Node.js, optional tools, kit version, tsconfig."
argument-hint: "[project folder, default: current]"
---

Run the environment doctor of the `motion-design` skill and explain the result. Request: $ARGUMENTS

1. Run `python "${CLAUDE_PLUGIN_ROOT}/skills/motion-design/tools/doctor.py" <project folder or .>` (on Windows `python` may be `py`). It is read-only: no installs, no network, no file changes.
2. Summarize in the user's language: what blocks a video (✖), what will limit it (!), what is optional (·). For each problem give the exact fix line the doctor printed.
3. Do **not** run the fixes yourself. Offer them; install only after the user says yes, and only the listed packages.
4. "kit differs from the plugin" means the project's `src/kit/` is older or edited. Ask before overwriting it: the user may have edited it on purpose.
