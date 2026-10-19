#!/bin/zsh

cd -- "${0:A:h}" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if /usr/bin/curl -fsS --max-time 2 http://127.0.0.1:5173/ 2>/dev/null | /usr/bin/grep -Fq '<title>PhysCodeGym'; then
  /usr/bin/open http://127.0.0.1:5173/
  exit 0
fi

# Finder does not load the terminal configuration that enables nvm.
if ! command -v npm >/dev/null 2>&1; then
  nvm_script="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [[ -s "$nvm_script" ]]; then
    source "$nvm_script"
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  print '请先安装 Node.js 22.12 或更新的受支持版本，再双击本文件。'
  read -r '?按回车键关闭。'
  exit 1
fi

if [[ ! -x node_modules/.bin/vite ]]; then
  print '首次打开，正在安装网站依赖……'
  npm ci --no-audit --no-fund || exit 1
fi

print '网站即将打开。浏览时请保留此终端窗口；按 Control+C 停止服务。'
npm run dev -- --open
