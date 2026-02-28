#!/usr/bin/env bash
# =============================================================================
# alteran.tech — Development environment startup
# =============================================================================
set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RESET='\033[0m'
BOLD='\033[1m'
TEAL='\033[38;2;113;215;180m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
DIM='\033[2m'

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${TEAL}${BOLD}▶${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠${RESET}  $*"; }
error()   { echo -e "${RED}${BOLD}✗${RESET}  $*" >&2; }
success() { echo -e "${TEAL}${BOLD}✓${RESET}  $*"; }
dim()     { echo -e "${DIM}  $*${RESET}"; }

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${TEAL}${BOLD}  ╔═══════════════════════════════════╗${RESET}"
echo -e "${TEAL}${BOLD}  ║     alteran.tech  ·  DEV MODE     ║${RESET}"
echo -e "${TEAL}${BOLD}  ╚═══════════════════════════════════╝${RESET}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── 1. Node version check ─────────────────────────────────────────────────────
info "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [[ -z "$NODE_VERSION" ]]; then
  error "Node.js not found. Install Node.js 20+ from https://nodejs.org"
  exit 1
fi
if [[ "$NODE_VERSION" -lt 20 ]]; then
  error "Node.js ${NODE_VERSION} is too old. Required: 20+"
  exit 1
fi
success "Node.js $(node -v)"

# ── 2. .env.local check ───────────────────────────────────────────────────────
info "Checking environment variables..."
if [[ ! -f ".env.local" ]]; then
  warn ".env.local not found — creating from .env.local.example"
  cp .env.local.example .env.local
  echo ""
  echo -e "${YELLOW}  ┌──────────────────────────────────────────────────────┐${RESET}"
  echo -e "${YELLOW}  │  Fill in .env.local, then run this script again.     │${RESET}"
  echo -e "${YELLOW}  │                                                      │${RESET}"
  echo -e "${YELLOW}  │  Required:                                           │${RESET}"
  echo -e "${YELLOW}  │  • TURSO_DATABASE_URL                                │${RESET}"
  echo -e "${YELLOW}  │  • TURSO_AUTH_TOKEN                                  │${RESET}"
  echo -e "${YELLOW}  │  • ADMIN_PASSWORD                                    │${RESET}"
  echo -e "${YELLOW}  │  • AUTH_SECRET  (min 32 chars)                       │${RESET}"
  echo -e "${YELLOW}  │                                                      │${RESET}"
  echo -e "${YELLOW}  │  Optional:                                           │${RESET}"
  echo -e "${YELLOW}  │  • GITHUB_TOKEN  (GitHub import)                     │${RESET}"
  echo -e "${YELLOW}  │  • OPENROUTER_API_KEY  (AI generation)               │${RESET}"
  echo -e "${YELLOW}  └──────────────────────────────────────────────────────┘${RESET}"
  echo ""
  dim "Created: $(pwd)/.env.local"
  echo ""
  exit 0
fi

success ".env.local found"

# Warn about required env vars
ADMIN_PASS=$(grep -E "^ADMIN_PASSWORD=" .env.local 2>/dev/null | cut -d= -f2- || true)
AUTH_SEC=$(grep -E "^AUTH_SECRET=" .env.local 2>/dev/null | cut -d= -f2- || true)
if [[ -z "$ADMIN_PASS" || "$ADMIN_PASS" == *"..."* ]]; then
  warn "ADMIN_PASSWORD not set — admin login will not work"
fi
if [[ -z "$AUTH_SEC" || ${#AUTH_SEC} -lt 32 ]]; then
  warn "AUTH_SECRET not set or too short (min 32 chars) — sessions will not work"
fi
if [[ -n "$ADMIN_PASS" && -n "$AUTH_SEC" && ${#AUTH_SEC} -ge 32 ]]; then
  success "Auth configured"
fi

# ── 3. Dependencies ───────────────────────────────────────────────────────────
info "Checking dependencies..."
if [[ ! -d "node_modules" ]]; then
  info "Installing dependencies..."
  npm install
  success "Dependencies installed"
else
  success "node_modules present"
fi

# ── 4. Database schema sync ───────────────────────────────────────────────────
info "Syncing database schema..."
if npm run db:push 2>&1 | grep -v "^$"; then
  success "Database schema up to date"
else
  warn "Schema sync failed — continuing without sync"
fi

info "Seeding example projects..."
if node scripts/seed.mjs 2>/dev/null; then
  : # output comes from the script itself
else
  warn "Seed failed — continuing without seed data"
fi

# ── 5. Start dev server ───────────────────────────────────────────────────────
echo ""
echo -e "${TEAL}${BOLD}  Starting development server...${RESET}"
echo -e "${DIM}  http://localhost:3000${RESET}"
echo -e "${DIM}  Admin:  http://localhost:3000/admin${RESET}"
echo ""

exec npm run dev
