#!/bin/sh
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Entrypoint cho container BE:
#   1. Äá»£i Postgres sáºµn sÃ ng
#   2. Cháº¡y migration:run
#   3. Seed: CHá»ˆ khi FORCE_RESEED=1 (thá»§ cÃ´ng, ghi Ä‘Ã¨ data). Máº·c Ä‘á»‹nh KHÃ”NG seed.
#      Migration Ä‘Ã£ lo khung tá»‘i thiá»ƒu (admin + danh má»¥c/menu/footer) nÃªn deploy
#      thÆ°á»ng chá»‰ Ä‘áº©y CODE, khÃ´ng Ä‘á»¥ng dá»¯ liá»‡u hiá»‡n cÃ³.
#   4. Khá»Ÿi Ä‘á»™ng NestJS
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
set -e

echo "==> [entrypoint] Waiting for postgres at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "==> [entrypoint] Postgres OK"

echo "==> [entrypoint] Running migrations..."
npm run migration:run

# â”€â”€ Seed dá»¯ liá»‡u â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# KHÃ”NG tá»± Ä‘á»™ng náº¡p snapshot ná»¯a. Migration Ä‘Ã£ cung cáº¥p khung tá»‘i thiá»ƒu (admin
# root@vsoftware.vn, 6 danh má»¥c + menu + footer máº·c Ä‘á»‹nh). Nhá» váº­y:
#   - Deploy thÆ°á»ng: chá»‰ code + migration, KHÃ”NG Ä‘áº©y data, KHÃ”NG Ä‘á»¥ng DB hiá»‡n cÃ³.
#   - Deploy mÃ´i trÆ°á»ng má»›i (DB trá»‘ng): lÃªn site tá»‘i thiá»ƒu tá»« migration, 0 bÃ i viáº¿t.
#   - QUAN TRá»ŒNG: dÃ¹ bÃ i viáº¿t vá» 0, restart container KHÃ”NG cÃ²n tá»± TRUNCATE/náº¡p láº¡i
#     snapshot â†’ data tháº­t cá»§a báº¡n an toÃ n.
# Muá»‘n náº¡p láº¡i TOÃ€N Bá»˜ snapshot (GHI ÄÃˆ data) â†’ cháº¡y vá»›i biáº¿n mÃ´i trÆ°á»ng FORCE_RESEED=1.
if [ "$FORCE_RESEED" = "1" ]; then
  echo "==> [entrypoint] FORCE_RESEED=1 â†’ TRUNCATE + restore tá»« snapshot.json (THá»¦ CÃ”NG, GHI ÄÃˆ DATA!)"
  npm run seed:all -- --reset || echo "WARN seed --reset failed, tiáº¿p tá»¥c start"
else
  echo "==> [entrypoint] Bá» qua seed â€” chá»‰ migration + code. Dá»¯ liá»‡u hiá»‡n cÃ³ giá»¯ nguyÃªn."
fi

echo "==> [entrypoint] Starting NestJS..."
exec node dist/main
