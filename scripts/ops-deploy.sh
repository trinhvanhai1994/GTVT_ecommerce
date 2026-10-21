#!/usr/bin/env bash
# Single deploy engine for Nava stack + Ops Console.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOCK_FILE="${ROOT}/scripts/.ops-deploy.lock"

NAMED="ecommerce-postgres ecommerce-rabbitmq ecommerce-eureka ecommerce-admin ecommerce-gateway ecommerce-auth ecommerce-shop ecommerce-product ecommerce-cart ecommerce-inventory ecommerce-order ecommerce-payment ecommerce-notification ecommerce-frontend ecommerce-ops-api ecommerce-ops-ui"

KNOWN_SERVICES="eureka admin gateway auth shop product cart inventory order payment notification frontend postgres rabbitmq ops-api ops-ui"
# Services managed by Ops Console (never ops-api / ops-ui — keep console usable)
MANAGED_SERVICES="postgres rabbitmq eureka admin gateway auth shop product cart inventory order payment notification frontend"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/ops-deploy.sh full [--restart-only|--skip-maven] [--exclude-ops]
  ./scripts/ops-deploy.sh restart --service <composeService>
  ./scripts/ops-deploy.sh stop --service <composeService>
  ./scripts/ops-deploy.sh start --service <composeService>
  ./scripts/ops-deploy.sh stop-all
  ./scripts/ops-deploy.sh start-all
  ./scripts/ops-deploy.sh rebuild --service <composeService>
  ./scripts/ops-deploy.sh maven-rebuild --service <composeService>

Actions:
  full            Deploy stack (optional --exclude-ops skips ops-api/ops-ui)
  restart|stop|start|rebuild|maven-rebuild  one service (ops-* refused)
  stop-all        stop managed services only (keeps Ops)
  start-all       up -d managed services only (keeps Ops)
EOF
}

is_ops_service() {
  [[ "$1" == "ops-api" || "$1" == "ops-ui" ]]
}

refuse_ops_mutate() {
  if is_ops_service "$SERVICE"; then
    echo "Refusing to $1 Ops service: $SERVICE (Ops Console must stay up)." >&2
    exit 1
  fi
}

maven_module_for() {
  case "$1" in
    eureka) echo eureka-server ;;
    admin) echo admin-server ;;
    gateway) echo gateway ;;
    auth) echo auth-service ;;
    shop) echo shop-service ;;
    product) echo product-service ;;
    cart) echo cart-service ;;
    inventory) echo inventory-service ;;
    order) echo order-service ;;
    payment) echo payment-service ;;
    notification) echo notification-service ;;
    ops-api) echo ops-control-plane ;;
    *) echo "" ;;
  esac
}

is_known_service() {
  local s
  for s in $KNOWN_SERVICES; do
    [[ "$s" == "$1" ]] && return 0
  done
  return 1
}

is_managed_service() {
  local s
  for s in $MANAGED_SERVICES; do
    [[ "$s" == "$1" ]] && return 0
  done
  return 1
}

COMMAND=""
SERVICE=""
RESTART_ONLY=0
SKIP_MAVEN=0
EXCLUDE_OPS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    full|restart|stop|start|stop-all|start-all|rebuild|maven-rebuild)
      COMMAND="$1"
      shift
      ;;
    --service|-s)
      SERVICE="${2:-}"
      if [[ -z "$SERVICE" ]]; then
        echo "Missing value for --service" >&2
        exit 1
      fi
      shift 2
      ;;
    --restart-only|-RestartOnly)
      RESTART_ONLY=1
      shift
      ;;
    --skip-maven|-SkipMaven)
      SKIP_MAVEN=1
      shift
      ;;
    --exclude-ops)
      EXCLUDE_OPS=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$COMMAND" ]]; then
  COMMAND=full
fi

require_service() {
  if [[ -z "$SERVICE" ]]; then
    echo "Missing --service <composeService>" >&2
    exit 1
  fi
  if ! is_known_service "$SERVICE"; then
    echo "Unknown service: $SERVICE" >&2
    echo "Known: $KNOWN_SERVICES" >&2
    exit 1
  fi
}

cleanup_leftovers() {
  local compose_project name owner
  compose_project="$(docker compose config --format json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin).get("name",""))' 2>/dev/null || true)"
  if [[ -z "${compose_project}" ]]; then
    compose_project="gtvt_ecommerce"
  fi
  for name in $NAMED; do
    if ! docker inspect "$name" >/dev/null 2>&1; then
      continue
    fi
    owner="$(docker inspect "$name" --format '{{index .Config.Labels "com.docker.compose.project"}}' 2>/dev/null || true)"
    if [[ "$owner" == "$compose_project" ]]; then
      continue
    fi
    echo "Removing leftover container $name (was project='$owner'; this stack='$compose_project')"
    docker rm -f "$name" >/dev/null
  done
}

