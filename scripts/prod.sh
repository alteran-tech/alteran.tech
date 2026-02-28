#!/usr/bin/env bash
# =============================================================================
# alteran.tech — Production build & start
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
step()    { echo -e "\n${TEAL}${BOLD}[$1/6]${RESET} $2"; }

# ── Args ──────────────────────────────────────────────────────────────────────
BUILD_ONLY=false
START_ONLY=false
for arg in "$@"; do
  case $arg in
    --build-only) BUILD_ONLY=true ;;
    --start-only) START_ONLY=true ;;
  esac
done

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${TEAL}${BOLD}  ╔══════════════════════════════════════╗${RESET}"
echo -e "${TEAL}${BOLD}  ║     alteran.tech  ·  PRODUCTION      ║${RESET}"
echo -e "${TEAL}${BOLD}  ╚══════════════════════════════════════╝${RESET}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── 1. Node check ─────────────────────────────────────────────────────────────
step 1 "Node.js version"
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [[ -z "$NODE_VERSION" ]]; then
  error "Node.js not found."
  exit 1
fi
if [[ "$NODE_VERSION" -lt 20 ]]; then
  error "Node.js ${NODE_VERSION} is too old. Required: 20+"
  exit 1
fi
success "Node.js $(node -v)"

# ── 2. Required env vars ──────────────────────────────────────────────────────
step 2 "Environment validation"

ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  # Production can also read from system environment
  if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
    error ".env.local not found and ADMIN_PASSWORD not set."
    error "Create .env.local from .env.local.example and fill in credentials."
    exit 1
  fi
  ENV_FILE="(system environment)"
fi

# Helper: read var from env file or current environment
get_var() {
  local name="$1"
  local val="${!name:-}"
  if [[ -z "$val" && -f ".env.local" ]]; then
    val=$(grep -E "^${name}=" .env.local 2>/dev/null | cut -d= -f2- || true)
  fi
  echo "$val"
}

MISSING=()
require_var() {
  local name="$1"
  local val
  val=$(get_var "$name")
  if [[ -z "$val" || "$val" == *"..."* || "$val" == "your-"* ]]; then
    MISSING+=("$name")
  fi
}
require_var "ADMIN_PASSWORD"
require_var "AUTH_SECRET"

if [[ ${#MISSING[@]} -gt 0 ]]; then
  error "Missing required environment variables:"
  for v in "${MISSING[@]}"; do
    dim "  - $v"
  done
  echo ""
  error "Set them in .env.local or as system environment variables."
  exit 1
fi

DB_URL=$(get_var "DATABASE_URL")
export DATABASE_URL="${DB_URL:-file:./alteran.db}"
success "All required variables set (${ENV_FILE})"
dim "DATABASE_URL=${DATABASE_URL}"

if [[ "$START_ONLY" == "true" ]]; then
  # Skip build steps
  info "Skipping build (--start-only)"
  jump_to_start=true
else
  jump_to_start=false
fi

if [[ "$jump_to_start" == "false" ]]; then

  # ── 3. Install dependencies ─────────────────────────────────────────────────
  step 3 "Installing dependencies"
  npm ci --prefer-offline
  success "Dependencies installed"

  # ── 4. SQLite schema sync ─────────────────────────────────────────────────────
  step 4 "Database schema sync"
  if npm run db:push; then
    success "Schema applied  →  ${DATABASE_URL}"
  else
    error "DB push failed for ${DATABASE_URL}"
    exit 1
  fi

  # ── 5. Build ──────────────────────────────────────────────────────────────────
  step 5 "Building for production"
  BUILD_START=$(date +%s)
  npm run build
  BUILD_END=$(date +%s)
  BUILD_TIME=$((BUILD_END - BUILD_START))
  success "Build complete in ${BUILD_TIME}s"

fi

if [[ "$BUILD_ONLY" == "true" ]]; then
  echo ""
  success "Build finished. Run with --start-only to start the server."
  exit 0
fi

# ── 6. Start ──────────────────────────────────────────────────────────────────
step 6 "Starting production server"

PORT="${PORT:-$(get_var PORT)}"
PORT="${PORT:-3000}"
echo ""
echo -e "${TEAL}${BOLD}  Server running at:${RESET}"
echo -e "${DIM}  http://localhost:${PORT}${RESET}"
echo -e "${DIM}  Admin:  http://localhost:${PORT}/admin${RESET}"
echo ""

exec npm run start -- --port "$PORT"
