#!/bin/sh
set -e

# Wendet ausstehende Datenbank-Migrationen automatisch beim Containerstart an.
# Erwartet, dass DATABASE_URL gesetzt ist (siehe .env / docker-compose.yml).
echo "→ Wende Datenbank-Migrationen an ..."
npx prisma migrate deploy || echo "⚠️  Migration übersprungen/fehlgeschlagen — prüfe DATABASE_URL."

exec "$@"