maven_package_all() {
  echo "Maven package (reactor, cache volume gtvt-ecommerce-m2)..."
  docker run --rm \
    -v "${ROOT}:/src" \
    -v gtvt-ecommerce-m2:/root/.m2 \
    -w /src \
    maven:3.9.9-eclipse-temurin-21 \
    mvn -q -DskipTests package
}

maven_package_module() {
  local module="$1"
  if [[ -z "$module" ]]; then
    echo "Service has no Maven module; skip Maven."
    return 0
  fi
  echo "Maven package module $module (-am), cache volume gtvt-ecommerce-m2..."
  docker run --rm \
    -v "${ROOT}:/src" \
    -v gtvt-ecommerce-m2:/root/.m2 \
    -w /src \
    maven:3.9.9-eclipse-temurin-21 \
    mvn -q -pl "$module" -am -DskipTests package
}

print_urls() {
  cat <<'EOF'

Storefront     http://localhost:5173
Gateway        http://localhost:8080
Ops Console    http://localhost:5199
Ops API        http://localhost:8099
Eureka         http://localhost:8761
Spring Admin   http://localhost:8088
RabbitMQ       http://localhost:15672  ecommerce/ecommerce
Postgres       localhost:5432          postgres/123456

CLI: ./scripts/ops-deploy.sh full | restart --service auth | rebuild --service auth
EOF
}

run_locked() {
  if command -v flock >/dev/null 2>&1; then
    exec 9>"$LOCK_FILE"
    if ! flock -n 9; then
      echo "Another ops-deploy job is running (lock: $LOCK_FILE)." >&2
      exit 2
    fi
    "$@"
    return
  fi
  local lockdir="${LOCK_FILE}.d"
  if ! mkdir "$lockdir" 2>/dev/null; then
    echo "Another ops-deploy job is running (lock: $lockdir)." >&2
    exit 2
  fi
  "$@"
  local status=$?
  rmdir "$lockdir" 2>/dev/null || true
  return "$status"
}

do_full() {
  cleanup_leftovers
  # shellcheck disable=SC2086
  if [[ "$EXCLUDE_OPS" -eq 1 ]]; then
    echo "Deploy managed services only (ops-api / ops-ui untouched): $MANAGED_SERVICES"
    if [[ "$RESTART_ONLY" -eq 1 ]]; then
      docker compose up -d $MANAGED_SERVICES
    else
      if [[ "$SKIP_MAVEN" -eq 0 ]]; then
        maven_package_all
      fi
      docker compose up -d --build $MANAGED_SERVICES
    fi
  else
    if [[ "$RESTART_ONLY" -eq 1 ]]; then
      docker compose up -d
    else
      if [[ "$SKIP_MAVEN" -eq 0 ]]; then
        maven_package_all
      fi
      docker compose up -d --build
    fi
  fi
  print_urls
}

do_restart() {
  require_service
  refuse_ops_mutate restart
  cleanup_leftovers
  echo "Restarting compose service: $SERVICE"
  docker compose restart "$SERVICE"
}

do_stop() {
  require_service
  refuse_ops_mutate stop
  echo "Stopping compose service: $SERVICE"
  docker compose stop "$SERVICE"
}

do_start() {
  require_service
  refuse_ops_mutate start
  echo "Starting compose service: $SERVICE"
  docker compose start "$SERVICE"
}

do_stop_all() {
  local s
  echo "Stopping managed services (ops-api / ops-ui kept)..."
  for s in $MANAGED_SERVICES; do
    echo "  stop $s"
    docker compose stop "$s" || true
  done
  echo "Done. Ops Console still on http://localhost:5199"
}

do_start_all() {
  # shellcheck disable=SC2086
  echo "Starting managed services (ops-api / ops-ui untouched)..."
  docker compose up -d $MANAGED_SERVICES
  echo "Done. Ops Console still on http://localhost:5199"
}

do_rebuild() {
  require_service
  refuse_ops_mutate rebuild
  cleanup_leftovers
  echo "Rebuild image + recreate (no Maven, no-deps): $SERVICE"
  docker compose up -d --build --no-deps "$SERVICE"
}

do_maven_rebuild() {
  require_service
  refuse_ops_mutate maven-rebuild
  cleanup_leftovers
  maven_package_module "$(maven_module_for "$SERVICE")"
  echo "Rebuild image + recreate (no-deps): $SERVICE"
  docker compose up -d --build --no-deps "$SERVICE"
}

case "$COMMAND" in
  full) run_locked do_full ;;
  restart) run_locked do_restart ;;
  stop) run_locked do_stop ;;
  start) run_locked do_start ;;
  stop-all) run_locked do_stop_all ;;
  start-all) run_locked do_start_all ;;
  rebuild) run_locked do_rebuild ;;
  maven-rebuild) run_locked do_maven_rebuild ;;
  *) usage; exit 1 ;;
esac
