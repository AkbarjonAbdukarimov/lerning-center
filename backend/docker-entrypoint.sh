#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

if [ "$SEED" = "true" ]; then
  echo "Seeding demo data..."
  node dist/seed.js
fi

exec node dist/main.js
