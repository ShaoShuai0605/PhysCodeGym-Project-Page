// All icons are served locally; unknown names keep their text without a guessed logo.
const modelBrands: [RegExp, string][] = [
  [/^GPT-/i, 'openai.svg'],
  [/^Claude\b/i, 'claude-color.svg'],
  [/^DeepSeek\b/i, 'deepseek-color.svg'],
  [/^Qwen/i, 'qwen-color.svg'],
  [/^GLM-/i, 'zai.svg'],
  [/^Kimi\b/i, 'kimi.svg'],
];
const harnessBrands: Record<string, string> = {
  codex: 'codex-color.svg',
  'claude code': 'claudecode-color.svg',
  'kimi code': 'kimi.svg',
};
const brandImage = (file: string | undefined, kind: string) => file
  ? `<img class="brand-icon ${kind}-icon" src="./icons/models/${file}" width="18" height="18" alt="" aria-hidden="true" />`
  : '';
export const modelIcon = (name: string) => brandImage(modelBrands.find(([pattern]) => pattern.test(name))?.[1], 'model');
export const harnessIcon = (name: string) => brandImage(harnessBrands[name.trim().toLowerCase().replace(/-/g, ' ')], 'harness');
