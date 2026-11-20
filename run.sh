#!/usr/bin/env bash
# =====================================================================
#  Angachilla App — Tutorial Video Generator
#  Genera demos desktop (1280×720) y mobile (390×844) automáticamente
# =====================================================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🌿 Angachilla App — Tutorial Video Generator     ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║   Desktop: 1280×720   |   Mobile: 390×844          ║"
echo "║   Output:  ./videos/                               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# --- Check dependencies ------------------------------------------------
if ! command -v node &>/dev/null; then
  echo "❌ Node.js no encontrado. Instálalo: https://nodejs.org"
  exit 1
fi

if ! node -e "require('playwright')" 2>/dev/null; then
  echo "📦 Instalando Playwright..."
  npm install playwright --save
  echo "✅ Playwright módulo instalado"
fi

# Always ensure chromium browser + system deps are ready
echo "🔍 Verificando browser Chromium..."
npx playwright install --with-deps chromium 2>&1 | tail -5
echo "✅ Chromium listo"

# --- Create output dir -------------------------------------------------
mkdir -p "$DIR/videos"

# --- Run desktop demo ---------------------------------------------------
echo ""
echo "🖥️  Generando video DESKTOP (1280×720)..."
echo "   Script: demo-angachilla.js"
echo ""
node "$DIR/demo-angachilla.js"

echo ""
echo "──────────────────────────────────────────────────────"
echo ""

# --- Run mobile demo ----------------------------------------------------
echo "📱 Generando video MOBILE (390×844)..."
echo "   Script: demo-angachilla-mobile.js"
echo ""
node "$DIR/demo-angachilla-mobile.js"

# --- List output ---------------------------------------------------------
echo ""
echo "══════════════════════════════════════════════════════"
echo "✅ Videos generados:"
echo ""
ls -lh "$DIR/videos/"*.webm 2>/dev/null | while read -r line; do
  echo "   $line"
done
echo ""
echo "══════════════════════════════════════════════════════"
echo ""
echo "💡 Tip: Para convertir a MP4 (requiere ffmpeg):"
echo "   ffmpeg -i video.webm -c:v libx264 -crf 20 output.mp4"
echo ""
