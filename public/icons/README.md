# Website icons

All icons are local SVG files. Adjacent text supplies the accessible name; icon images are decorative.

## Models and harnesses

`models/` contains user-supplied SVG assets from `/Users/k/Downloads/assets/`, plus the replacement Kimi artwork from `/Users/k/Downloads/kimi.svg`:

- GPT models → `openai.svg`; Claude → `claude-color.svg`; DeepSeek → `deepseek-color.svg`.
- Qwen → `qwen-color.svg`; GLM → `zai.svg`; Kimi → `kimi.svg`.
- Codex → `codex-color.svg`; Claude Code → `claudecode-color.svg`; Kimi Code → `kimi.svg`.

The matching rules live in `src/icons.ts` (relative to the website root). Unknown names retain their text without a logo. Model and harness icons appear in the leaderboard and reconstruction grid; model icons also identify the physical-failure cases. The current task dialog shows model reconstructions together rather than using a model selector. Kimi uses the new square artwork with its original paths and colors; only a `viewBox="0 0 1280 1280"` was added to support small image sizes. Other supplied SVGs are unchanged.

## Resource icons

The four top buttons are Paper, Code, Dataset, and Evaluation. CSS gives all four the same dark background and inverts their monochrome resource icons to white; the SVG source files remain unchanged. The citation icon belongs to the Copy BibTeX button in the final section and retains its dark appearance. Model and harness icons retain their supplied colors.

- `resources/paper.svg`: Lucide `file-text`, downloaded from https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/file-text.svg (ISC license; see `LUCIDE-LICENSE.txt`).
- `resources/github.svg`: Simple Icons GitHub, downloaded from https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg (CC0-1.0; https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md).
- `resources/dataset.svg`, `evaluation.svg`, and `citation.svg`: locally drawn database, checked clipboard, and quotation marks with matching 24 px / 2 px stroke styling. These have no remote runtime dependency.

Visual placement reference: https://4dcodebench.com/#leaderboard, inspected 2026-10-15.
