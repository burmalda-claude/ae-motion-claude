## What changes

## Why

## Checks
- [ ] `ruff check --select F plugins scripts`
- [ ] tool self-tests and `lexicon.py --check` / `site.py --check` (see CONTRIBUTING.md)
- [ ] `python scripts/check_kit_types.py` (if `kit/` or `examples/` changed)
- [ ] `python scripts/check_docs.py`
- [ ] `claude plugin validate plugins/ae-motion`
- [ ] `CHANGELOG.md` updated; breaking changes have a migration
